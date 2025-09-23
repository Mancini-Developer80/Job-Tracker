import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import styles from "./Profile.module.css";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Registration failed");
        return;
      }
      // Auto-login: store user info and redirect
      const data = await res.json();
      // Store user info and token together in localStorage (like login)
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
      <h2 className={styles.formTitle}>Register</h2>
      {error && (
        <div className={styles.message} style={{ color: "#d32f2f" }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </label>
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
            autoComplete="new-password"
            required
          />
        </label>
        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <button type="submit" disabled={false}>
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
