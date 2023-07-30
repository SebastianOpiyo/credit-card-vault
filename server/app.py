from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import cryptography.fernet

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from frontend

# JWT Config
app.config["JWT_SECRET_KEY"] = "your-secret-key"  # Change this to a secure secret key in production
jwt = JWTManager(app)

# Postgres DB config
db_host = "localhost"
db_name = "creditcardvault"
db_user = "doka"
db_password = "doka1234"
db_port = "5432"  # Change this if your PostgreSQL is using a different port

# SQLAlchemy config
engine = create_engine(
    f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
)
Base = declarative_base()
Session = sessionmaker(bind=engine)


# Database Models
# User Model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    fernet_key = Column(String(100), nullable=False)

    def check_password(self, password):
        return self.password == password
    
    def get_fernet_key(self):
        return self.fernet_key()


# Credit Card Model
class CreditCard(Base):
    __tablename__ = "credit_cards"
    id = Column(Integer, primary_key=True)
    card_number = Column(String(100), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="credit_cards")


User.credit_cards = relationship("CreditCard", order_by=CreditCard.id, back_populates="user")


# Helper functions
def generate_token(user_id):
    return create_access_token(identity=user_id)


# Authentication decorator
def protected_route(fn):
    @jwt_required()
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)

    return wrapper


# ROUTES

# Home route
@app.route("/api/v1/home", methods=["GET"])
def home():
    return {"message": "E-Commerce Credit Card Vault."}


# Signup route
@app.route("/api/v1/signup", methods=["POST"])
def signup():
    username = request.json.get("username")
    password = request.json.get("password")

    if not username or not password:
        return {"message": "Username and password are required."}, 400

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        token = generate_token(user.id)
        return {"token": token}
    else:
        return {"message": "Invalid username or password"}, 401


# Login route
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
    


# Encrypt route
@app.route("/api/v1/encrypt", methods=["POST"])
@protected_route
def encrypt():
    credit_card_number = request.json.get("credit_card_number")
    if not credit_card_number:
        return {"message": "Credit card number is required."}, 400

    key = cryptography.fernet.Fernet.generate_key()
    encrypted_credit_card_number = cryptography.fernet.Fernet(key).encrypt(
        credit_card_number.encode()
    )

    # Save the encrypted_credit_card_number in the database here (you need to implement the database logic)

    return {"encrypted_credit_card_number": encrypted_credit_card_number}


# Decrypt route
@app.route("/api/v1/decrypt", methods=["POST"])
@protected_route
def decrypt():
    user_id = get_jwt_identity()
    encrypted_data = request.json.get("data")

    if not encrypted_data:
        return {"message": "Encrypted data is required."}, 400

    try:
        decrypted_data = decrypt(encrypted_data.encode(), user_id)
        return {"decrypted_data": decrypted_data}
    except cryptography.fernet.InvalidToken:
        return {"message": "Invalid encrypted data."}, 400


# Add a new credit card for the user
@app.route("/api/v1/credit-cards", methods=["POST"])
@protected_route
def add_credit_card():
    user_id = get_jwt_identity()
    credit_card_number = request.json.get("credit_card_number")
    if not credit_card_number:
        return {"message": "Credit card number is required."}, 400

    key = cryptography.fernet.Fernet.generate_key()
    fernet = cryptography.fernet.Fernet(key)
    encrypted_credit_card_number = fernet.encrypt(credit_card_number.encode())

    session = Session()
    credit_card = CreditCard(card_number=encrypted_credit_card_number, user_id=user_id)
    session.add(credit_card)
    session.commit()
    session.close()

    return {"message": "Credit card added successfully."}


# Retrieve all credit cards for the authenticated user
@app.route("/api/v1/credit-cards", methods=["GET"])
@protected_route
def get_credit_cards():
    user_id = get_jwt_identity()
    session = Session()
    credit_cards = (
        session.query(CreditCard)
        .filter_by(user_id=user_id)
        .with_entities(CreditCard.id, CreditCard.card_number)
        .all()
    )
    session.close()

    decrypted_credit_cards = []
    for card_id, encrypted_card_number in credit_cards:
        fernet = cryptography.fernet.Fernet(get_user_key(user_id))
        decrypted_card_number = fernet.decrypt(encrypted_card_number).decode()
        decrypted_credit_cards.append({"id": card_id, "card_number": decrypted_card_number})

    return {"credit_cards": decrypted_credit_cards}



# Delete a credit card for the user
@app.route("/api/v1/credit-cards/<int:credit_card_id>", methods=["DELETE"])
@protected_route
def delete_credit_card(credit_card_id):
    user_id = get_jwt_identity()
    session = Session()
    credit_card = session.query(CreditCard).filter_by(id=credit_card_id, user_id=user_id).first()
    if not credit_card:
        return {"message": "Credit card not found."}, 404

    session.delete(credit_card)
    session.commit()
    session.close()

    return {"message": "Credit card deleted successfully."}

# Helper Functions
def decrypt(encrypted_data, user_id):
    fernet = cryptography.fernet.Fernet(get_user_key(user_id))
    decrypted_data = fernet.decrypt(encrypted_data).decode()
    return decrypted_data

def get_user_key(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        raise ValueError("User not found.")
    
    return user.get_fernet_key()


if __name__ == "__main__":
    app.run(debug=True)