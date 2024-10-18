// Modal.js
import React from "react";
import "./Modal.css"; // Import the CSS file for styling

const Modal = ({ isOpen, onClose, parameters }) => {
  if (!isOpen) return null; // Return null if the modal is not open

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times; {/* Close button */}
        </button>
        <h2>Parameter Details</h2>
        <pre>{JSON.stringify(parameters, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Modal;
