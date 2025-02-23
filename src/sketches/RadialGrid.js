
import BaseGrid from "./BaseGrid";

class RadialGrid extends BaseGrid {
    constructor(p, xStart, yStart, radius, radialDivisions, angularDivisions) {
        super(p, xStart, yStart, radius * 2); // Use radius * 2 as the gridSize for a radial grid
        this.xStart = xStart;
        this.yStart = yStart;
        this.xCenter = xStart + radius;
        this.yCenter = yStart + radius;
        this.radius = radius;
        this.radialDivisions = radialDivisions; // Number of concentric circles
        this.angularDivisions = angularDivisions; // Number of angular segments
        this.initGrid();
    }

    // Initialize the radial grid (concentric circles & spokes)
    initGrid() {
        this.grid = {
            circles: [],
            spokes: [],
        };

        // Divide the radius into concentric circles
        for (let i = 1; i <= this.radialDivisions; i++) {
            this.grid.circles.push((this.radius / this.radialDivisions) * i);
        }

        // Divide the full circle into angular segments
        for (let i = 0; i < this.angularDivisions; i++) {
            this.grid.spokes.push((2 * Math.PI / this.angularDivisions) * i);
        }
    }

    // Draw the radial grid
    draw() {
        const p = this.p;
        p.noFill();
        p.stroke(this.strokeColor);
        p.strokeWeight(this.strokeWeight);

        // Draw concentric circles
        for (const r of this.grid.circles) {
            p.ellipse(this.xCenter, this.yCenter, r * 2, r * 2);
        }

        // Draw radial spokes
        for (const angle of this.grid.spokes) {
            const x = this.xCenter + Math.cos(angle) * this.radius;
            const y = this.yCenter + Math.sin(angle) * this.radius;
            p.line(this.xCenter, this.yCenter, x, y);
        }
    }

    // Snapping logic for the radial grid
    getSnapPosition(mouseX, mouseY) {
        const dx = mouseX - this.xCenter;
        const dy = mouseY - this.yCenter;

        const distance = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx);

        // Normalize angle to [0, 2π] for consistent comparison
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        // Snap to the center of the grid
        if (distance <= this.snapThreshold) {
            return {
                x: this.xCenter,
                y: this.yCenter,
            };
        }


        // Snap to the nearest circle
        let closestCircle = null;
        let minCircleDistance = Infinity;

        for (const r of this.grid.circles) {
            const d = Math.abs(distance - r);
            if (d < minCircleDistance && d <= this.snapThreshold) {
                closestCircle = r;
                minCircleDistance = d;
            }
        }

        // Snap to the nearest spoke
        let closestAngle = null;
        let minAngleDistance = Infinity;

        for (const a of this.grid.spokes) {
            const angleDistance = Math.abs(angle - a);

            // Ensure angular distance accounts for wrapping around 2π
            const wrappedDistance = Math.min(angleDistance, 2 * Math.PI - angleDistance);

            if (wrappedDistance < minAngleDistance && distance <= this.radius && wrappedDistance <= this.snapThreshold) {
                closestAngle = a;
                minAngleDistance = wrappedDistance;
            }
        }

        if (closestCircle !== null && closestAngle !== null) {
            return {
                x: this.xCenter + closestCircle * Math.cos(closestAngle),
                y: this.yCenter + closestCircle * Math.sin(closestAngle),
            };
        }

        return null; // Return null if no snapping occurs
    }
}

export default RadialGrid;