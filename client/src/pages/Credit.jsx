import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from "../contextt/AuthContext"; // AuthContext hook


const CreditCard = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  // Access the token from the AuthContext
  const { token } = useAuth()

  const handleAddCreditCard = () => {
    axios
      .post('http://localhost:8000/api/v1/credit-cards', 
      { card_number: cardNumber, cvv:cvv, expiry_date: expiryDate },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // Include the token in the headers
        }
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <h2>Credit Card Information</h2>
      <input
        type="text"
        placeholder="Card Number"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
      />
      <input
        type="text"
        placeholder="CVV"
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
      />
      <input
        type="text"
        placeholder="Expiry Date"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
      />
      <button onClick={handleAddCreditCard}>Add Credit Card</button>
    </div>
  );
};

export default CreditCard;

