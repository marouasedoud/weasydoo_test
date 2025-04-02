"use client";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { token, username, logout } = useContext(AuthContext);
  const router = useRouter();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid #ddd" }}>
      <img 
        src="/Weasydoo.png" 
        alt="Weasydoo Logo" 
        style={{ height: "40px" }} 
      />
        {token ? (
          <div>
            <span style={{ marginRight: "10px" }}>Welcome, {username}!</span>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <button onClick={() => router.push("/login")}>Login</button>
        )}
      </nav>

      {/* Main Content */}
      <h1>Welcome</h1>
    </div>
  );
}
