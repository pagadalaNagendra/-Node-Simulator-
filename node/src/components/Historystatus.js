import React, { useState, useEffect } from "react";
import "./Historystatus.css"; // Ensure your styles are maintained
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Modal from "./Modal"; // Import the Modal component

const Historystatus = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false); // State for modal visibility
  const [selectedParameters, setSelectedParameters] = useState(null); // State for selected parameters

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const response = await fetch("http://localhost:8000/simulations/");
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setSimulations(data); // Assuming the response is an array of simulations
        } else {
          throw new Error("Received non-JSON response");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimulations();
  }, []);

  const parseParameters = (parameters) => {
    try {
      if (!parameters) return []; // Handle empty parameter string
      // Replace the Python-like string structure with valid JSON
      const formattedParams = parameters
        .replace(/Parameter\(/g, "{") // Replace 'Parameter(' with '{'
        .replace(/\)/g, "}") // Replace closing ')' with '}'
        .replace(/name='/g, '"name":"') // Replace name=' with valid JSON key-value pair
        .replace(/', min=/g, '", "min":') // Replace ', min=' with correct JSON key
        .replace(/, max=/g, ', "max":') // Replace ', max=' with correct JSON key
        .replace(/'/g, '"'); // Ensure all single quotes are converted to double quotes for JSON

      const parsedParams = JSON.parse(`[${formattedParams}]`);
      return parsedParams;
    } catch (error) {
      console.error("Error parsing parameters:", error);
      return []; // Return an empty array if parsing fails
    }
  };

  const renderNodeIds = (node_ids) => {
    return node_ids.split(",").map((nodeId, index) => (
      <div key={index}>
        {index + 1}. {nodeId}
      </div>
    ));
  };

  const handleDownload = async (timestamp) => {
    try {
      const unixTimestamp = String(timestamp);
      const payload = { timestamp: unixTimestamp };
      console.log("Payload to send:", payload);

      const response = await fetch("http://localhost:8000/logger/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download: ${response.statusText} - ${errorText}`);
      }

      // Get the raw response text
      const rawText = await response.text();
      console.log("Raw response from server:", rawText);

      // Fix the invalid JSON format
      const cleanedText = rawText
        .trim()
        .replace(/},\s*{/g, "},{")
        .replace(/,\s*$/, "");

      // Now, wrap it in array brackets and parse
      const fixedJson = `[${cleanedText}]`;
      const data = JSON.parse(fixedJson);

      // Create a JSON blob
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

      // Create a temporary link element
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `download_${unixTimestamp}.json`; // Set the file name for download
      document.body.appendChild(a);
      a.click(); // Trigger the download
      document.body.removeChild(a); // Clean up the DOM
      URL.revokeObjectURL(url); // Release the object URL

      console.log("Download initiated for timestamp:", unixTimestamp);
    } catch (error) {
      console.error("Error during download:", error);
    }
  };

  const handleParameterClick = (parameters) => {
    setSelectedParameters(parseParameters(parameters)); // Parse and set selected parameters
    setModalOpen(true); // Open the modal
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="historystatus-homepage">
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} parameters={selectedParameters} />
      <div className="historystatus-content">
        <h2>Simulations Data</h2>
        <table className="historystatus-table">
          <thead>
            <tr>
              <th>Node IDs</th>
              <th>Timestamp</th>
              <th>Platform</th>
              <th>Parameters</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {simulations.map((simulation, index) => (
              <tr key={index}>
                <td>{renderNodeIds(simulation.node_ids)}</td>
                <td>{simulation.timestamp}</td>
                <td>{simulation.platform}</td>
                <td>
                  <div
                    className="historystatus-parameters"
                    onClick={() => handleParameterClick(simulation.parameter)}
                  >
                    {simulation.parameter}
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => handleDownload(simulation.timestamp)}
                    className="historystatus-download-button"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Historystatus;




