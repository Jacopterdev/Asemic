// Create a new file called ZoomSuggestionPopup.jsx in your components folder

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ZoomSuggestionPopup = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0  bg-white/50 flex items-center justify-center z-50">
            <div className="about-container-inner bg-gray-100 p-6 max-w-md w-full shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-600 font-mono">Please adjust your screen</h2>
                <p className="mb-4 text-gray-600">
                    For the best experience, you may want to adjust your browser's zoom level.
                </p>
                <p className="mb-4 text-gray-600">
                    <strong>Tip:</strong> You can zoom in or out by pressing:
                </p>
                    <ul className="list-disc ml-5 mt-2 text-gray-600">
                        <li>Ctrl + (Windows) or ⌘ + (Mac) to zoom in</li>
                        <li>Ctrl - (Windows) or ⌘ - (Mac) to zoom out</li>
                        <li>Or hold Ctrl (Windows) or ⌘ (Mac) and use your mouse wheel/trackpad</li>
                    </ul>


                <div className="flex justify-end space-x-3">
                    <button
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => {
                            localStorage.setItem('dontShowZoomSuggestion', 'true');
                            onClose();
                        }}
                    >
                        Don't show again
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={onClose}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

ZoomSuggestionPopup.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default ZoomSuggestionPopup;