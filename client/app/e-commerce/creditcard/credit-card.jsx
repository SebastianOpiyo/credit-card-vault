import React, { useState } from "react";
import axios from "axios";
import CreditCardInput from "react-credit-card-input";

const App = () => {
  const [creditCard, setCreditCard] = useState(null);

  const handleChange = (event) => {
    setCreditCard(event.target.value);
  };

  const submitForm = async () => {
    const response = await axios.post("/api/v1/credit-cards", {
      credit_card: creditCard,
    });

    if (response.status === 201) {
      alert("Credit card created successfully!");
    } else {
      alert("Something went wrong.");
    }
  };

  return (
    <div>
      <h1>My Credit Cards</h1>
      <CreditCardInput
        onChange={handleChange}
        value={creditCard}
      />
      <button onClick={submitForm}>Submit</button>
    </div>
  );
};

export default App;
