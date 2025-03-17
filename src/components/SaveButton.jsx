// src/components/SaveButton.jsx
import React from "react";
import PropTypes from "prop-types";

const SaveButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
        {/* Floppy disk save icon */}
        <path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 00-1 1v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 12.586V9a1 1 0 00-1-1z" />
      </svg>
      Save
    </button>
  );
};

SaveButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default SaveButton;