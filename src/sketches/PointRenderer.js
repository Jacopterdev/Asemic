class PointRenderer {
    constructor(p, missRadius) {
        this.p = p;
        this.missRadius = missRadius || 10;
        
        // Colors for points
        this.normalColor = this.p.color(250, 140, 0); // Orange for normal points
        this.hoverColor = this.p.color(255, 255, 255); // White fill for hover
        this.hoverBorderColor = this.p.color(250, 140, 0); // Orange border for hover
        this.missAreaColor = this.p.color(250, 140, 0, 50); // Semi-transparent orange for miss area
        
        // Point sizes
        this.normalSize = 12; 
        this.hoverSize = 22;
        this.hoverBorderWeight = 2; // Border thickness for hovered points
    }

    /**
     * Checks if the mouse is hovering over a given point.
     * @param {Object} point - The point object { x, y }.
     * @param {Number} mouseX - Mouse x-coordinate.
     * @param {Number} mouseY - Mouse y-coordinate.
     * @returns {Boolean} True if hovering, otherwise false.
     */
    isHovered(point, mouseX, mouseY) {
        // Use a self-defined value for the hit area radius
        // This is larger than the visual size of the point
        const hitRadius = 18; // Adjust this value to make hit area bigger or smaller
        
        const isHovered = this.p.dist(point.x, point.y, mouseX, mouseY) < hitRadius;
        return isHovered;
    }

    setMissRadius(missRadius) {
        this.missRadius = missRadius;
    }

    /**
     * Draws a single point with the appropriate hover color and miss area.
     * @param {Object} point - The point object { x, y }.
     * @param {Boolean} isHovered - Whether the point is currently hovered.
     * @param {Boolean} isSelected - Whether the point is selected.
     */
    draw(point, isHovered, isSelected = false) {
        // First draw the miss area (hover detection area)
        this.p.noStroke();
        this.p.fill(this.missAreaColor);
        this.p.ellipse(point.x, point.y, this.missRadius * 2, this.missRadius * 2);
        
        // Then draw the point on top
        if (isSelected) {
            // Draw a blurred highlight effect for selected point
            this.p.drawingContext.shadowBlur = 10;
            this.p.drawingContext.shadowColor = this.p.color(250, 140, 0, 200);
            this.p.stroke(this.p.color(255, 160, 20));
            this.p.strokeWeight(3);
            this.p.fill(this.p.color(255, 200, 100));
            this.p.ellipse(point.x, point.y, this.hoverSize + 2, this.hoverSize + 2);
            this.p.drawingContext.shadowBlur = 0;
        } else if (isHovered) {
            this.p.stroke(this.hoverBorderColor);
            this.p.strokeWeight(this.hoverBorderWeight);
            this.p.fill(this.hoverColor);
            this.p.ellipse(point.x, point.y, this.hoverSize, this.hoverSize);
        } else {
            this.p.noStroke();
            this.p.fill(this.normalColor);
            this.p.ellipse(point.x, point.y, this.normalSize, this.normalSize);
        }
    }
}

export default PointRenderer;