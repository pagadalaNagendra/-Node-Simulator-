import React, { useState, useEffect } from "react";
import { Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Typography, Paper, Grid } from "@mui/material";
import "./Homepage.css"; // Import your styles
import config from "../config";
import Terminal from "./Terminal"; // Import the Terminal component
import Status from "./statustable";
import { useNavigate } from "react-router-dom";

const NodeSelector = () => {
  const [nodes, setNodes] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [nodeDetails, setNodeDetails] = useState(null);
  const [frequency, setFrequency] = useState("");
  const [parameters, setParameters] = useState([]);
  const [verticals, setVerticals] = useState([]);
  const [selectedVertical, setSelectedVertical] = useState("");
  const [terminalReloadKey, setTerminalReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showParameters, setShowParameters] = useState(false); // New state for parameter visibility
  const navigate = useNavigate();

  // Fetch verticals on component mount
  useEffect(() => {
    fetch(`${config.backendAPI}/verticals/`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVerticals(data);
          setSelectedVertical(data[0].id);
        } else {
          setVerticals([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching verticals:", error);
        setVerticals([]);
      });
  }, []);

  // Fetch filtered nodes when selected vertical changes
  useEffect(() => {
    if (selectedVertical) {
      fetch(`${config.backendAPI}/nodes/vertical/${selectedVertical}`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setFilteredNodes(data);
            setSelectedNodeId(data[0].node_id);
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
        setParameters(selectedNode.parameter || []);
        setShowParameters(false); // Reset visibility when node is changed
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

      fetch(`http://127.0.0.1:8000/services/start`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          setNodeDetails((prevDetails) => ({ ...prevDetails, status: "start" }));
          setTerminalReloadKey((prevKey) => prevKey + 1);
        })
        .catch((error) => console.error("Error starting service:", error));
    }
  };

  const handleStop = (event) => {
    event.preventDefault();
    if (selectedNodeId) {
      const payload = [{ node_id: selectedNodeId }];

      fetch(`http://127.0.0.1:8000/services/stop`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          setNodeDetails((prevDetails) => ({ ...prevDetails, status: "stop" }));
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
      newParams[index][field] = value;
      return newParams;
    });
  };

  const handleToggleParameters = () => {
    setShowParameters((prev) => !prev); // Toggle parameter visibility
  };

  const handleNavigate = (event) => {
    const selectedPage = event.target.value;
    if (selectedPage) {
      navigate(`/${selectedPage}`); // Navigate to the selected page
    }
  };

  return (
    <div className="homepage-single">
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid item xs={12} md={6}>
          {nodeDetails && (
            <div className="node-details-single">
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Select
                    onChange={handleNavigate}
                    value="" // Set this to control the default selected value
                    fullWidth
                    displayEmpty
                  >
                    <MenuItem value="">
                      <div style={{ fontStyle: "normal" }}>Select Mode</div>
                    </MenuItem>
                    <MenuItem value="Node-Simultor">Single Stimulation</MenuItem>
                    <MenuItem value="Node-Simultor/platform">Multi Stimulation</MenuItem>
                  </Select>
                </Grid>

                <Grid item xs={4}>
                  <Select value={selectedVertical} onChange={handleVerticalSelect} fullWidth displayEmpty>
                    <MenuItem value="">
                      <em>Select Vertical</em>
                    </MenuItem>
                    {verticals.map((vertical) => (
                      <MenuItem key={vertical.id} value={vertical.id}>
                        {vertical.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={4}>
                  <Select value={selectedNodeId} onChange={handleNodeSelect} fullWidth disabled={filteredNodes.length === 0} displayEmpty>
                    <MenuItem value="">
                      <em>Select Node ID</em>
                    </MenuItem>
                    {filteredNodes.map((node) => (
                      <MenuItem key={node.node_id} value={node.node_id}>
                        {node.node_id}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>

              <Typography variant="h5"> </Typography>
              <br></br>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Node ID</TableCell>
                      <TableCell>{nodeDetails.node_id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Platform</TableCell>
                      <TableCell>{nodeDetails.platform}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Protocol</TableCell>
                      <TableCell>{nodeDetails.protocol}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Frequency</TableCell>
                      <TableCell>
                        <TextField type="text" value={frequency} onChange={handleFrequencyChange} placeholder="HH:MM:SS" fullWidth />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Button variant="outlined" onClick={handleToggleParameters}>
                          {showParameters ? "Hide Parameters" : "View Parameters"}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {showParameters && (
                      <div className="homepage-parameters-details-node">
                        {parameters.map((param, index) => (
                          <TableRow key={index}>
                            <TableCell>{param.name}</TableCell>
                            <TableCell>
                              <Grid container spacing={1}>
                                <Grid item xs={12}>
                                  <TextField type="number" value={param.min_value} onChange={(e) => handleParameterChange(index, "min_value", e.target.value)} placeholder="Min" fullWidth />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField type="number" value={param.max_value} onChange={(e) => handleParameterChange(index, "max_value", e.target.value)} placeholder="Max" fullWidth />
                                </Grid>
                              </Grid>
                            </TableCell>
                          </TableRow>
                        ))}
                      </div>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <br></br>
              <Button variant="contained" color={nodeDetails.status === "start" ? "secondary" : "primary"} onClick={nodeDetails.status === "start" ? handleStop : handleStart}>
                {nodeDetails.status === "start" ? "Stop" : "Start"}
              </Button>
              <div className="terminal-home-code">
                <Terminal />
              </div>
            </div>
          )}
        </Grid>

        <Grid item xs={12} md={6} className="right-sidebar">
          <div className="right-sidebar">
            <div className="table-container">
              <Status />
            </div>

            {/* <Terminal /> */}
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default NodeSelector;
