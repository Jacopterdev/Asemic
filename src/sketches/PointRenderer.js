class PointRenderer {
    constructor(p, missRadius, snapThreshold = 10, size = 16) {
        this.p = p; // Reference to the p5 instance
        this.snapThreshold = snapThreshold; // Hover distance threshold
        this.size = size; // Point size
        this.defaultColor = this.p.color(255, 150, 0); // Default fill color
        this.hoverColor = this.p.color(255, 200, 0); // Hover fill color
        this.missRadius = missRadius;
    }

    /**
     * Checks if the mouse is hovering over a given point.
     * @param {Object} point - The point object { x, y }.
     * @param {Number} mouseX - Mouse x-coordinate.
     * @param {Number} mouseY - Mouse y-coordinate.
     * @returns {Boolean} True if hovering, otherwise false.
     */
    isHovered(point, mouseX, mouseY) {
        const distance = this.p.dist(mouseX, mouseY, point.x, point.y);
        return distance <= this.snapThreshold;
    }

    setMissRadius(missRadius) {
        this.missRadius = missRadius;
    }

    /**
     * Draws a single point with the appropriate hover color.
     * @param {Object} point - The point object { x, y }.
     * @param {Boolean} isHovered - Whether the point is currently hovered.
     */
    draw(point, isHovered) {
        this.p.fill(255, 150, 0, 64);
        this.p.noStroke();
        this.p.ellipse(point.x, point.y, this.missRadius, this.missRadius);

        this.p.stroke(isHovered ? this.hoverColor : this.defaultColor);
        this.p.strokeWeight(1);
        //this.p.fill(isHovered ? this.hoverColor : this.defaultColor);
        this.p.noFill();
        this.p.ellipse(point.x, point.y, this.size, this.size); // Draw the point
    }
}

export default PointRenderer;