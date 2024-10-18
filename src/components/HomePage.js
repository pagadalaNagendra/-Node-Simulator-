import React, { useState, useEffect } from "react";
import "./Homepage.css";
import config from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSitemap, faNetworkWired } from "@fortawesome/free-solid-svg-icons";
import Terminal from "./Terminal"; // Import the Terminal component
import Status from "./statustable";

const NodeSelector = () => {
  const [nodes, setNodes] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [nodeDetails, setNodeDetails] = useState(null);
  const [frequency, setFrequency] = useState("");
  const [parameters, setParameters] = useState([]);
  const [verticals, setVerticals] = useState([]);
  const [selectedVertical, setSelectedVertical] = useState("");
  const [terminalReloadKey, setTerminalReloadKey] = useState(0); // State for reloading Terminal
  const [nodeCount, setNodeCount] = useState(0);
  const [verticalCount, setVerticalCount] = useState(0);
  const [uniquePlatforms, setUniquePlatforms] = useState([]);
  const [platformCount, setPlatformCount] = useState(0);
  const [uniqueServices, setUniqueServices] = useState([]);
  const [serviceCount, setServiceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch verticals on component mount
  useEffect(() => {
    fetch(`${config.backendAPI}/verticals/`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVerticals(data);
          setSelectedVertical(data[0].id); // Automatically select the first vertical
        } else {
          console.error("Unexpected data format:", data);
          setVerticals([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching verticals:", error);
        setVerticals([]);
      });
  }, []);


//these fetch method for nodes count 
  useEffect(() => {
    fetch("http://localhost:8000/nodes/?skip=0&limit=1000?skip=0&limit=1000")
      .then((response) => response.json())
      .then((data) => setNodeCount(data.length))
      .catch((error) => console.error("Error fetching node data:", error));
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/verticals/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch vertical count');
        }
        return response.json();
      })
      .then(data => {
        setVerticalCount(data.length);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const fetchPlatforms = async () => {
        try {
            const response = await fetch('http://localhost:8000/nodes/?skip=0&limit=1000');            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const uniquePlatformsSet = [...new Set(data.map(node => node.platform))];
            setUniquePlatforms(uniquePlatformsSet);
            setPlatformCount(uniquePlatformsSet.length);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    fetchPlatforms();
}, []); 

useEffect(() => {
  const fetchServices = async () => {
      try {
          const response = await fetch('http://localhost:8000/nodes/?skip=0&limit=1000');
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          const data = await response.json();
          const uniqueServicesSet = [...new Set(data
              .filter(node => node.services === "start")
              .map(node => node.services))
          ];
          setUniqueServices(uniqueServicesSet);
          setServiceCount(uniqueServicesSet.length);
      } catch (error) {
          setError(error.message);
      } finally {
          setLoading(false);
      }
  };

  fetchServices();
}, []); 
 

  // Fetch filtered nodes when selected vertical changes
  useEffect(() => {
    if (selectedVertical) {
      fetch(`${config.backendAPI}/nodes/vertical/${selectedVertical}`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setFilteredNodes(data);
            setSelectedNodeId(data[0].node_id); // Automatically select the first node
          } else {
            alert("Node Ids not found");
            setFilteredNodes([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching filtered nodes:", error);
          alert("Error fetching nodes. Please try again.");
        });
    } else {
      setFilteredNodes([]);
    }
  }, [selectedVertical]);

  // Fetch all nodes data on component mount
  useEffect(() => {
    fetch("http://localhost:8000/nodes/?skip=0&limit=1000")
      .then((response) => response.json())
      .then((data) => {
        setNodes(data);
      })
      .catch((error) => console.error("Error fetching nodes data:", error));
  }, []);

  // Fetch node details when a node is selected
  useEffect(() => {
    if (selectedNodeId) {
      const selectedNode = nodes.find((node) => node.node_id === selectedNodeId);
      if (selectedNode) {
        setNodeDetails(selectedNode);
        if (selectedNode.frequency) {
          setFrequency(secondsToHMS(selectedNode.frequency));
        }
        setParameters(selectedNode.parameter || []); // Use the parameter field from the selected node
        // Start terminal data streaming when node is selected
        const eventSource = new EventSource(`http://localhost:8000/services/events/`);
        eventSource.onmessage = (event) => {
          setTerminalReloadKey((prevData) => prevData + event.data + "\n");
        };

        eventSource.onerror = (error) => {
          console.error("EventSource failed:", error);
          eventSource.close();
        };

        return () => {
          eventSource.close();
        };
      }
    } else {
      setNodeDetails(null);
    }
  }, [selectedNodeId, nodes]);

  const handleNodeSelect = (event) => {
    setSelectedNodeId(event.target.value);
  };

  const handleVerticalSelect = (event) => {
    setSelectedVertical(event.target.value);
  };

  const secondsToHMS = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hours.toString().padStart(2, "0"), minutes.toString().padStart(2, "0"), secs.toString().padStart(2, "0")].join(":");
  };

  const hmsToSeconds = (hms) => {
    const [hours, minutes, seconds] = hms.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleStart = (event) => {
    event.preventDefault();
    if (selectedNodeId && frequency) {
      const frequencyInSeconds = hmsToSeconds(frequency);
      const formattedParameters = parameters.map((param) => ({
        name: param.name,
        min: param.min_value,
        max: param.max_value,
      }));

      const payload = [
        {
          node_id: selectedNodeId,
          frequency: frequencyInSeconds,
          parameters: formattedParameters,
          platform: nodeDetails.platform,
          protocol: nodeDetails.protocol,
        },
      ];
      console.log(payload);
      
      fetch(`http://127.0.0.1:8000/services/start`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Start response:", data);
          setNodeDetails((prevDetails) => ({
            ...prevDetails,
            status: "start",
          }));
          setTerminalReloadKey((prevKey) => prevKey + 1);
        })
        .catch((error) => console.error("Error starting service:", error));
    }
  };

  const handleStop = (event) => {
    event.preventDefault();
    if (selectedNodeId) {
      const payload = [
        {
          node_id: selectedNodeId,
        },
      ];

      fetch(`http://127.0.0.1:8000/services/stop`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Stop response:", data);
          setNodeDetails((prevDetails) => ({
            ...prevDetails,
            status: "stop",
          }));
        })
        .catch((error) => console.error("Error stopping service:", error));
    }
  };

  const handleFrequencyChange = (event) => {
    setFrequency(event.target.value);
  };

  const handleParameterChange = (index, field, value) => {
    setParameters((prevParams) => {
      const newParams = [...prevParams];
      newParams[index][field] = value; // Update specific field
      return newParams;
    });
  };

  return (
    <div className="homepage">
      <div className="left-sidebar">
        <h1 className="nodeselect">
          <FontAwesomeIcon icon={faSitemap} /> Select Vertical
        </h1>
        <select value={selectedVertical} onChange={handleVerticalSelect}>
          <option value="">Select Vertical</option>
          {verticals.map((vertical) => (
            <option key={vertical.id} value={vertical.id}>
              {vertical.name}
            </option>
          ))}
        </select>

        <h1 className="nodeselect">
          <FontAwesomeIcon icon={faNetworkWired} /> Select Node
        </h1>
        <select value={selectedNodeId} onChange={handleNodeSelect} disabled={filteredNodes.length === 0}>
          <option value="">Select Node ID</option>
          {filteredNodes.map((node) => (
            <option key={node.node_id} value={node.node_id}>
              {node.node_id}
            </option>
          ))}
        </select>
      </div>

      <div className="contentss">
        <div class="home-image-container">
          <div className="home-node-item">
            <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1729252778/domains.f8dcff7786020da7f6f3_ye1prf.png" alt="Range Icon" className="home-icon-icon" />
            <div className="node-details">
              <p className="home-nodecount">{verticalCount}</p>
              <p className="home-nodetitle">Domains</p>
            </div>
          </div>
          <div className="home-node-item">
            <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1729252869/sensors.5b52755804301a7ece3e_sbdtnh.png" alt="Range Icon" className="home-icon-icon" />
            <div className="node-details">
              <p className="home-nodecount">{nodeCount}</p>
              <p className="home-nodetitle">Nodes</p>
            </div>
          </div>
          <div className="home-node-item">
            <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1729252981/nodes.615bd1b0b66e63b83202_aelqwa.png" alt="Range Icon" className="home-icon-icon" />
            <div className="node-details">
              <p className="home-nodecount">{platformCount}</p>
              <p className="home-nodetitle">Platforms</p>
            </div>
          </div>
          <div className="home-node-item">
            <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1729253184/pngtree-start-button-rounded-futuristic-hologram-png-image_2257337-removebg-preview_o9wcnh.png" alt="Range Icon" className="home-icon-icon" />
            <div className="node-details">
              <p className="home-nodecount">{serviceCount}</p>
              <p className="home-nodetitle">Services(start)</p>
            </div>
          </div>
        </div>

        {nodeDetails && (
          <div className="node-details">
            <h2>Node Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Node ID</td>
                  <td>{nodeDetails.node_id}</td>
                </tr>
                <tr>
                  <td>Platform</td>
                  <td>{nodeDetails.platform}</td>
                </tr>
                <tr>
                  <td>Protocol</td>
                  <td>{nodeDetails.protocol}</td>
                </tr>
                <tr>
                  <td>Frequency</td>
                  <td>
                    <input type="text" value={frequency} onChange={handleFrequencyChange} placeholder="HH:MM:SS" />
                  </td>
                </tr>
                <div className="parameters-container">
                  {parameters.map((param, index) => (
                    <div className="parameter-card" key={index}>
                      <h3>{param.name}</h3>
                      <div className="input-group">
                        <label>Min:</label>
                        <input type="number" value={param.min_value} onChange={(e) => handleParameterChange(index, "min_value", e.target.value)} placeholder="Min" />
                      </div>
                      <div className="input-group">
                        <label>Max:</label>
                        <input type="number" value={param.max_value} onChange={(e) => handleParameterChange(index, "max_value", e.target.value)} placeholder="Max" />
                      </div>
                    </div>
                  ))}
                </div>
              </tbody>
            </table>
            {nodeDetails.status === "start" ? (
              <button className="servicesstart" onClick={handleStop}>
                Stop
              </button>
            ) : (
              <button className="servicesstart" onClick={handleStart}>
                Start
              </button>
            )}
          </div>
        )}
      </div>
      <div className="right-sidebar">
        <div className="table-container">
          <Status />
        </div>
        <Terminal reloadKey={terminalReloadKey} />
      </div>
    </div>
  );
};

export default NodeSelector;
