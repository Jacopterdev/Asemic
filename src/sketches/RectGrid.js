import BaseGrid from "./BaseGrid.js";
class RectGrid extends BaseGrid{
    constructor(p, cols, rows, xStart, yStart, gridSize) {
        super(p, xStart, yStart, gridSize);

        this.cols = cols;
        this.rows = rows;
        this.cellWidth = gridSize/cols;
        this.cellHeight = gridSize/rows;
        this.grid = [];

        this.initGrid();

        // Knob positions (start near the top-left of the grid)
        this.colsKnob = { x: xStart + this.gridSize - 50, y: yStart, size: 30 };
        this.rowsKnob = { x: xStart + this.gridSize, y: yStart + 50, size: 30 };

        // Tracking dragging state
        this.draggingColsKnob = false;
        this.draggingRowsKnob = false;
        // To track the initial counts when dragging starts
        this.initialCols = this.cols;
        this.initialRows = this.rows;

    }

    // Initialize the grid with GenShape objects
    initGrid() {
        this.grid = [];
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.rows; j++) {
                let x = this.xStart + i * this.cellWidth;
                let y = this.yStart + j * this.cellHeight;

                this.grid[i][j] = {
                    x: x,
                    y: y,
                    w: this.cellWidth,
                    h: this.cellHeight,
                };
            }
        }
    }

    draw(){
        const p = this.p;
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                let cell = this.grid[i][j];
                p.noFill();
                p.stroke(this.strokeColor);
                p.strokeWeight(this.strokeWeight);
                p.rect(cell.x, cell.y, cell.w, cell.h);
            }
        }
        // Columns knob
        p.fill(255);
        p.strokeWeight(2);
        p.ellipse(this.colsKnob.x, this.colsKnob.y, this.colsKnob.size);

        // Rows knob
        p.ellipse(this.rowsKnob.x, this.rowsKnob.y, this.rowsKnob.size);

    }

    // Dynamically set grid size and reinitialize
    setGridSize(cols, rows) {
        this.cols = Math.max(1, Math.floor(cols)); // Ensure at least 1 column
        this.rows = Math.max(1, Math.floor(rows)); // Ensure at least 1 row

        this.cellWidth = this.gridSize / cols; // Recalculate cell width
        this.cellHeight = this.gridSize / rows; // Recalculate cell height
        this.initGrid(); // Reinitialize the grid
    }

    /**
     * Determines snap position based on mouse coordinates, respecting the snap threshold.
     * @param {number} mouseX - The x-coordinate of the mouse.
     * @param {number} mouseY - The y-coordinate of the mouse.
     * @returns {object|null} An object with the snapped x and y position, or null if no snapping occurs.
     */
    getSnapPosition(mouseX, mouseY) {
        // Ensure the mouse is within the bounds of the grid
        if (mouseX < this.xStart || mouseY < this.yStart ||
            mouseX > this.xStart + this.cols * this.cellWidth ||
            mouseY > this.yStart + this.rows * this.cellHeight) {
            return null; // Out of bounds
        }

        // Calculate the closest corner in the grid
        const col = Math.round((mouseX - this.xStart) / this.cellWidth); // Closest column index
        const row = Math.round((mouseY - this.yStart) / this.cellHeight); // Closest row index

        // Calculate the corner position
        const snapX = this.xStart + col * this.cellWidth;
        const snapY = this.yStart + row * this.cellHeight;

        // Calculate the distance between the mouse position and the snapped position
        const distance = Math.sqrt(Math.pow(mouseX - snapX, 2) + Math.pow(mouseY - snapY, 2));

        // Snap only if within the defined threshold
        if (distance <= this.snapThreshold) {
            return { x: snapX, y: snapY };
        }

        // Otherwise, return null (no snapping)
        return null;

    }

    // Handle mouse press events to check if knobs are clicked
    mousePressed(mouseX, mouseY) {
        const distToColsKnob = this.p.dist(mouseX, mouseY, this.colsKnob.x, this.colsKnob.y);
        const distToRowsKnob = this.p.dist(mouseX, mouseY, this.rowsKnob.x, this.rowsKnob.y);

        // Check if either knob is clicked
        if (distToColsKnob < this.colsKnob.size / 2) {
            this.draggingColsKnob = true;
            this.initialCols = this.cols; // Save the starting number of columns
        }
        if (distToRowsKnob < this.rowsKnob.size / 2) {
            this.draggingRowsKnob = true;
            this.initialRows = this.rows; // Save the starting number of rows
        }

    }
    // Handle mouse dragging
    mouseDragged(mouseX, mouseY) {
        const dragRange = 100; // Range in pixels for full change (-100 to 100 for max scaling)
        const maxCols = 12;
        const minCols = 2;
        const maxRows = 12;
        const minRows = 2;

        if (this.draggingColsKnob) {
            // Calculate relative horizontal drag distance
            const deltaX = mouseX - this.colsKnob.x;

            // Scale deltaX to a change in columns
            const change = Math.round(deltaX / dragRange * (maxCols - minCols));

            // Apply the change to the starting number of columns
            const newCols = this.initialCols + change;

            // Clamp the value
            const clampedCols = Math.min(maxCols, Math.max(minCols, newCols));

            // Update grid temporarily
            this.setGridSize(clampedCols, this.rows);
        }

        if (this.draggingRowsKnob) {
            // Calculate relative vertical drag distance
            const deltaY = mouseY - this.rowsKnob.y;

            // Scale deltaY to a change in rows
            const change = Math.round(deltaY / dragRange * (maxRows - minRows));

            // Apply the change to the starting number of rows
            const newRows = this.initialRows + change;

            // Clamp the value
            const clampedRows = Math.min(maxRows, Math.max(minRows, newRows));

            // Update grid temporarily
            this.setGridSize(this.cols, clampedRows);
        }
    }

// Handle mouse release events
    mouseReleased() {
        // Stop dragging and finalize the columns/rows
        this.draggingColsKnob = false;
        this.draggingRowsKnob = false;

        // Finalize the column and row count by setting them to the grid (already done in dragging)
        this.initialCols = this.cols;
        this.initialRows = this.rows;
    }


}
export default RectGrid;