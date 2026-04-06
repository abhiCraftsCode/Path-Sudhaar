import React, { useState } from "react";

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Dynamic URL for Laptop (localhost) vs Phone (ngrok)
      const backendBase =
        window.location.hostname === "localhost"
          ? "http://localhost:8081"
          : window.location.origin.replace("3000", "8081");

      const response = await fetch(`${backendBase}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const adminData = await response.json();
        console.log("Login Successful:", adminData.username);
        onLogin(adminData);
      } else {
        alert("❌ Access Denied: Incorrect Username or Password.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert(
        "📡 Connection Error: Cannot reach the Backend. Ensure Spring Boot is running and MongoDB service is active.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Path-Sudhaar Admin</h2>
        <p style={styles.subtitle}>Dashboard LogIn Portal</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            autoComplete="current-password"
          />
          <button
            type="submit"
            style={{
              ...styles.button,
              background: loading ? "#95a5a6" : "#e74c3c",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Login to System"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#1a1a2e", // Dark professional blue
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    width: "320px",
    textAlign: "center",
  },
  title: { color: "#2c3e50", marginBottom: "10px", fontSize: "22px" },
  subtitle: { color: "#7f8c8d", fontSize: "14px", marginBottom: "25px" },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "12px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "16px",
    transition: "0.3s ease",
  },
};

export default AdminLogin;
