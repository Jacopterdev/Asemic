class GridContext {
    constructor(gridType, ...args) {
        this.gridInstances = new Map(); // Store grid instances by their constructor name
        this.setGridType(gridType, ...args);
    }

    // Dynamically update the strategy (grid type) at runtime
    // Dynamically update the strategy (grid type) at runtime
    setGridType(gridType, ...args) {
        // Check if we already have an instance of this grid type
        if (!this.gridInstances.has(gridType)) {
            // If not, create a new instance and store it
            this.gridInstances.set(gridType, new gridType(...args));
        } else {
            // If we have an existing instance, we can update it if needed
            const existingGrid = this.gridInstances.get(gridType);

            // Optionally, update the existing grid with new parameters
            // This depends on how your grid classes are structured
            // If your grid classes have an update method, you could call it here
            // Call the updateParams method if it exists
            if (typeof existingGrid.updateParams === 'function') {
                //existingGrid.updateParams(...args);
            }
        }

        // Set the current grid to the existing or newly created instance
        this.grid = this.gridInstances.get(gridType);
    }



    // Get the current grid instance
    getGrid() {
        return this.grid;
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

    // Add proxy methods for the new grid functionality
    isValidGridLine(point1, point2) {
        return this.grid.isValidGridLine(point1, point2);
    }
}

export default GridContext;