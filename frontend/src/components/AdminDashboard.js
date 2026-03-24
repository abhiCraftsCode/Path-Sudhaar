import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const AdminDashboard = ({
  potholes,
  fetchPotholes,
  redIcon,
  greenIcon,
  currentAdmin,
  onLogout,
  admins,
  fetchAdmins,
}) => {
  const [showReg, setShowReg] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    role: "SUB_ADMIN",
  });
  const [delUsername, setDelUsername] = useState("");
  const [enlargedId, setEnlargedId] = useState(null);

  const backendBase =
    window.location.hostname === "localhost"
      ? "http://localhost:8081"
      : window.location.origin.replace("3000", "8081");

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `${backendBase}/api/potholes/${id}/status?status=${status}`,
        { method: "PUT" },
      );
      if (res.ok) fetchPotholes();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const deletePothole = async (id) => {
    if (
      window.confirm(
        "⚠️ Are you sure you want to PERMANENTLY delete this report?",
      )
    ) {
      try {
        const res = await fetch(`${backendBase}/api/potholes/${id}`, {
          method: "DELETE",
        });
        if (res.ok) fetchPotholes();
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendBase}/api/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin),
      });
      if (res.ok) {
        alert(`🚀 Success! ${newAdmin.username} added.`);
        setShowReg(false);
        setNewAdmin({ username: "", password: "", role: "SUB_ADMIN" });
        if (fetchAdmins) fetchAdmins();
      }
    } catch (err) {
      alert("Registration error.");
    }
  };

  const handleDeleteByName = async (e) => {
    e.preventDefault();
    if (delUsername === currentAdmin.username) {
      alert("You cannot delete your own account!");
      return;
    }
    if (window.confirm(`Permanently delete user: ${delUsername}?`)) {
      const res = await fetch(
        `${backendBase}/api/admin/deleteByUsername?username=${delUsername}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        alert("User removed from database.");
        setDelUsername("");
        setShowDel(false);
        if (fetchAdmins) fetchAdmins();
      } else {
        alert("User not found.");
      }
    }
  };

  const total = potholes.length;
  const fixed = potholes.filter((p) => p.status === "FIXED").length;
  const pending = total - fixed;
  const efficiency = total > 0 ? ((fixed / total) * 100).toFixed(1) : 0;

  return (
    <div style={styles.mainContainer}>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>🛡️ Path-Sudhaar Dashboard</h2>
          <small>
            User: <b>{currentAdmin.username}</b> | Role:{" "}
            <span style={{ color: "#f1c40f" }}>{currentAdmin.role}</span>
          </small>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <div style={styles.grid}>
        <div style={styles.mapWrapper}>
          <MapContainer
            center={[21.2514, 81.6296]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {potholes.map((p) => (
              <Marker
                key={p.id}
                position={[p.latitude, p.longitude]}
                icon={p.status === "FIXED" ? greenIcon : redIcon}
              >
                <Popup>
                  <div style={styles.popupContainer}>
                    <p style={styles.popupId}>ID: #{p.id}</p>
                    <p style={styles.popupCoords}>
                      📍 {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}
                    </p>

                    <div style={styles.imageBox}>
                      {p.imageUrl && p.imageUrl !== "" ? (
                        <>
                          <img
                            src={p.imageUrl}
                            alt="pothole"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEnlargedId(enlargedId === p.id ? null : p.id);
                            }}
                            style={{
                              ...styles.popupImg,
                              cursor: "zoom-in",
                              ...(enlargedId === p.id
                                ? styles.enlargedStyle
                                : {}),
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentNode.innerHTML =
                                "<div style='color:#95a5a6; font-size:11px; padding-top:40px;'>⚠️ Image Error</div>";
                            }}
                          />
                          {enlargedId === p.id && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setEnlargedId(null);
                              }}
                              style={styles.fullScreenBackdrop}
                            />
                          )}
                        </>
                      ) : (
                        <div
                          style={{
                            color: "#95a5a6",
                            fontSize: "11px",
                            textAlign: "center",
                            paddingTop: "40px",
                          }}
                        >
                          🚫 No Image
                        </div>
                      )}
                    </div>

                    <p style={{ fontSize: "13px", margin: "5px 0" }}>
                      Status:{" "}
                      <b
                        style={{
                          color: p.status === "FIXED" ? "#27ae60" : "#e74c3c",
                        }}
                      >
                        {p.status}
                      </b>
                    </p>

                    <div style={styles.popupActions}>
                      {p.status !== "FIXED" && (
                        <button
                          onClick={() => updateStatus(p.id, "FIXED")}
                          style={styles.popFixBtn}
                        >
                          ✅ Fix
                        </button>
                      )}
                      <button
                        onClick={() => deletePothole(p.id)}
                        disabled={currentAdmin.role !== "MASTER"}
                        style={{
                          ...styles.popDelBtn,
                          background:
                            currentAdmin.role === "MASTER"
                              ? "#e74c3c"
                              : "#bdc3c7",
                          cursor:
                            currentAdmin.role === "MASTER"
                              ? "pointer"
                              : "not-allowed",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div style={styles.sidebar}>
          <h3 style={styles.sideTitle}>📈 Analytics</h3>
          <div style={styles.statBox}>
            <p>
              Total: <b>{total}</b>
            </p>
            <p>
              Resolved: <b style={{ color: "#27ae60" }}>{fixed}</b>
            </p>
            <p>
              Pending: <b style={{ color: "#e67e22" }}>{pending}</b>
            </p>
            <hr />
            <p>
              Resolution Rate: <b style={{ color: "#3498db" }}>{efficiency}%</b>
            </p>
          </div>

          {currentAdmin.role === "MASTER" && (
            <div style={{ marginTop: "30px" }}>
              <h3 style={styles.sideTitle}>👥 User Management</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setShowReg(true)}
                  style={{ ...styles.actionBtn, background: "#3498db" }}
                >
                  ➕ Add
                </button>
                <button
                  onClick={() => setShowDel(true)}
                  style={{ ...styles.actionBtn, background: "#e74c3c" }}
                >
                  🗑️ Delete
                </button>
              </div>
              <div style={styles.adminList}>
                {admins &&
                  admins.map((adm) => (
                    <div key={adm.id} style={styles.adminRow}>
                      <span>
                        {adm.username}{" "}
                        <small style={{ color: "#7f8c8d" }}>({adm.role})</small>
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {(showReg || showDel) && (
        <div
          style={styles.modalOverlay}
          onClick={() => {
            setShowReg(false);
            setShowDel(false);
          }}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.sideTitle}>
              {showReg ? "Create New Admin" : "Delete Admin Account"}
            </h3>
            {showReg ? (
              <form onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Username"
                  required
                  style={styles.regInput}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, username: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  style={styles.regInput}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, password: e.target.value })
                  }
                />
                <select
                  style={styles.regInput}
                  value={newAdmin.role}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, role: e.target.value })
                  }
                >
                  <option value="SUB_ADMIN">Sub-Admin</option>
                  <option value="MASTER">Master Admin</option>
                </select>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={styles.saveBtn}>
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReg(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleDeleteByName}>
                <p style={{ fontSize: "12px", color: "#666" }}>
                  Enter exact username to remove:
                </p>
                <input
                  type="text"
                  placeholder="Username"
                  required
                  style={styles.regInput}
                  value={delUsername}
                  onChange={(e) => setDelUsername(e.target.value)}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    style={{ ...styles.saveBtn, background: "#e74c3c" }}
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDel(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  enlargedStyle: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90vw",
    height: "auto",
    maxHeight: "85vh",
    zIndex: 9999, // Ensure it's above everything
    borderRadius: "15px",
    boxShadow: "0 0 50px rgba(0,0,0,0.9)",
    objectFit: "contain",
    backgroundColor: "#000", // Black background helps the image "pop"
    display: "block",
  },
  fullScreenBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.8)",
    zIndex: 4500,
    cursor: "pointer",
  },
  imageBox: {
    height: "100px",
    width: "100%",
    background: "#f0f0f0",
    borderRadius: "5px",
    margin: "5px 0",
    position: "relative",
  },
  mainContainer: {
    padding: "20px",
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f4f7f6",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#2c3e50",
    color: "white",
    padding: "15px 25px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  logoutBtn: {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  grid: { display: "grid", gridTemplateColumns: "3fr 1fr", gap: "20px" },
  mapWrapper: {
    height: "75vh",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  sidebar: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  sideTitle: {
    borderBottom: "2px solid #3498db",
    paddingBottom: "10px",
    marginBottom: "15px",
    fontSize: "18px",
  },
  statBox: {
    fontSize: "14px",
    lineHeight: "1.8",
    background: "#f9f9f9",
    padding: "10px",
    borderRadius: "8px",
  },
  popupContainer: { textAlign: "center", width: "160px" },
  popupId: {
    margin: "0",
    fontWeight: "bold",
    color: "#34495e",
    fontSize: "14px",
  },
  popupCoords: { fontSize: "9px", color: "#7f8c8d", margin: "2px 0" },
  popupImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "5px",
  },
  popupActions: { display: "flex", gap: "5px", marginTop: "8px" },
  popFixBtn: {
    flex: 3,
    background: "#2ecc71",
    color: "white",
    border: "none",
    padding: "6px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
  },
  popDelBtn: {
    flex: 1,
    color: "white",
    border: "none",
    padding: "6px",
    borderRadius: "4px",
    fontWeight: "bold",
    fontSize: "12px",
  },
  actionBtn: {
    flex: 1,
    padding: "10px",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  adminList: { marginTop: "15px", maxHeight: "200px", overflowY: "auto" },
  adminRow: {
    padding: "8px",
    borderBottom: "1px solid #eee",
    fontSize: "12px",
  },
  restrictedNote: {
    marginTop: "20px",
    padding: "15px",
    background: "#fff3cd",
    color: "#856404",
    borderRadius: "5px",
    fontSize: "12px",
    border: "1px solid #ffeeba",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 6000,
  },
  modal: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    width: "320px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  regInput: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
    boxSizing: "border-box",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  saveBtn: {
    flex: 1,
    padding: "10px",
    background: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    background: "#95a5a6",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default AdminDashboard;
