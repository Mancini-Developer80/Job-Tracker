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
              <span
                className={styles.link}
                style={{ fontWeight: 500, color: "#007bff" }}
              >
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
