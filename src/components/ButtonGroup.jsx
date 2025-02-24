import React, { useState } from 'react';

const ButtonGroup = () => {
    const [selectedButton, setSelectedButton] = useState(0); // Tracks the selected button index

    const buttons = ["Edit Skeleton", "Anatomy View", "Composition View"]; // Button labels

    const handleButtonClick = (index) => {
        setSelectedButton(index); // Update the selected button
    };

    return (
        <div className="flex items-center space-x-2">
            {buttons.map((label, index) => (
                <div
                    key={index}
                    onClick={() => handleButtonClick(index)} // Handle button click
                    className={`button ${selectedButton === index ? "button-active" : ""}`} // Apply the "button-active" class when selected
                >
                    {label}
                </div>
            ))}
        </div>
    );
};

export default ButtonGroup;