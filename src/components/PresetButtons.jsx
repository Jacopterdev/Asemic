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
      id: 1,
      name: "Simple",
      thumbnail: "/presetThumbnails/simpel.svg",
      params: {
        numberOfLines: { min: 3, max: 5 },
        smoothAmount: 2,
        lineType: "straight"
      },
      1: {
        subShape: "Square",
        sides: 4,
        amount: { min: 2, max: 3 },
        size: { min: 20, max: 40 },
        connection: "Along",
        stretch: { min: 0, max: 0 },
        curve: { min: 0, max: 0 },
        rotationType: "relative",
        angle: { min: 0, max: 0 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 2,
      name: "Box Style",
      thumbnail: "/presetThumbnails/boxi.svg",
      params: {
        numberOfLines: { min: 8, max: 12 },
        smoothAmount: 0,
        lineType: "straight"
      },
      1: {
        subShape: "Square",
        sides: 4,
        amount: { min: 5, max: 10 },
        size: { min: 30, max: 60 },
        connection: "joints",
        stretch: { min: 0, max: 0 },
        curve: { min: 0, max: 0 },
        rotationType: "relative",
        angle: { min: 0, max: 0 },
        distort: { min: 0, max: 0 }
      },
      2: {
        subShape: "Triangle",
        sides: 3,
        amount: { min: 2, max: 4 },
        size: { min: 10, max: 20 },
        connection: "atEnd",
        stretch: { min: 0, max: 0 },
        curve: { min: 0, max: 0 },
        rotationType: "relative",
        angle: { min: 0, max: 0 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 3,
      name: "Smooth",
      thumbnail: "/presetThumbnails/smooth.svg",
      params: {
        numberOfLines: { min: 5, max: 8 },
        smoothAmount: 7,
        lineType: "curved",
        curviness: { min: 50, max: 80 }
      },
      1: {
        subShape: "Circle",
        amount: { min: 3, max: 7 },
        size: { min: 20, max: 40 },
        connection: "Along",
        stretch: { min: 0, max: 0 },
        curve: { min: 0, max: 0 },
        rotationType: "relative",
        angle: { min: 0, max: 0 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 4,
      name: "Blob Style",
      thumbnail: "/presetThumbnails/blob.svg",
      params: {
        numberOfLines: { min: 6, max: 10 },
        smoothAmount: 10,
        lineType: "curved",
        curviness: { min: 70, max: 100 }
      },
      1: {
        subShape: "Circle",
        sides: 8,
        amount: { min: 4, max: 8 },
        size: { min: 15, max: 45 },
        distort: { min: 30, max: 60 },
        connection: "Along",
        stretch: { min: 0, max: 0 },
        curve: { min: 0, max: 0 },
        rotationType: "relative",
        angle: { min: 0, max: 0 }
      }
    },
    {
      id: 5,
      name: "Duck",
      thumbnail: "/presetThumbnails/duck.svg",
      params: {
        numberOfLines: { min: 5, max: 7 },
        smoothAmount: 10,
        lineType: "both"
      },
      1: {
        subShape: "Circle",
        amount: { min: 1, max: 2 },
        size: { min: 25, max: 35 },
        connection: "atEnd",
        stretch: { min: 0, max: 0 },
        curve: { min: 0, max: 0 },
        rotationType: "relative",
        angle: { min: 0, max: 0 },
        distort: { min: 0, max: 0 }
      },
      2: {
        subShape: "Triangle",
        sides: 3,
        amount: { min: 1, max: 2 },
        size: { min: 15, max: 25 },
        connection: "atEnd",
        stretch: { min: 0, max: 0 },
        curve: { min: 0, max: 0 },
        rotationType: "relative",
        angle: { min: 0, max: 0 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 6,
      name: "Baby",
      thumbnail: "/presetThumbnails/baby.svg",
      params: {
        numberOfLines: { min: 4, max: 6 },
        smoothAmount: 10,
        lineWidth: { min: 5, max: 10 }
      },
      1: {
        subShape: "Circle",
        amount: { min: 2, max: 4 },
        size: { min: 40, max: 70 },
        connection: "joints",
        stretch: { min: 0, max: 0 },
        curve: { min: 0, max: 0 },
        rotationType: "relative",
        angle: { min: 0, max: 0 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 7,
      name: "Cloud",
      thumbnail: "/presetThumbnails/cloud.svg",
      params: {
        numberOfLines: { min: 3, max: 5 },
        smoothAmount: 10,
        lineType: "curved"
      },
      1: {
        subShape: "Circle",
        amount: { min: 6, max: 12 },
        size: { min: 30, max: 50 },
        connection: "Along",
        curve: { min: 20, max: 40 },
        stretch: { min: 0, max: 0 },
        rotationType: "relative",
        angle: { min: 0, max: 0 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 8,
      name: "Geometric",
      thumbnail: "/presetThumbnails/geo.svg",
      params: {
        numberOfLines: { min: 7, max: 9 },
        smoothAmount: 0,
        lineType: "straight",
        lineWidth: { min: 3, max: 6 }
      },
      1: {
        subShape: "Triangle",
        amount: { min: 5, max: 8 },
        size: { min: 15, max: 30 },
        connection: "joints",
        rotationType: "absolute",
        angle: { min: 0, max: 120 },
        stretch: { min: 0, max: 0 },
        curve: { min: 0, max: 0 },
        distort: { min: 0, max: 0 }
      }
    },
    {
      id: 9,
      name: "Spiky",
      thumbnail: "/presetThumbnails/spiky.svg",
      params: {
        numberOfLines: { min: 5, max: 7 },
        smoothAmount: 3,
        lineType: "straight"
      },
      1: {
        subShape: "Triangle",
        sides: 3,
        amount: { min: 10, max: 15 },
        size: { min: 8, max: 20 },
        connection: "Along",
        rotationType: "absolute",
        angle: { min: 0, max: 360 },
        stretch: { min: 0, max: 0 },
        curve: { min: 0, max: 0 },
        distort: { min: 0, max: 0 }
      }
    }
  ];

  const handlePresetClick = (preset) => {
    if (window.p5Instance) {
      try {
        // Get current state from p5Instance (to preserve existing parameters and skeleton)
        const currentState = window.p5Instance.getShapeLanguageAsJSON();
        
        // Start with current state as the base
        const presetData = JSON.parse(JSON.stringify(currentState));
        
        // Override only the parameters defined in the preset
        if (preset.params) {
          Object.entries(preset.params).forEach(([key, value]) => {
            presetData[key] = value;
          });
        }
        
        // Process subshapes - only override properties that are defined in the preset
        if (preset.subShapes) {
          // Make sure the subshapeKeys are preserved and updated if needed
          const existingSubshapeKeys = Array.isArray(presetData.subshapeKeys) 
            ? presetData.subshapeKeys 
            : Object.keys(presetData).filter(key => !isNaN(parseInt(key))).map(String);
            
          // Get all subshape keys from both current state and preset
          const allSubshapeKeys = [...new Set([
            ...Object.keys(preset.subShapes),
            ...existingSubshapeKeys
          ])];
          
          // Update subshapeKeys property
          presetData.subshapeKeys = allSubshapeKeys;
          
          // Process each subshape
          Object.entries(preset.subShapes).forEach(([key, presetSubshape]) => {
            // If this subshape already exists in the current state, merge with it
            // Otherwise create a new subshape based on preset
            const currentSubshape = presetData[key] || {};
            
            // Start with current subshape as base, then override with preset values
            presetData[key] = {
              ...currentSubshape,
              ...presetSubshape
            };
          });
        }
        
        console.log("Applying preset with merged data:", presetData);
        
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
                subshapeKeys: presetData.subshapeKeys,
                ...preset.subShapes,
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
              subshapeKeys: presetData.subshapeKeys,
              ...preset.subShapes,
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
    <div className="preset-buttons w-full mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-600 font-mono pl-1">Presets</div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="grid grid-cols-3 gap-2 p-1"
        >
          {presets.map((preset) => (
            <button
              key={preset.id}
              className="preset-button bg-gray-200 hover:bg-gray-300 transition-colors duration-150 rounded aspect-square flex items-center justify-center"
              onClick={() => handlePresetClick(preset)}
              title={preset.name}
            >
              <img 
                src={preset.thumbnail} 
                alt={preset.name}
                className="w-4/5 h-4/5 object-contain"
              />
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