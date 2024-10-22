import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleNavigation = (event) => {
    const selectedValue = event.target.value;
    // Navigate to the selected page
    if (selectedValue) {
      navigate(selectedValue);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1721754287/left_xfp4qb.png" alt="Logo" />
        <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1721739306/smartcity_jgrecd.png" alt="Logo" />
      </div>
      <div className="navbar-title">
      Node Simulator 
      </div>
      <div className="navbar-dropdown">
      <select onChange={handleNavigation} defaultValue="">
        <option value="" disabled>Select Page</option>
        <option value="/Node-Simultor">Homepage</option>
        <option value="/Node-Simultor/vertical">Vertical</option>
        <option value="/Node-Simultor/parameter">Parameter</option>
        <option value="/Node-Simultor/node">Node</option>
        <option value="/Node-Simultor/platform">Platforms</option>
        <option value="/Node-Simultor/Predefinedconfigurations">Predefined Configurations</option>
        <option value="/Node-Simultor/Historystatus">History</option>
      </select>
    </div>    
    </nav>
  );
}

export default Navbar;
