import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./UserDropdown.module.css";

interface Props {
  user: { name: string; role?: string };
  onLogout: () => void;
}

const UserDropdown: React.FC<Props> = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div
      className={`${styles.userDropdown} ${open ? styles.open : ""}`}
      ref={ref}
    >
      <button
        className={styles.userDropdownBtn}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          style={{ marginRight: 6 }}
        >
          <circle cx="10" cy="6.5" r="3.5" fill="#2563eb" fillOpacity="0.18" />
          <circle cx="10" cy="6.5" r="2.5" fill="#2563eb" />
          <ellipse
            cx="10"
            cy="15.5"
            rx="6"
            ry="3.5"
            fill="#2563eb"
            fillOpacity="0.12"
          />
        </svg>
        {user.name}
        <span style={{ marginLeft: 6, fontSize: 14 }}>▼</span>
      </button>
      <div className={styles.userDropdownMenu}>
        <Link to="/profile" onClick={() => setOpen(false)}>
          Profile
        </Link>
        {user.role === "admin" && (
          <Link to="/admin" onClick={() => setOpen(false)}>
            Admin
          </Link>
        )}
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default UserDropdown;
