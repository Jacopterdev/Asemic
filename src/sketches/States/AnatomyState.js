import DisplayGrid from "../DisplayGrid.js";
import {SPACING as LAYOUT} from "./LayoutConstants.js";

class AnatomyState {
    constructor(p, points, lineManager, shapeGenerator, mergedParams) {
        this.p = p;
        this.name = "Anatomy";
        this.points = points;
        this.lineManager = lineManager;
        this.shapeGenerator = shapeGenerator;
        this.mergedParams = mergedParams;
        this.displayGrid = new DisplayGrid(p, 3,3, LAYOUT.MARGIN, LAYOUT.MARGIN, p.width - LAYOUT.MARGIN * 2, this.mergedParams);
        this.xray = false;
        this.resetXrayTimer = null; // To track the timeout for resetting xray

    }

    draw() {
        this.displayGrid.drawShapes();
        this.p.applyEffects();
        this.displayGrid.drawGrid();
        if (this.xray) this.displayGrid.drawShapes(true);
    }
    updateMergedParams(newMergedParams) {
        this.mergedParams = newMergedParams;
        const lines = this.lineManager.getSelectedLines();
        const mergedParams = {
            ...this.mergedParams,
            lines: lines,
            points: this.points,
        };
        this.mergedParams = mergedParams;
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

    mousePressed() {
        this.xray = true;
        // No mouse interaction in this state
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