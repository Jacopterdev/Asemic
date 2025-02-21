class PossibleLinesRenderer {
    constructor(p, lineColor = [250, 140, 0, 100]) {
        this.p = p; // Reference to the p5 instance
        this.lineColor = this.p.color(...lineColor); // Default line color with transparency
        this.strokeWeight = 0.2;
    }

    /**
     * Draws lines between all possible pairs of points.
     * @param {Array} points - Array of plain point objects { x, y }.
     */
    drawAllLines(points) {
        this.p.stroke(this.lineColor); // Set line color
        this.p.strokeWeight(this.strokeWeight); // Set line thickness

        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                // Connect points[i] to points[j]
                this.p.line(points[i].x, points[i].y, points[j].x, points[j].y);
            }
        }
    }
}

export default PossibleLinesRenderer;