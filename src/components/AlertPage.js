// SweartAlert.js
import React, { useEffect, useState } from "react";
import config from "../config";

const SweartAlert = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch(`${config.backendAPI}/alerts/`) // Adjust the endpoint as necessary
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAlerts(data);
        } else {
          console.error("Unexpected data format:", data);
          setAlerts([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching alerts:", error);
        setAlerts([]);
      });
  }, []);

  return (
    <div className="sweart-alert">
      <h2>Sweart Alerts</h2>
      <table className="alerts-table">
        <thead>
          <tr>
            <th>Alert ID</th>
            <th>Message</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <tr key={alert.id}>
                <td>{alert.id}</td>
                <td>{alert.message}</td>
                <td>{new Date(alert.date).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No alerts available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SweartAlert;
