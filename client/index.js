import React, { Component } from "react";
import axios from "axios";
import Stripe from "stripe";

class CreditCardVault extends Component {
  state = {
    credit_card_number: "",
  };

  handleChange = (event) => {
    this.setState({
      credit_card_number: event.target.value,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const stripe = Stripe("YOUR_STRIPE_SECRET_KEY");
    const token = stripe.createToken({
      card: {
        number: this.state.credit_card_number,
        exp_month: 12,
        exp_year: 2023,
        cvc: 123,
      },
    });

    axios.post("/encrypt", {
      credit_card_number: token.card.id,
    })
      .then((response) => {
        this.setState({
          encrypted_credit_card_number: response.data.encrypted_credit_card_number,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    return (
      <div>
        <h1>Credit Card Vault</h1>
        <input
          type="text"
          placeholder="Credit Card Number"
          value={this.state.credit_card_number}
          onChange={this.handleChange}
        />
        <button onClick={this.handleSubmit}>Encrypt</button>
        <p>Encrypted Credit Card Number: {this.state.encrypted_credit_card_number}</p>
        <hr />
        <h2>Sign Up</h2>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button>Sign Up</button>
        <hr />
        <h2>Login</h2>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button>Login</button>
      </div>
    );
  }
}

export default CreditCardVault;