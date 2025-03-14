// src/components/LoadButton.jsx
import React from "react";
import PropTypes from "prop-types";

const LoadButton = ({ onClick }) => {
  return (
    <div 
      className="fixed top-4 right-28 button bg-blue-500 hover:bg-blue-600 transition-colors duration-200 z-50 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center px-3 py-2">
        {/* Upload icon (from heroicons style) */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-1 text-white" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-white font-medium">Load</span>
      </div>
    </div>
  );
};

LoadButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default LoadButton;