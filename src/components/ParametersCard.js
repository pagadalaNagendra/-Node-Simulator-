// ParametersCard.js
import React from "react";

const ParametersCard = ({ parameters, onParameterChange }) => {
  return (
    <div className="parameters-card">
      <h3>Parameters</h3>
      <table>
        <thead>
          <tr>
            <th>Parameter Name</th>
            <th>Min Value</th>
            <th>Max Value</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param, index) => (
            <tr key={index}>
              <td>{param.name}</td>
              <td>
                <input
                  type="number"
                  value={param.min_value}
                  onChange={(e) => onParameterChange(index, "min_value", e.target.value)}
                  placeholder="Min"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={param.max_value}
                  onChange={(e) => onParameterChange(index, "max_value", e.target.value)}
                  placeholder="Max"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParametersCard;
