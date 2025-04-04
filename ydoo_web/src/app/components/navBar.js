"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/AuthContext";
import './NavBar.css'; // Import the external CSS file

const NavBar = () => {
  const { token, username, logout } = useContext(AuthContext);

  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const handleLogoClick = () => {
    router.push("/"); // Redirect to the homepage when the logo is clicked
  };

  return (
    <nav className="navbar">
      <img
        src="/Weasydoo.png"
        alt="Weasydoo Logo"
        className="logo"
        onClick={handleLogoClick} // Add click handler to the logo
      />
      {token ? (
        <div className="auth-section">
          <span className="welcome-message">Welcome, {username}!</span>
          <button className="auth-button logout-button" onClick={logout}>Logout</button>
        </div>
      ) : (
        <button className="auth-button login-button" onClick={() => router.push("/login")}>Login</button>
      )}
    </nav>
  );
};

export default NavBar;
