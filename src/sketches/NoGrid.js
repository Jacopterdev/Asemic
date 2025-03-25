import BaseGrid from "./BaseGrid.js";

class NoGrid extends BaseGrid {
    constructor(p, xStart, yStart, gridSize) {
        super();
        this.p = p;
        this.xStart = xStart;
        this.yStart = yStart;
        this.gridSize = gridSize;
    }

    draw() {
        this.p.stroke(this.strokeColor);
        this.p.strokeWeight(this.strokeWeight);
        this.p.noFill();
        this.p.rect(this.xStart, this.yStart, this.gridSize, this.gridSize);
    }

    initGrid() {
        return;
    }

    getSnapPosition(mouseX, mouseY) {
        return null;
    }

    mousePressed(x,y) {return;}
    mouseReleased() {return;}
    mouseDragged(x,y) {return;}

    /**
     * Check if a line follows the grid lines - always return true for NoGrid
     * @returns {boolean} - Always true since there are no grid lines
     */
    isValidGridLine(point1, point2) {
        // For NoGrid, any line is valid
        return true;
    }

    /**
     * Get all grid intersection points - return empty array for NoGrid
     * @returns {Array} - Empty array since there are no grid intersections
     */
    getIntersections() {
        // For NoGrid, there are no intersections
        return [];
    }
}
export default NoGrid;