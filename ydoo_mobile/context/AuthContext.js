import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("authToken");
        const savedUsername = await AsyncStorage.getItem("username");

        if (savedToken && savedUsername) {
          setToken(savedToken);
          setUsername(savedUsername);
        }
      } catch (error) {
        console.error("Failed to load auth data:", error);
      }
    };

    loadAuthData();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch("https://fakestoreapi.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password.");
      }

      const data = await response.json();
      setToken(data.token);
      setUsername(username);
      await AsyncStorage.setItem("authToken", data.token);
      await AsyncStorage.setItem("username", username);
    } catch (error) {
      console.error("Login Error:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("username");
      setToken(null);
      setUsername(null);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
