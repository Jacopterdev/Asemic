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
        return;
    }

    initGrid() {
        return;
    }

    getSnapPosition(mouseX, mouseY) {
        return null;
    }
}
export default NoGrid;