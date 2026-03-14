import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

// Fix for default marker icons not showing in React-Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Function to create icons of different colors
const getIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const redIcon = getIcon("red");
const greenIcon = getIcon("green");
const blueIcon = getIcon("blue");

function App() {
  const [potholes, setPotholes] = useState([]);
  const [formData, setFormData] = useState({
    latitude: 25.5941,
    longitude: 85.1376,
    status: "PENDING",
  });

  const fetchPotholes = async () => {
    const res = await fetch("http://localhost:8081/api/potholes");
    const data = await res.json();
    setPotholes(data);
  };

  useEffect(() => {
    fetchPotholes();
  }, []);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file); // This converts the image to a Base64 string
    }
  };
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.latitude) return; // Don't submit if empty

    await fetch("http://localhost:8081/api/potholes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    // Now this reset is safe!
    setFormData({ latitude: null, longitude: null, status: "PENDING" });
    fetchPotholes();
  };

  // --- NEW: UPDATE STATUS FUNCTION ---
  const updateStatus = async (id, newStatus) => {
    await fetch(
      `http://localhost:8081/api/potholes/${id}/status?status=${newStatus}`,
      {
        method: "PUT",
      },
    );
    fetchPotholes(); // Refresh the markers
  };

  // --- NEW: DELETE FUNCTION ---
  const deletePothole = async (id) => {
    await fetch(`http://localhost:8081/api/potholes/${id}`, {
      method: "DELETE",
    });
    fetchPotholes();
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setFormData({
          ...formData,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        });
      },
    });
    return formData.latitude ? (
      // Use blueIcon for the current selection
      <Marker
        position={[formData.latitude, formData.longitude]}
        icon={blueIcon}
      >
        <Popup>New Pothole Location</Popup>
      </Marker>
    ) : null;
  }
  const totalPotholes = potholes.length;
  const pendingCount = potholes.filter((p) => p.status === "PENDING").length;
  const fixedCount = potholes.filter((p) => p.status === "REPAIRED").length;
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f4f7f6",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#2c3e50",
        }}
      >
        🛣️ Path-Sudhaar: Bihar Pothole Tracker
      </h1>

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* LEFT SIDE: THE MAP */}
        <div
          style={{
            height: "550px",
            width: "70%",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
                    <b style={{ fontSize: "14px" }}>Pothole #{p.id}</b>
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt="Pothole Evidence"
                        style={{
                          width: "100%",
                          maxHeight: "150px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginTop: "10px",
                        }}
                      />
                    )}
                    <div
                      style={{
                        margin: "8px 0",
                        color: "#666",
                        fontSize: "12px",
                      }}
                    >
                      <strong>📍 Lat:</strong> {p.latitude.toFixed(5)} <br />
                      <strong>📍 Long:</strong> {p.longitude.toFixed(5)}
                    </div>
                    <hr />
                    <div style={{ marginBottom: "10px" }}>
                      <strong>Status:</strong> {p.status}
                    </div>
                    <button
                      onClick={() => updateStatus(p.id, "REPAIRED")}
                      style={{
                        cursor: "pointer",
                        marginRight: "5px",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    >
                      Mark as Fixed
                    </button>
                    <button
                      onClick={() => deletePothole(p.id)}
                      style={{
                        color: "white",
                        background: "#e74c3c",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            <LocationMarker />
          </MapContainer>
          <p style={{ marginTop: "10px", color: "#7f8c8d" }}>
            <i>Tip: Click anywhere on the map to set coordinates!</i>
          </p>
        </div>

        {/* RIGHT SIDE: FORM + DASHBOARD COLUMN */}
        <div
          style={{
            width: "30%",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* BOX 1: REPORT FORM */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#34495e" }}>
              🚩 Report Pothole
            </h3>
            <p style={{ margin: "5px 0" }}>
              Lat:{" "}
              {formData.latitude
                ? formData.latitude.toFixed(4)
                : "Click on Map"}
            </p>
            <p style={{ margin: "5px 0" }}>
              Long:{" "}
              {formData.longitude
                ? formData.longitude.toFixed(4)
                : "Click on Map"}
            </p>

            <label
              style={{
                display: "block",
                marginTop: "15px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Upload Evidence:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ width: "100%", margin: "10px 0" }}
            />

            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="preview"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
            )}

            <button
              type="submit"
              disabled={!formData.latitude}
              style={{
                width: "100%",
                padding: "12px",
                background: formData.latitude ? "#d9534f" : "#bdc3c7",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: formData.latitude ? "pointer" : "not-allowed",
                transition: "background 0.3s",
              }}
            >
              Confirm & Save to DB
            </button>
          </form>

          {/* BOX 2: ANALYTICS DASHBOARD */}
          <div
            style={{
              background: "#2c3e50",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                borderBottom: "1px solid #444",
                paddingBottom: "10px",
              }}
            >
              📊 Quick Stats
            </h3>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "12px 0",
              }}
            >
              <span>Total Reported:</span>
              <span style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                {totalPotholes}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "12px 0",
                color: "#ff7675",
              }}
            >
              <span>🔴 Pending:</span>
              <span style={{ fontWeight: "bold" }}>{pendingCount}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "12px 0",
                color: "#55efc4",
              }}
            >
              <span>🟢 Fixed:</span>
              <span style={{ fontWeight: "bold" }}>{fixedCount}</span>
            </div>

            <div
              style={{
                marginTop: "15px",
                paddingTop: "15px",
                borderTop: "1px solid #444",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.9em", opacity: 0.8 }}>
                Resolution Rate
              </p>
              <h4 style={{ margin: "5px 0", fontSize: "1.4em" }}>
                {totalPotholes > 0
                  ? ((fixedCount / totalPotholes) * 100).toFixed(1)
                  : 0}
                %
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
