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
    }

    draw() {
        this.displayGrid.drawShapes();
        this.p.applyEffects();
        this.displayGrid.drawGrid();
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
    }

    mousePressed() {
        // No mouse interaction in this state
    }

    mouseDragged() {
        // No mouse drag interaction in this state
    }

    mouseReleased() {
        this.displayGrid.updateMergedParams(this.mergedParams);
        this.p.animateSmoothAmount();
    }

    mouseWheel(event) {
        this.displayGrid.handleScroll(event.delta);
    }
}
export default AnatomyState;