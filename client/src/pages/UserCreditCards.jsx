import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from "../contextt/AuthContext"; // AuthContext hook

const UserCreditCards = () => {
  const [creditCards, setCreditCards] = useState([]);
    // Access the token from the AuthContext
  const { token } = useAuth()

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/v1/credit-cards', { headers: { Authorization: `Bearer ${YOUR_USER_TOKEN}` } })
      .then((response) => {
        setCreditCards(response.data.credit_cards);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <h2>Your Credit Cards</h2>
      <ul>
        {creditCards.map((card) => (
          <li key={card.id}>{card.card_number}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserCreditCards;
