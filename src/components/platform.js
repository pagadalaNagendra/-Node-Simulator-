import React, { useState, useEffect } from "react";
import "./platform.css";
import config from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNetworkWired } from "@fortawesome/free-solid-svg-icons";
import Terminal from "./Terminal"; // Import the Terminal component
import Status from "./statustable";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Collapse,
  Typography,
  Box,
  Grid,
  Grid2,
} from "@mui/material";
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
  const [expandedNodes, setExpandedNodes] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectedNegativeAction, setSelectedNegativeAction] = useState(""); // Fetch unique platforms
  const navigate = useNavigate();
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

  const handleViewDetails = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId], // Toggle expanded state for the selected node
    }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNodes([]);
    } else {
      const allNodeIds = platformData.map((node) => node.node_id);
      setSelectedNodes(allNodeIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectNode = (nodeId) => {
    setSelectedNodes((prev) => (prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]));
  };

  const handleToggle = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
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
  const handleNegativeActionSelect = (event) => {
    const action = event.target.value;
    setSelectedNegativeAction(action);

    // Navigate based on the selected action
    if (action) {
      navigate(action);
    }
  };
  return (
    <div className="homepage">
      <div className="left">
        {/* {platformData.length > 0 && (
          <>
            <button className="startstopbtn" onClick={handleStartStopToggle}>
              {isRunning ? "Stop" : "Start"}
            </button>
          </>
        )} */}
      </div>
      {/* Main Content */}
      <div className="main-content">
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Modes</InputLabel>
            <Select value={selectedNegativeAction} onChange={handleNegativeActionSelect}>
              <MenuItem value="">Select Action</MenuItem>
              <MenuItem value="/Node-Simultor">Single Stimulation</MenuItem>
              <MenuItem value="/Node-Simultor/platform">Multi Stimulation</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Platform</InputLabel>
              <Select value={selectedPlatform} onChange={handlePlatformSelect}>
                <MenuItem value="">Select Platform</MenuItem>
                {platforms.map((platform, index) => (
                  <MenuItem key={index} value={platform}>
                    {platform}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              {" "}
              {/* Adjust mt value as needed */}
              <InputLabel>Select Name</InputLabel>
              <Select value={selectedName} onChange={handleNameSelect}>
                <MenuItem value="">Select Name</MenuItem>
                {names.map((name) => (
                  <MenuItem key={name.id} value={name.name}>
                    {name.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} fullWidth sx={{ mt: 2 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={5}>
                <TextField type="number" name="rangeStart" value={rangeStart} onChange={handleRangeChange} placeholder="From (start)" inputProps={{ min: 1 }} fullWidth />
              </Grid>
              <Grid item xs={5}>
                <TextField type="number" name="rangeEnd" value={rangeEnd} onChange={handleRangeChange} placeholder="To (end)" inputProps={{ min: 1 }} fullWidth />
              </Grid>
              <Grid item xs={2} textAlign="right">
                <IconButton onClick={handleApplyRange} color="primary">
                  <CheckCircleIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 450,
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                display: "none", // Hide scrollbar for WebKit browsers (Chrome, Safari)
              },
              scrollbarWidth: "none", // Hide scrollbar for Firefox
            }}
          >
            <Table className="node-table">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectAll} onChange={handleSelectAll} />
                  </TableCell>
                  <TableCell>Node ID</TableCell>
                  <TableCell>Platform</TableCell>
                  <TableCell>view details</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {platformData.length > 0 ? (
                  platformData.map((node) => (
                    <React.Fragment key={node.node_id}>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedNodes.includes(node.node_id)} onChange={() => handleSelectNode(node.node_id)} />
                        </TableCell>
                        <TableCell>{node.node_id}</TableCell>
                        <TableCell>{node.platform}</TableCell>
                        <TableCell>
                          <Box
                            onClick={() => handleToggle(node.node_id)}
                            sx={{
                              padding: "2px 8px",
                              backgroundColor: "#1976d2",
                              color: "#fff",
                              borderRadius: "4px",
                              cursor: "pointer",
                              textAlign: "center",
                              "&:hover": {
                                backgroundColor: "#1565c0",
                              },
                            }}
                          >
                            {expandedNodes[node.node_id] ? <Visibility sx={{ verticalAlign: "middle", marginRight: 1 }} /> : <VisibilityOff  sx={{ verticalAlign: "middle", marginRight: 1 }} />}
                          </Box>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={4} style={{ paddingBottom: 0, paddingTop: 0 }}>
                          <Collapse in={expandedNodes[node.node_id]} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                              <Typography variant="subtitle1" gutterBottom>
                                <strong>Frequency:</strong> {node.frequency}
                              </Typography>
                              <Typography variant="subtitle1" gutterBottom>
                                <strong>Protocol:</strong> {node.protocol}
                              </Typography>

                              {node.parameter && Array.isArray(node.parameter) && node.parameter.length > 0 ? (
                                <div className="parameter-list">
                                  <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
                                    Parameters:
                                  </Typography>
                                  {node.parameter.map((parameter, i) => (
                                    <Box
                                      key={i}
                                      className="parameter-item"
                                      sx={{
                                        padding: 2,
                                        marginBottom: 2,
                                        border: "1px solid #ccc",
                                        borderRadius: "8px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                        backgroundColor: "#f9f9f9",
                                      }}
                                    >
                                      <Typography variant="body1" sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
                                        {parameter.min}
                                      </Typography>
                                      <Typography variant="body1" sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
                                        {parameter.max}
                                      </Typography>
                                      <ParameterCard parameter={parameter} onUpdate={handleParameterUpdate} />
                                    </Box>
                                  ))}
                                </div>
                              ) : (
                                <Typography>No parameters available for this node.</Typography>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No platform data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {platformData.length > 0 && (
          <div className="button-container" style={{ marginTop: "16px", textAlign: "right" }}>
            <button className="startstopbtn" onClick={handleStartStopToggle}>
              {isRunning ? "Stop" : "Start"}
            </button>
            <Terminal />
          </div>
        )}
      </div>
      {/* Right Sidebar */}
      <div className="right-sidebar">
        <div className="table-container">
          <Status />
        </div>
        {/* <Terminal /> */}
      </div>
    </div>
  );
};

export default Platform;
