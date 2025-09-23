import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import styles from "./Profile.module.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Login failed");
        return;
      }
      const data = await res.json();
      // Store user info and token together in localStorage
      const user = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
      };
      setUser(user);
      navigate("/dashboard", { replace: true, state: { welcome: true } });
    } catch (err) {
      setError("Network error");
    }
  };

  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div className={styles.profileBox}>
      <h2 className={styles.formTitle}>Login</h2>
      {error && (
        <div className={styles.message} style={{ color: "#d32f2f" }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button type="submit" disabled={false}>
          Login
        </button>
      </form>
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <span style={{ color: "#555", fontSize: "0.98em" }}>
          Don't have an account?{" "}
          <a
            href="/register"
            style={{
              color: "#2563eb",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Register here
          </a>
        </span>
      </div>
    </div>
  );
};

export default Login;
