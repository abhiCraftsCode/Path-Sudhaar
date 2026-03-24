import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- CUSTOM ICONS ---
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- 1. PUBLIC MOBILE REPORTER COMPONENT ---
const PublicReport = ({ onReport }) => {
  const [formData, setFormData] = useState({
    latitude: null,
    longitude: null,
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false); // For GPS
  const [isSubmitting, setIsSubmitting] = useState(false); // For Final Upload

  const getAutoLocation = () => {
    if (!navigator.geolocation) return alert("GPS not supported!");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setLoading(false);
      },
      () => {
        alert("Please enable GPS permissions!");
        setLoading(false);
      },
    );
  };

  const handleCapture = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData({ ...formData, imageUrl: reader.result });
    if (file) reader.readAsDataURL(file);
  };

  const submitReport = async () => {
    if (!formData.latitude || !formData.imageUrl)
      return alert("Location + Photo required!");

    setIsSubmitting(true); // START LOADER
    try {
      const response = await fetch("http://192.168.1.6:8081/api/potholes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "PENDING" }),
      });

      if (response.ok) {
        alert("✅ Pothole Reported Successfully!");
        setFormData({ latitude: null, longitude: null, imageUrl: "" });
        onReport(); // Refresh admin data
      } else {
        alert("Submission failed on server.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Network Error: Could not connect to IdeaPad.");
    } finally {
      setIsSubmitting(false); // STOP LOADER
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#f4f7f6",
        minHeight: "100vh",
      }}
    >
      <h2>🛣️ Path-Sudhaar</h2>
      <p>Pothole Reporting Portal</p>
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={getAutoLocation}
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "15px",
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "8px",
            marginBottom: "15px",
            fontWeight: "bold",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          {formData.latitude
            ? "✅ Location Captured"
            : loading
              ? "Locating..."
              : "📍 Get My Location"}
        </button>

        <label
          style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}
        >
          Take Photo:
        </label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          disabled={isSubmitting}
          style={{ marginBottom: "15px", width: "100%" }}
        />

        {formData.imageUrl && (
          <img
            src={formData.imageUrl}
            alt="preview"
            style={{
              width: "100%",
              borderRadius: "10px",
              marginBottom: "15px",
              opacity: isSubmitting ? 0.5 : 1,
            }}
          />
        )}

        <button
          onClick={submitReport}
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "15px",
            background: isSubmitting ? "#bdc3c7" : "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "0.3s",
          }}
        >
          {isSubmitting ? "🚀 UPLOADING..." : "SUBMIT REPORT"}
        </button>
      </div>
    </div>
  );
};

// --- 2. ADMIN DASHBOARD COMPONENT ---
const AdminDashboard = ({ potholes, fetchPotholes }) => {
  const updateStatus = async (id, status) => {
    await fetch(
      `http://192.168.1.6:8081/api/potholes/${id}/status?status=${status}`,
      { method: "PUT" },
    );
    fetchPotholes();
  };

  const deletePothole = async (id) => {
    await fetch(`http://192.168.1.6:8081/api/potholes/${id}`, {
      method: "DELETE",
    });
    fetchPotholes();
  };

  const total = potholes.length;
  const fixed = potholes.filter((p) => p.status === "REPAIRED").length;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#2c3e50" }}>👨‍✈️ Admin Controller</h1>
      <div style={{ display: "flex", gap: "20px" }}>
        <div
          style={{
            width: "70%",
            height: "550px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <MapContainer
            center={[25.5941, 85.1376]}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {potholes.map((p) => (
              <Marker
                key={p.id}
                position={[p.latitude, p.longitude]}
                icon={p.status === "REPAIRED" ? greenIcon : redIcon}
              >
                <Popup>
                  <div style={{ minWidth: "150px" }}>
                    <b>Pothole #{p.id}</b>
                    <br />
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        style={{
                          width: "100%",
                          borderRadius: "5px",
                          marginTop: "5px",
                        }}
                        alt="evidence"
                      />
                    )}
                    <div
                      style={{ marginTop: "10px", display: "flex", gap: "5px" }}
                    >
                      <button
                        onClick={() => updateStatus(p.id, "REPAIRED")}
                        style={{ cursor: "pointer", padding: "5px" }}
                      >
                        Fix
                      </button>
                      <button
                        onClick={() => deletePothole(p.id)}
                        style={{
                          color: "white",
                          background: "red",
                          border: "none",
                          borderRadius: "3px",
                          padding: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div
          style={{
            width: "30%",
            background: "#2c3e50",
            color: "white",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h2>📊 Stats</h2>
          <p>
            Total: <b>{total}</b>
          </p>
          <p style={{ color: "#ff7675" }}>
            Pending: <b>{total - fixed}</b>
          </p>
          <p style={{ color: "#55efc4" }}>
            Fixed: <b>{fixed}</b>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- 3. MAIN APP ROUTER ---
function App() {
  const [potholes, setPotholes] = useState([]);

  const fetchPotholes = async () => {
    try {
      const res = await fetch("http://192.168.1.6:8081/api/potholes");
      const data = await res.json();
      setPotholes(data);
    } catch (err) {
      console.error("Backend not running?");
    }
  };

  useEffect(() => {
    fetchPotholes();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicReport onReport={fetchPotholes} />} />
        <Route
          path="/admin"
          element={
            <AdminDashboard potholes={potholes} fetchPotholes={fetchPotholes} />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
