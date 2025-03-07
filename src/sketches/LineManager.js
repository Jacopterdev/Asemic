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
            if (newPoint.x === existingPoint.x && newPoint.y === existingPoint.y) {
                return; // Do not add this line
            }

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
     * Remove all lines connected to a specific point
     * @param {Object} point - The point whose lines should be removed
     */
    removePointLines(point) {
        // Filter out any lines connected to the point
        this.lines = this.lines.filter(line => 
            line.start.id !== point.id && line.end.id !== point.id
        );
    }

    /**
     * Gets all lines connected to a specific point
     * @param {Object} point - The point to check connections for
     * @returns {Array} Array of lines connected to the point
     */
    getLinesConnectedToPoint(point) {
        return this.lines.filter(line => 
            line.start.id === point.id || line.end.id === point.id
        );
    }

    /**
     * Retrieves the current set of lines.
     * @returns {Array} The current array of line objects.
     */
    getLines() {
        return this.lines;
    }

    /**
     * Retrieves a list of selected lines without their 'selected' property.
     * @returns {Array} A list of selected lines without the 'selected' property.
     */
    getSelectedLines() {
        return this.lines
            .filter(line => line.selected) // Only selected lines
            .map(({ start, end }) => ({ start, end })); // Remove 'selected' property
    }

    clearAllLines() {
        this.lines = [];
    }

}

export default LineManager;