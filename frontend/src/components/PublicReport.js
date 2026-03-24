import React, { useState } from "react";

const PublicReport = ({ onReport }) => {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });

  // 1. Get GPS Location
  const getAutoLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        console.error(err);
        alert("📍 Please enable GPS permissions to report!");
        setLoading(false);
      },
    );
  };

  // 2. Submit to Backend (Matched to your Schema)
  const submitReport = async (e) => {
    e.preventDefault();

    if (!location.lat || !location.lng) {
      alert("Please capture your GPS location first!");
      return;
    }

    setIsSubmitting(true);

    // DYNAMIC URL: Detects if on Laptop (localhost) or Phone (ngrok)
    const backendBase =
      window.location.hostname === "localhost"
        ? "http://localhost:8081"
        : window.location.origin.replace("3000", "8081");

    const formData = new FormData(e.target);

    // MATCHING YOUR SCHEMA COLUMNS EXACTLY
    formData.append("latitude", location.lat);
    formData.append("longitude", location.lng);
    formData.append("status", "PENDING");

    try {
      const res = await fetch(`${backendBase}/api/potholes`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("🚀 Success! Pothole reported to the Database.");
        if (typeof onReport === "function") onReport();

        // --- UI RESET ---
        e.target.reset(); // Clears the file input
        setLocation({ lat: null, lng: null }); // Resets location state (GPS button goes back to Blue)
      } else {
        const errorText = await res.text();
        alert(`❌ Server Error: ${res.status} - ${errorText}`);
      }
    } catch (err) {
      console.error("Connection Error:", err);
      alert("📡 Connection Failed! Is the Backend and ngrok running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ color: "#2c3e50" }}>📍 Path-Sudhaar</h2>
        <p style={{ color: "#7f8c8d" }}>Pothole Reporting Portal</p>

        <form onSubmit={submitReport}>
          {/* GPS Button - Changes to Amber (#f39c12) when captured */}
          <button
            type="button"
            onClick={getAutoLocation}
            style={{
              ...styles.gpsBtn,
              background: location.lat ? "#f39c12" : "#3498db",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Detecting GPS..."
              : location.lat
                ? "✅ Location Captured"
                : "🎯 Get Current Location"}
          </button>

          {/* Image Input */}
          <div style={styles.field}>
            <label style={styles.label}>Upload Photo Evidence</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              capture="environment"
              required
              style={styles.input}
            />
          </div>

          {/* Submit Button - Changes to Grey (#95a5a6) when isSubmitting is true */}
          <button
            type="submit"
            disabled={isSubmitting || !location.lat}
            style={{
              ...styles.submitBtn,
              background: isSubmitting
                ? "#95a5a6"
                : location.lat
                  ? "#27ae60"
                  : "#bdc3c7",
              opacity: 1, // Controlled by background color now
              cursor: isSubmitting || !location.lat ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "🚀 UPLOADING..." : "REPORT POTHOLE"}
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
    background: "#f0f2f5",
    padding: "20px",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
  },
  field: { textAlign: "left", marginBottom: "20px" },
  label: {
    fontSize: "12px",
    color: "#7f8c8d",
    fontWeight: "bold",
    display: "block",
    marginBottom: "5px",
  },
  gpsBtn: {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    transition: "background 0.3s ease",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxSizing: "border-box",
  },
  submitBtn: {
    width: "100%",
    padding: "15px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    transition: "background 0.3s ease",
  },
};

export default PublicReport;
