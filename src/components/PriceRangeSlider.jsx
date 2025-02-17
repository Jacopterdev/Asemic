import {useRef, useState, useEffect, useCallback} from "react";
import PropTypes from "prop-types";

const valueCSS = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    gap: "2px",
    paddingTop: "10px",
};

const PriceRangeSlider = ({
                              min,
                              max,
                              trackColor = "#7c7c7c",
                              onChange,
                              rangeColor = "#ff5100",
                              valueStyle = valueCSS,
                              width = "300px",
                          }) => {

    const [minVal, setMinVal] = useState(min);
    const [maxVal, setMaxVal] = useState(max);
    const minValRef = useRef(min);
    const maxValRef = useRef(max);
    const range = useRef(null);


    // convert to percentage
    const getPercent = useCallback(
        (value) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    // set width of the range to decrease from the left side
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    // set the width of the range to decrease from right side
    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    // Get min and max values when their state changes
    useEffect(() => {
        if (minVal != minValRef.current || maxVal != maxValRef.current) {
            onChange({ min: minVal, max: maxVal });
            minValRef.current = minVal;
            maxValRef.current = maxVal;
        }
    }, [minVal, maxVal, onChange]);

    return (
        <div className='w-full flex items-center justify-center flex-col space-y-14'>

            {/* Display Price Value */}
            <div className="w-[300px] px-4 flex items-center justify-between gap-x-5">

                <p className="text-xl text-neutral-100 font-semibold">
                    {minVal}
                </p>

                <div className="flex-1 border-dashed border border-neutral-500 mt-1"></div>

                <p className="text-xl text-neutral-100 font-semibold">
                    {maxVal}
                </p>

            </div>


            {/* Style the price range slider */}
            <div className="multi-slide-input-container" style={{ width }}>

                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    onChange={(event) => {
                        const value = Math.min(Number(event.target.value), maxVal - 1);
                        setMinVal(value);
                    }}
                    className="thumb thumb-left"
                    style={{
                        width,
                        zIndex: minVal > max - 100 || minVal === maxVal ? 5 : undefined,
                    }}
                />

                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    onChange={(event) => {
                        const value = Math.max(Number(event.target.value), minVal + 1);
                        setMaxVal(value);
                    }}
                    className="thumb thumb-right"
                    style={{
                        width,
                        zIndex: minVal > max - 100 || minVal === maxVal ? 4 : undefined,
                    }}
                />

                <div className="slider">
                    <div
                        style={{ backgroundColor: trackColor }}
                        className="track-slider"
                    />

                    <div
                        ref={range}
                        style={{ backgroundColor: rangeColor }}
                        className="range-slider"
                    />

                </div>

            </div>

        </div>
    )
}
PriceRangeSlider.propTypes = {
    min: PropTypes.number.isRequired, // Minimum value for the slider
    max: PropTypes.number.isRequired, // Maximum value for the slider
    trackColor: PropTypes.string, // Color of the slider's track (default: light gray)
    onChange: PropTypes.func.isRequired, // Callback function to handle value changes
    rangeColor: PropTypes.string, // Color of the selected range (default: red)
    valueStyle: PropTypes.object, // Inline styles for value display elements
    width: PropTypes.string, // Width of the slider (default: "300px")
};

export default PriceRangeSlider