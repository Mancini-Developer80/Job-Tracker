import { Link } from "react-router-dom";
import { RoutePath } from "../types/routes";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to={RoutePath.Dashboard} className={styles.link}>
          Dashboard
        </Link>
        <Link to={RoutePath.Admin} className={styles.link}>
          Admin
        </Link>
        <Link to={RoutePath.Login} className={styles.link}>
          Login
        </Link>
        <Link to={RoutePath.Register} className={styles.link}>
          Register
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
