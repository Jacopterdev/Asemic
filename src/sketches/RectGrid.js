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
    }

    // Initialize the grid with GenShape objects
    initGrid() {
        //console.log("totalWidth: ", this.gridSize);
        //console.log("canvas width: ", this.p.width);
        //console.log("cell width ", this.cellWidth);
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
    }

    // Dynamically set grid size and reinitialize
    setGridSize(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.cellWidth = this.p.width / cols; // Recalculate cell width
        this.cellHeight = this.p.height / rows; // Recalculate cell height
        this.initGrid(); // Reinitialize the grid
    }

    /**
     * Determines snap position based on mouse coordinates, respecting the snap threshold.
     * @param {number} mouseX - The x-coordinate of the mouse.
     * @param {number} mouseY - The y-coordinate of the mouse.
     * @returns {object|null} An object with the snapped x and y position, or null if no snapping occurs.
     */
    getSnapPosition(mouseX, mouseY) {
        // Calculate the column and row index for the mouse position
        const col = Math.floor(mouseX / this.cellWidth);
        const row = Math.floor(mouseY / this.cellHeight);

        // Ensure mouse is within bounds of the grid
        if (col >= 0 && col <= this.cols && row >= 0 && row <= this.rows) {
            // Calculate the closest corner coordinates
            const cornerX = col * this.cellWidth;
            const cornerY = row * this.cellHeight;

            // Check the distance between mouse position and the closest corner
            const distance = Math.sqrt(
                Math.pow(mouseX - cornerX, 2) + Math.pow(mouseY - cornerY, 2)
            );

            // Snap if within the threshold
            if (distance <= this.snapThreshold) {
                return { x: cornerX, y: cornerY };
            }
        }
        // If out of bounds or not within the threshold, return null
        return null;
    }



}
export default RectGrid;