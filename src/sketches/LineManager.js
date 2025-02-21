class LineManager {
    constructor() {
        this.lines = []; // Array to store line objects
    }

    /**
     * Adds new lines involving a new point.
     * For every existing point, create a new line between it and the new point.
     * @param {Object} newPoint - The new point to add (e.g., { x, y }).
     * @param {Array} existingPoints - The current array of points.
     */
    addLinesForPoint(newPoint, existingPoints) {
        existingPoints.forEach((existingPoint) => {
            this.lines.push({
                start: existingPoint,
                end: newPoint,
                selected: true, // Default to selectd
            });
        });
    }

    /**
     * Removes all lines that involve a given point.
     * @param {Object} point - The point to remove (e.g., { x, y }).
     */
    removeLinesForPoint(point) {
        this.lines = this.lines.filter(
            (line) => line.start !== point && line.end !== point // Remove lines where the point is involved
        );
    }

    /**
     * Retrieves the current set of lines.
     * @returns {Array} The current array of line objects.
     */
    getLines() {
        return this.lines;
    }
}

export default LineManager;