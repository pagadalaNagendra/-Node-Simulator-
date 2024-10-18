import React, { useState } from 'react';
import Swal from 'sweetalert';
import axios from 'axios';
import './vertical.css';
import config from '../config';
const FormPage1 = () => {
  const [vertical, setVertical] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${config.backendAPI}/verticals/`,
        { name: vertical },
        {
          headers: {
            'Content-Type': 'application/json', 
          },
        }
      );

      Swal({
        title: "Success!",
        text: "Vertical created successfully!",
        icon: "success",
        timer: 5000, 
        button: false,
      });

      setVertical('');
    } catch (error) {
      console.error('Error:', error);
      Swal({
        title: "Error!",
        text: "Vertical with this name already exists",
        icon: "error",
        timer: 5000, 
        button: false,
      });
    }
  };

  const handleChange = (e) => {
    setVertical(e.target.value.toUpperCase()); 
  };

  return (
    <div className="form-containerss">
      <form onSubmit={handleSubmit} className="form-content">
        <label htmlFor="vertical" className="form-label">
          Vertical:
        </label>
        <input 
          type="text" 
          name="vertical" 
          id="vertical"
          value={vertical} 
          onChange={handleChange}
          required 
          className="form-input"
        />
        <button type="submit" className="form-button">Create</button>
      </form>
    </div>
  );
};

export default FormPage1;
