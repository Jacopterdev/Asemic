import { useState } from "react";
import PropTypes from "prop-types";

export function IntervalSlider({
                                   min = 0, // minimum possible value
                                   max = 100, // maximum possible value
                                   step = 1, // slider step
                                   initialMin = 25, // default minimum value
                                   initialMax = 75, // default maximum value
                                   onChange, // callback to pass selected range
                               }) {
    const [minValue, setMinValue] = useState(initialMin);
    const [maxValue, setMaxValue] = useState(initialMax);

    const handleMinChange = (e) => {
        const value = Math.min(Number(e.target.value), maxValue - step); // Prevent overlap
        setMinValue(value);
        if (onChange) onChange([value, maxValue]);
    };

    const handleMaxChange = (e) => {
        const value = Math.max(Number(e.target.value), minValue + step); // Prevent overlap
        setMaxValue(value);
        if (onChange) onChange([minValue, value]);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg shadow-md">
            <div className="w-full relative">
                {/* Minimum slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={minValue}
                    onChange={handleMinChange}
                    className="absolute top-0 w-full h-2 bg-transparent cursor-pointer appearance-none"
                    style={{
                        zIndex: minValue === maxValue ? 1 : 0, // Prevent overlap
                    }}
                />
                {/* Maximum slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={maxValue}
                    onChange={handleMaxChange}
                    className="absolute top-0 w-full h-2 bg-transparent cursor-pointer appearance-none z-10"
                />
                {/* Visual track */}
                <div className="h-2 rounded-full bg-gray-300">
                    <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{
                            left: `${((minValue - min) / (max - min)) * 100}%`,
                            right: `${100 - ((maxValue - min) / (max - min)) * 100}%`,
                            position: "absolute",
                        }}
                    ></div>
                </div>
            </div>
            {/* Range Value Display */}
            <div className="flex justify-between gap-2 text-center w-full">
                <span className="text-gray-700 font-medium">{minValue}</span>
                <span className="text-gray-700 font-medium">{maxValue}</span>
            </div>
        </div>
    );
}

IntervalSlider.propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    initialMin: PropTypes.number,
    initialMax: PropTypes.number,
    onChange: PropTypes.func,
};