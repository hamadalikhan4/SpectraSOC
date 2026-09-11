import { useState } from "react";
import API from "../api/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await API.post(
        "/api/v1/auth/login-json",
        {
          email,
          password,
        }
      );

      // Save JWT Access Token
      localStorage.setItem(
        "token",
        res.data.access_token
      );

      // Save Refresh Token
      localStorage.setItem(
        "refresh",
        res.data.refresh_token
      );

      // Save user email (optional)
      localStorage.setItem(
        "email",
        email
      );

      onLogin();

    } catch (err) {
      console.error(err);

      alert("Invalid Email or Password");
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>SpectraSOC</h1>

        <p>SOC Authentication</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="btn"
          onClick={login}
        >
          LOGIN
        </button>

      </div>

    </div>
  );
}