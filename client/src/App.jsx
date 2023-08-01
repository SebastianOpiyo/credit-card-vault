import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Credit from "./pages/Credit";
import Dashboard from "./pages/Dashboard";
import UserCreditCards from "./pages/UserCreditCards";



const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-credit-cards" element={<UserCreditCards />} />
        <Route path="/credit-card" element={<Credit />} />
      </Routes>
    </div>
  );                                                                                                      
};

export default App;
