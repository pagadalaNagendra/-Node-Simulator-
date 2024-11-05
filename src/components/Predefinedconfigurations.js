import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./platform.css";
import config from "../config";
import Status from "./statustable";
import Terminal from "./Terminal";
import "./Predefinedconfigurations.css";

const PredefinedConfigurations = () => {
  const [platformSegments, setPlatformSegments] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const MySwal = withReactContent(Swal);

  const platformImages = {
    ccsp: "https://res.cloudinary.com/dxoq1rrh4/image/upload/v1729158600/ISC2_CCSP_RGB__mark-removebg-preview_rzulja.png",
    OneM2m: "https://res.cloudinary.com/dxoq1rrh4/image/upload/v1729279553/logofilepng-removebg-preview_bddmjp.png",
    om2m: "https://example.com/image3.png",
    // Add more platforms and their respective image URLs
  };

  const partitionData = (data) => {
    const groupedPlatforms = {};

    data.forEach((node) => {
      if (!groupedPlatforms[node.platform]) {
        groupedPlatforms[node.platform] = [];
      }
      groupedPlatforms[node.platform].push(node);
    });

    const segments = {};
    for (const platform in groupedPlatforms) {
      const nodes = groupedPlatforms[platform];
      const totalNodes = nodes.length;
      const segmentSize = Math.ceil(totalNodes / 3);

      const platformSegments = [
        nodes.slice(0, segmentSize),
        nodes.slice(segmentSize, 2 * segmentSize),
        nodes.slice(2 * segmentSize, totalNodes),
      ];

      segments[platform] = platformSegments;
    }

    setPlatformSegments(segments);
  };

  useEffect(() => {
    fetch(`${config.backendAPI}/nodes?skip=0&limit=1000`)
      .then((response) => response.json())
      .then((data) => {
        return Promise.all(
          data.map(async (node) => {
            const paramResponse = await fetch(`${config.backendAPI}/nodes/all/${node.node_id}`);
            const paramData = await paramResponse.json();
            return { ...node, parameters: paramData.parameters || [] };
          })
        );
      })
      .then((nodesWithParams) => {
        partitionData(nodesWithParams);
      })
      .catch((error) => console.error("Error fetching nodes or parameters:", error));
  }, []);

  const handleStartStopToggle = (segmentData) => {
    const action = isRunning ? "stop" : "start";

    MySwal.fire({
      title: `Are you sure you want to ${action} the services?`,
      text: `This will ${action} the selected services for the nodes.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
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
            MySwal.fire("Success!", `The services have been ${action}ed.`, "success");
            setIsRunning(!isRunning);
          })
          .catch((error) => {
            console.error(`Error ${isRunning ? "stopping" : "starting"} services:`, error);
            MySwal.fire("Error!", `Failed to ${action} the services. Please try again.`, "error");
          });
      }
    });
  };

  const showNodeDetailsPopup = (segmentData, platform) => {
    MySwal.fire({
      title: `Nodes in Platform: ${platform}`,
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
          <button className="start-stop-btn" onClick={() => handleStartStopToggle(segmentData)}>
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
        {/* <h2>Available Platforms</h2> */}
        {Object.entries(platformSegments)
          .sort(([platformA], [platformB]) => platformA.localeCompare(platformB)) // Sort platforms alphabetically
          .map(([platform, segments]) => (
            <div key={platform} className="platform-Predefinedconfigurations-card-container">
              {segments.map((segment, index) => (
                <div key={index} className="platform-card" onClick={() => showNodeDetailsPopup(segment, platform)}>
                  <img
                    src={platformImages[platform] || "https://example.com/default-image.png"}
                    alt={`${platform} Logo`}
                    className="platform-icon"
                  />
                  {/* <h4>{platform} {index + 1}</h4> */}
                  <h4 className="predefinedconfigurationssd">{platform}</h4>
                  <p className="predefinedconfigurationssdew">{`Contains ${segment.length} nodes`}</p>
                  
                </div>
                
              ))}
            </div>
            
          ))}
             <Terminal />
        <div className="right-sidebar unique-right-sidebar">
          <div className="table-container unique-table-container">
            <Status />
          </div>
          {/* <Terminal /> */}
        </div>
      </div>
    </div>
  );
};

export default PredefinedConfigurations;
