import React from "react";
import PropTypes from "prop-types";

const ShareButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
      </svg>
      Share
    </button>
  );
};

ShareButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default ShareButton;