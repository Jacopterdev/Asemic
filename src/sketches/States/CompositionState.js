import CompositionTool from "../CompositionTool/CompositionTool.js";
import GoToNextStateButton from "../SkeletonButtons/GoToNextStateButton.js";
import {SPACING as LAYOUT} from "./LayoutConstants.js";

class CompositionState {
    constructor(p, mergedParams) {
        this.p = p;
        this.mergedParams = mergedParams;
        this.name = "Composition";
        this.compositionTool = new CompositionTool(p, this.mergedParams);
        this.previousStateButton = new GoToNextStateButton(this.p,
            LAYOUT.PREVIOUS_STATE_BUTTON_X,
            LAYOUT.PREVIOUS_STATE_BUTTON_Y,
            () => {
                this.p.changeState("Anatomy");
            },
            true);
    }

    draw() {
        this.compositionTool.draw(this.p);
        this.previousStateButton.draw();
    }

    mousePressed() {
        // Forward mouse pressed events to CompositionTool
        this.compositionTool.handleMousePressed();
        if (this.previousStateButton.checkHover(this.p.mouseX, this.p.mouseY)){
            this.previousStateButton.click();
        }
    }

    mouseDragged() {
        this.compositionTool.handleMouseDragged();
        // Handle composition-specific mouse dragging if needed
    }

    mouseReleased() {
        this.compositionTool.handleMouseReleased();
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