
import CompositionTool from "../CompositionTool/CompositionTool.js";

class CompositionState {
    constructor(p) {
        this.p = p;
        this.name = "Composition";
        this.compositionTool = new CompositionTool(p);
    }

    draw() {
        this.compositionTool.draw(this.p);
    }

    mousePressed() {
        // Handle composition-specific mouse interactions if needed
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
    }
}
export default CompositionState;