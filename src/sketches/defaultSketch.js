import LineManager from "./LineManager.js";
import SkeletonState from "./States/SkeletonState.js";
import AnatomyState from "./States/AnatomyState.js";
import CompositionState from "./States/CompositionState.js";
import Effects from "./Effects.js";

const defaultSketch = (p, mergedParamsRef, toolConfigRef, lastUpdatedParamRef) => {
    let points = [];

    let lineManager;

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

        effects = new Effects(p);


        /** STATE MANAGEMENT */
        // Pre-create each state and store them
        states["Edit Skeleton"] = new SkeletonState(p, points, lineManager, mergedParams, toolConfig);
        states["Anatomy"] = new AnatomyState(p, points, lineManager, shapeGenerator, mergedParamsRef);
        states["Composition"] = new CompositionState(p);
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
            console.log("Updating merged params");
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
        }
        effects.setSmoothAmount(mergedParams.smoothAmount);
        currentState?.draw();
    };

    p.applyEffects = () => {
        effects.applyEffects();
    }
    p.animateSmoothAmount = () => {
        if(!effects) return;
        effects.animateSmoothAmount();
    }
    p.isConfigUpdated = () => {
        if (!lastUpdatedParam) return true;
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

};

export default defaultSketch;