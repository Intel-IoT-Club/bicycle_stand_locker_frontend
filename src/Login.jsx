import React, { useState } from "react";
import axios from "axios";
import "./styling/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Attempting login with:", email, password); // Debugging line
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/login`, {
        email,
        password,
      });
      console.log("Response:", response.data); // Debugging line
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error occurred:", error); // Debugging line
      setMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>

          {message && <p>{message}</p>}

          <div className="signup-link">
            <p>
              Don't have an account? <a href="/register">Sign up</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
