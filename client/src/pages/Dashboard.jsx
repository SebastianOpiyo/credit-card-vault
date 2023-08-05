import React, { useEffect, useState } from "react";
import { useAuth } from "../contextt/AuthContext"; // AuthContext hook
import axios from "axios";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
    // Access the token from the AuthContext
    const { token } = useAuth()


  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Credit Cards</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.username}>
              <td>{user.username}</td>
              <td>
                <ul>
                  {user.credit_cards.map((card) => (
                    <li key={card.id}>{card.card_number}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
