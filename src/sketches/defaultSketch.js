import LineManager from "./LineManager.js";
import SkeletonState from "./States/SkeletonState.js";
import AnatomyState from "./States/AnatomyState.js";
import CompositionState from "./States/CompositionState.js";
import Effects from "./Effects.js";
import shapeDictionary from "./ShapeDictionary.js";
import {SPACING as LAYOUT} from "./States/LayoutConstants.js";

const defaultSketch = (p, mergedParamsRef, toolConfigRef, lastUpdatedParamRef) => {
    let points = [];

    let lineManager;
    let shapeScale;

    let shapeGenerator;
    let mergedParams;
    let toolConfig;
    let lastUpdatedParam;
    let previousLastUpdatedParam;
    let effects;

    // Instances of various states
    let states = {};
    let currentState;


    p.setup = () => {
        // Create the canvas (adjust dimensions as needed)
        p.createCanvas(800, 800);
        p.angleMode(p.DEGREES);
        p.angleMode(p.RADIANS);
        p.noiseSeed(1);

        mergedParams = mergedParamsRef.current;
        toolConfig = toolConfigRef.current;
        lastUpdatedParam = lastUpdatedParamRef.current;
        previousLastUpdatedParam = null;

        //gridSize = p.width - margin * 2;

        lineManager = new LineManager();
        shapeScale = 1;

        effects = new Effects(p);
        console.log(shapeDictionary.getDictionary());

        /** STATE MANAGEMENT */
        // Pre-create each state and store them
        states["Edit Skeleton"] = new SkeletonState(p, points, lineManager, mergedParams, toolConfig);
        states["Anatomy"] = new AnatomyState(p, points, lineManager, shapeGenerator, mergedParamsRef);
        states["Composition"] = new CompositionState(p, mergedParams);
        currentState = "Edit Skeleton"
        updateState("Edit Skeleton"); // Set the initial state
    };

    const updateState = (stateName) => {
        if (currentState?.name === stateName) return; // Avoid unnecessary updates
        currentState = states[stateName]; // Switch to the existing state instance
    };

    p.draw = () => {
        /**Update variables*/
        mergedParams = mergedParamsRef.current;
        toolConfig = toolConfigRef.current;
        lastUpdatedParam = lastUpdatedParamRef.current;

        let configUpdated = p.isConfigUpdated();


        if (currentState?.updateMergedParams && configUpdated) {
            p.rebuildSkeleton();
            effects.setSmoothAmount(mergedParams.smoothAmount);
            currentState.updateMergedParams(mergedParams);
        }

        if(currentState?.updateToolConfig){
            currentState.updateToolConfig(toolConfig);
        }

        /**DRAWING*/
        p.background(255); // Reset background each frame

        const currentToolState = toolConfig.state;

        if (currentToolState && currentToolState !== currentState?.name) {

            updateState(currentToolState); // Update state when `toolConfigRef.state` changes
            p.rebuildSkeleton();
            if (currentState?.updateMergedParams) {
                currentState.updateMergedParams(mergedParams);
                effects.setSmoothAmount(mergedParams.smoothAmount);
                p.animateSmoothAmount();

            }
        }

        currentState?.draw();
    };

    p.rebuildSkeleton = () => {
        const lines = lineManager.getSelectedLines();
        mergedParams = {
            ...mergedParams,
            lines: lines,
            points: points,
        };
        shapeScale = p.calculateOuterScale(points, p.width - (2*LAYOUT.MARGIN), p.height - (2*LAYOUT.MARGIN));
        
        // Make sure to update the React ref
        mergedParamsRef.current = mergedParams;
    }
    p.getShapeScale = () => shapeScale;

    p.applyEffects = (blurScale) => {
        effects.applyEffects(blurScale);
    }
    p.animateSmoothAmount = (duration = 400) => {
        if(!effects) return;
        effects.animateSmoothAmount(duration);
    }
    p.isConfigUpdated = () => {
        let configUpdated =
            lastUpdatedParam &&
            (!previousLastUpdatedParam ||
                JSON.stringify(lastUpdatedParam) !== JSON.stringify(previousLastUpdatedParam));

        previousLastUpdatedParam = lastUpdatedParam
            ? JSON.parse(JSON.stringify(lastUpdatedParam))
            : null;
        return configUpdated;
    }
    p.mousePressed = () => currentState?.mousePressed();
    p.mouseDragged = () => currentState?.mouseDragged();
    p.mouseReleased = () => currentState?.mouseReleased();
    p.keyPressed = (evt) => currentState?.keyPressed?.(evt);
    p.keyReleased = (evt) => currentState?.keyReleased?.(evt);
    p.mouseWheel = (event) => {
        if (currentState?.mouseWheel) currentState.mouseWheel(event);
    };
    p.mouseMoved = () => {
        if(currentState?.mouseMoved) currentState?.mouseMoved();
    }

    /**
     * Calculate a scale factor based on the outer-most points in the points list,
     * ensuring the points fit within the canvas proportionally.
     *
     * @param {Array<{x: number, y: number}>} points - The list of points with `x` and `y` coordinates.
     * @param {number} canvasWidth - The width of the canvas.
     * @param {number} canvasHeight - The height of the canvas.
     * @returns {number} - The calculated scale factor.
     */
     p.calculateOuterScale = (points, canvasWidth, canvasHeight) => {
        if (!points || points.length === 0) {
            return 1; // Default scale if no points are provided.
        }

        // Step 1: Find the bounding box of the points
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        points.forEach(point => {
            if (point.x < minX) minX = point.x; // Leftmost point
            if (point.x > maxX) maxX = point.x; // Rightmost point
            if (point.y < minY) minY = point.y; // Topmost point
            if (point.y > maxY) maxY = point.y; // Bottommost point
        });

        // Step 2: Compute horizontal and vertical deltas
        const horizontalDelta = maxX - minX; // Width of the bounding box
        const verticalDelta = maxY - minY;   // Height of the bounding box

        // Step 3: Calculate horizontal and vertical scales
        const horizontalScale = horizontalDelta / canvasWidth;
        const verticalScale = verticalDelta / canvasHeight;

        // Step 4: Return the scale based on the larger dimension
        const scaleFactor = Math.max(horizontalScale, verticalScale);

        return 1/scaleFactor;
     }

    // Method to get the current state as JSON
    p.getShapeLanguageAsJSON = () => {
        // Make sure we rebuild skeleton first to get the latest points and lines
        p.rebuildSkeleton();
        
        // Create a deep copy to avoid any reference issues
        const exportData = JSON.parse(JSON.stringify(mergedParams));
        
        return exportData;
    };

    // Method to get the current state as a JSON string
    p.getShapeLanguageAsJSONString = () => {
        return JSON.stringify(p.getShapeLanguageAsJSON());
    };

    // Method to save current state to file
    p.saveShapeLanguage = (filename = `shape_language_${Date.now()}.json`) => {
        const jsonString = p.getShapeLanguageAsJSONString();
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log("Shape language saved successfully as", filename);
        return true;
    };

    // Method to load state from JSON string - updated to handle subshapes
    p.loadShapeLanguageFromJSON = (jsonString) => {
        try {
            const loadedData = JSON.parse(jsonString);
            
            // Get a clean version of params (exclude points and lines)
            const uiParams = {};
            
            // Copy ALL parameters except points and lines to ensure we don't miss any subshape parameters
            Object.keys(loadedData).forEach(key => {
                if (key !== 'points' && key !== 'lines') {
                    uiParams[key] = loadedData[key];
                }
            });
            
            console.log("UI params to update:", uiParams);
            
            // Update mergedParams with loaded data
            Object.keys(loadedData).forEach(key => {
                mergedParamsRef.current[key] = loadedData[key];
            });
            
            // Update local mergedParams
            mergedParams = mergedParamsRef.current;
            
            // Handle points and lines specially
            if (loadedData.points && Array.isArray(loadedData.points)) {
                points.length = 0; // Clear existing points
                loadedData.points.forEach(point => points.push({...point})); // Create fresh objects
                console.log(`Loaded ${points.length} points`);
            }
            
            if (loadedData.lines && Array.isArray(loadedData.lines)) {
                lineManager.clearAllLines();
                
                // Check if all loaded lines have selected property
                const allHaveSelectedProp = loadedData.lines.every(line => 'selected' in line);
                console.log(`All lines have selected property: ${allHaveSelectedProp}`);
                
                loadedData.lines.forEach(line => {
                    // Find the actual point objects in our points array
                    const startPoint = points.find(p => p.id === line.start.id);
                    const endPoint = points.find(p => p.id === line.end.id);
                    
                    if (startPoint && endPoint) {
                        // Explicitly set selected to true
                        lineManager.lines.push({
                            start: startPoint,
                            end: endPoint,
                            selected: true // Force lines to be selected
                        });
                    }
                });
                
                console.log(`Loaded ${lineManager.lines.length} lines`);
                console.log(`Selected lines after push: ${lineManager.getSelectedLines().length}`);
            }
            
            // Rebuild the skeleton with loaded data
            p.rebuildSkeleton();
            
            // Force selection of all lines in case the line manager has internal state
            if (lineManager && typeof lineManager.selectAllLines === 'function') {
                lineManager.selectAllLines();
                console.log(`Selected lines after selectAllLines: ${lineManager.getSelectedLines().length}`);
            } else {
                // If no selectAllLines method, manually set all to selected
                lineManager.lines.forEach(line => line.selected = true);
                console.log(`Manually set all lines to selected: ${lineManager.getSelectedLines().length}`);
            }
            
            // Update current state
            if (currentState?.updateMergedParams) {
                currentState.updateMergedParams(mergedParams);
            }
            
            // If we're in the Edit Skeleton state, make sure it knows about the new points and lines
            if (currentState?.name === "Edit Skeleton" && currentState.updatePointsAndLines) {
                currentState.updatePointsAndLines(points, lineManager);
            }
            
            // IMPORTANT: Dispatch event to update Tweakpane UI
            const tweakpaneUpdateEvent = new CustomEvent('tweakpane-update', {
                detail: uiParams
            });
            window.dispatchEvent(tweakpaneUpdateEvent);
            
            // Debug logging
            console.log("State after loading:", currentState?.name);
            console.log("Points loaded:", points.length);
            console.log("Lines loaded:", lineManager.lines.length);
            console.log("Selected lines:", lineManager.getSelectedLines().length);
            
            console.log("Shape language loaded successfully");
            return true;
        } catch (error) {
            console.error("Failed to load shape language:", error);
            return false;
        }
    };
};

export default defaultSketch;