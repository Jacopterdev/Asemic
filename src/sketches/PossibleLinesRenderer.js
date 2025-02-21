class PossibleLinesRenderer {
    constructor(p, lineColor = [250, 140, 0, 196], disabledLineColor = [220, 220, 220, 156]) {
        this.p = p; // Reference to the p5 instance
        this.lineColor = this.p.color(...lineColor); // Default line color with transparency
        this.disabledLineColor = this.p.color(...disabledLineColor);
        this.strokeWeight = 1;
    }

    /**
     * Draws the selected and remaining lines.
     * @param {Array} possibleLines - All possible lines from points.
     * @param {Array} selectedLines - Lines that are currently "active".
     */
    /**
     * Draws the lines, applying styles based on their selection state.
     * @param {Array} possibleLines - Array of all line objects with `selected` property.
     */
    drawLines(possibleLines) {
        possibleLines.forEach((line) => {
            this.p.stroke(line.selected ? this.lineColor : this.disabledLineColor);
            this.p.strokeWeight(this.strokeWeight);
            this.p.line(line.start.x, line.start.y, line.end.x, line.end.y);
        });
    }

}

export default PossibleLinesRenderer;