import ShapeGenerator from "./ShapeGenerator/ShapeGenerator.js";
class DisplayGrid {
    constructor(p, cols, rows, xStart, yStart, gridSize, mergedParams) {
        this.p = p;
        this.cols = cols;
        this.rows = rows;
        this.gridSize = gridSize;
        this.xStart = xStart;
        this.yStart = yStart;
        this.gridSize = gridSize;
        this.cellWidth = gridSize/cols;
        this.cellHeight = gridSize/rows;
        this.grid = [];
        this.hoveredCell = null;

        this.scrollOffset = 0;

        this.mergedParams = mergedParams;

        this.initGrid();

    }

    // Initialize the grid and assign letters
    initGrid() {
        this.cellWidth = this.gridSize / this.cols;
        this.cellHeight = this.gridSize / this.rows;
        this.grid = [];
        let letterCode = 65; // Start with 'A' (ASCII code)

        for (let j = 0; j < this.rows; j++) {
            this.grid[j] = [];
            for (let i = 0; i < this.cols; i++) {
                let x = i * this.cellWidth + this.xStart;
                let y = j * this.cellHeight + this.yStart;

                // Assign letter to the cell and wrap after 'Z'
                const letter = String.fromCharCode(letterCode);
                letterCode = letterCode === 90 ? 65 : letterCode + 1; // Wrap from 'Z' to 'A'

                let shape = new ShapeGenerator(this.p);
                shape.generateCompositeForms();
                this.grid[j][i] = {
                    x: x,
                    y: y,
                    w: this.cellWidth,
                    h: this.cellHeight,
                    letter: letter, // Add the letter property
                    shape: shape,
                };
            }
        }
    }

    drawGrid() {
        const p = this.p;

        // Use absolute rendering bounds for visibility calculations
        const renderTop = this.yStart + this.scrollOffset - this.cellHeight * 2;
        const renderBottom = this.yStart + this.scrollOffset + p.height + this.cellHeight * 2;

        let renderedCellCount = 0;

        for (let j = 0; j < this.grid.length; j++) {
            for (let i = 0; i < this.grid[j].length; i++) {
                const cell = this.grid[j][i];

                const cellYWithScroll = cell.y + this.scrollOffset;

                // Check if the cell falls within the renderable area
                if (cellYWithScroll + cell.h < renderTop || cellYWithScroll > renderBottom) {
                    //continue; // Skip cells outside the visible area
                }




                // Draw cell
                if (this.hoveredCell === cell) {
                    p.fill(200, 200, 255, 20);
                } else {
                    p.noFill();
                }

                p.stroke(200);
                p.strokeWeight(1);
                p.rect(cell.x, cellYWithScroll, cell.w, cell.h);

                // Draw the letter inside the cell
                p.noStroke();
                p.fill(50);
                p.textFont("Roboto Mono");
                p.textSize(12);
                p.textAlign(p.RIGHT, p.BOTTOM);
                p.text(cell.letter, cell.x + cell.w - 6, cellYWithScroll + cell.h - 4);

                renderedCellCount++;
            }
        }

        //console.log(`Rendered ${renderedCellCount} cells.`); // Debug the count
    }

    drawShapes(){
        const p = this.p;
        for (let j = 0; j < this.grid.length; j++) {
            for (let i = 0; i < this.grid[j].length; i++) {
                const cell = this.grid[j][i];
                const cellYWithScroll = cell.y + this.scrollOffset;

                if (cell.shape !== null) {
                    p.push(); // Save current transformation state

                    // Translate to the top-left corner of the current cell
                    p.translate(cell.x, cellYWithScroll);

                    // Scale down the shape to fit within the cell dimensions
                    const scaleX = (p.w / cell.w) * 0.1;
                    const scaleY = (p.h / cell.h) * 0.1;
                    p.scale(0.4);

                    // Draw the shape relative to the translated origin (scaled to fit)
                    cell.shape.drawLines();
                    cell.shape.drawPolygons();

                    p.pop(); // Restore the previous transformation state
                }
            }
        }
}

    setGrid(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.initGrid();
    }
    // Detect if the mouse is hovering over a cell
    updateHover(mx, my) {
        this.hoveredCell = null;
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                let cell = this.grid[i][j];
                if (
                    mx > cell.x &&
                    mx < cell.x + cell.w &&
                    my > cell.y &&
                    my < cell.y + cell.h
                ) {
                    this.hoveredCell = cell;
                    return;
                }
            }
        }
    }

    // Handle clicks
    handleClick() {

    }

    handleScroll(md) {
        const SCROLL_THRESHOLD = 400; // Pixels near the viewport bottom
        const ADD_ROW_COUNT = 5; // Pre-add this many rows

        // Update scroll offset by the mouse delta
        this.scrollOffset -= md * 1; // Adjust speed of scroll scaling if needed

        // Prevent scrolling above the topmost position
        if (this.scrollOffset > 0) {
            this.scrollOffset = 0;
        }

        // Calculate the viewport's bottom edge relative to `scrollOffset`
        const viewportBottomEdge = Math.abs(this.scrollOffset) + this.p.height;

        // The bottom edge of the last row
        const lastRowBottomEdge = this.grid[this.grid.length - 1][0].y + this.cellHeight;

        // Check if we need to add rows
        if (viewportBottomEdge + SCROLL_THRESHOLD > lastRowBottomEdge) {
            console.log(`Adding new rows. Viewport bottom: ${viewportBottomEdge}, Last row bottom: ${lastRowBottomEdge}`);
            this.addRows(ADD_ROW_COUNT);
        }

        // Purge rows above the visible area
        this.purgeOffscreenRows();

    }

    // Add Rows dynamically
    addRows(numRows) {
        const newRows = [];
        let letterCode = this.getLastLetterCode(); // Get the next letter

        // Determine the y position for the first new row
        const startingY = this.grid.length > 0
            ? this.grid[this.grid.length - 1][0].y + this.cellHeight
            : this.yStart;

        for (let row = 0; row < numRows; row++) {
            const newRow = [];
            for (let col = 0; col < this.cols; col++) {
                const x = col * this.cellWidth + this.xStart;
                const y = startingY + row * this.cellHeight; // Align new rows correctly

                // Assign letters (wrap from 'Z' to 'A')
                const letter = String.fromCharCode(letterCode);
                letterCode = letterCode === 90 ? 65 : letterCode + 1;

                let shape = new ShapeGenerator(this.p);
                shape.generateCompositeForms();

                newRow.push({
                    x: x,
                    y: y,
                    w: this.cellWidth,
                    h: this.cellHeight,
                    letter: letter,
                    shape: shape,
                });
            }
            newRows.push(newRow);
        }

        // Append rows to the grid
        this.grid.push(...newRows);

        // Update row count dynamically
        this.rows += numRows;

        console.log(`Added ${numRows} rows. Total rows in grid: ${this.grid.length}`);
    }

    // Add this helper method to get the last letter's ASCII code
    getLastLetterCode() {
        for (let i = this.grid.length - 1; i >= 0; i--) {
            for (let j = this.grid[i].length - 1; j >= 0; j--) {
                if (this.grid[i][j].letter) {
                    return this.grid[i][j].letter.charCodeAt(0) + 1; // Get ASCII code for next letter
                }
            }
        }
        return 65; // Default to 'A' if the grid is empty
    }

    purgeOffscreenRows() {
        const removeThreshold = this.yStart + this.scrollOffset - this.cellHeight * 2;

        const originalLength = this.grid.length;
        this.grid = this.grid.filter((row) => {
            const isRowVisible = row[0].y >= removeThreshold;
            if (!isRowVisible) {
                console.log(`Purging row at y=${row[0].y}`);
            }
            return isRowVisible;
        });

        const purgedRowCount = originalLength - this.grid.length;

        if (purgedRowCount > 0) {
            console.log(`Purged ${purgedRowCount} rows.`);
        }
    }

}
export default DisplayGrid;