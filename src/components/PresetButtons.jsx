import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { SPACING } from "../sketches/States/LayoutConstants";

const PresetButtons = ({ onPresetSelect }) => {
  const scrollContainerRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  // Check if scrolling is needed
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setShowScrollButtons(container.scrollHeight > container.clientHeight);
    }
  }, []);

  // Scroll functions
  const scrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -150, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 150, behavior: 'smooth' });
    }
  };

  // Define presets with their configurations
  const presets = [
    {
      id: 2,
      name: "Skyline",
      thumbnail: "/presetThumbnails/skylineicon.svg",
      params: {
        smoothAmount: 0,
        lineWidth: { min: 15, max: 16 },
      },
      1: {
        subShape: "Square",
        sides: 4,
        amount: { min: 5, max: 100 },
        size: { min: 0, max: 35 },
        connection: "Along",
        stretch: { min: 0, max: 99 },
        curve: { min: 0, max: 0 },
        rotationType: "relative",
        angle: { min: 92, max: 92 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 18,
      name: "Hairy",
      thumbnail: "/presetThumbnails/hairyicon.svg",
      params: {
        smoothAmount: 0,
        lineWidth: { min: 15, max: 16 },
      },
      1: {
        subShape: "Square",
        sides: 2,
        amount: { min: 10, max: 77 },
        size: { min: 100, max: 100 },
        connection: "Along",
        stretch: { min: 78, max: 78 },
        curve: { min: 0, max: 0 },
        rotationType: "absolute",
        angle: { min: 0, max: 0 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 12,
      name: "Fluid",
      thumbnail: "/presetThumbnails/fluidicon.svg",
      params: {
        smoothAmount: 20,
        lineWidth: { min: 25, max: 27 },
      },
      1: {
        subShape: "Triangle",
        sides: 3,
        amount: { min: 100, max: 100 },
        size: { min: 29, max: 48 },
        connection: "Along",
        stretch: { min: 0, max: 0 },
        curve: { min: 1, max: 42 },
        rotationType: "relative",
        angle: { min: 0, max: 203 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 13,
      name: "Leaves",
      thumbnail: "/presetThumbnails/leavesicon.svg",
      params: {
        smoothAmount: 0,
        lineWidth: { min: 5, max: 10 },
      },
      1: {
        subShape: "Triangle",
        sides: 2,
        amount: { min: 100, max: 100 },
        size: { min: 29, max: 48 },
        connection: "Along",
        stretch: { min: 0, max: 0 },
        curve: { min: 1, max: 71 },
        rotationType: "relative",
        angle: { min: 0, max: 203 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 14,
      name: "Blob",
      thumbnail: "/presetThumbnails/blobicon.svg",
      params: {
        smoothAmount: 40,
        lineWidth: { min: 63, max: 81 }
      }
    },
    {
      id: 15,
      name: "Cap",
      thumbnail: "/presetThumbnails/capicon.svg",
      params: {
        smoothAmount: 16,
        lineWidth: { min: 28, max: 52 }
      },
      1: {
        subShape: "Circle",
        sides: 4,
        amount: { min: 3, max: 100 },
        size: { min: 41, max: 58 },
        connection: "atEnd",
        stretch: { min: 90, max: 150 },
        curve: { min: 1, max: 1 },
        rotationType: "absolute",
        angle: { min: 181, max: 181 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 16,
      name: "Stars",
      thumbnail: "/presetThumbnails/starsicon.svg",
      params: {
        smoothAmount: 0,
        lineWidth: { min: 0, max: 0 }
      },
      1: {
        subShape: "Square",
        sides: 4,
        amount: { min: 0, max: 10 },
        size: { min: 20, max: 160 },
        connection: "Along",
        stretch: { min: 0, max: 0 },
        curve: { min: 71, max: 100 },
        rotationType: "relative",
        angle: { min: 0, max: 360 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 17,
      name: "Seaweed",
      thumbnail: "/presetThumbnails/seaweedicon.svg", // You'll need to add this image file
      params: {
        numberOfLines: { min: 5, max: 120 },
        smoothAmount: 16,
        lineWidth: { min: 25, max: 25 },
        lineType: "both",
        curviness: { min: 70, max: 100 },
        curveOffset: { min: 0, max: 0 },
        curveRatio: 50,
        lineComposition: "Branched"
      },
      1: {
        subShape: "Triangle",
        sides: 3,
        amount: { min: 100, max: 100 },
        size: { min: 13, max: 32 },
        connection: "Along",
        stretch: { min: 0, max: 0 },
        curve: { min: 1, max: 42 },
        rotationType: "relative",
        angle: { min: 0, max: 203 },
        distort: { min: 0, max: 0 }
      }
    }
  ];

  const handlePresetClick = (preset) => {
    if (window.p5Instance) {
      try {
        // Get current state from p5Instance (to preserve skeleton structure only)
        const currentState = window.p5Instance.getShapeLanguageAsJSON();

        // Start with a fresh preset-based state, only preserving points and lines
        const presetData = {
          // Copy the skeleton structure (points and lines)
          points: currentState.points || [],
          lines: currentState.lines || []
        };

        // Add all params from the preset
        if (preset.params) {
          Object.entries(preset.params).forEach(([key, value]) => {
            presetData[key] = value;
          });
        }

        // Get all numeric keys to identify subshapes
        const subshapeKeys = Object.keys(preset)
          .filter(key => !isNaN(parseInt(key)))
          .map(String);

        // Set subshapeKeys property explicitly
        presetData.subshapeKeys = subshapeKeys;

        // Completely replace all subshapes with ones from the preset
        // This ensures no existing subshapes remain in the configuration
        subshapeKeys.forEach(key => {
          presetData[key] = JSON.parse(JSON.stringify(preset[key]));
        });

        console.log("Applying preset with completely replaced subshapes:", presetData);

        // Convert to JSON string
        const jsonString = JSON.stringify(presetData);

        // Use the method from p5 sketch to load the preset
        if (window.p5Instance.loadShapeLanguageFromJSON) {
          const success = window.p5Instance.loadShapeLanguageFromJSON(jsonString);

          if (success) {
            console.log(`Preset "${preset.name}" applied successfully`);

            // If there's an onPresetSelect callback, call it
            if (onPresetSelect) {
              onPresetSelect(preset);
            }
          } else {
            console.error(`Failed to apply preset "${preset.name}"`);

            // Fallback to the event-based approach if loading failed
            const updateEvent = new CustomEvent('tweakpane-update', {
              detail: {
                ...preset.params,
                updateSubshapes: true,
                clearSubshapes: true, // Signal to clear existing subshapes
                subshapeKeys: subshapeKeys,
                // Add all subshapes directly
                ...Object.fromEntries(
                  subshapeKeys.map(key => [key, preset[key]])
                ),
                preserveSkeleton: true
              }
            });

            window.dispatchEvent(updateEvent);
          }
        } else {
          console.error("p5Instance doesn't have loadShapeLanguageFromJSON method");

          // Fallback to the event-based approach
          const updateEvent = new CustomEvent('tweakpane-update', {
            detail: {
              ...preset.params,
              updateSubshapes: true,
              clearSubshapes: true, // Signal to clear existing subshapes
              subshapeKeys: subshapeKeys,
              // Add all subshapes directly
              ...Object.fromEntries(
                subshapeKeys.map(key => [key, preset[key]])
              ),
              preserveSkeleton: true
            }
          });

          window.dispatchEvent(updateEvent);
        }
      } catch (error) {
        console.error("Error applying preset:", error);

        // Fallback on error
        if (onPresetSelect) {
          const updateEvent = new CustomEvent('tweakpane-update', {
            detail: {
              ...preset.params,
              updateSubshapes: true,
              subshapeKeys: Object.keys(preset.subShapes),
              ...preset.subShapes,
              preserveSkeleton: true
            }
          });

          window.dispatchEvent(updateEvent);
        }
      }
    } else {
      console.warn("p5Instance not available, cannot apply preset directly");
    }
  };

  return (
  <div className="preset-buttons w-full mt-4 bg-gray-200 rounded-md shadow-md">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-gray-500 font-mono pl-1">
          <h5 className="mx-3 my-0 select-none">Presets</h5></div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="grid grid-cols-4 gap-0.5 p-1 mx-3"
        >
          {presets.map((preset) => (
            <button
              key={preset.id}
              className="preset-button bg-gray-200 hover:bg-gray-300 transition-colors duration-150 rounded-lg flex flex-col items-center justify-center p-1 "
              onClick={() => handlePresetClick(preset)}
              title={preset.name}
            >
              <div className="flex-grow flex items-center justify-center w-full">
                <img
                  src={preset.thumbnail}
                  alt={preset.name}
                  className="w-4/5 h-4/5 object-contain"
                />
              </div>
              <div className="text-xs text-gray-500 my-0 truncate w-full text-center">
                {preset.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

PresetButtons.propTypes = {
  onPresetSelect: PropTypes.func
};

export default PresetButtons;