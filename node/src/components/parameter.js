import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './parameter.css';
import axios from 'axios';
import config from '../config';
const ParameterForm = () => {
  const [formData, setFormData] = useState({
    parameterName: '',
    max: '',
    min: '',
    datatype: 'number', // Default value set to "number"
    vertical: '',
  });

  const [verticals, setVerticals] = useState([]);

  useEffect(() => {
    axios.get(`${config.backendAPI}/verticals/`)
      .then((response) => {
        setVerticals(response.data);
      })
      .catch((error) => {
        console.error('Error fetching verticals:', error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'parameterName' ? value.toLowerCase() : value;

    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const postData = {
      name: formData.parameterName.toLowerCase(),
      min_value: parseFloat(formData.min),
      max_value: parseFloat(formData.max),
      vertical_id: parseInt(formData.vertical, 10),
      data_type: formData.datatype,
    };

    if (isNaN(postData.min_value) || isNaN(postData.max_value)) {
      Swal.fire({
        title: 'Invalid Input!',
        text: 'Max and Min values should be valid numbers.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    console.log('Form Data BEFORE Submitted:', postData);
    axios.post(`${config.backendAPI}/parameters/`, postData)
      .then((response) => {
        Swal.fire({
          title: 'Form Submitted!',
          text: 'Your parameters have been submitted successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });

        setFormData({
          parameterName: '',
          max: '',
          min: '',
          datatype: 'number', // Reset to default value
          vertical: '',
        });
        
        console.log('Form Data Submitted:', response.data);
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error!',
          text: 'There was an issue submitting your form.',
          icon: 'error',
          confirmButtonText: 'OK',
        });

        console.error('Error submitting form:', error);
      });
  };

  return (
    <div className="parameter-form-container">
      <form onSubmit={handleSubmit} className="parameter-form">
        <div className="form-group">
          <label htmlFor="vertical" className="form-label">
            Vertical:
          </label>
          <select
            id="vertical"
            name="vertical"
            value={formData.vertical}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Select a vertical</option>
            {verticals.map((vertical) => (
              <option key={vertical.id} value={vertical.id}>
                {vertical.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="parameterName" className="form-label">
            Parameter Name:
          </label>
          <input
            type="text"
            id="parameterName"
            name="parameterName"
            value={formData.parameterName}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="max" className="form-label">
            Max:
          </label>
          <input
            type="number"
            id="max"
            name="max"
            value={formData.max}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="min" className="form-label">
            Min:
          </label>
          <input
            type="number"
            id="min"
            name="min"
            value={formData.min}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="datatype" className="form-label">
            Datatype:
          </label>
          <select
            id="datatype"
            name="datatype"
            value={formData.datatype}
            onChange={handleChange}
            className="form-select"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="date">Date</option>
          </select>
        </div>
        <button type="submit" className="form-submit-button">Submit</button>
      </form>
    </div>
  );
};

export default ParameterForm;



