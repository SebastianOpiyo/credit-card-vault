import React, { useState } from 'react';
import axios from 'axios';

const CreditCard = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const handleAddCreditCard = () => {
    axios
      .post('http://localhost:8000/api/v1/credit-cards', { card_number: cardNumber, cvv, expiry_date: expiryDate })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
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

