import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "../components/AuthForm.module.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setUser } = useAuth();
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

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Login</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            className={styles.input}
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            className={styles.input}
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button className={styles.button} type="submit">
          Login
        </button>
      </form>
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <span style={{ color: "#555", fontSize: "0.98em" }}>
          Don't have an account?{" "}
          <a
            href="/register"
            style={{
              color: "#007bff",
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
