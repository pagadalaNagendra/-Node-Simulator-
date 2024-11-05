import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Checkbox, TextField, FormGroup, FormControlLabel, Select, MenuItem, FormControl, InputLabel, Container, Box, Typography, Stepper, Step, StepLabel } from "@mui/material";
import { styled } from "@mui/system";
import config from "../config";
import Terminal from "./Terminal"; // Import the Terminal component
import Status from "./statustable";
const Section = styled(Box)({
  minWidth: "100%",
  padding: "40px",
  backgroundColor: "#f5f7fa",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  marginBottom: "20px",
});

const CenteredContainer = styled(Container)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});

const App = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [vertical, setVertical] = useState("");
  const [max, setMax] = useState("");
  const [min, setMin] = useState("");
  const [datatype, setDatatype] = useState("number");
  const [shortName, setShortName] = useState("");
  const [steps] = useState(["Domain", "Sensor Type", "Node"]);
  const [parameter, setParameter] = useState("");
  const [verticals, setVerticals] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [selectedVertical, setSelectedVertical] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState("https");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedParameter, setSelectedParameter] = useState([]);
  const [parameterInputs, setParameterInputs] = useState({});
  const [nodeId, setNodeId] = useState("");
  const [frequency, setFrequency] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [ccspFiles, setCcspFiles] = useState([null, null]);
  const [oneM2mCredentials, setOneM2mCredentials] = useState({ username: "", password: "" });
  const [ctopField, setCtopField] = useState("");
  const [url, setUrl] = useState("");
  const [port, setPort] = useState("");
  useEffect(() => {
    const fetchVerticals = async () => {
      try {
        const response = await fetch(`${config.backendAPI}/verticals/`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setVerticals(data);
      } catch (error) {
        console.error("Error fetching verticals:", error);
      }
    };

    fetchVerticals();
  }, []);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmitSection1 = async () => {
    const requestBody = {
      name: vertical,
      shortName: shortName,
    };

    console.log("Request Body:", requestBody);

    try {
      const response = await fetch(`${config.backendAPI}/verticals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Successfully submitted Section 1:", data);
    } catch (error) {
      console.error("Error submitting Section 1:", error);
    }
  };

  const handleSubmitSection2 = async () => {
    const requestBody = {
      name: parameter,
      min_value: parseFloat(min),
      max_value: parseFloat(max),
      vertical_id: verticals.find((v) => v.name === vertical)?.id,
      data_type: datatype,
    };

    console.log("Request Body:", requestBody);

    try {
      const response = await fetch(`${config.backendAPI}/parameters/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Successfully submitted Section 2:", data);
    } catch (error) {
      console.error("Error submitting Section 2:", error);
    }
  };

  const platforms = [{ name: "ccsp" }, { name: "OneM2m" }, { name: "ctop" }];

  useEffect(() => {
    axios
      .get(`${config.backendAPI}/verticals/`)
      .then((response) => {
        setVerticals(response.data);
      })
      .catch((error) => {
        console.error("Error fetching verticals!", error);
      });
  }, []);

  const handleVerticalChange = (e) => {
    const selectedVerticalName = e.target.value;
    setSelectedVertical(selectedVerticalName);

    const selectedVerticalObject = verticals.find((vertical) => vertical.name === selectedVerticalName);
    if (selectedVerticalObject) {
      axios
        .get(`${config.backendAPI}/parameters/?vertical_id=${selectedVerticalObject.id}`)
        .then((response) => {
          setParameters(response.data);
          setSelectedParameter([]);
          setParameterInputs({});
        })
        .catch((error) => {
          console.error("Error fetching parameters!", error);
        });
    } else {
      setParameters([]);
    }
  };

  const handleParameterChange = (parameterId) => {
    setSelectedParameter((prev) => {
      if (prev.includes(parameterId)) {
        const newParams = prev.filter((id) => id !== parameterId);
        const newInputs = { ...parameterInputs };
        delete newInputs[parameterId];
        setParameterInputs(newInputs);
        return newParams;
      } else {
        return [...prev, parameterId];
      }
    });
  };

  const handleParameterInputChange = (parameterId, type) => (event) => {
    setParameterInputs((prev) => ({
      ...prev,
      [parameterId]: { ...prev[parameterId], [type]: event.target.value },
    }));
  };

  const handleCcspFileChange = (index) => (event) => {
    const files = [...ccspFiles];
    files[index] = event.target.files[0];
    setCcspFiles(files);
  };

  const handleOneM2mChange = (event) => {
    const { name, value } = event.target;
    setOneM2mCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const frequencyInSeconds = frequency.hours * 3600 + frequency.minutes * 60 + frequency.seconds;

    const nodeData = JSON.stringify({
      node_id: nodeId,
      platform: selectedPlatform,
      protocol: selectedProtocol,
      frequency: frequencyInSeconds,
      url: url,
      services: "stop",

      vertical_id: verticals.find((v) => v.name === selectedVertical)?.id,
      parameter: selectedParameter.map((paramId) => ({
        name: parameters.find((p) => p.id === paramId).name,
        min_value: parameterInputs[paramId]?.min || 0,
        max_value: parameterInputs[paramId]?.max || 0,
        vertical_id: verticals.find((v) => v.name === selectedVertical)?.id,
        data_type: "int",
        id: paramId,
      })),
    });

    const formData = new FormData();
    formData.append("node", nodeData);
    formData.append("cert_file", ccspFiles[0]);
    formData.append("key_file", ccspFiles[1]);

    try {
      const response = await axios.post(`${config.backendAPI}/nodes/ccsp/`, formData, { headers: { "Content-Type": "multipart/form-data" } });

      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Submission failed!");
    }
  };

  const handleChange = (key) => (e) => {
    let value = parseInt(e.target.value) || 0;

    // Ensure valid ranges for hours, minutes, and seconds
    if (key === "hours" && value > 23) value = 23;
    if ((key === "minutes" || key === "seconds") && value > 59) value = 59;

    setFrequency((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <CenteredContainer sx={{ marginTop: "60px", marginLeft: "-20px" }}>
      <Box width="80%">
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box width="100%" mt={4}>
          {/* Section 1 */}
          {activeStep === 0 && (
            <Section>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Add New Domain
              </Typography>
              <TextField label="Domain Name" fullWidth margin="normal" value={vertical} onChange={(e) => setVertical(e.target.value)} style={{ marginBottom: "20px" }} />
              <TextField label="Domain Short Name" fullWidth margin="normal" value={shortName} onChange={(e) => setShortName(e.target.value)} style={{ marginBottom: "20px" }} />

              <Box mt={2} display="flex" justifyContent="space-between">
                <Button variant="contained" color="secondary" onClick={handleSubmitSection1}>
                  Submit
                </Button>
                <Button variant="contained" color="primary" onClick={handleNext}>
                  Next
                </Button>
              </Box>
            </Section>
          )}

          {/* Section 2 */}
          {activeStep === 1 && (
            <Section>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Sensor Type
              </Typography>
              <Box display="flex" gap={2} mb={2}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="vertical-select-label">Vertical</InputLabel>
                  <Select labelId="vertical-select-label" value={vertical} onChange={(e) => setVertical(e.target.value)}>
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {verticals.map((v) => (
                      <MenuItem key={v.id} value={v.name}>
                        {v.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Parameter" fullWidth margin="normal" value={parameter} onChange={(e) => setParameter(e.target.value)} style={{ marginTop: "16px" }} />
              </Box>
              <Box display="flex" gap={2} mb={2}>
                <TextField label="Max" type="number" fullWidth value={max} onChange={(e) => setMax(e.target.value)} />
                <TextField label="Min" type="number" fullWidth value={min} onChange={(e) => setMin(e.target.value)} />
              </Box>
              <FormControl fullWidth margin="normal" style={{ marginBottom: "20px" }}>
                <InputLabel id="datatype-select-label">Data Type</InputLabel>
                <Select labelId="datatype-select-label" value={datatype} onChange={(e) => setDatatype(e.target.value)}>
                  <MenuItem value="string">String</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="boolean">Boolean</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                </Select>
              </FormControl>
              <Box mt={2} display="flex" justifyContent="space-between">
                <Button variant="contained" color="secondary" onClick={handleSubmitSection2}>
                  Submit
                </Button>
                <Box>
                  <Button variant="outlined" color="primary" onClick={handleBack} style={{ marginRight: "8px" }}>
                    Back
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleNext}>
                    Next
                  </Button>
                </Box>
              </Box>
            </Section>
          )}
          {/* Section 3 */}
          {activeStep === 2 && (
            <Section sx={{ marginTop: "45px" }}>
              <Typography variant="h4"> </Typography>
              <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="column" gap={1} sx={{ padding: 1 }}>
                  <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={1}>
                    <TextField select label="Vertical Name" value={selectedVertical} onChange={handleVerticalChange} fullWidth size="small" sx={{ margin: 0 }}>
                      <MenuItem value="">
                        <em>Select Vertical</em>
                      </MenuItem>
                      {verticals.map((vertical) => (
                        <MenuItem key={vertical.id} value={vertical.name}>
                          {vertical.name}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField label="Node ID" value={nodeId} onChange={(e) => setNodeId(e.target.value.toUpperCase())} fullWidth size="small" sx={{ margin: 0 }} />
                  </Box>

                  <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={1}>
                    <TextField select label="Protocol" value={selectedProtocol} onChange={(e) => setSelectedProtocol(e.target.value)} fullWidth size="small" sx={{ margin: 0 }}>
                      <MenuItem value="">
                        <em>Select Protocol</em>
                      </MenuItem>
                      {["https", "mqtt", "tcp"].map((protocol) => (
                        <MenuItem key={protocol} value={protocol}>
                          {protocol}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField select label="Platform" value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} fullWidth size="small" sx={{ margin: 0 }}>
                      <MenuItem value="">
                        <em>Select Platform</em>
                      </MenuItem>
                      {platforms.map((platform) => (
                        <MenuItem key={platform.name} value={platform.name}>
                          {platform.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={1}>
                    <TextField label="URL" value={url} onChange={(e) => setUrl(e.target.value)} fullWidth size="small" sx={{ margin: 0 }}></TextField>

                    <TextField label="PORT" value={port} onChange={(e) => setPort(e.target.value)} fullWidth size="small" sx={{ margin: 0 }} />
                  </Box>

                  {/* <Typography variant="h6">Frequency:</Typography> */}
                  <Box display="flex" gap={1}>
                    <TextField
                      type="number"
                      value={frequency.hours || ""}
                      onChange={handleChange("hours")}
                      className="time-input"
                      inputProps={{ min: 0, max: 23 }}
                      size="small"
                      sx={{ margin: 0, width: "33%" }}
                      placeholder="HH"
                    />
                    <TextField
                      type="number"
                      value={frequency.minutes || ""}
                      onChange={handleChange("minutes")}
                      className="time-input"
                      inputProps={{ min: 0, max: 59 }}
                      size="small"
                      sx={{ margin: 0, width: "33%" }}
                      placeholder="MM"
                    />
                    <TextField
                      type="number"
                      value={frequency.seconds || ""}
                      onChange={handleChange("seconds")}
                      className="time-input"
                      inputProps={{ min: 0, max: 59 }}
                      size="small"
                      sx={{ margin: 0, width: "33%" }}
                      placeholder="SS"
                    />
                  </Box>
                  {parameters.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <label>Parameters:</label>
                      <Box
                        sx={{
                          maxHeight: "100px",
                          overflowY: "auto",
                          border: "1px solid #ccc",
                          padding: 2,
                        }}
                      >
                        {parameters.map((parameter) => (
                          <Box key={parameter.id} sx={{ mb: 1, display: "flex", alignItems: "center" }}>
                            <FormControlLabel
                              control={<Checkbox checked={selectedParameter.includes(parameter.id)} onChange={() => handleParameterChange(parameter.id)} />}
                              label={parameter.name}
                              sx={{ width: "150px" }}
                            />
                            {selectedParameter.includes(parameter.id) && (
                              <>
                                <TextField
                                  type="number"
                                  placeholder="Min Value"
                                  value={parameterInputs[parameter.id]?.min || ""}
                                  onChange={handleParameterInputChange(parameter.id, "min")}
                                  sx={{ width: "120px", mx: 1, margin: 0 }}
                                  size="small"
                                />
                                <TextField
                                  type="number"
                                  placeholder="Max Value"
                                  value={parameterInputs[parameter.id]?.max || ""}
                                  onChange={handleParameterInputChange(parameter.id, "max")}
                                  sx={{ width: "120px", margin: 0 }}
                                  size="small"
                                />
                              </>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {selectedPlatform === "ccsp" && (
                    <Box>
                      <Typography variant="h6">CCSP Files:</Typography>
                      <Box display="flex" gap={1}>
                        <input type="file" onChange={handleCcspFileChange(0)} />
                        <input type="file" onChange={handleCcspFileChange(1)} />
                      </Box>
                    </Box>
                  )}

                  {selectedPlatform === "OneM2m" && (
                    <Box>
                      <Typography variant="h6">OneM2m Credentials:</Typography>
                      <Box display="flex" gap={1}>
                        <TextField label="Username" name="username" value={oneM2mCredentials.username} onChange={handleOneM2mChange} fullWidth size="small" sx={{ margin: 0 }} />
                        <TextField type="password" label="Password" name="password" value={oneM2mCredentials.password} onChange={handleOneM2mChange} fullWidth size="small" sx={{ margin: 0 }} />
                      </Box>
                    </Box>
                  )}

                  {selectedPlatform === "ctop" && <TextField label="Ctop Field" value={ctopField} onChange={(e) => setCtopField(e.target.value)} fullWidth size="small" sx={{ margin: 0 }} />}

                  {/* Button alignment */}
                  <Box display="flex" justifyContent="space-between" width="100%" mt={2}>
                    <Button variant="contained" color="primary" type="submit">
                      Submit
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleBack}>
                      Back
                    </Button>
                  </Box>
                </Box>
              </form>
           
            </Section>
            
          )}
             <Terminal />
        </Box>
        <Box item xs={12} md={6} className="right-sidebar">
          <div className="right-sidebar">
            <div className="table-container">
              <Status />
            </div>
            {/* <Terminal /> */}
          </div>
        </Box>
      </Box>
    </CenteredContainer>
  );
};

export default App;
