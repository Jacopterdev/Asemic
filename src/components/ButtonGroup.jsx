import React, { useState } from "react";
import PropTypes from "prop-types";

const ButtonGroup = ({ buttons, onButtonSelect }) => {
    const [selectedButton, setSelectedButton] = useState(0); // Default to the first button being selected

    const handleButtonClick = (button, index) => {
        if (selectedButton !== index) {
            setSelectedButton(index); // Update selected button
            if (onButtonSelect) onButtonSelect(index); // Notify the parent about the new selection
            if (button.onClick) button.onClick(true); // Execute custom button action with active state as true
        }
    };

    return (
        <div className="flex items-center space-x-2">
            {buttons.map((button, index) => (
                <div
                    key={index}
                    onClick={() => handleButtonClick(button, index)}
                    className={`button ${selectedButton === index ? "button-active" : ""}`} // Apply active class when selected
                >
                    {/* Render an image if the label is a file path ending with image extensions, otherwise render the label as text */}
                    {typeof button.label === "string" && button.label.match(/\.(jpeg|jpg|gif|png|svg)$/i) ? (
                        <img
                            src={button.label}
                            alt={`Button ${index}`}
                            className="button-image"
                        />
                    ) : (
                        button.label // Render the text label otherwise
                    )}

                </div>
            ))}
        </div>
    );
};

// Prop Types for validation
ButtonGroup.propTypes = {
    buttons: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.oneOfType([
                PropTypes.string, // String labels
                PropTypes.string, // Image file paths
            ]).isRequired,
            onClick: PropTypes.func, // Optional custom function for button action, receives active state as true
        })
    ).isRequired,
    onButtonSelect: PropTypes.func, // Callback to notify the parent of the selected button index
};

export default ButtonGroup;