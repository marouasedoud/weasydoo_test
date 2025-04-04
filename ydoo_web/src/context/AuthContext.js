"use client";

import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUsername = localStorage.getItem("username");

    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch("https://fakestoreapi.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password."); // Custom error message
      }

      const data = await response.json();
      setToken(data.token);
      setUsername(username);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("username", username);
      router.push("/"); // Redirect to Home
    } catch (error) {
      console.error("Login Error:", error.message);
      throw error; // Re-throw the error to be caught by the login page
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
    router.push("/"); // Redirect to Home
  };

  return (
    <AuthContext.Provider value={{ token, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
