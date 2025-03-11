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
            if (currentState?.updateMergedParams) currentState.updateMergedParams(mergedParams);
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
    }
    p.getShapeScale = () => shapeScale;

    p.applyEffects = (blurScale) => {
        effects.applyEffects(blurScale);
    }
    p.animateSmoothAmount = () => {
        if(!effects) return;
        effects.animateSmoothAmount();
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

};

export default defaultSketch;