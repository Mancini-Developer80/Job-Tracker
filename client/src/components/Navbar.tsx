import { Link, useNavigate, useLocation } from "react-router-dom";
import { RoutePath } from "../types/routes";
import styles from "./Navbar.module.css";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "./UserDropdown";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode ? "true" : "false");
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.navLeft}>
            {/* App name/logo always visible, links to home */}
            <Link
              to="/"
              className={styles.link}
              style={{ fontWeight: 700, fontSize: "1.2rem", marginRight: 24 }}
            >
              JobTracker
            </Link>
            {/* Dashboard only for logged-in users, but not on dashboard page */}
            {user && location.pathname !== "/dashboard" && (
              <Link to="/dashboard" className={styles.link}>
                Dashboard
              </Link>
            )}
            {/* Admin only for superuser/admin */}
            {user && user.role === "admin" && (
              <Link to={RoutePath.Admin} className={styles.link}>
                Admin
              </Link>
            )}
          </div>
          <div className={styles.navRight}>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode((d) => !d)}
              style={{
                background: darkMode ? "#222" : "#eee",
                color: darkMode ? "#fff" : "#222",
                border: "1px solid #bbb",
                borderRadius: 20,
                padding: "6px 18px",
                marginRight: 12,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 15,
                transition: "background 0.2s, color 0.2s",
              }}
              title="Toggle dark mode"
            >
              {darkMode ? "🌙 Dark" : "☀️ Light"}
            </button>
            {/* User dropdown menu for logged-in users */}
            {user && user.name && (
              <UserDropdown user={user} onLogout={handleLogout} />
            )}
            {/* Auth links for guests, but not on home or register page */}
            {!user &&
              location.pathname !== "/" &&
              location.pathname !== "/register" &&
              location.pathname !== "/login" && (
                <>
                  <Link to={RoutePath.Login} className={styles.link}>
                    Login
                  </Link>
                  <Link to={RoutePath.Register} className={styles.link}>
                    Register
                  </Link>
                </>
              )}
            {/* Logout now handled in dropdown */}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
