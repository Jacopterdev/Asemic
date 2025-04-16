import SkeletonButton from "./SkeletonButton.js";

class EraserToolButton extends SkeletonButton{
    constructor(p, x, y, onEraser, toggleable) {
        super(p, x, y, onEraser, toggleable);
    }

    draw() {
        super.draw();

        const margin = 10;
        const rectX = this.x + margin;
        const rectY = this.y + margin;
        const rectWidth = this.size - 2 * margin;
        const rectHeight = this.size - 2 * margin;
        const skewOffset = rectWidth * 0.3; // Changed to rectWidth for horizontal skew

        // Draw horizontally skewed rectangle
        this.p.stroke(75, 85, 99);
        this.p.quad(
            rectX + skewOffset, rectY,                // Top-left corner (skewed right)
            rectX + rectWidth, rectY,                 // Top-right corner
            rectX + rectWidth - skewOffset, rectY + rectHeight, // Bottom-right corner (skewed left)
            rectX, rectY + rectHeight                 // Bottom-left corner
        );

        // Add line across the middle
        this.p.line(
            rectX+2, rectY + 1 + rectHeight/2,             // Start of line
            rectX-2 + rectWidth, rectY + 1 + rectHeight/2  // End of line
        );
    }
} export default EraserToolButton;