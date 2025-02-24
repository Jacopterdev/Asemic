
import BaseGrid from "./BaseGrid";
import KnobLabel from "./KnobLabel";

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

        // Knob positions
        this.angularKnob = { x: this.xStart + this.radius * 2, y: this.yCenter, size: 15 };
        this.radialKnob = { x: this.xCenter, y: this.yStart, size: 15 };

        // Dragging state
        this.draggingRadialKnob = false;
        this.draggingAngularKnob = false;

        // Initial states for dragging adjustments
        this.initialRadialDivisions = this.radialDivisions;
        this.initialAngularDivisions = this.angularDivisions;

        this.knobLabel = new KnobLabel(p); // Create an instance of KnobLabel
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

        // Draw radial divisions knob
        p.fill(255);
        p.strokeWeight(2);
        p.ellipse(this.radialKnob.x, this.radialKnob.y, this.radialKnob.size);

        // Draw angular divisions knob
        p.ellipse(this.angularKnob.x, this.angularKnob.y, this.angularKnob.size);

        this.knobLabel.draw();
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

    // Handle mouse press events
    mousePressed(mouseX, mouseY) {
        const distToRadialKnob = this.p.dist(mouseX, mouseY, this.radialKnob.x, this.radialKnob.y);
        const distToAngularKnob = this.p.dist(mouseX, mouseY, this.angularKnob.x, this.angularKnob.y);

        // Check if either knob is pressed
        if (distToRadialKnob < this.radialKnob.size / 2) {
            this.draggingRadialKnob = true;
            this.initialRadialDivisions = this.radialDivisions; // Save the starting radial divisions
        }
        if (distToAngularKnob < this.angularKnob.size / 2) {
            this.draggingAngularKnob = true;
            this.initialAngularDivisions = this.angularDivisions; // Save the starting angular divisions
        }
        return this.draggingAngularKnob || this.draggingRadialKnob;
    }

    // Handle mouse dragging
    mouseDragged(mouseX, mouseY) {
        const dragRange = 100; // Range in pixels for full incremental change
        const minRadialDivisions = 2;
        const maxRadialDivisions = 12;
        const minAngularDivisions = 2;
        const maxAngularDivisions = 12;

        if (this.draggingRadialKnob) {
            // Horizontal drag controls radial divisions
            const deltaX = mouseX - this.radialKnob.x;

            // Scale deltaX to change in radial divisions
            const change = Math.round(deltaX / dragRange * (maxRadialDivisions - minRadialDivisions));
            const newRadialDivisions = this.initialRadialDivisions + change;

            // Clamp to allowed range
            const clampedRadialDivisions = Math.min(maxRadialDivisions, Math.max(minRadialDivisions, newRadialDivisions));

            // Update the grid
            this.radialDivisions = clampedRadialDivisions;
            this.initGrid();

            // Update label for radial divisions
            this.knobLabel.update(clampedRadialDivisions, this.radialKnob.x + 20, this.radialKnob.y);

        }

        if (this.draggingAngularKnob) {
            // Vertical drag controls angular divisions
            const deltaY = mouseY - this.angularKnob.y;

            // Scale deltaY to change in angular divisions
            const change = Math.round(deltaY / dragRange * (maxAngularDivisions - minAngularDivisions));
            const newAngularDivisions = this.initialAngularDivisions - change; // Dragging up decreases divisions

            // Clamp to allowed range
            const clampedAngularDivisions = Math.min(maxAngularDivisions, Math.max(minAngularDivisions, newAngularDivisions));

            // Update the grid
            this.angularDivisions = clampedAngularDivisions;
            this.initGrid();

            // Update label for angular divisions
            this.knobLabel.update(clampedAngularDivisions, this.angularKnob.x , this.angularKnob.y+ 20);

        }
        return this.draggingAngularKnob || this.draggingRadialKnob;
    }

    // Handle mouse release events
    mouseReleased() {
        const wasDraggingKnob = this.draggingRadialKnob || this.draggingAngularKnob;
        this.draggingRadialKnob = false;
        this.draggingAngularKnob = false;

        // Finalize state
        this.initialRadialDivisions = this.radialDivisions;
        this.initialAngularDivisions = this.angularDivisions;

        // Hide the label when dragging stops
        this.knobLabel.hide();

        return wasDraggingKnob;
    }

}

export default RadialGrid;