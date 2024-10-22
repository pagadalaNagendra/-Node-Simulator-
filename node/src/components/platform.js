import React, { useState, useEffect } from "react";
import "./platform.css";
import config from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNetworkWired } from "@fortawesome/free-solid-svg-icons";
import Terminal from "./Terminal"; // Import the Terminal component
import Status from "./statustable";
const ParameterCard = ({ parameter, onUpdate }) => {
  const [minValue, setMinValue] = useState(parameter.min_value);
  const [maxValue, setMaxValue] = useState(parameter.max_value);

  const handleSave = () => {
    onUpdate(parameter.id, { min_value: minValue, max_value: maxValue });
  };

  return (
    <div className="parameter-card">
      <h4>{parameter.name}</h4>
      <div>
        <label>
          Min:
          <input type="number" value={minValue} onChange={(e) => setMinValue(e.target.value)} />
        </label>
        <label>
          Max:
          <input type="number" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
        </label>
      </div>
    </div>
  );
};



const Platform = () => {
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [platformData, setPlatformData] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);

  // Fetch unique platforms
  useEffect(() => {
    fetch(`${config.backendAPI}/nodes?skip=0&limit=1000`)
      .then((response) => response.json())
      .then((data) => {
        const uniquePlatforms = Array.from(new Set(data.map((node) => node.platform))).filter(Boolean);
        setPlatforms(uniquePlatforms);
        if (uniquePlatforms.includes("ccsp")) {
          setSelectedPlatform("ccsp");
        }
      })
      .catch((error) => console.error("Error fetching nodes:", error));
  }, []);

  // Fetch platform data based on selected platform
  useEffect(() => {
    if (selectedPlatform) {
      fetch(`${config.backendAPI}/nodes?skip=0&limit=1000`)
        .then((response) => response.json())
        .then((data) => {
          const filteredData = data.filter((node) => node.platform === selectedPlatform);
          const nodesWithParams = Promise.all(
            filteredData.map(async (node) => {
              const paramResponse = await fetch(`${config.backendAPI}/nodes/all/${node.node_id}`);
              const paramData = await paramResponse.json();
              return { ...node, parameters: paramData.parameters || [] };
            })
          );

          nodesWithParams.then(setPlatformData).catch((error) => console.error("Error fetching node parameters:", error));
          setSelectedNodes([]);
        })
        .catch((error) => console.error("Error fetching platform data:", error));
    } else {
      setPlatformData([]);
    }
  }, [selectedPlatform]);

  // Fetch names from verticals
  useEffect(() => {
    fetch(`${config.backendAPI}/verticals/`)
      .then((response) => response.json())
      .then((data) => setNames(data))
      .catch((error) => console.error("Error fetching names:", error));
  }, []);

  // Fetch data from the URL for the DataTable
  useEffect(() => {
    fetch(`${config.backendAPI}/nodes/?skip=0&limit=1000`)
      .then((response) => response.json())
      .then((data) => {
        setFetchedData(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handlePlatformSelect = (event) => {
    const platform = event.target.value;
    setSelectedPlatform(platform);
    setSelectedNodes([]);
    setPlatformData([]);
  };

  

  const handleNodeSelect = (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === "selectAll") {
      const allNodeIds = platformData.map((node) => node.node_id);
      setSelectedNodes(allNodeIds);
    } else {
      if (selectedNodes.includes(selectedValue)) {
        setSelectedNodes(selectedNodes.filter((id) => id !== selectedValue));
      } else {
        setSelectedNodes([...selectedNodes, selectedValue]);
      }
    }
  };

  const handleCheckboxChange = (nodeId) => {
    if (selectedNodes.includes(nodeId)) {
      setSelectedNodes(selectedNodes.filter((id) => id !== nodeId));
    } else {
      setSelectedNodes([...selectedNodes, nodeId]);
    }
  };

  const handleRangeChange = (event) => {
    const { name, value } = event.target;
    if (name === "rangeStart") {
      setRangeStart(value);
    } else if (name === "rangeEnd") {
      setRangeEnd(value);
    }
  };

  const handleApplyRange = () => {
    const start = parseInt(rangeStart, 10);
    const end = parseInt(rangeEnd, 10);
    if (!isNaN(start) && !isNaN(end) && start >= 1 && end >= 1 && start <= end) {
      const rangeSelectedNodes = platformData.slice(start - 1, end).map((node) => node.node_id);
      setSelectedNodes(rangeSelectedNodes);
    } else {
      alert("Invalid range. Please enter valid numbers where 'from' and 'to' are greater than or equal to 1 and 'from' is less than or equal to 'to'.");
    }
  };

  const handleNameSelect = (event) => {
    const selectedName = event.target.value;
    setSelectedName(selectedName);

    if (selectedName) {
      // Assuming vertical_id is stored in names data, update to use vertical_id instead of name
      const selectedVertical = names.find((name) => name.name === selectedName);
      const verticalId = selectedVertical ? selectedVertical.id : null;

      if (verticalId) {
        fetch(`${config.backendAPI}/nodes/vertical/${verticalId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Error: ${response.statusText}`);
            }
            return response.json();
          })
          .then((data) => {
            const nodesWithParams = Promise.all(
              data.map(async (node) => {
                const paramResponse = await fetch(`${config.backendAPI}/nodes/all/${node.node_id}?skip=0&limit=1000`);
                const paramData = await paramResponse.json();
                return { ...node, parameters: paramData.parameters || [] };
              })
            );

            nodesWithParams
              .then((nodes) => {
                setPlatformData(nodes);
              })
              .catch((error) => console.error("Error fetching node parameters:", error));

            setSelectedNodes([]);
          })
          .catch((error) => console.error("Error fetching nodes for selected vertical:", error));
      } else {
        console.error("Vertical ID not found for the selected name.");
      }
    } else {
      setPlatformData([]);
    }
  };

  const handleStartStopToggle = () => {
    setIsRunning(!isRunning);

    const selectedNodesData = platformData.filter((node) => selectedNodes.includes(node.node_id)).map((node) => ({ node_id: node.node_id }));

    if (!isRunning) {
      const startData = platformData
        .filter((node) => selectedNodes.includes(node.node_id))
        .map((node) => ({
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
        }));

      fetch(`http://127.0.0.1:8000/services/start`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(startData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Start response:", data);
        })
        .catch((error) => console.error("Error starting services:", error));
    } else {
      fetch(`http://127.0.0.1:8000/services/stop`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedNodesData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Stop response:", data);
        })
        .catch((error) => console.error("Error stopping services:", error));
    }
  };

  const handleParameterUpdate = (paramId, newValues) => {
    setPlatformData((prevData) =>
      prevData.map((node) =>
        node.parameters
          ? {
              ...node,
              parameters: node.parameters.map((param) => (param.id === paramId ? { ...param, ...newValues } : param)),
            }
          : node
      )
    );
  };

  return (
    <div className="homepage">
      {/* Left Sidebar */}
      <div className="left-sidebar">
        <h1 className="nodeselect">
          <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1729231943/block-removebg-preview_eeb1wy.png" alt="Platform Icon" className="Platform-icon-icon" />
          Select Platform
        </h1>
        <select className="select-spacing" value={selectedPlatform} onChange={handlePlatformSelect}>
          <option value="">Select Platform</option>
          {platforms.map((platform, index) => (
            <option key={index} value={platform}>
              {platform}
            </option>
          ))}
        </select>

        {platformData.length > 0 && (
          <>
            <h2 className="nodeselect">
              <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1729232379/connection-removebg-preview_uhryhg.png" alt="Nodes Icon" className="Platform-icon-icons" />
              Select Nodes
            </h2>
            <select className="select-spacing" value={selectedNodes.length === platformData.length ? "selectAll" : selectedNodes[0]} onChange={handleNodeSelect}>
              <option value="">Select Node</option>
              <option value="selectAll">Select All Nodes</option>
            </select>

            <h2 className="nodeselect">
              <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1729232814/manual_6672157-removebg-preview_hds2la.png" alt="Manual Selection Icon" className="Platform-icon-iconss" />
              Manual selection
            </h2>
            <select className="select-spacing" value={selectedName} onChange={handleNameSelect}>
              <option value="">Select Name</option>
              {names.map((name) => (
                <option key={name.id} value={name.name}>
                  {name.name}
                </option>
              ))}
            </select>

            <h2 className="nodeselect">
              <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1729232152/radar-removebg-preview_l25o62.png" alt="Range Icon" className="Platform-icon-icon" />
              Range
            </h2>
            <div className="range-selection">
              <input type="number" name="rangeStart" value={rangeStart} onChange={handleRangeChange} placeholder="From (start)" min="1" />
              <input type="number" name="rangeEnd" value={rangeEnd} onChange={handleRangeChange} placeholder="To (end)" min="1" />
            </div>
            <button className="rangenodebtn" onClick={handleApplyRange}>
              Apply Range
            </button>

            <button className="startstopbtn" onClick={handleStartStopToggle}>
              {isRunning ? "Stop" : "Start"}
            </button>
          </>
        )}
      </div>
      {/* Main Content */}
      <div class="main-content">
        <div className="card-container">
          {platformData.length > 0 ? (
            platformData.map((node, index) => (
              <div key={node.node_id} className="card">
                <span className="node-number">#{index + 1}</span>
                <input type="checkbox" checked={selectedNodes.includes(node.node_id)} onChange={() => handleCheckboxChange(node.node_id)} className="node-checkbox" />
                <p>Node ID: {node.node_id}</p>
                <p>Frequency: {node.frequency} </p>
                <p>Platform: {node.platform}</p>
                <p>Protocol: {node.protocol}</p>

                {/* Updated Conditional Check for 'parameter' */}
                {node.parameter && Array.isArray(node.parameter) && node.parameter.length > 0 ? (
                  <div className="parameter-list">
                    {node.parameter.map((parameter) => (
                      <ParameterCard key={parameter.id} parameter={parameter} onUpdate={handleParameterUpdate} />
                    ))}
                  </div>
                ) : (
                  <p>No parameters available for this node</p>
                )}
              </div>
            ))
          ) : (
            <p>No platform data available.</p>
          )}
        </div>
      </div>

      {/* Right Sidebar */}

      <div className="right-sidebar">
        <div className="table-container">
          {/* <DataTable data={fetchedData} isRunning={isRunning} /> */}
          <Status />
        </div>

        <Terminal />
      </div>
    </div>
  );
};

export default Platform;
