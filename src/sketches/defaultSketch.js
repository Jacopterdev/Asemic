import RectGrid from "./RectGrid.js";
import GridContext from "./GridContext.js";
import RadialGrid from "./RadialGrid.js";
import MouseEventHandler from "./MouseEventHandler.js";
import PointRenderer from "./PointRenderer.js";
import PossibleLinesRenderer from "./PossibleLinesRenderer.js";

const defaultSketch = (p, mergedParamsRef) => {
    let x = 3;
    //console.log("Params:", mergedParamsRef.current);
    let points = [];
    let margin = 20;
    let gridContext;
    let mouseHandler;
    let pointRenderer;
    let possibleLinesRenderer;



    p.setup = () => {
        // Create the canvas (adjust dimensions as needed)
        p.createCanvas(900, 900);
        p.angleMode(p.DEGREES);

        let xStart = margin;
        let yStart = margin;
        let gridSize = p.width - (margin * 2);

        const gridType = "radial";
        // Dynamically set the grid type in GridContext
        if (gridType === "radial") {
            gridContext = new GridContext(RadialGrid, p, xStart, yStart, gridSize / 2, 5, 12); // Adjust parameters
        } else if (gridType === "rect") {
            gridContext = new GridContext(RectGrid, p, 3, 3, xStart, yStart, gridSize);
        }

        // Initialize the MouseEventHandler
        mouseHandler = new MouseEventHandler(p, gridContext, points);
        pointRenderer = new PointRenderer(p); // Initialize the PointRenderer
        possibleLinesRenderer = new PossibleLinesRenderer(p); // Initialize PossibleLinesRenderer


    };

    p.mousePressed = () => {
        if (!mouseHandler) return;
        // Delegate mousePressed logic to MouseEventHandler
        mouseHandler.handleMousePressed();
    };

    p.mouseDragged = () => {
        if (!mouseHandler) return;
        mouseHandler.handleMouseDragged();
    };

    p.mouseReleased = () => {
        if (!mouseHandler) return;
        mouseHandler.handleMouseReleased();
    };



    p.draw = () => {
        const mergedParams = mergedParamsRef.current;
        const angle = mergedParams[1].angle;
        const smoothAmount = mergedParams.smoothAmount;

        p.background(255); // Reset background each frame
        p.noStroke();
        p.fill(0); // Color: black
        p.ellipse(x, p.height / 2, angle); // Draw a circle


        // Apply filter dynamically based on smoothAmount
        if (smoothAmount > 0) {
            //p.filter(p.BLUR, smoothAmount); // Apply smoothAmount as blur
        }
        //p.filter(p.THRESHOLD, 0.5);


        gridContext.draw();

        // Draw lines between all points
        possibleLinesRenderer.drawAllLines(points);

        points.forEach((point) => {
            const isHovered = pointRenderer.isHovered(point, p.mouseX, p.mouseY);
            pointRenderer.draw(point, isHovered);
        });


    };
};

export default defaultSketch;