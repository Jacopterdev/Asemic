import CompositionTool from "../CompositionTool/CompositionTool.js";

class CompositionState {
    constructor(p, mergedParams) {
        this.p = p;
        this.mergedParams = mergedParams;
        this.name = "Composition";
        this.compositionTool = new CompositionTool(p, this.mergedParams);
    }

    draw() {
        this.compositionTool.draw(this.p);
    }

    mousePressed() {
        // Forward mouse pressed events to CompositionTool
        this.compositionTool.handleMousePressed();
    }

    mouseDragged() {
        // Handle composition-specific mouse dragging if needed
    }

    mouseReleased() {

        // Handle composition-specific mouse releasing if needed
    }

    keyPressed(evt) {
        this.compositionTool.keyPressed(evt.key);
    }

    keyReleased(evt) {
        this.compositionTool.keyReleased(evt.key);
        this.p.animateSmoothAmount();
    }

    updateMergedParams(mergedParams) {
        this.mergedParams = mergedParams;
        this.compositionTool.updateMergedParams(mergedParams);
    }
}
export default CompositionState;