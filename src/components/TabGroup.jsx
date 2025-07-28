import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";

const TabGroup = ({ buttons, onButtonSelect, selectedButton }) => {

    const handleButtonClick = (button, index) => {
        if (selectedButton !== index) {
            if (onButtonSelect) onButtonSelect(index); // Notify parent of the selection
            if (button.onClick) button.onClick(true); // Trigger custom action
        }
    };


    return (
        <div className="flex items-center space-x-2">
            {buttons.map((button, index) => (
                <div
                    key={index}
                    onClick={() => handleButtonClick(button, index)}
                    className={`tab button ${selectedButton === index ? "button-active statetab" : ""}`} // Apply active class when selected
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

TabGroup.propTypes = {
    buttons: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.oneOfType([
                PropTypes.string, // String labels
                PropTypes.string, // Image file paths
            ]).isRequired,
            onClick: PropTypes.func,
        })
    ).isRequired,
    onButtonSelect: PropTypes.func,
    selectedButton: PropTypes.number, // Controlled prop for selected button
};


export default TabGroup;