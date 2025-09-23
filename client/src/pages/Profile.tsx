import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./Profile.module.css";

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (password) formData.append("password", password);
      if (avatar) formData.append("avatar", avatar);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
          body: formData,
        }
      );
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setUser(data);
      setMessage("Profile updated!");
      setPassword("");
    } catch (err) {
      setMessage("Could not update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.profileBox}>
      <h2>Profile</h2>
      {message && <div className={styles.message}>{message}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          New Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current"
          />
        </label>
        <label>
          Profile Picture
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
