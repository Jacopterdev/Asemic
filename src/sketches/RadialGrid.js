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

        // Knob positions - updated to be larger and positioned on the outer circle
        this.angularKnob = { 
            x: this.xCenter + this.radius * Math.cos(Math.PI/4), // Position at 45 degrees
            y: this.yCenter + this.radius * Math.sin(Math.PI/4), 
            size: 24 // Larger size
        };
        
        this.radialKnob = { 
            x: this.xCenter + this.radius * Math.cos(7*Math.PI/4), // Position at 315 degrees 
            y: this.yCenter + this.radius * Math.sin(7*Math.PI/4), 
            size: 24 // Larger size
        };

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
            const y = this.xCenter + Math.sin(angle) * this.radius;
            p.line(this.xCenter, this.yCenter, x, y);
        }

        // Draw outer circle with the same stroke color and weight as other lines
        p.stroke(this.strokeColor);
        p.strokeWeight(this.strokeWeight);
        p.ellipse(this.xCenter, this.yCenter, this.radius * 2, this.radius * 2);

        // Draw radial divisions knob
        this.drawKnob(this.radialKnob, this.draggingRadialKnob);
        
        // Draw angular divisions knob
        this.drawKnob(this.angularKnob, this.draggingAngularKnob);

        // Update cursor when hovering over knobs
        const distToRadialKnob = p.dist(p.mouseX, p.mouseY, this.radialKnob.x, this.radialKnob.y);
        const distToAngularKnob = p.dist(p.mouseX, p.mouseY, this.angularKnob.x, this.angularKnob.y);
        
        if (distToRadialKnob < this.radialKnob.size / 2 || distToAngularKnob < this.radialKnob.size / 2) {
            p.cursor(p.HAND);
        } else {
            p.cursor(p.ARROW);
        }

        this.knobLabel.draw();
    }

    // Helper method to draw improved round knobs with better hover/drag effects
    drawKnob(knob, isDragging) {
        const p = this.p;
        
        // Calculate angle from center to knob for proper line orientation
        const angle = Math.atan2(knob.y - this.yCenter, knob.x - this.xCenter);
        
        // Check if mouse is hovering over this knob
        const distToKnob = p.dist(p.mouseX, p.mouseY, knob.x, knob.y);
        const isHovered = distToKnob < knob.size / 2 * 1.2;
        
        // Determine visual state (normal, hover, active) - using darker grays
        let knobColor, knobSize;
        
        if (isDragging) {
            // Active state
            knobColor = 120; // Darker gray when dragging
            knobSize = knob.size * 1.1; // Slightly larger
        } else if (isHovered) {
            // Hover state
            knobColor = 140; // Medium gray when hovered (darker)
            knobSize = knob.size * 1.05; // Very slightly larger
        } else {
            // Normal state
            knobColor = 180; // Darker gray than before (was 220)
            knobSize = knob.size; // Normal size
        }
        
        // Draw knob with no stroke
        p.noStroke();
        p.fill(knobColor);
        p.ellipse(knob.x, knob.y, knobSize);
        
        p.stroke(255); // White lines
        p.strokeWeight(1.5);
        
        // If this is the radial knob (controlling circles), draw concentric circles
        if (knob === this.radialKnob) {
            p.push();
            p.translate(knob.x, knob.y);
            
            // Draw three concentric circles
            const circleSizes = [
                knobSize * 0.25,  // Small circle (innermost)
                knobSize * 0.45,  // Medium circle (middle)
                knobSize * 0.70   // Large circle (outermost)
            ];
            
            // Draw the three circles centered in the knob
            for (const size of circleSizes) {
                p.noFill();
                p.ellipse(0, 0, size, size);
            }
            
            p.pop();
        } 
        // If this is the angular knob (controlling spokes), draw angled lines
        else if (knob === this.angularKnob) {
            p.push();
            p.translate(knob.x, knob.y);
            p.rotate(angle); // Rotate to align with the radius
            
            // Draw three angled lines to represent spokes radiating from center
            const lineLength = knobSize * 0.6;
            const centerOffset = knobSize * 0.1; // Offset lines slightly from center
            
            // Central line - straight along the radius direction
            p.line(-lineLength/2, 0, lineLength/2, 0);
            
            // Two angled lines - at slight angles from the central line
            const angleOffset = 0.3; // Angle in radians (about 17 degrees)
            
            // Upper angled line
            p.line(-lineLength/2 + centerOffset, -centerOffset, 
                   lineLength/2, -lineLength/2 * Math.sin(angleOffset));
            
            // Lower angled line
            p.line(-lineLength/2 + centerOffset, centerOffset, 
                   lineLength/2, lineLength/2 * Math.sin(angleOffset));
            
            p.pop();
        }
        
        // Draw directional arrow indicators only when hovering or dragging
        if (isHovered || isDragging) {
            const arrowSize = knobSize * 0.5; // Keep the same size
            
            p.push();
            p.noStroke();
            p.fill(knobColor); // Use the same color as the knob itself
            
            if (knob === this.radialKnob || knob === this.angularKnob) {
                // Calculate tangent angle - perpendicular to the radius
                const tangentAngle = angle + Math.PI/2;
                
                // Position arrows with just a slight overlap (0.9 instead of 0.8)
                // This ensures they don't overlap with the white lines inside the knob
                const arrowDistance = knobSize * 0.9;
                
                // Clockwise arrow (pointing along the circle perimeter)
                p.push();
                p.translate(
                    knob.x + Math.cos(tangentAngle) * arrowDistance, // Positioned with slight overlap
                    knob.y + Math.sin(tangentAngle) * arrowDistance
                );
                p.rotate(tangentAngle - Math.PI/2); // Point along the circle path (clockwise)
                p.triangle(
                    0, 0,
                    -arrowSize/2, -arrowSize, // Point away from the triangle base
                    arrowSize/2, -arrowSize
                );
                p.pop();
                
                // Counter-clockwise arrow
                p.push();
                p.translate(
                    knob.x - Math.cos(tangentAngle) * arrowDistance, // Positioned with slight overlap
                    knob.y - Math.sin(tangentAngle) * arrowDistance
                );
                p.rotate(tangentAngle + Math.PI/2); // Point along the circle path (counter-clockwise)
                p.triangle(
                    0, 0,
                    -arrowSize/2, -arrowSize, // Point away from the triangle base
                    arrowSize/2, -arrowSize
                );
                p.pop();
            }
            
            p.pop();
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
                y: this.xCenter + closestCircle * Math.sin(closestAngle),
            };
        }

        return null; // Return null if no snapping occurs
    }

    // Update mousePressed to improve knob interaction
    mousePressed(mouseX, mouseY) {
        const distToRadialKnob = this.p.dist(mouseX, mouseY, this.radialKnob.x, this.radialKnob.y);
        const distToAngularKnob = this.p.dist(mouseX, mouseY, this.angularKnob.x, this.angularKnob.y);

        // Slightly larger hitboxes for better UX
        const hitboxMultiplier = 1.3;

        // Check if either knob is pressed
        if (distToRadialKnob < (this.radialKnob.size / 2) * hitboxMultiplier) {
            this.draggingRadialKnob = true;
            this.initialRadialDivisions = this.radialDivisions; // Save the starting radial divisions
            this.knobLabel.update(this.radialDivisions, this.radialKnob.x + 20, this.radialKnob.y); // Show initial value
            
            // Save drag starting point
            this.dragStartX = mouseX;
            this.dragStartY = mouseY;
        }
        if (distToAngularKnob < (this.angularKnob.size / 2) * hitboxMultiplier) {
            this.draggingAngularKnob = true;
            this.initialAngularDivisions = this.angularDivisions; // Save the starting angular divisions
            this.knobLabel.update(this.angularDivisions, this.angularKnob.x, this.angularKnob.y + 20); // Show initial value
            
            // Save drag starting point
            this.dragStartX = mouseX;
            this.dragStartY = mouseY;
        }
        return this.draggingAngularKnob || this.draggingRadialKnob;
    }

    // Update mouseDragged to implement direct slider-like mapping without moving back
    mouseDragged(mouseX, mouseY) {
        const minRadialDivisions = 2;
        const maxRadialDivisions = 12;
        const minAngularDivisions = 2;
        const maxAngularDivisions = 12;

        if (this.draggingRadialKnob) {
            // Calculate drag vector relative to center
            const dragVectorX = mouseX - this.xCenter;
            const dragVectorY = mouseY - this.yCenter;
            
            // Calculate new angle based on drag position
            let newAngle = Math.atan2(dragVectorY, dragVectorX);
            // Normalize to 0-2π range
            if (newAngle < 0) newAngle += 2 * Math.PI;
            
            // Determine which half of the circle we're in
            const isRightHalf = (newAngle < Math.PI/2 || newAngle > 3*Math.PI/2);
            
            // Map the angle to radial divisions
            // Use horizontal position (right half = more divisions, left half = fewer divisions)
            let mappedDivisions;
            if (isRightHalf) {
                // Right half: map from min to max
                const rightAngleRange = Math.PI; // From 3π/2 to π/2
                const normalizedAngle = (newAngle > 3*Math.PI/2) ?
                    (newAngle - 3*Math.PI/2) : (newAngle + Math.PI/2);
                mappedDivisions = minRadialDivisions + (normalizedAngle / rightAngleRange) * 
                    (maxRadialDivisions - minRadialDivisions);
            } else {
                // Left half: map from max to min
                const leftAngleRange = Math.PI; // From π/2 to 3π/2
                const normalizedAngle = newAngle - Math.PI/2;
                mappedDivisions = maxRadialDivisions - (normalizedAngle / leftAngleRange) * 
                    (maxRadialDivisions - minRadialDivisions);
            }
            
            // Round and clamp to allowed range
            const newRadialDivisions = Math.round(mappedDivisions);
            const clampedRadialDivisions = Math.min(maxRadialDivisions, 
                                           Math.max(minRadialDivisions, newRadialDivisions));
            
            // Update knob position to exact position on circle
            this.radialKnob.x = this.xCenter + this.radius * Math.cos(newAngle);
            this.radialKnob.y = this.xCenter + this.radius * Math.sin(newAngle);
            
            // Only update grid if the value changed
            if (this.radialDivisions !== clampedRadialDivisions) {
                this.radialDivisions = clampedRadialDivisions;
                this.initGrid();
            }

            // Update label position to follow the knob
            this.knobLabel.update(clampedRadialDivisions, this.radialKnob.x + 20, this.radialKnob.y);
        }

        if (this.draggingAngularKnob) {
            // Calculate drag vector relative to center
            const dragVectorX = mouseX - this.xCenter;
            const dragVectorY = mouseY - this.yCenter;
            
            // Calculate new angle based on drag position
            let newAngle = Math.atan2(dragVectorY, dragVectorX);
            // Normalize to 0-2π range
            if (newAngle < 0) newAngle += 2 * Math.PI;
            
            // Map the angle to angular divisions
            const mappedDivisions = minAngularDivisions + 
                (newAngle / (2 * Math.PI)) * (maxAngularDivisions - minAngularDivisions);
            
            // Round and clamp to allowed range
            const newAngularDivisions = Math.round(mappedDivisions);
            const clampedAngularDivisions = Math.min(maxAngularDivisions, 
                                           Math.max(minAngularDivisions, newAngularDivisions));
            
            // Update knob position to exact position on circle
            this.angularKnob.x = this.xCenter + this.radius * Math.cos(newAngle);
            this.angularKnob.y = this.xCenter + this.radius * Math.sin(newAngle);
            
            // Only update grid if the value changed
            if (this.angularDivisions !== clampedAngularDivisions) {
                this.angularDivisions = clampedAngularDivisions;
                this.initGrid();
            }

            // Update label position to follow the knob
            this.knobLabel.update(clampedAngularDivisions, this.angularKnob.x, this.angularKnob.y + 20);
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

/**
     * Check if a line follows the grid lines
     * @param {Object} point1 - First point {x, y}
     * @param {Object} point2 - Second point {x, y}
     * @returns {boolean} - True if the line follows a grid line
     */
isValidGridLine(point1, point2) {
    // For a radial grid, lines are valid if:
    // 1. They lie on the same radius (same angle from center)
    // 2. They lie on the same concentric circle

    // Calculate distances from center for both points
    const dist1 = Math.sqrt(Math.pow(point1.x - this.xCenter, 2) + Math.pow(point1.y - this.yCenter, 2));
    const dist2 = Math.sqrt(Math.pow(point2.x - this.xCenter, 2) + Math.pow(point2.y - this.yCenter, 2));
    
    // Calculate angles from center for both points
    const angle1 = Math.atan2(point1.y - this.yCenter, point1.x - this.xCenter);
    const angle2 = Math.atan2(point2.y - this.yCenter, point2.x - this.xCenter);
    
    // Find closest angle division
    const angleStep = 2 * Math.PI / this.angularDivisions;
    const roundedAngle1 = Math.round(angle1 / angleStep) * angleStep;
    const roundedAngle2 = Math.round(angle2 / angleStep) * angleStep;
    
    // Find closest radial division
    const radiusStep = this.radius / this.radialDivisions;
    const roundedDist1 = Math.round(dist1 / radiusStep) * radiusStep;
    const roundedDist2 = Math.round(dist2 / radiusStep) * radiusStep;
    
    // Line is valid if both points are on the same angle or same radius
    return Math.abs(roundedAngle1 - roundedAngle2) < 0.01 || Math.abs(roundedDist1 - roundedDist2) < 0.01;
}

/**
 * Get all grid intersection points
 * @returns {Array} - Array of points {x, y}
 */
getIntersections() {
    const intersections = [];
    
    // For each radius division
    for (let r = 1; r <= this.radialDivisions; r++) {
        const radius = (this.radius / this.radialDivisions) * r;
        
        // For each angular division
        for (let a = 0; a < this.angularDivisions; a++) {
            const angle = (2 * Math.PI / this.angularDivisions) * a;
            
            intersections.push({
                x: this.xCenter + Math.cos(angle) * radius,
                y: this.xCenter + Math.sin(angle) * radius
            });
        }
    }
    
    // Add the center point
    intersections.push({
        x: this.xCenter,
        y: this.yCenter
    });
    
    return intersections;
}


}

export default RadialGrid;