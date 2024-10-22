import React from "react";
import "./ParameterCard.css"; // CSS for styling the parameter cards

const ParameterCard = ({ parameter }) => {
  return (
    <div className="parameter-card">
      <h4>{parameter.name}</h4>
      <p>Min: {parameter.min_value}</p>
      <p>Max: {parameter.max_value}</p>
    </div>
  );
};

export default ParameterCard;
