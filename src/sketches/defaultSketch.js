import RectGrid from "./RectGrid.js";
import GridContext from "./GridContext.js";
import RadialGrid from "./RadialGrid.js";
import NoGrid from "./NoGrid.js";
import MouseEventHandler from "./MouseEventHandler.js";
import PointRenderer from "./PointRenderer.js";
import PossibleLinesRenderer from "./PossibleLinesRenderer.js";
import LineManager from "./LineManager.js";
import EphemeralLineAnimator from "./EphemeralLineAnimator.js";
import DisplayGrid from "./DisplayGrid.js";
import CompositionTool from "./CompositionTool/CompositionTool.js";
import ShapeGenerator from "./ShapeGenerator/ShapeGenerator.js";
import {defaultConfig, exampleConfig} from "./ShapeGenerator/Constants.js";

const defaultSketch = (p, mergedParamsRef, toolConfigRef) => {
    let x = 3;
    let points = [];
    let margin = 20;
    let gridContext;
    let mouseHandler;
    let pointRenderer;
    let possibleLinesRenderer;
    let lineManager;
    let ephemeralLineAnimator;
    let missRadius;
    let currentGridType = "none"; // Track the current grid type
    let displayGrid;
    let compositionTool;
    let shapeGenerator;
    let mergedParams;



    p.setup = () => {
        // Create the canvas (adjust dimensions as needed)
        p.createCanvas(800, 800);
        p.angleMode(p.DEGREES);
        p.angleMode(p.RADIANS);

        mergedParams = mergedParamsRef.current;

        let xStart = margin;
        let yStart = margin;
        let gridSize = p.width - margin * 2;

        // Initialize the gridContext based on the default `currentGridType` ("none")
        gridContext = new GridContext(NoGrid, p, xStart, yStart, gridSize);

        // Init lineManager
        lineManager = new LineManager();

        // Initialize the MouseEventHandler
        mouseHandler = new MouseEventHandler(p, gridContext, points, lineManager);

        missRadius = mergedParamsRef.current.missArea;
        pointRenderer = new PointRenderer(p, missRadius); // Initialize the PointRenderer

        possibleLinesRenderer = new PossibleLinesRenderer(p); // Initialize PossibleLinesRenderer

        //Animator
        ephemeralLineAnimator = new EphemeralLineAnimator(p, lineManager);

        ephemeralLineAnimator.start(); // Start the animation

        displayGrid = new DisplayGrid(p, 3,3, xStart, yStart, gridSize, mergedParams);

        compositionTool = new CompositionTool(p);

    };

    const updateGridContext = () => {
        let xStart = margin;
        let yStart = margin;
        let gridSize = p.width - margin * 2;

        // Retrieve the latest grid type from toolConfigRef
        const toolConfig = toolConfigRef.current;
        const gridType = toolConfig?.grid || "none";
        // Only update the gridContext if the gridType has changed
        if (currentGridType !== gridType) {
            if (gridType === "radial") {
                gridContext.setGridType(RadialGrid,
                    p,
                    xStart,
                    yStart,
                    gridSize / 2,
                    5,
                    12
                ); // Adjust parameters
            } else if (gridType === "rect") {
                gridContext.setGridType(RectGrid, p, 3, 3, xStart, yStart, gridSize);
            } else if (gridType === "none") {
                gridContext.setGridType(NoGrid, p, xStart, yStart, gridSize);
            }
            currentGridType = gridType; // Update current grid type
        }
    };


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
};

export default defaultSketch;