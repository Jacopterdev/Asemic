import LineManager from "./LineManager.js";
import SkeletonState from "./States/SkeletonState.js";
import AnatomyState from "./States/AnatomyState.js";
import CompositionState from "./States/CompositionState.js";
import Effects from "./Effects.js";
import shapeDictionary from "./ShapeDictionary.js";
import {SPACING as LAYOUT} from "./States/LayoutConstants.js";
import LZString from 'lz-string'; // Add this import for compression
import History from "./History.js";

const defaultSketch = (p, mergedParamsRef, toolConfigRef, lastUpdatedParamRef) => {
    let points = [];

    let lineManager;
    let shapeScale;
    let shapeOffset;

    let shapeGenerator;
    let mergedParams;
    let toolConfig;
    let lastUpdatedParam;
    let previousLastUpdatedParam;
    let previousPoints;
    let previousLines;

    let effects;

    // Instances of various states
    let states = {};
    let currentState;

    // Create history instance
    let history;
    
    // Flag to prevent recording history during undo/redo operations
    let isUndoRedoOperation = false;

    p.setup = () => {
        // Create the canvas (adjust dimensions as needed)
        p.createCanvas(LAYOUT.CANVAS_WIDTH, LAYOUT.CANVAS_HEIGHT);
        p.angleMode(p.DEGREES);
        p.angleMode(p.RADIANS);
        p.noiseSeed(1);

        mergedParams = mergedParamsRef.current;
        toolConfig = toolConfigRef.current;
        lastUpdatedParam = lastUpdatedParamRef.current;
        previousLastUpdatedParam = null;
        previousPoints = null;
        previousLines = null;

        //gridSize = p.width - margin * 2;

        lineManager = new LineManager();
        
        shapeScale = 1;
        shapeOffset = { x: 0, y: 0 };

        effects = new Effects(p);
        

        /** STATE MANAGEMENT */
        // Pre-create each state and store them
        states["Edit Skeleton"] = new SkeletonState(p, points, lineManager, mergedParams, toolConfig);
        states["Anatomy"] = new AnatomyState(p, points, mergedParams);
        states["Composition"] = new CompositionState(p, mergedParams);
        currentState = "Edit Skeleton"
        updateState("Edit Skeleton"); // Set the initial state

        // Initialize history
        history = new History();
        
        // Check for shape data in URL on startup
        setTimeout(() => {
            p.checkURLForShapeLanguage();
            recordCurrentState("initial");
        }, 500); // Short delay to ensure all components are initialized
    };

    const updateState = (stateName) => {
        if (currentState?.name === stateName) return; // Avoid unnecessary updates
        currentState = states[stateName]; // Switch to the existing state instance
    };

    // Add function to record current state
    const recordCurrentState = (changedParam = null) => {
        if (isUndoRedoOperation) return; // Don't record during undo/redo

        const state = {
            points: JSON.parse(JSON.stringify(points)),
            lines: getSerializableLines(),
            params: JSON.parse(JSON.stringify(mergedParamsRef.current))
        };
        
        // Only push if it's different from the last state
        if (history.isDifferentFromLastState(state)) {
            history.pushState(state, changedParam);
        }
    };
    
    // Helper function to get serializable lines
    const getSerializableLines = () => {
        if (!lineManager || !lineManager.lines) {
            console.warn("lineManager or lineManager.lines is undefined");
            return []; // Return empty array if lineManager is not available
        }
        return lineManager.lines.map(line => ({
            startId: line.start.id,
            endId: line.end.id,
            selected: line.selected
        }));
    };
    
    // Add function to restore state
    const restoreState = (state) => {
        if (!state) return false;
        
        isUndoRedoOperation = true;
        
        try {
            // Restore points
            points.length = 0;
            state.points.forEach(point => points.push({ ...point }));
            
            // Restore lines
            if (lineManager) {
                lineManager.clearAllLines();
                state.lines.forEach(line => {
                    const startPoint = points.find(p => p.id === line.startId);
                    const endPoint = points.find(p => p.id === line.endId);
                    if (startPoint && endPoint) {
                        lineManager.lines.push({
                            start: startPoint,
                            end: endPoint,
                            selected: line.selected || true
                        });
                    }
                });
            }
            
            // Restore parameters
            // First clear all existing parameters that are numeric (subshapes)
            const currentNumericKeys = Object.keys(mergedParamsRef.current).filter(key => !isNaN(parseInt(key)));
            currentNumericKeys.forEach(key => {
                delete mergedParamsRef.current[key];
            });

            // Restore parameters
            Object.keys(state.params).forEach(key => {
                mergedParamsRef.current[key] = state.params[key];
            });

            // Update local mergedParams
            mergedParams = mergedParamsRef.current;
            
            // Update Tweakpane UI with explicit information about subshapes
            const uiParams = {};

            // First copy all parameters except points and lines
            Object.keys(state.params).forEach(key => {
                if (key !== 'points' && key !== 'lines') {
                    uiParams[key] = state.params[key];
                }
            });

            // Set a special flag to ensure complete UI refresh 
            uiParams.updateSubshapes = true;
            
 

            // Dispatch the event with clean parameters
            const tweakpaneUpdateEvent = new CustomEvent('tweakpane-update', {
                detail: uiParams
            });
            window.dispatchEvent(tweakpaneUpdateEvent);
            
            // Rebuild the skeleton with restored data
            p.rebuildSkeleton();
            
            // Update current state
            if (currentState?.updateMergedParams) {
                currentState.updateMergedParams(mergedParams);
            }
            
            // If we're in the Edit Skeleton state, update its points and lines
            if (currentState?.name === "Edit Skeleton" && currentState.updatePointsAndLines) {
                currentState.updatePointsAndLines(points, lineManager);
            }
            
            isUndoRedoOperation = false;
            return true;
        } catch (error) {
            console.error("Error restoring state:", error);
            isUndoRedoOperation = false;
            return false;
        }
    };

    p.draw = () => {
        /**Update variables*/
        mergedParams = mergedParamsRef.current;
        toolConfig = toolConfigRef.current;
        lastUpdatedParam = lastUpdatedParamRef.current;

        let configUpdated = p.isConfigUpdated() || p.isSkeletonUpdated();

        // Record state when parameters are updated
        if (currentState?.updateMergedParams && configUpdated && !isUndoRedoOperation) {
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
                if (!isUndoRedoOperation) {
                    recordCurrentState("stateChange");
                }
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
        //shapeScale = p.calculateOuterScale(points, LAYOUT.GRID_SIZE+LAYOUT.MARGIN, LAYOUT.GRID_SIZE+LAYOUT.MARGIN);
        const { scale: returnedshapeScale, centerOffset: returnedshapeOffset } = p.analyzeSkeletonScale(
            points,
            LAYOUT.MARGIN, // x-coordinate of the canvas
            LAYOUT.MARGIN, // y-coordinate of the canvas
            LAYOUT.GRID_SIZE, // width of the canvas
            LAYOUT.GRID_SIZE  // height of the canvas
        );
        shapeScale = returnedshapeScale;
        shapeOffset = returnedshapeOffset;

        // Make sure to update the React ref
        mergedParamsRef.current = mergedParams;
    }
    p.getShapeScale = () => shapeScale;
    p.getShapeOffset = () => shapeOffset;

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
    p.isSkeletonUpdated = () => {
        let skeletonUpdated =
            previousPoints &&
            previousLines &&
            (
                JSON.stringify(points) !== JSON.stringify(previousPoints) ||
                JSON.stringify(lineManager.getLines()) !== JSON.stringify(previousLines)
            );

        previousPoints = points ? JSON.parse(JSON.stringify(points)) : null;
        previousLines = lineManager.getLines() ? JSON.parse(JSON.stringify(lineManager.getLines())) : null;

        return skeletonUpdated;
    };


    p.mousePressed = () => currentState?.mousePressed();
    p.mouseDragged = () => currentState?.mouseDragged();
    p.mouseReleased = () => {
        const result = currentState?.mouseReleased();
        
        // Record state after mouse release (likely a point was added, moved, or removed)
        if (!isUndoRedoOperation) {
            if (lineManager) {
                recordCurrentState("mouseAction");
            }
        }
        
        return result;
    };
    p.keyPressed = (evt) => {
        // Handle Undo - Cmd+Z (Mac) or Ctrl+Z (Windows)
        if ((evt.key === 'z' || evt.key === 'Z') && (evt.ctrlKey || evt.metaKey)) {
            

            if (history?.canUndo()) {
                
                const state = history.undo();
                if (restoreState(state)) {
                    
                    return false; // Prevent default behavior
                }
            }
            return false; // Even if we can't undo, prevent default browser behavior
        }
        
        // Forward key event to current state
        return currentState?.keyPressed?.(evt);
    };
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
     }*/

    /**
     * Analyzes a point cloud to calculate its scale and center offset relative to a canvas.
     *
     * @param {Array<{x: number, y: number}>} points - The list of points with absolute `x` and `y` coordinates.
     * @param {number} canvasX - The x-coordinate of the canvas's top-left corner.
     * @param {number} canvasY - The y-coordinate of the canvas's top-left corner.
     * @param {number} canvasWidth - The width of the canvas.
     * @param {number} canvasHeight - The height of the canvas.
     * @returns {{ scale: number, centerOffset: { x: number, y: number } }} - The calculated scale factor and the center offset.
     */
    p.analyzeSkeletonScale = (points, canvasX, canvasY, canvasWidth, canvasHeight) => {
        if (!points || points.length < 3) {
            return {
                scale: 1, // Default scale if no points are provided.
                centerOffset: { x: 0, y: 0 } // Default offset since there's no point cloud.
            };
        }

        // Step 1: Find the bounding box of the points (in absolute coordinates).
        // Step 1: Find the bounding box of the points (in absolute coordinates).
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        points.forEach(point => {
            const adjustedX = point.x + canvasX; // Points are already relative to canvas's top-left corner.
            const adjustedY = point.y + canvasY;

            if (adjustedX < minX) minX = adjustedX; // Leftmost point
            if (adjustedX > maxX) maxX = adjustedX; // Rightmost point
            if (adjustedY < minY) minY = adjustedY; // Topmost point
            if (adjustedY > maxY) maxY = adjustedY; // Bottommost point
        });

        // Step 2: Compute the bounding box dimensions.
        const horizontalDelta = maxX - minX; // Width of the bounding box
        const verticalDelta = maxY - minY;   // Height of the bounding box

        // Step 3: Calculate the scale factor.
        const horizontalScale = horizontalDelta / canvasWidth;
        const verticalScale = verticalDelta / canvasHeight;
        const scale = horizontalScale > verticalScale ? 1 / horizontalScale : 1 / verticalScale;

        // Step 4: Calculate the bounding box center.
        const boundingBoxCenter = {
            x: minX + horizontalDelta / 2,
            y: minY + verticalDelta / 2
        };

        // Step 5: Calculate the center of the canvas.
        const canvasCenter = {
            x: canvasX + canvasWidth / 2,
            y: canvasY + canvasHeight / 2
        };

        // Step 6: Calculate the center offset.
        const centerOffset = {
            x: boundingBoxCenter.x - canvasCenter.x,
            y: boundingBoxCenter.y - canvasCenter.y
        };

        // Return both the scale and the center offset.
        return { scale, centerOffset };
    };

    p.findScale = (localScale, localX, localY, localSize) => {
        // Retrieve the shapeScale and shapeOffset
        const shapeScale = p.getShapeScale(); // Scale based on outermost points
        const shapeOffset = p.getShapeOffset(); // Offset from center
        const spacedShapeScale = shapeScale * LAYOUT.SHAPE_SCALE;
        // Compute the total scale relative to the cell size
        const totalScale = localScale * spacedShapeScale;
        // Apply translation and scaling transformation
        //p.translate(centerX - offsetX + (shapeOffset.x * totalScale), centerY - offsetY + (shapeOffset.y * totalScale));
        const newX = localX - (1-LAYOUT.SHAPE_SCALE)*((shapeScale)-(1/LAYOUT.SHAPE_SCALE))*(localSize/2) + (localSize*(1-LAYOUT.SHAPE_SCALE)/2) - (totalScale*shapeOffset.x);
        const newY = localY - (1-LAYOUT.SHAPE_SCALE)*((shapeScale)-(1/LAYOUT.SHAPE_SCALE))*(localSize/2) + (localSize*(1-LAYOUT.SHAPE_SCALE)/2) - (totalScale*shapeOffset.y);

        return {totalScale, newX, newY};
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
                
            }
            
            if (loadedData.lines && Array.isArray(loadedData.lines)) {
                lineManager.clearAllLines();
                
               
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
                

            }
            
            // Rebuild the skeleton with loaded data
            p.rebuildSkeleton();
            
            // Force selection of all lines in case the line manager has internal state
            if (lineManager && typeof lineManager.selectAllLines === 'function') {
                lineManager.selectAllLines();
            } else {
                // If no selectAllLines method, manually set all to selected
                lineManager.lines.forEach(line => line.selected = true);
                
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

            return true;
        } catch (error) {
            console.error("Failed to load shape language:", error);
            return false;
        }
    };

    // Add these methods to handle URL-based saving and loading

    // Method to save current state to URL
    p.saveShapeLanguageToURL = () => {
        try {
            // Get the current shape language JSON
            const shapeData = p.getShapeLanguageAsJSON();
            
            // Convert to JSON string
            const jsonString = JSON.stringify(shapeData);
            
            // Compress the data using LZString (which we've now imported)
            const compressedData = LZString.compressToEncodedURIComponent(jsonString);
            
            // Create new URL with the compressed data
            const url = new URL(window.location.href);
            url.searchParams.set('shape', compressedData);
            
            // Update browser history without reloading
            window.history.pushState({}, '', url);
            
            // Copy URL to clipboard
            navigator.clipboard.writeText(url.toString()).then(() => {
                console.log("URL copied to clipboard");
                alert("Shareable URL copied to clipboard!");
            }).catch(err => {
                console.error("Failed to copy URL:", err);
            });
            
            return url.toString();
        } catch (error) {
            console.error("Error creating shape URL:", error);
            alert("Failed to create shareable URL - data may be too large");
            return null;
        }
    };

    // Method to check URL and load shape language if present
    p.checkURLForShapeLanguage = () => {
        try {
            const url = new URL(window.location.href);
            const shapeParam = url.searchParams.get('shape');
            
            if (shapeParam) {
                // Decompress the data using LZString
                const jsonString = LZString.decompressFromEncodedURIComponent(shapeParam);
                const shapeData = JSON.parse(jsonString);
                
                // Load the shape language data
                p.loadShapeLanguageFromJSON(JSON.stringify(shapeData));
                
                return true;
            }
        } catch (error) {
            console.error("Failed to load shape language from URL:", error);
        }
        
        return false;
    };

    p.changeState = (newState) => {
        window.dispatchEvent(new CustomEvent('toolConfig', { detail: newState }));
    }
};

export default defaultSketch;