from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_current_user
from flask_cors import CORS
from sqlalchemy import Column, Integer, String, ForeignKey
from flask_migrate import Migrate
import os
import base64
import cryptography.fernet

# Get database connection info and the secret key from environment variables
db_user = os.environ.get('PGUSER', 'creditcardvault')
db_password = os.environ.get('PGPASSWORD', 'tzwz4qR7mvzFKmPrKzaKxY9iZ7')
db_host = os.environ.get('PGHOST', 'db')
db_name = os.environ.get('PGDATABASE', 'creditcardvault')
db_port = os.environ.get('PGPORT', '5432')

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from frontend

# JWT Config
app.config["JWT_SECRET_KEY"] = os.environ.get('SECRET_KEY', 'mX&dpNmuaKq8HB$@wLvk*n9V!AYD7X@EJhTmGh6fW@zXQMe9EY!t8rQfNPybyyW!')  # Change this to a secure secret key in production
jwt = JWTManager(app)

# SQLAlchemy config
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # to silence deprecation warning
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Database Models
# User Model
class User(db.Model):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    fernet_key = Column(String(100), nullable=False)
    role = Column(String(20), default="user", nullable=False)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_fernet_key(self):
        # convert base64 string to bytes before returning
        return base64.urlsafe_b64decode(self.fernet_key)


# Credit Card Model
class CreditCard(db.Model):
    __tablename__ = "credit_cards"
    id = Column(Integer, primary_key=True)
    card_number = Column(String(100), nullable=False)
    cvv = Column(String(10), nullable=False)
    expiry_date = Column(String(10), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))

# Helper functions
def generate_token(user_id):
    return create_access_token(identity=user_id)

# ROUTES

# Home route
@app.get('/')
def HealthCheck():
    return 'HealthCheck'

@app.route("/api/v1/home", methods=["GET"])
def home():
    return {"message": "E-Commerce Credit Card Vault."}


# Signup route (Route for all)
@app.route("/api/v1/signup", methods=["POST"])
def signup():
    try:
        username = request.json.get("username")
        password = request.json.get("password")

        if not username or not password:
            return {"message": "Username and password are required."}, 400

        user = User.query.filter_by(username=username).first()

        if user:
            return {"message": "User already exists"}, 400
        else:
            new_user = User(username=username)

            # Generate Fernet key for user
            fernet_key = base64.urlsafe_b64encode(cryptography.fernet.Fernet.generate_key())
            new_user.fernet_key = fernet_key.decode()  # Store this key as base64 encoded string

            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()
            return {"message": "User created successfully."}, 201
    except Exception as e:
        return {"message": str(e)}, 500

# Login route (Route for all)
@app.route("/api/v1/login", methods=["POST"])
def login():
    # Perform user authentication here and return the token on success
    username = request.json.get("username")
    password = request.json.get("password")
    
    if not username or not password:
        return {"message": "Username and password are required."}, 400
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        token = generate_token(user.id)
        return {"token": token }
    else:
        return {"message": "Invalid username or password."}, 401
    

# Encrypt route (Only for authenticated users)
@app.route("/api/v1/encrypt", methods=["POST"])
@jwt_required()
def encrypt():
    try:
        user_id = get_jwt_identity()
        credit_card_number = request.json.get("credit_card_number")
        if not credit_card_number:
            return {"message": "Credit card number is required."}, 400

        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {"message": "User not found."}, 404

        fernet = cryptography.fernet.Fernet(user.get_fernet_key())
        encrypted_credit_card_number = fernet.encrypt(
            credit_card_number.encode()
        )

        credit_card = CreditCard(card_number=encrypted_credit_card_number.decode(), user_id=user_id)
        db.session.add(credit_card)
        db.session.commit()
        return {"message": "Credit card added successfully."}

    except Exception as e:
        return {"message": str(e)}, 500

# Decrypt route (Only for authenticated user)
@app.route("/api/v1/decrypt", methods=["POST"])
@jwt_required()
def decrypt():
    try:
        user_id = get_jwt_identity()
        encrypted_data = request.json.get("data")

        if not encrypted_data:
            return {"message": "Encrypted data is required."}, 400

        user = db.session.query(User).filter_by(id=user_id).first()
        if not user:
            return {"message": "User not found."}, 404

        fernet = cryptography.fernet.Fernet(user.get_fernet_key())
        decrypted_data = fernet.decrypt(encrypted_data.encode()).decode()
        return {"decrypted_data": decrypted_data}

    except cryptography.fernet.InvalidToken:
        return {"message": "Invalid encrypted data."}, 400
    except Exception as e:
        return {"message": str(e)}, 500

# Add a new credit card for the user (Only for authenticated user)
@app.route("/api/v1/credit-cards", methods=["POST"])
@jwt_required()
@jwt_required()
def add_credit_card():
    try:
        user_id = get_jwt_identity()
        credit_card_number = request.json.get("credit_card_number")
        if not credit_card_number:
            return {"message": "Credit card number is required."}, 400

        key = cryptography.fernet.Fernet.generate_key()
        fernet = cryptography.fernet.Fernet(key)
        encrypted_credit_card_number = fernet.encrypt(credit_card_number.encode())

        credit_card = CreditCard(card_number=encrypted_credit_card_number, user_id=user_id)
        db.session.add(credit_card)
        db.session.commit()
        return {"message": "Credit card added successfully."}

    except Exception as e:
        return {"message": str(e)}, 500

# Retrieve all credit cards for the authenticated user (Only for authenticated user)
@app.route("/api/v1/credit-cards", methods=["GET"])
@jwt_required()
def get_credit_cards():
    try:
        user_id = get_jwt_identity()
        credit_cards = (
            db.session.query(CreditCard)
            .filter_by(user_id=user_id)
            .with_entities(CreditCard.id, CreditCard.card_number)
            .all()
        )

        decrypted_credit_cards = []
        for card_id, encrypted_card_number in credit_cards:
            fernet = cryptography.fernet.Fernet(get_user_key(user_id))
            decrypted_card_number = fernet.decrypt(encrypted_card_number).decode()
            decrypted_credit_cards.append({"id": card_id, "card_number": decrypted_card_number})

        return {"credit_cards": decrypted_credit_cards}

    except Exception as e:
        return {"message": str(e)}, 500

# Delete a credit card for the user
@app.route("/api/v1/credit-cards/<int:credit_card_id>", methods=["DELETE"])
@jwt_required()
def delete_credit_card(credit_card_id):
    try:
        user_id = get_jwt_identity()
        credit_card = db.session.query(CreditCard).filter_by(id=credit_card_id, user_id=user_id).first()
        if not credit_card:
            return {"message": "Credit card not found."}, 404

        db.session.delete(credit_card)
        db.session.commit()
        return {"message": "Credit card deleted successfully."}

    except Exception as e:
        return {"message": str(e)}, 500

# Retrieve all users and their credit cards (only for admins)
@app.route("/api/v1/users", methods=["GET"])
@jwt_required()
def get_all_users_and_credit_cards():
    user = get_current_user()
    if user.role != "admin":
        return {"message": "Unauthorized. Insufficient permissions."}, 403
    # querry all users and their credit cards information
    session = Session()
    users_credit_cards = {}
    users = session.query(User).all()
    for user in users:
        credit_cards = [
            {"id": card.id, "card_number": decrypt(card.card_number, user.id)}
            for card in user.credit_cards
        ]
        users_credit_cards[user.username] = credit_cards
    session.close()
    
    return jsonify(users_credit_cards)


# Delete a credit card for a specific user (only for admins)
@app.route("/api/v1/users/<int:user_id>/credit-cards/<int:credit_card_id>", methods=["DELETE"])
@jwt_required()
def delete_user_credit_card(user_id, credit_card_id):
    user = get_current_user()
    if user.role != "admin":
        return {"message": "Unauthorized. Insufficient permissions."}, 403
     # Check if the user exists
    session = Session()
    user_to_delete = session.query(User).filter_by(id=user_id).first()
    if not user_to_delete:
        session.close()
        return {"message": "User not found."}, 404
    
    # Check if the credit card exists for the user
    credit_card_to_delete = session.query(CreditCard).filter_by(id=credit_card_id, user_id=user_id).first()
    if not credit_card_to_delete:
        session.close()
        return {"message": "Credit card not found."}, 404
    
    # Delete the credit card
    session.delete(credit_card_to_delete)
    session.commit()
    session.close()
    
    return {"message": "Credit card deleted successfully."}

  
# Helper Functions
def decrypt(encrypted_data, user_id):
    try:
        fernet = cryptography.fernet.Fernet(get_user_key(user_id))
        decrypted_data = fernet.decrypt(encrypted_data).decode()
        return decrypted_data
    except Exception as e:
        return {"message": str(e)}, 500

def get_user_key(user_id):
    try:
        user = User.query.filter_by(id=user_id).first()
        if not user:
            raise ValueError("User not found.")
        
        return user.get_fernet_key()
    except Exception as e:
        return {"message": str(e)}, 500

# @app.before_first_request
# def create_tables():
#     db.create_all()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)