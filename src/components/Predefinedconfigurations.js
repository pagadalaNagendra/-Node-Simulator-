import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./platform.css";
import config from "../config";
import Status from "./statustable";
import Terminal from "./Terminal"; // Import the Terminal component
import "./Predefinedconfigurations.css";

const PredefinedConfigurations = () => {
  const [platforms, setPlatforms] = useState([]);
  const [segmentedData, setSegmentedData] = useState([[], [], []]);
  const [isRunning, setIsRunning] = useState(false); // Track service status for start/stop
  const MySwal = withReactContent(Swal);

  // Function to partition data into three segments
  const partitionData = (data) => {
    const totalNodes = data.length;
    console.log(totalNodes);
    
    const segmentSize = Math.ceil(totalNodes / 3);
    const partitionedData = [data.slice(0, segmentSize), data.slice(segmentSize, 2 * segmentSize), data.slice(2 * segmentSize, totalNodes)];

    const platformNames = partitionedData.map((segment) => {
      const platformsInSegment = Array.from(new Set(segment.map((node) => node.platform)));
      return platformsInSegment.length > 0 ? platformsInSegment.join(", ") : "Unknown Platform";
    });

    setSegmentedData(partitionedData);
    setPlatforms(platformNames);
  };

  // Fetch unique platforms and nodes
  useEffect(() => {
    fetch(`${config.backendAPI}/nodes?skip=0&limit=1000`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        
        return Promise.all(
          data.map(async (node) => {
            const paramResponse = await fetch(`${config.backendAPI}/nodes/all/${node.node_id}`);
            const paramData = await paramResponse.json();
            return { ...node, parameters: paramData.parameters || [] };
          })
        );
      })
      .then((nodesWithParams) => {
        //console.log(nodesWithParams);
        partitionData(nodesWithParams);

      })
      .catch((error) => console.error("Error fetching nodes or parameters:", error));
  }, []);

  // Handle Start/Stop button click with confirmation
  const handleStartStopToggle = (segmentData) => {
    const action = isRunning ? "stop" : "start";
    
    MySwal.fire({
      title: `Are you sure you want to ${action} the services?`,
      text: `This will ${action} the selected services for the nodes.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // If user confirms, proceed with starting or stopping services
        const url = isRunning ? `${config.backendAPI}/services/stop` : `${config.backendAPI}/services/start`;
        const method = "PUT";

        fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            segmentData.map((node) => ({
              node_id: node.node_id,
              frequency: node.frequency,
              parameters:
                node.parameters.map((param) => ({
                  name: param.name,
                  min: param.min_value,
                  max: param.max_value,
                })) || [],
              platform: node.platform,
              protocol: node.protocol,
            }))
          ),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(`${isRunning ? "Stop" : "Start"} response data:`, data);
            MySwal.fire('Success!', `The services have been ${action}ed.`, 'success');
            setIsRunning(!isRunning); // Toggle running state
          })
          .catch((error) => {
            console.error(`Error ${isRunning ? "stopping" : "starting"} services:`, error);
            MySwal.fire('Error!', `Failed to ${action} the services. Please try again.`, 'error');
          });
      }
    });
  };

  // Display SweetAlert pop-up with node details and Start/Stop buttons
  const showNodeDetailsPopup = (segmentData, segmentIndex) => {
    MySwal.fire({
      title: `Nodes in Platform: ${platforms[segmentIndex]}`,
      html: (
        <div>
          <div className="Predefinedconfigurations-card-container">
            {segmentData.map((node, index) => (
              <div key={node.node_id} className="Predefinedconfigurations-card">
                <span className="node-number">#{index + 1}</span>
                <p>Node ID: {node.node_id}</p>
                <p>Frequency: {node.frequency}</p>
                <p>Platform: {node.platform}</p>
                <p>Protocol: {node.protocol}</p>
                {node.parameters && node.parameters.length > 0 && (
                  <div className="parameter-sections">
                    <h4>Parameters:</h4>
                    <table className="parameter-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Min Value</th>
                          <th>Max Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {node.parameters.map((parameter) => (
                          <tr key={parameter.id}>
                            <td>{parameter.name}</td>
                            <td>{parameter.min_value}</td>
                            <td>{parameter.max_value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            className="start-stop-btn"
            onClick={() => handleStartStopToggle(segmentData)}
          >
            {isRunning ? "Stop" : "Start"}
          </button>
        </div>
      ),
      showConfirmButton: false,
      showCloseButton: true,
    });
  };

  return (
    <div className="homepage">
      <div className="Predefinedconfigurations-contentnm unique-contentnm">
        <h2>Available Platforms</h2>

        {/* Display segments as cards */}
        <div className="platform-Predefinedconfigurations-card-container">
          {segmentedData.map((segment, index) => (
            <div
              key={index}
              className="platform-card"
              onClick={() => showNodeDetailsPopup(segment, index)}
            >
              <img
                src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1729158600/ISC2_CCSP_RGB__mark-removebg-preview_rzulja.png"
                alt="Platform Logo"
                className="platform-icon"
              />
              <h3>{platforms[index] || `Segment ${index + 1}`}</h3>
              <p>{`Contains ${segment.length} nodes`}</p>
            </div>
          ))}
        </div>

        <div className="right-sidebar unique-right-sidebar">
          <div className="table-container unique-table-container">
            <Status />
          </div>
          <Terminal />
        </div>
      </div>
    </div>
  );
};

export default PredefinedConfigurations;
