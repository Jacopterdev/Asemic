import MouseEventHandler from "../MouseEventHandler.js";
import RadialGrid from "../RadialGrid.js";
import RectGrid from "../RectGrid.js";
import NoGrid from "../NoGrid.js";
import PointRenderer from "../PointRenderer.js";
import PossibleLinesRenderer from "../PossibleLinesRenderer.js";

import EphemeralLineAnimator from "../EphemeralLineAnimator.js";
import GridContext from "../GridContext.js";
import {SPACING as LAYOUT, SPACING} from "./LayoutConstants.js";
class SkeletonState {
    constructor(p, points, lineManager, mergedParams, toolConfig) {
        this.p = p;
        this.name = "Edit Skeleton";
        this.mergedParams = mergedParams;
        this.toolConfig = toolConfig;
        this.currentGridType = "none"; // Track the current grid type
        this.possibleLinesRenderer = null;
        this.pointRenderer = null;
        this.gridContext = null;
        this.points = points;
        this.lineManager = lineManager;
        this.ephemeralLineAnimator = null;
        this.gridContext  = null;
        this.possibleLinesRenderer  = null;
        this.mouseHandler = null;
        this.init();
    }

    init(){

        // Initialize the gridContext based on the default `currentGridType` ("none")
        this.gridContext = new GridContext(RectGrid, this.p, SPACING.MARGIN, SPACING.MARGIN, this.p.width - SPACING.MARGIN * 2);

        this.pointRenderer = new PointRenderer(this.p, this.mergedParams.missRadius); // Initialize the PointRenderer

        this.possibleLinesRenderer = new PossibleLinesRenderer(this.p); // Initialize PossibleLinesRenderer

        //Animator
        this.ephemeralLineAnimator = new EphemeralLineAnimator(this.p, this.lineManager);

        this.ephemeralLineAnimator.start(); // Start the animation

        //Mouse events:
        this.mouseHandler = new MouseEventHandler(this.p, this.gridContext, this.points, this.lineManager);
    }

    draw(){
        this.updateGridContext();
        const missRadius = this.mergedParams.missArea;
        this.pointRenderer.setMissRadius(missRadius);

        this.p.noStroke();
        this.p.fill(0); // Color: black

        this.ephemeralLineAnimator.updateAndDraw(); // Update and

        this.gridContext.draw();

        // Draw lines between all points
        this.possibleLinesRenderer.drawLines(this.lineManager.getLines());

        this.points.forEach((point) => {
            const isHovered = this.pointRenderer.isHovered(point, this.p.mouseX, this.p.mouseY);
            this.pointRenderer.draw(point, isHovered);
        });

    }

    updateMergedParams(newMergedParams) {
        this.mergedParams = newMergedParams;
    }

    updateToolConfig(newToolConfig) {
        this.toolConfig = newToolConfig;
    }


    mousePressed() {
        if (!this.mouseHandler) return;
        const knobDragged = this.gridContext.mousePressed(this.p.mouseX, this.p.mouseY);
        if (knobDragged) return;
        this.mouseHandler.handleMousePressed();
    }

    mouseDragged() {
        if (!this.mouseHandler) return;
        const knobDragged = this.gridContext.mouseDragged(this.p.mouseX, this.p.mouseY);
        if (knobDragged) return;
        this.mouseHandler.handleMouseDragged();
    }

    mouseReleased() {
        if (!this.mouseHandler) return;
        const knobDragged = this.gridContext.mouseReleased();
        if (knobDragged) return;
        this.mouseHandler.handleMouseReleased();
        console.log("Points: ", this.points);
    }



    updateGridContext = () => {
        let xStart = LAYOUT.MARGIN;
        let yStart = LAYOUT.MARGIN;
        let gridSize = this.p.width - LAYOUT.MARGIN * 2;

        // Retrieve the latest grid type from toolConfigRef
        const toolConfig = this.toolConfig;
        const gridType = toolConfig?.grid || "none";
        // Only update the gridContext if the gridType has changed
        if (this.currentGridType !== gridType) {
            if (gridType === "radial") {
                this.gridContext.setGridType(RadialGrid,
                    this.p,
                    xStart,
                    yStart,
                    gridSize / 2,
                    5,
                    12
                ); // Adjust parameters
            } else if (gridType === "rect") {
                this.gridContext.setGridType(RectGrid, this.p, 3, 3, xStart, yStart, gridSize);
            } else if (gridType === "none") {
                this.gridContext.setGridType(NoGrid, this.p, xStart, yStart, gridSize);
            }
            this.currentGridType = gridType; // Update current grid type
        }
    };
}
export default SkeletonState;