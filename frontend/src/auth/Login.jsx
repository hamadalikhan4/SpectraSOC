import { useState } from "react";
import API from "../api/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@spectrasoc.com");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);
      formData.append("grant_type", "password");

      const res = await API.post(
        "/api/v1/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem(
        "token",
        res.data.access_token
      );

      if (res.data.refresh_token) {
        localStorage.setItem(
          "refresh",
          res.data.refresh_token
        );
      }

      localStorage.setItem(
        "email",
        email
      );

      await onLogin();

    } catch (err) {
      console.error("Login error:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Invalid Email or Password";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>SpectraSOC</h1>

        <p>SOC Authentication</p>

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 12px",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.08)",
              color: "#f87171",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="current-password"
        />

        <button
          className="btn"
          onClick={login}
          disabled={loading}
        >
          {loading ? "AUTHENTICATING..." : "LOGIN"}
        </button>

      </div>

    </div>
  );
}