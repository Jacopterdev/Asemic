import React from "react";
import PropTypes from "prop-types";

const ShareButton = ({ onClick }) => {
  return (
    <div 
      className="fixed top-4 right-52 button bg-purple-500 hover:bg-purple-600 transition-colors duration-200 z-50 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center px-3 py-2">
        {/* Share icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-1 text-white" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        <span className="text-white font-medium">Share</span>
      </div>
    </div>
  );
};

ShareButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default ShareButton;