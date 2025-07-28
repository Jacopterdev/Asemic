import SkeletonButton from "./SkeletonButton.js";

class ConnectWithoutCrossingButton extends SkeletonButton {
    constructor(p, x, y, onClick, toggleable) {
        super(p, x, y, onClick, toggleable);
    }

    draw() {
               // Superclass draw method draws the button without the icon
               super.draw();

               // Define larger icon dimensions 
               const margin = this.size * 0.15; // Smaller margin for larger icon
               const iconSize = this.size * 0.7; // Increased from 0.5 to 0.7 (70% of button size)
               
               // Position icon in the center
               const iconX = this.x + (this.size - iconSize) / 2;
               const iconY = this.y + (this.size - iconSize) / 2;
               
               // Use darker grey color
               this.p.stroke(75, 85, 99); // text-gray-600
               this.p.strokeWeight(1); // Slightly thicker stroke
               this.p.fill(75, 85, 99, 120); // Darker semi-transparent fill
               
               // Draw four points with connecting lines in a diamond pattern
               const pointSize = iconSize * 0.12; // Slightly larger points
               
               // Define the four corner points of a diamond with a slightly larger size
               const points = [
                   { x: iconX + iconSize * 0.5, y: iconY + iconSize * 0.15 },           // Top
                   { x: iconX + iconSize * 0.85, y: iconY + iconSize * 0.5 },           // Right
                   { x: iconX + iconSize * 0.5, y: iconY + iconSize * 0.85 },           // Bottom
                   { x: iconX + iconSize * 0.15, y: iconY + iconSize * 0.5 }            // Left
               ];
               // Draw connecting lines forming outer diamond
               for (let i = 0; i < points.length; i++) {
                   const next = (i + 1) % points.length;
                   this.p.line(points[i].x, points[i].y, points[next].x, points[next].y);
               }
               
               // Draw crossing lines (X in the middle)
               this.p.line(points[0].x, points[0].y, points[2].x, points[2].y);

               
               // Draw all four points
               points.forEach(point => {
                   this.p.ellipse(point.x, point.y, pointSize, pointSize);
               });
    }
}

export default ConnectWithoutCrossingButton;