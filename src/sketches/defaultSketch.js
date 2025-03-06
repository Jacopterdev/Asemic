import LineManager from "./LineManager.js";
import SkeletonState from "./States/SkeletonState.js";
import AnatomyState from "./States/AnatomyState.js";
import CompositionState from "./States/CompositionState.js";
import Effects from "./Effects.js";

const defaultSketch = (p, mergedParamsRef, toolConfigRef) => {
    let points = [];

    let lineManager;

    let shapeGenerator;
    let mergedParams;
    let toolConfig;

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

    /**
    p.mousePressed = () => {
        if (!mouseHandler) return;
        let knobDragged = gridContext.mousePressed(p.mouseX, p.mouseY);
        if (knobDragged) return;
        // Delegate mousePressed logic to MouseEventHandler
        mouseHandler.handleMousePressed();
    };

    p.mouseDragged = () => {
        if (!mouseHandler) return;
        let knobDragged = gridContext.mouseDragged(p.mouseX, p.mouseY);
        if (knobDragged) return;
        mouseHandler.handleMouseDragged();

    };

    p.mouseReleased = () => {
        if(toolConfigRef.current.state === "Anatomy"){
            if (!lineManager) return;
            const lines = lineManager.getSelectedLines(); // Get the selected lines
            mergedParams = mergedParamsRef.current; // Get the current mergedParams

            // Merge lines, points, and mergedParams into one object
            mergedParams = {
                ...mergedParams, // Keep existing parameters
                lines: lines, // Add lines array
                points: points // Add points array
            };


            shapeGenerator = new ShapeGenerator(p, mergedParams);
            // Automatically generate shapes when starting
            shapeGenerator.generateCompositeForms();

        }

        if (!mouseHandler) return;
        let knobDragged = gridContext.mouseReleased();
        if (knobDragged) return;
        mouseHandler.handleMouseReleased();
    };
        */

    p.draw = () => {
        /**Update variables*/
        mergedParams = mergedParamsRef.current;
        toolConfig = toolConfigRef.current;

        if (currentState?.updateMergedParams) {
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

    /**
    p.draw = () => {

        p.background(255); // Reset background each frame
        if(toolConfigRef.current.state === "Anatomy"){
            mouseHandler = null;
            //if(!shapeGenerator){return;}
            // Draw all generative elements
            //shapeGenerator.drawLines();
            //shapeGenerator.drawPolygons();

            displayGrid.drawShapes();

            //shapeGenerator.applyEffects();
            p.filter(p.BLUR, mergedParams.smoothAmount);

            p.filter(p.THRESHOLD, 0.5);

            displayGrid.drawGrid();



            return;
        } else if (toolConfigRef.current.state === "Composition"){
            compositionTool.draw(p);
            mouseHandler = null;
            return;

        } else if (toolConfigRef.current.state === "Edit Skeleton"){
            if (!mouseHandler) mouseHandler = new MouseEventHandler(p, gridContext, points, lineManager);
        }

        updateGridContext();

        const angle = 90;
        const smoothAmount = mergedParams.smoothAmount;

        missRadius = mergedParamsRef.current.missArea;
        pointRenderer.setMissRadius(missRadius);


        p.noStroke();
        p.fill(0); // Color: black
        //p.ellipse(x, p.height / 2, angle); // Draw a circle


        // Apply filter dynamically based on smoothAmount
        if (smoothAmount > 0) {
            p.filter(p.BLUR, smoothAmount); // Apply smoothAmount as blur
        }
        p.filter(p.THRESHOLD, 0.5);

        ephemeralLineAnimator.updateAndDraw(); // Update and

        gridContext.draw();

        // Draw lines between all points
        possibleLinesRenderer.drawLines(lineManager.getLines());

        points.forEach((point) => {
            const isHovered = pointRenderer.isHovered(point, p.mouseX, p.mouseY);
            pointRenderer.draw(point, isHovered);
        });
    };
     */

    /**
    p.keyPressed = (evt) => {


        if(!compositionTool) return;
        console.log(evt.key);
        compositionTool.keyPressed(evt.key);
    }

    p.keyReleased = (evt) => {
        if(!compositionTool) return;
        compositionTool.keyReleased(evt.key);
    }

    p.mouseWheel = (event) => {
        if(!displayGrid) return;
        displayGrid.handleScroll(event.delta); // Pass the scroll delta to the grid
    }
        */

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