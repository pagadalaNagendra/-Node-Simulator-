import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from "recharts";
import Swal from "sweetalert2";

const Terminal = ({ reloadKey }) => {
  const [responseData, setResponseData] = useState([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [successCount, setSuccessCount] = useState(0); // Count of successful responses
  const [errorCount, setErrorCount] = useState(0); // Count of error responses

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/services/events");

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        const { node_id, status_code } = parsedData;

        // Increment total responses count
        setTotalResponses((prevCount) => prevCount + 1);

        // Count successful and error responses
        if (status_code === 201) {
          setSuccessCount((prev) => prev + 1);
        } else {
          setErrorCount((prev) => prev + 1);
          handleAlert(node_id);
        }
      } catch (err) {
        console.error("Error parsing event data:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    // Set up a timer to calculate averages every minute
    const intervalId = setInterval(() => {
      setResponseData((prevData) => {
        const newData = [
          ...prevData,
          {
            time: new Date().toLocaleTimeString(),
            "201": successCount,
            errors: errorCount,
          },
        ];

        // Reset counts for the next interval
        setSuccessCount(0);
        setErrorCount(0);

        return newData.slice(-10); // Keep the last 10 data points for the graph
      });
    }, 60000); // Every 60 seconds

    return () => {
      clearInterval(intervalId);
      eventSource.close();
    };
  }, [reloadKey, successCount, errorCount]);

  const handleAlert = (nodeId) => {
    Swal.fire({
      title: "Node Issue Detected",
      text: `There was a problem with node: ${nodeId}`,
      icon: "warning",
    });
  };

  return (
    <div style={{ width: "100%", height: 500 }}>
      <h2>Node Response Over Time</h2>
      <div style={{ marginBottom: "10px" }}>
        <strong>Total Responses:</strong> {totalResponses}
      </div>
      <ResponsiveContainer width="80%" height="80%">
        <LineChart data={responseData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="201" stroke="#82ca9d" name="Successful (201)" />
          <Line type="monotone" dataKey="errors" stroke="#ff7300" name="Errors" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Terminal;



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Container, TextField, Button, Select, MenuItem, Checkbox, FormControl, InputLabel, FormGroup, FormControlLabel, Grid, Typography, Box } from "@mui/material";
// import config from "../config";

// const FormPage3 = () => {
//   const [verticals, setVerticals] = useState([]);
//   const [parameters, setParameters] = useState([]);
//   const [selectedVertical, setSelectedVertical] = useState("");
//   const [selectedProtocol, setSelectedProtocol] = useState("https");
//   const [selectedPlatform, setSelectedPlatform] = useState("");
//   const [selectedParameter, setSelectedParameter] = useState([]);
//   const [parameterInputs, setParameterInputs] = useState({});
//   const [nodeId, setNodeId] = useState("");
//   const [frequency, setFrequency] = useState({ hours: 0, minutes: 0, seconds: 0 });
//   const [ccspFiles, setCcspFiles] = useState([null, null]);
//   const [oneM2mCredentials, setOneM2mCredentials] = useState({ username: "", password: "" });
//   const [ctopField, setCtopField] = useState("");
//   const [url, setUrl] = useState("");
//   const [port, setPort] = useState("");
//   const platforms = [{ name: "ccsp" }, { name: "OneM2m" }, { name: "ctop" }];

//   useEffect(() => {
//     axios
//       .get(`${config.backendAPI}/verticals/`)
//       .then((response) => {
//         setVerticals(response.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching verticals!", error);
//       });
//   }, []);

//   const handleVerticalChange = (e) => {
//     const selectedVerticalName = e.target.value;
//     setSelectedVertical(selectedVerticalName);

//     const selectedVerticalObject = verticals.find((vertical) => vertical.name === selectedVerticalName);
//     if (selectedVerticalObject) {
//       axios
//         .get(`${config.backendAPI}/parameters/?vertical_id=${selectedVerticalObject.id}`)
//         .then((response) => {
//           setParameters(response.data);
//           setSelectedParameter([]);
//           setParameterInputs({});
//         })
//         .catch((error) => {
//           console.error("Error fetching parameters!", error);
//         });
//     } else {
//       setParameters([]);
//     }
//   };
//   const handleChange = (key) => (e) => {
//     let value = parseInt(e.target.value) || 0;

//     if (key === "hours" && value > 23) value = 23;
//     if ((key === "minutes" || key === "seconds") && value > 59) value = 59;

//     setFrequency((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleParameterChange = (parameterId) => {
//     setSelectedParameter((prev) => {
//       if (prev.includes(parameterId)) {
//         const newParams = prev.filter((id) => id !== parameterId);
//         const newInputs = { ...parameterInputs };
//         delete newInputs[parameterId];
//         setParameterInputs(newInputs);
//         return newParams;
//       } else {
//         return [...prev, parameterId];
//       }
//     });
//   };

//   const handleParameterInputChange = (parameterId, type) => (event) => {
//     setParameterInputs((prev) => ({
//       ...prev,
//       [parameterId]: { ...prev[parameterId], [type]: event.target.value },
//     }));
//   };

//   const handleCcspFileChange = (index) => (event) => {
//     const files = [...ccspFiles];
//     files[index] = event.target.files[0];
//     setCcspFiles(files);
//   };

//   const handleOneM2mChange = (event) => {
//     const { name, value } = event.target;
//     setOneM2mCredentials((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const frequencyInSeconds = frequency.hours * 3600 + frequency.minutes * 60 + frequency.seconds;

//     const nodeData = JSON.stringify({
//       node_id: nodeId,
//       platform: selectedPlatform,
//       protocol: selectedProtocol,
//       frequency: frequencyInSeconds, 
//       services: "stop", 
//       vertical_id: verticals.find((v) => v.name === selectedVertical)?.id,
//       parameter: selectedParameter.map((paramId) => ({
//         name: parameters.find((p) => p.id === paramId).name,
//         min_value: parameterInputs[paramId]?.min || 0,
//         max_value: parameterInputs[paramId]?.max || 0,
//         vertical_id: verticals.find((v) => v.name === selectedVertical)?.id,
//         data_type: "int", 
//         id: paramId,
//       })),
//     });

//     const formData = new FormData();
//     formData.append("node", nodeData); 
//     formData.append("cert_file", ccspFiles[0]); 
//     formData.append("key_file", ccspFiles[1]); 

//     try {
//       const response = await axios.post(
//         `${config.backendAPI}/nodes/ccsp/`, 
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data", 
//           },
//         }
//       );

//       console.log("Response:", response.data);
//       alert("Data submitted successfully!");
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       alert("Submission failed!");
//     }
//   };

//   return (
//    <Container maxWidth="sm" sx={{ marginTop: "120px" }}>   <Typography variant="h4"> </Typography>
//       <form onSubmit={handleSubmit}>
//         <Box display="flex" flexDirection="column" gap={1} sx={{ padding: 1 }}>
//           <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={1}>
//             <TextField select label="Vertical Name" value={selectedVertical} onChange={handleVerticalChange} fullWidth size="small" sx={{ margin: 0 }}>
//               <MenuItem value="">
//                 <em>Select Vertical</em>
//               </MenuItem>
//               {verticals.map((vertical) => (
//                 <MenuItem key={vertical.id} value={vertical.name}>
//                   {vertical.name}
//                 </MenuItem>
//               ))}
//             </TextField>

//             <TextField label="Node ID" value={nodeId} onChange={(e) => setNodeId(e.target.value.toUpperCase())} fullWidth size="small" sx={{ margin: 0 }} />
//           </Box>

//           <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={1}>
//             <TextField select label="Protocol" value={selectedProtocol} onChange={(e) => setSelectedProtocol(e.target.value)} fullWidth size="small" sx={{ margin: 0 }}>
//               <MenuItem value="">
//                 <em>Select Protocol</em>
//               </MenuItem>
//               {["https", "mqtt", "tcp"].map((protocol) => (
//                 <MenuItem key={protocol} value={protocol}>
//                   {protocol}
//                 </MenuItem>
//               ))}
//             </TextField>

//             <TextField select label="Platform" value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} fullWidth size="small" sx={{ margin: 0 }}>
//               <MenuItem value="">
//                 <em>Select Platform</em>
//               </MenuItem>
//               {platforms.map((platform) => (
//                 <MenuItem key={platform.name} value={platform.name}>
//                   {platform.name}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </Box>

//           <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={1}>
//             <TextField label="URL" value={url} onChange={(e) => setUrl(e.target.value)} fullWidth size="small" sx={{ margin: 0 }}></TextField>

//             <TextField label="PORT" value={port} onChange={(e) => setPort(e.target.value)} fullWidth size="small" sx={{ margin: 0 }} />
//           </Box>

//           <Box display="flex" gap={1}>
//             <TextField
//               type="number"
//               value={frequency.hours || ""}
//               onChange={handleChange("hours")}
//               className="time-input"
//               inputProps={{ min: 0, max: 23 }}
//               size="small"
//               sx={{ margin: 0, width: "33%" }}
//               placeholder="HH"
//             />
//             <TextField
//               type="number"
//               value={frequency.minutes || ""}
//               onChange={handleChange("minutes")}
//               className="time-input"
//               inputProps={{ min: 0, max: 59 }}
//               size="small"
//               sx={{ margin: 0, width: "33%" }}
//               placeholder="MM"
//             />
//             <TextField
//               type="number"
//               value={frequency.seconds || ""}
//               onChange={handleChange("seconds")}
//               className="time-input"
//               inputProps={{ min: 0, max: 59 }}
//               size="small"
//               sx={{ margin: 0, width: "33%" }}
//               placeholder="SS"
//             />
//           </Box>
//           {parameters.length > 0 && (
//             <Box sx={{ mb: 2 }}>
//               <label>Parameters:</label>
//               <Box
//                 sx={{
//                   maxHeight: "100px",
//                   overflowY: "auto",
//                   border: "1px solid #ccc",
//                   padding: 2,
//                 }}
//               >
//                 {parameters.map((parameter) => (
//                   <Box key={parameter.id} sx={{ mb: 1, display: "flex", alignItems: "center" }}>
//                     <FormControlLabel
//                       control={<Checkbox checked={selectedParameter.includes(parameter.id)} onChange={() => handleParameterChange(parameter.id)} />}
//                       label={parameter.name}
//                       sx={{ width: "150px" }}
//                     />
//                     {selectedParameter.includes(parameter.id) && (
//                       <>
//                         <TextField
//                           type="number"
//                           placeholder="Min Value"
//                           value={parameterInputs[parameter.id]?.min || ""}
//                           onChange={handleParameterInputChange(parameter.id, "min")}
//                           sx={{ width: "120px", mx: 1, margin: 0 }}
//                           size="small"
//                         />
//                         <TextField
//                           type="number"
//                           placeholder="Max Value"
//                           value={parameterInputs[parameter.id]?.max || ""}
//                           onChange={handleParameterInputChange(parameter.id, "max")}
//                           sx={{ width: "120px", margin: 0 }}
//                           size="small"
//                         />
//                       </>
//                     )}
//                   </Box>
//                 ))}
//               </Box>
//             </Box>
//           )}

//           {selectedPlatform === "ccsp" && (
//             <Box>
//               <Typography variant="h6">CCSP Files:</Typography>
//               <Box display="flex" gap={1}>
//                 <input type="file" onChange={handleCcspFileChange(0)} />
//                 <input type="file" onChange={handleCcspFileChange(1)} />
//               </Box>
//             </Box>
//           )}

//           {selectedPlatform === "OneM2m" && (
//             <Box>
//               <Typography variant="h6">OneM2m Credentials:</Typography>
//               <Box display="flex" gap={1}>
//                 <TextField label="Username" name="username" value={oneM2mCredentials.username} onChange={handleOneM2mChange} fullWidth size="small" sx={{ margin: 0 }} />
//                 <TextField type="password" label="Password" name="password" value={oneM2mCredentials.password} onChange={handleOneM2mChange} fullWidth size="small" sx={{ margin: 0 }} />
//               </Box>
//             </Box>
//           )}

//           {selectedPlatform === "ctop" && <TextField label="Ctop Field" value={ctopField} onChange={(e) => setCtopField(e.target.value)} fullWidth size="small" sx={{ margin: 0 }} />}

//           <Box display="flex" justifyContent="space-between" width="100%" mt={2}>
//             <Button variant="contained" color="primary" type="submit">
//               Submit
//             </Button>
     
//           </Box>
//         </Box>
//       </form>{" "}
//     </Container>
//   );
// };

// export default FormPage3;
