import SkeletonButton from "./SkeletonButton.js";

class ConnectToOneButton extends SkeletonButton {
    constructor(p, x, y, onClick, toggleable) {
        super(p, x, y, onClick, toggleable);
    }

    draw() {
        super.draw();

        // Define smaller icon dimensions
        const margin = this.size * 0.25;
        const iconSize = this.size * 0.5;
        
        // Position icon in the center
        const iconX = this.x + (this.size - iconSize) / 2;
        const iconY = this.y + (this.size - iconSize) / 2;
        
        // Use lighter color
        this.p.stroke(75, 85, 99); // text-gray-600
        this.p.strokeWeight(1);
        this.p.fill(156, 163, 175, 100); // Semi-transparent fill
        
        // Draw two points with a connecting line
        const pointSize = iconSize * 0.15;
        const point1X = iconX + iconSize * 0.2;
        const point1Y = iconY + iconSize * 0.2;
        const point2X = iconX + iconSize * 0.8;
        const point2Y = iconY + iconSize * 0.8;
        
        // Draw the line
        this.p.line(point1X, point1Y, point2X, point2Y);
        
        // Draw the points
        this.p.ellipse(point1X, point1Y, pointSize, pointSize);
        this.p.ellipse(point2X, point2Y, pointSize, pointSize);
    }
}

export default ConnectToOneButton;