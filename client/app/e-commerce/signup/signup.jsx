import React, { useState } from "react";
import axios from "axios";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const response = await axios.post("/api/v1/signup", {
      username: username,
      password: password,
    });

    if (response.status === 201) {
      alert("Signup successful!");
    } else {
      alert("Something went wrong.");
    }
  };

  return (
    <div>
      <h1>Signup</h1>
      <input
        type="text"
        placeholder="Username"
        onChange={(event) => setUsername(event.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(event) => setPassword(event.target.value)}
      />
      <button onClick={handleSubmit}>Signup</button>
    </div>
  );
};

export default Signup;
