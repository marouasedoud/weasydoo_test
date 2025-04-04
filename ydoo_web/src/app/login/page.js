"use client"; // Required for Next.js hooks

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/AuthContext";
import { AiOutlineArrowLeft } from "react-icons/ai";
import styles from "./loginPage.module.css";  // Use module import

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (error) {
      setError(error.message); // Catch and set error message from login function
    }
  };

  return (
    <div className={styles.loginContainer}>
      <button className={styles.arrowButton} onClick={() => router.back()}>
        <AiOutlineArrowLeft className={styles.arrowIcon} />
      </button>
      <div className={styles.textContainer}>
        <div>Authorized</div>
        <div>users</div>
        <div>space</div>
      </div>
      <div className={styles.loginBox}>
        <img
          src="/Weasydoo.png"
          alt="Weasydoo Logo"
          className={styles.logoImage}
        />
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className={styles.button} type="submit">LOG IN</button>
        </form>
      </div>
    </div>
  );
}
