import SkeletonButton from "./SkeletonButton.js";

class ConnectToNearest extends SkeletonButton {
    constructor(p, x, y, onClick, toggleable) {
        super(p, x, y, onClick, toggleable);
    }

    draw() {
        // Base button rendering
        super.draw();

        // Define icon dimensions
        const margin = this.size * 0.2;
        const iconSize = this.size * 0.6;
        
        // Position icon in the center
        const iconX = this.x + (this.size - iconSize) / 2;
        const iconY = this.y + (this.size - iconSize) / 2;
        
        // Use lighter color
        this.p.stroke(75, 85, 99); // text-gray-600
        this.p.strokeWeight(1);
        this.p.fill(156, 163, 175, 100); // Semi-transparent fill
        
        // Draw center point
        const centerPointSize = iconSize * 0.15;
        const centerX = iconX + iconSize / 2;
        const centerY = iconY + iconSize / 2;
        
        // Draw a center point with a "connection radius" circle
        this.p.ellipse(centerX, centerY, centerPointSize, centerPointSize);
        
        // Draw dotted connection radius circle
        this.p.noFill();
        this.p.strokeWeight(0.8);
        const dashLength = 3;
        const radiusSize = iconSize * 0.4;
        const circumference = 2 * Math.PI * radiusSize;
        const steps = Math.floor(circumference / (dashLength * 2));
        
        for (let i = 0; i < steps; i++) {
            const angle1 = (i * 2 * Math.PI) / steps;
            const angle2 = ((i + 0.5) * 2 * Math.PI) / steps;
            const x1 = centerX + radiusSize * Math.cos(angle1);
            const y1 = centerY + radiusSize * Math.sin(angle1);
            const x2 = centerX + radiusSize * Math.cos(angle2);
            const y2 = centerY + radiusSize * Math.sin(angle2);
            this.p.line(x1, y1, x2, y2);
        }
        
        // Draw surrounding points and connections
        const pointPositions = [
            { x: iconX + iconSize * 0.2, y: iconY + iconSize * 0.3 },
            { x: iconX + iconSize * 0.8, y: iconY + iconSize * 0.2 },
            { x: iconX + iconSize * 0.85, y: iconY + iconSize * 0.7 },
            { x: iconX + iconSize * 0.25, y: iconY + iconSize * 0.8 }
        ];
        
        // Draw small points
        this.p.fill(75, 85, 99);
        pointPositions.forEach(point => {
            // Calculate distance from center
            const distance = Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2));
            
            // Only draw connections if within the radius
            if (distance <= radiusSize) {
                // Draw connection line
                this.p.stroke(75, 85, 99);
                this.p.line(centerX, centerY, point.x, point.y);
            }
            
            // Draw point
            this.p.ellipse(point.x, point.y, centerPointSize * 0.8, centerPointSize * 0.8);
        });
    }
}

export default ConnectToNearest;