class LineManager {
    constructor() {
        this.lines = []; // Array to store line objects
    }

    /**
     * Add a single line between two points
     * @param {Object} point1 - First point
     * @param {Object} point2 - Second point
     * @param {Boolean} selected - Whether the line should be visible
     */
    addLine(point1, point2, selected = true) {
        // Check if the line already exists
        const exists = this.lines.some(line => 
            (line.start.id === point1.id && line.end.id === point2.id) || 
            (line.start.id === point2.id && line.end.id === point1.id)
        );
        
        if (!exists) {
            this.lines.push({
                start: point1,
                end: point2,
                selected: selected
            });
            return true;
        }
        return false;
    }

    /**
     * Remove a specific line
     * @param {Object} line - The line to remove
     */
    removeLine(line) {
        this.lines = this.lines.filter(l => 
            !(l.start.id === line.start.id && l.end.id === line.end.id) &&
            !(l.start.id === line.end.id && l.end.id === line.start.id)
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
     * Add lines from a point to all points in a list
     * @param {Object} sourcePoint - The source point
     * @param {Array} targetPoints - Array of target points
     * @param {Boolean} selected - Whether the lines should be visible
     */
    addLinesForPoint(sourcePoint, targetPoints, selected = true) {
        let addedAnyLine = false;
        
        targetPoints.forEach(targetPoint => {
            const added = this.addLine(sourcePoint, targetPoint, selected);
            addedAnyLine = addedAnyLine || added;
        });
        
        return addedAnyLine;
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

    /**
     * Clears all lines
     */
    clearAllLines() {
        this.lines = [];
    }
}

export default LineManager;