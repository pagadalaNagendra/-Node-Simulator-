import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert
// import "./node.css";
import config from "../config";

const FormPage3 = () => {
  const [verticals, setVerticals] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [selectedVertical, setSelectedVertical] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState("https"); // Default value
  const [selectedPlatform, setSelectedPlatform] = useState(""); // Updated
  const [selectedParameter, setSelectedParameter] = useState([]); // Track selected parameters
  const [parameterInputs, setParameterInputs] = useState({}); // To store input values for each parameter
  const [nodeId, setNodeId] = useState("");
  const [frequency, setFrequency] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // New state variables for file uploads
  const [ccspFiles, setCcspFiles] = useState([null, null]); // For two files
  const [oneM2mCredentials, setOneM2mCredentials] = useState({ username: "", password: "" });
  const [ctopField, setCtopField] = useState(""); // New state for ctop input

  const platforms = [
    { name: "ccsp" },
    { name: "OneM2m" },
    { name: "ctop" }, // Add the new platform here
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
          setSelectedParameter([]); // Clear previous selections
          setParameterInputs({}); // Clear previous input values
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
        // If already selected, remove it and clear its input
        const newParams = prev.filter((id) => id !== parameterId);
        const newInputs = { ...parameterInputs };
        delete newInputs[parameterId]; // Remove input value for this parameter
        setParameterInputs(newInputs); // Update state
        return newParams;
      } else {
        // If not selected, add it
        return [...prev, parameterId];
      }
    });
  };

  const handleParameterInputChange = (parameterId) => (event) => {
    setParameterInputs((prev) => ({
      ...prev,
      [parameterId]: event.target.value, // Store input value for this parameter
    }));
  };

  const handleCcspFileChange = (index) => (event) => {
    const files = [...ccspFiles];
    files[index] = event.target.files[0]; // Store the file
    setCcspFiles(files);
  };

  const handleOneM2mChange = (event) => {
    const { name, value } = event.target;
    setOneM2mCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedVerticalObject = verticals.find((vertical) => vertical.name === selectedVertical);

    const formData = {
      node_id: nodeId.toUpperCase(),
      platform: selectedPlatform,
      protocol: selectedProtocol,
      frequency: frequency.hours * 3600 + frequency.minutes * 60 + frequency.seconds,
      parameter_id: JSON.stringify(selectedParameter),
      services: "stop",
      vertical_id: selectedVerticalObject ? selectedVerticalObject.id : 0,
      parameter_values: parameterInputs, // Include parameter input values
    };

    // Append files to formData if platform is "ccsp"
    if (selectedPlatform === "ccsp") {
      const data = new FormData();
      for (let i = 0; i < ccspFiles.length; i++) {
        if (ccspFiles[i]) {
          data.append("files", ccspFiles[i]);
        }
      }
      data.append("formData", JSON.stringify(formData)); // Append other form data as a JSON string

      axios
      .post(`${config.backendAPI}/nodes/`, data, {          
        headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          // Show success alert
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Form submitted successfully!",
            confirmButtonText: "OK",
          }).then(() => {
            // Auto-refresh page after clicking OK
            window.location.reload();
          });
          console.log("Form submitted successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error submitting form!", error);

          // Show error alert
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Please try again.",
            confirmButtonText: "OK",
          });
        });
    } else if (selectedPlatform === "OneM2m") {
      // Handle submission for OneM2m
      const oneM2mData = {
        ...formData,
        ...oneM2mCredentials, // Include username and password
      };

      axios
      .post(`${config.backendAPI}/nodes/`, oneM2mData)        
      .then((response) => {
          // Show success alert
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Form submitted successfully!",
            confirmButtonText: "OK",
          }).then(() => {
            // Auto-refresh page after clicking OK
            window.location.reload();
          });
          console.log("Form submitted successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error submitting form!", error);

          // Show error alert
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Please try again.",
            confirmButtonText: "OK",
          });
        });
    } else if (selectedPlatform === "ctop") {
      // Handle submission for ctop
      const ctopData = {
        ...formData,
        ctopField, // Include the ctop input field value
      };

      axios
      .post(`${config.backendAPI}/nodes/`, ctopData)        
      .then((response) => {
          // Show success alert
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Form submitted successfully!",
            confirmButtonText: "OK",
          }).then(() => {
            // Auto-refresh page after clicking OK
            window.location.reload();
          });
          console.log("Form submitted successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error submitting form!", error);

          // Show error alert
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Please try again.",
            confirmButtonText: "OK",
          });
        });
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
              <select id="protocol" name="protocol" value={selectedProtocol} onChange={(e) => setSelectedProtocol(e.target.value)}>
                <option value="">Select Protocol</option>
                {["http", "https"].map((protocol, index) => (
                  <option key={index} value={protocol}>{protocol}</option>
                ))}
              </select>
            </div>
            <div className="form-group half-width">
              <label htmlFor="platform">Platform:</label>
              <select id="platform" name="platform" value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                <option value="">Select Platform</option>
                {platforms.map((platform, index) => (
                  <option key={index} value={platform.name}>{platform.name}</option>
                ))}
              </select>
            </div>
          </div>
  
          <div className="form-group">
            <label>Frequency:</label>
            <div className="flex-container">
              <input type="number" name="hours" placeholder="Hours" min="0" max="24" onChange={(e) => setFrequency({ ...frequency, hours: e.target.value })} />
              <input type="number" name="minutes" placeholder="Minutes" min="0" max="60" onChange={(e) => setFrequency({ ...frequency, minutes: e.target.value })} />
              <input type="number" name="seconds" placeholder="Seconds" min="0" max="60" onChange={(e) => setFrequency({ ...frequency, seconds: e.target.value })} />
            </div>
          </div>
  
          {parameters.length > 0 && (
            <div className="form-group">
              <label>Parameters:</label>
              <div className="parameters-grid">
                {parameters.map((parameter) => (
                  <div key={parameter.id} className="parameter-item">
                    <label>
                      <input 
                        type="checkbox" 
                        value={parameter.id} 
                        checked={selectedParameter.includes(parameter.id)} 
                        onChange={() => handleParameterChange(parameter.id)} 
                      />
                      {parameter.name}
                    </label>
                    {selectedParameter.includes(parameter.id) && (
                      <div className="parameter-inputs">
                        <input type="number" placeholder="Min" onChange={handleParameterInputChange(parameter.id, "min")} />
                        <input type="number" placeholder="Max" onChange={handleParameterInputChange(parameter.id, "max")} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {selectedPlatform === "ccsp" && (
            <div className="platform-section">
              <label>Upload CCSP Files:</label>
              <div className="flex-container">
                <input type="file" onChange={handleCcspFileChange(0)} />
                <input type="file" onChange={handleCcspFileChange(1)} />
              </div>
            </div>
          )}
  
          {selectedPlatform === "OneM2m" && (
            <div className="platform-section">
              <div className="form-row">
                <div className="form-group half-width">
                  <label>OneM2M Username:</label>
                  <input type="text" name="username" value={oneM2mCredentials.username} onChange={handleOneM2mChange} />
                </div>
                <div className="form-group half-width">
                  <label>OneM2M Password:</label>
                  <input type="password" name="password" value={oneM2mCredentials.password} onChange={handleOneM2mChange} />
                </div>
              </div>
            </div>
          )}
  
          {selectedPlatform === "ctop" && (
            <div className="platform-section">
              <label>CTOP Field:</label>
              <input type="text" value={ctopField} onChange={(e) => setCtopField(e.target.value)} />
            </div>
          )}
  
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default FormPage3;