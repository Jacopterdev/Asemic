
import BaseGrid from "./BaseGrid";

class RadialGrid extends BaseGrid {
    constructor(p, xStart, yStart, radius, radialDivisions, angularDivisions) {
        super(p, xStart, yStart, radius * 2); // Use radius * 2 as the gridSize for a radial grid
        this.xStart = xStart + radius;
        this.yStart = yStart + radius;
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
            p.ellipse(this.xStart, this.yStart, r * 2, r * 2);
        }

        // Draw radial spokes
        for (const angle of this.grid.spokes) {
            const x = this.xStart + Math.cos(angle) * this.radius;
            const y = this.yStart + Math.sin(angle) * this.radius;
            p.line(this.xStart, this.yStart, x, y);
        }
    }

    // Snapping logic for the radial grid
    getSnapPosition(mouseX, mouseY) {
        const dx = mouseX - this.xStart;
        const dy = mouseY - this.yStart;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Snap to the nearest circle
        let closestCircle = null;
        let minDistance = Infinity;

        for (const r of this.grid.circles) {
            const d = Math.abs(distance - r);
            if (d < minDistance && d <= this.snapThreshold) {
                closestCircle = r;
                minDistance = d;
            }
        }

        // Snap to the nearest spoke
        let closestAngle = null;
        minDistance = Infinity;

        for (const a of this.grid.spokes) {
            const d = Math.abs(angle - a);
            if (d < minDistance && distance <= this.radius && d <= this.snapThreshold) {
                closestAngle = a;
                minDistance = d;
            }
        }

        if (closestCircle !== null && closestAngle !== null) {
            return {
                x: this.xStart + closestCircle * Math.cos(closestAngle),
                y: this.yStart + closestCircle * Math.sin(closestAngle),
            };
        }

        return null; // Return null if no snapping occurs
    }
}

export default RadialGrid;