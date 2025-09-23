import { Link, useNavigate, useLocation } from "react-router-dom";
import { RoutePath } from "../types/routes";
import styles from "./Navbar.module.css";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "./UserDropdown";

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
