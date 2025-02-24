class DisplayGrid {
    constructor(p, cols, rows) {
        this.p = p;
        this.cols = cols;
        this.rows = rows;
        this.cellWidth = p.width/cols;
        this.cellHeight = p.height/rows;
        this.grid = [];
        this.hoveredCell = null;

        this.initGrid();
    }

    // Initialize the grid with GenShape objects
    initGrid() {
        this.grid = [];
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.rows; j++) {
                let x = i * this.cellWidth;
                let y = j * this.cellHeight;

                this.grid[i][j] = {
                    x: x,
                    y: y,
                    w: this.cellWidth,
                    h: this.cellHeight,
                    shape: null,
                };
            }
        }
    }

    // Draw the grid and shapes
    draw() {
        const p = this.p;
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                let cell = this.grid[i][j];

                // Apply hover effect
                if (this.hoveredCell === cell) {
                    p.fill(200, 200, 255, 20); // Light blue hover
                } else {
                    p.noFill();
                }

                p.stroke(200);
                p.strokeWeight(0.1);
                p.rect(cell.x, cell.y, cell.w, cell.h);

                // Draw the shape assigned to this cell
                //cell.shape.draw();
            }
        }
    }

    // Detect if the mouse is hovering over a cell
    updateHover(mx, my) {
        this.hoveredCell = null;
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
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
}
export default DisplayGrid;