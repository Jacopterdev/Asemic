class GridContext {
    constructor(gridType, ...args) {
        this.setGridType(gridType, ...args);
    }

    // Dynamically update the strategy (grid type) at runtime
    setGridType(gridType, ...args) {
        this.grid = new gridType(...args); // Instantiate the grid with provided arguments
    }

    // Proxy methods to the current strategy (grid type)
    initGrid() {
        this.grid.initGrid();
    }

    draw() {
        this.grid.draw();
    }

    getSnapPosition(mouseX, mouseY) {
        return this.grid.getSnapPosition(mouseX, mouseY);
    }

    mousePressed(x,y) {
        return this.grid.mousePressed(x,y);
    }
    mouseReleased() {
        return this.grid.mouseReleased();
    }
    mouseDragged(x,y) {
        return this.grid.mouseDragged(x,y);
    }
}

export default GridContext;