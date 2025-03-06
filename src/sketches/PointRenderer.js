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
        return this.p.dist(point.x, point.y, mouseX, mouseY) < this.missRadius;
    }

    setMissRadius(missRadius) {
        this.missRadius = missRadius;
    }

    /**
     * Draws a single point with the appropriate hover color and miss area.
     * @param {Object} point - The point object { x, y }.
     * @param {Boolean} isHovered - Whether the point is currently hovered.
     */
    draw(point, isHovered) {
        // First draw the miss area (hover detection area)
        this.p.noStroke();
        this.p.fill(this.missAreaColor);
        this.p.ellipse(point.x, point.y, this.missRadius * 2, this.missRadius * 2);
        
        // Then draw the point on top
        if (isHovered) {
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