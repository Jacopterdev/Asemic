import DisplayGrid from "../DisplayGrid.js";
import {SPACING as LAYOUT} from "./LayoutConstants.js";
import shapeSaver from "../ShapeSaver.js";

class AnatomyState {
    constructor(p, points, lineManager, shapeGenerator, mergedParams) {
        this.p = p;
        this.name = "Anatomy";
        this.points = points;
        this.lineManager = lineManager;
        this.shapeGenerator = shapeGenerator;
        this.mergedParams = mergedParams;
        this.displayGrid = new DisplayGrid(p, 3,3, LAYOUT.MARGIN, LAYOUT.MARGIN, p.width - LAYOUT.MARGIN * 2, this.mergedParams);
        this.blurScale = 1;
        this.xray = false;
        this.resetXrayTimer = null; // To track the timeout for resetting xray

    }

    draw() {
        this.displayGrid.drawShapes();
        this.p.applyEffects(this.blurScale);
        this.displayGrid.drawGrid();
        if (this.xray) this.displayGrid.drawShapes(true);
    }
    updateMergedParams(newMergedParams) {
        this.mergedParams = newMergedParams;

        this.blurScale = this.displayGrid.scale;
        //this.displayGrid.updateMergedParams(this.mergedParams);

        this.displayGrid.updateMergedParams(this.mergedParams);

        // Clear any existing timer
        if (this.resetXrayTimer) {
            clearTimeout(this.resetXrayTimer);
        }

        // Set a timer to disable xray mode after 1 second
        this.resetXrayTimer = setTimeout(() => {
            this.xray = false;
        }, 1000);

    }

    // Update the mousePressed method to handle button clicks
    mousePressed() {
        // Delegate button handling to DisplayGrid
        this.displayGrid.handleMousePressed();
        
        // If no button was clicked, set xray mode
        //if (!buttonClicked) {
            this.xray = true;
        //}

    }

    mouseDragged() {
        this.xray = true;
        // No mouse drag interaction in this state
    }

    mouseReleased() {
        this.xray = false;
        this.p.animateSmoothAmount();
    }

    mouseWheel(event) {
        this.displayGrid.handleScroll(event.delta);
    }
}
export default AnatomyState;