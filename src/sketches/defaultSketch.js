import RectGrid from "./RectGrid.js";
import GridContext from "./GridContext.js";
import RadialGrid from "./RadialGrid.js";
import NoGrid from "./NoGrid.js";
import MouseEventHandler from "./MouseEventHandler.js";
import PointRenderer from "./PointRenderer.js";
import PossibleLinesRenderer from "./PossibleLinesRenderer.js";
import LineManager from "./LineManager.js";
import EphemeralLineAnimator from "./EphemeralLineAnimator.js";

const defaultSketch = (p, mergedParamsRef) => {
    let x = 3;
    //console.log("Params:", mergedParamsRef.current);
    let points = [];
    let margin = 20;
    let gridContext;
    let mouseHandler;
    let pointRenderer;
    let possibleLinesRenderer;
    let lineManager;
    let ephemeralLineAnimator;
    let missRadius;

    p.setup = () => {
        // Create the canvas (adjust dimensions as needed)
        p.createCanvas(800, 800);
        p.angleMode(p.DEGREES);

        let xStart = margin;
        let yStart = margin;
        let gridSize = p.width - (margin * 2);

        const gridType = "rect";
        // Dynamically set the grid type in GridContext
        if (gridType === "radial") {
            gridContext = new GridContext(RadialGrid, p, xStart, yStart, gridSize / 2, 5, 12); // Adjust parameters
        } else if (gridType === "rect") {
            gridContext = new GridContext(RectGrid, p, 3, 3, xStart, yStart, gridSize);
        } else if (gridType === "none") {
            gridContext = new GridContext(NoGrid, p, xStart, yStart, gridSize);
        }
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


    };

    p.mousePressed = () => {
        if (!mouseHandler) return;
        // Delegate mousePressed logic to MouseEventHandler
        mouseHandler.handleMousePressed();
        gridContext.mousePressed(p.mouseX, p.mouseY);
    };

    p.mouseDragged = () => {
        if (!mouseHandler) return;
        mouseHandler.handleMouseDragged();
        gridContext.mouseDragged(p.mouseX, p.mouseY);
    };

    p.mouseReleased = () => {
        if (!mouseHandler) return;
        mouseHandler.handleMouseReleased();
        gridContext.mouseReleased();
    };





    p.draw = () => {
        const mergedParams = mergedParamsRef.current;
        const angle = mergedParams[1].angle;
        const smoothAmount = mergedParams.smoothAmount;
        missRadius = mergedParamsRef.current.missArea;
        pointRenderer.setMissRadius(missRadius);

        p.background(255); // Reset background each frame
        p.noStroke();
        p.fill(0); // Color: black
        p.ellipse(x, p.height / 2, angle); // Draw a circle


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
};

export default defaultSketch;