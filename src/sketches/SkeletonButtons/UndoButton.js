import SkeletonButton from "./SkeletonButton.js";
import History from "../History.js";

class UndoButton extends SkeletonButton {
    constructor(p, x, y, onUndo) {
        super(p, x, y, onUndo);
        this.history = new History();
    }

    draw() {
        const size = this.size;
        const iconX = this.x;
        const iconY = this.y;

        // Draw the standard button background
        super.draw();

        // Draw undo icon in text-gray-600 color - but lighter
        this.p.stroke(120, 130, 140); // Lighter gray color
        this.p.strokeWeight(1.5); // Thinner stroke
        this.p.noFill();

        // Center coordinates for the icon
        const centerX = iconX + size / 2;
        const centerY = iconY + size / 2;
        
        // Size for the circular arc (counterclockwise arrow) - smaller size
        const iconSize = size * 0.4; // Smaller icon (was 0.6)
        const arrowRadius = iconSize / 2;
        
        // Draw the arc (about 270 degrees, counterclockwise)
        this.p.push();
        this.p.noFill();
        
        // Draw the circular arrow - note the start/end angles are in radians
        // We'll start from -PI/4 (upper right) and go almost full circle
        const startAngle = -this.p.PI/4;
        const endAngle = startAngle + this.p.PI * 1.75; // About 315 degrees
        
        this.p.arc(
            centerX, 
            centerY, 
            arrowRadius * 2, 
            arrowRadius * 2, 
            startAngle,
            endAngle
        );
        this.p.pop();

        // Add the arrowhead at the end of the arc but move it slightly down and right
        const arrowAngle = endAngle;
        
        // Calculate the base position at the end of the arc
        const baseX = centerX + Math.cos(arrowAngle) * arrowRadius;
        const baseY = centerY + Math.sin(arrowAngle) * arrowRadius;
        
        // Adjust the position to move the arrowhead slightly down and right
        const offsetY = 1; // Pixels to move down
        const offsetX = 2; // Pixels to move right
        
        // Calculate the final position with offsets
        const arrowTipX = baseX + offsetX;
        const arrowTipY = baseY + offsetY;
        
        // Fixed arrowhead dimensions for better proportions
        const arrowheadLength = 5;    // Length of the arrowhead
        const arrowheadWidth = 3;     // Width of the arrowhead (half-width)
        
        this.p.push();
        this.p.fill(120, 130, 140); // Matching the lighter gray color
        this.p.noStroke(); // No stroke for cleaner look
        
        // Position at the adjusted tip position
        this.p.translate(arrowTipX, arrowTipY);
        
        // Fix: Rotate to correctly align with the direction of the arc
        this.p.rotate(arrowAngle + this.p.PI/2);
        
        // Draw a better shaped arrowhead
        this.p.beginShape();
        this.p.vertex(0, 0);                          // Tip of the arrow
        this.p.vertex(-arrowheadLength, arrowheadWidth);   // Bottom right corner
        this.p.vertex(-arrowheadLength, -arrowheadWidth);  // Top right corner
        this.p.endShape(this.p.CLOSE);
        
        this.p.pop();
    }
    
    click() {
        if (this.onClick) {
            this.onClick();
        }
    }
}

export default UndoButton;