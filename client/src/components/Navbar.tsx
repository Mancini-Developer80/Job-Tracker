import { Link, useNavigate, useLocation } from "react-router-dom";
import { RoutePath } from "../types/routes";
import styles from "./Navbar.module.css";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
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
            {/* Show user name when logged in */}
            {user && user.name && (
              <span className={styles.userName}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{ marginRight: 6 }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="10"
                    cy="6.5"
                    r="3.5"
                    fill="#2563eb"
                    fillOpacity="0.18"
                  />
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
              </span>
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
            {/* Logout for logged-in users */}
            {user && (
              <button className={styles.logoutButton} onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
