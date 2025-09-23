import React from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import {
  FaLock,
  FaChartBar,
  FaEdit,
  FaUserCog,
  FaShieldAlt,
} from "react-icons/fa";

const Home: React.FC = () => {
  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>Welcome to Job Tracker Dashboard</h1>
      <p className={styles.subtitle}>
        Effortlessly manage your job applications, track your progress, and gain
        insights with our full-featured dashboard.
      </p>
      <ul className={styles.features}>
        <li>
          <FaLock className={styles.icon} /> Secure authentication and user
          management
        </li>
        <li>
          <FaChartBar className={styles.icon} /> Analytics and job stats
        </li>
        <li>
          <FaEdit className={styles.icon} /> Add, edit, and delete job
          applications
        </li>
        <li>
          <FaUserCog className={styles.icon} /> Profile and settings management
        </li>
        <li>
          <FaShieldAlt className={styles.icon} /> Admin features for advanced
          control
        </li>
      </ul>
      <div className={styles.actions}>
        <Link to="/register" className={styles.button}>
          Get Started
        </Link>
        <Link to="/login" className={styles.linkButton}>
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;
