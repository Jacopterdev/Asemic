import SkeletonButton from "./SkeletonButton.js";

class EraserToolButton extends SkeletonButton{
    constructor(p, x, y, onEraser, toggleable) {
        super(p, x, y, onEraser, toggleable);
    }

    draw() {
        //super.draw draws the button without icon
        // Superclass draw method draws the button without the icon
        super.draw();

// Define margin and rect dimensions
        const margin = 10;
        const rectX = this.x + margin; // Starting x-position
        const rectY = this.y + margin; // Starting y-position
        const rectWidth = this.size - 2 * margin; // Rectangle width
        const rectHeight = this.size - 2 * margin; // Rectangle height
        const skewOffset = rectHeight * 0.3; // Skew offset to distort the rectangle

// Draw a skewed rectangle
        this.p.stroke(75, 85, 99); // text-gray-600
        this.p.quad(
            rectX, rectY,                           // Top-left corner
            rectX + rectWidth, rectY + skewOffset,  // Top-right corner (skewed down)
            rectX + rectWidth, rectY + rectHeight,  // Bottom-right corner
            rectX, rectY + rectHeight - skewOffset  // Bottom-left corner (skewed up)
        );
    }
} export default EraserToolButton;