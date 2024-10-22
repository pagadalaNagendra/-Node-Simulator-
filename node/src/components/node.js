import React, { useEffect, useState } from "react";
import axios from "axios";
import "./node.css";
import config from "../config";

const FormPage3 = () => {
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

  const platforms = [
    { name: "ccsp" },
    { name: "OneM2m" },
    { name: "ctop" },
  ];

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

  // POST Method for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Convert frequency into seconds
    const frequencyInSeconds = frequency.hours * 3600 + frequency.minutes * 60 + frequency.seconds;
  
    // Prepare the node data as a JSON string
    const nodeData = JSON.stringify({
      node_id: nodeId,
      platform: selectedPlatform,
      protocol: selectedProtocol,
      frequency: frequencyInSeconds, // Use total frequency in seconds
      services: "stop", // Example service
      vertical_id: verticals.find((v) => v.name === selectedVertical)?.id,
      parameter: selectedParameter.map((paramId) => ({
        name: parameters.find((p) => p.id === paramId).name,
        min_value: parameterInputs[paramId]?.min || 0,
        max_value: parameterInputs[paramId]?.max || 0,
        vertical_id: verticals.find((v) => v.name === selectedVertical)?.id,
        data_type: "int", // Example type
        id: paramId
      }))
    });
  
    // Log node data to the console
    console.log("Data to be sent to the server:");
    console.log(nodeData);
  
    // Prepare form data to include node data and binary files for CCSP
    const formData = new FormData();
    formData.append("node", nodeData);  // Add node data as a JSON string
    formData.append("cert_file", ccspFiles[0]);  // Add certificate file
    formData.append("key_file", ccspFiles[1]);   // Add key file
  
    // Log form data for inspection
    console.log("Form data to be sent:");
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
  
    try {
      // Make the POST request to the backend with form data
      const response = await axios.post(
        `${config.backendAPI}/nodes/ccsp/`, // Your backend endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set content type for multipart
          },
        }
      );
  
      // Log the response from the server
      console.log("Response:", response.data);
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Submission failed!");
    }
  };
  

  return (
    <div className="container">
      <div className="form-container">
        <h2>Node</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="vertical_name">Vertical Name:</label>
              <select id="vertical_name" name="vertical_name" onChange={handleVerticalChange}>
                <option value="">Select Vertical</option>
                {verticals.map((vertical) => (
                  <option key={vertical.id} value={vertical.name}>
                    {vertical.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group half-width">
              <label htmlFor="node_id">Node ID:</label>
              <input
                type="text"
                id="node_id"
                name="node_id"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="protocol">Protocol:</label>
              <select
                id="protocol"
                name="protocol"
                value={selectedProtocol}
                onChange={(e) => setSelectedProtocol(e.target.value)}
              >
                <option value="">Select Protocol</option>
                {["https", "mqtt", "tcp"].map((protocol) => (
                  <option key={protocol} value={protocol}>
                    {protocol}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group half-width">
              <label htmlFor="platform">Platform:</label>
              <select
                id="platform"
                name="platform"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
              >
                <option value="">Select Platform</option>
                {platforms.map((platform) => (
                  <option key={platform.name} value={platform.name}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Frequency:</label>
            <div className="form-row">
              <input
                type="number"
                placeholder="HH"
                value={frequency.hours}
                onChange={(e) => setFrequency({ ...frequency, hours: parseInt(e.target.value) })}
                className="time-input"
              />
              <input
                type="number"
                placeholder="MM"
                value={frequency.minutes}
                onChange={(e) => setFrequency({ ...frequency, minutes: parseInt(e.target.value) })}
                className="time-input"
              />
              <input
                type="number"
                placeholder="SS"
                value={frequency.seconds}
                onChange={(e) => setFrequency({ ...frequency, seconds: parseInt(e.target.value) })}
                className="time-input"
              />
            </div>
          </div>

          {parameters.length > 0 && (
            <div className="form-groupsd">
              <label>Parameters:</label>
              {parameters.map((parameter) => (
                <div key={parameter.id} className="parameter-group">
                  <input
                    type="checkbox"
                    id={`param_${parameter.id}`}
                    checked={selectedParameter.includes(parameter.id)}
                    onChange={() => handleParameterChange(parameter.id)}
                  />
                  <label htmlFor={`param_${parameter.id}`}>{parameter.name}</label>
                  {selectedParameter.includes(parameter.id) && (
                    <div className="parameter-inputs">
                      <input
                        type="number"
                        placeholder="Min Value"
                        value={parameterInputs[parameter.id]?.min || ""}
                        onChange={handleParameterInputChange(parameter.id, "min")}
                      />
                      <input
                        type="number"
                        placeholder="Max Value"
                        value={parameterInputs[parameter.id]?.max || ""}
                        onChange={handleParameterInputChange(parameter.id, "max")}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedPlatform === "ccsp" && (
            <div className="form-group">
              <label>CCSP Files:</label>
              <div className="form-row">
                <input type="file" onChange={handleCcspFileChange(0)} />
                <input type="file" onChange={handleCcspFileChange(1)} />
              </div>
            </div>
          )}

          {selectedPlatform === "OneM2m" && (
            <div className="form-group">
              <label>OneM2m Credentials:</label>
              <div className="form-row">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={oneM2mCredentials.username}
                  onChange={handleOneM2mChange}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={oneM2mCredentials.password}
                  onChange={handleOneM2mChange}
                />
              </div>
            </div>
          )}

          {selectedPlatform === "ctop" && (
            <div className="form-group">
              <label htmlFor="ctop_field">Ctop Field:</label>
              <input
                type="text"
                id="ctop_field"
                value={ctopField}
                onChange={(e) => setCtopField(e.target.value)}
              />
            </div>
          )}

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default FormPage3;
