import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Import modular components ---
import PublicReport from "./components/PublicReport";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";

// --- CUSTOM ICONS (Keep in App.js to pass as props) ---
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

function App() {
  const [potholes, setPotholes] = useState([]);

  // 1. Initialize admin from Session Storage (Object instead of Boolean)
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const savedAdmin = sessionStorage.getItem("adminUser");
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const fetchPotholes = async () => {
    try {
      const res = await fetch("http://192.168.1.6:8081/api/potholes");
      const data = await res.json();
      setPotholes(data);
    } catch (err) {
      console.error("Backend not reachable. Check IP or Spring Boot.");
    }
  };

  // 2. Handle Login/Logout State
  const handleAuthChange = (adminData) => {
    if (adminData) {
      sessionStorage.setItem("adminUser", JSON.stringify(adminData));
      setCurrentAdmin(adminData);
    } else {
      sessionStorage.removeItem("adminUser");
      setCurrentAdmin(null);
    }
  };

  useEffect(() => {
    fetchPotholes();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Citizen Portal */}
        <Route path="/" element={<PublicReport onReport={fetchPotholes} />} />

        {/* Protected Admin Dashboard */}
        <Route
          path="/admin"
          element={
            currentAdmin ? (
              <AdminDashboard
                potholes={potholes}
                fetchPotholes={fetchPotholes}
                redIcon={redIcon}
                greenIcon={greenIcon}
                currentAdmin={currentAdmin} // Passing role/username down
                onLogout={() => handleAuthChange(null)}
              />
            ) : (
              <AdminLogin onLogin={handleAuthChange} />
            )
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
