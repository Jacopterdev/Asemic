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
        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h1v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
      </svg>
      Save
    </button>
  );
};

SaveButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default SaveButton;