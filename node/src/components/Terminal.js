// Terminal.js
// import React from 'react';
// import './Terminal.css'; // Adjust styles as needed

// const Terminal = ({ data }) => {
//   return (
//     <div className="terminal">
//       <h2>Terminal Output</h2>
//       <pre>{data}</pre>
//     </div>
//   );
// };
// export default Terminal;


import React, { useEffect, useState } from "react";
import "./Terminal.css"; // Link to your CSS file
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Terminal = ({ reloadKey }) => {
  const [data, setData] = useState("");

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/services/events");

    eventSource.onmessage = (event) => {
      setData((prevData) => prevData + event.data + "\n");
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [reloadKey]); // Listen to reloadKey changes

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
