import React, { useEffect, useState } from "react";
import "./Terminal.css"; // Link to your CSS file
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2"; // Import SweetAlert2

const Terminal = ({ reloadKey }) => {
  const [data, setData] = useState("");
  const [runningNodes, setRunningNodes] = useState(new Set()); // Track active nodes

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/services/events");

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data); // Parse the event data
        const { node_id, status_code, error } = parsedData;

        setData((prevData) => prevData + JSON.stringify(parsedData, null, 2) + "\n");

        if (status_code !== 201) {
          handleAlert(node_id); // Trigger SweetAlert if status_code isn't 201
        } else {
          setRunningNodes((prevNodes) => new Set(prevNodes).add(node_id)); // Add node to running set
        }
      } catch (err) {
        console.error("Failed to parse event data:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [reloadKey]); // Listen to reloadKey changes

  const handleAlert = (nodeId) => {
    Swal.fire({
      title: "Node not found",
      text: `Issue detected with node: ${nodeId}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Stop requests",
      cancelButtonText: "Continue",
    }).then((result) => {
      if (result.isConfirmed) {
        stopRequests(); // Hit the stop endpoint if confirmed
      } else {
        console.log("Simulation continues...");
      }
    });
  };

  const stopRequests = async () => {
    try {
      const response = await fetch("http://localhost:8000/services/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: Array.from(runningNodes) }), // Send running nodes
      });

      if (!response.ok) {
        throw new Error("Failed to stop the requests.");
      }

      Swal.fire("Stopped!", "All running nodes have been stopped.", "success");
      setRunningNodes(new Set()); // Clear the nodes after stopping
    } catch (error) {
      console.error("Error stopping requests:", error);
      Swal.fire("Error", "Unable to stop requests.", "error");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("http://localhost:8000/logger/");
      if (!response.ok) {
        throw new Error("Failed to fetch data from logger.");
      }
      const loggerData = await response.text(); // Fetch as plain text

      // Create a file and trigger download
      const element = document.createElement("a");
      const file = new Blob([loggerData], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "logger_data.txt";
      document.body.appendChild(element); // Required for this to work in Firefox
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error("Error downloading data:", error);
    }
  };

  return (
    <div className="streaming-data-container">
      <pre>{data}</pre>
      <button className="download-button" onClick={handleDownload}>
        <p className="button-text">Streaming Data</p>
        <FontAwesomeIcon icon={faDownload} className="download-icon" /> {/* Font Awesome download icon */}
      </button>
    </div>
  );
};

export default Terminal;
