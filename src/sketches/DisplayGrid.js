import ShapeGenerator from "./ShapeGenerator/ShapeGenerator.js";
import ShapeGeneratorV2 from "./ShapeGenerator/ShapeGeneratorV2.js";
import shapeDictionary from "./ShapeDictionary.js";
import Effects from "./Effects.js";
import shapeSaver from "./ShapeSaver.js";

class DisplayGrid {
    constructor(p, cols, rows, xStart, yStart, gridSize, mergedParams) {
        this.p = p;
        this.cols = cols;
        this.rows = rows;
        this.gridSize = gridSize;
        this.xStart = xStart;
        this.yStart = yStart;

        this.cellWidth = gridSize/cols;
        this.cellHeight = gridSize/rows;
        this.grid = [];
        this.hoveredCell = null;

        this.scrollOffset = 0;

        this.mergedParams = mergedParams;
        this.scale = 1/rows;

        this.initGrid();

        // Initialize downloadButtons array
        this.downloadButtons = [];
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

                let shape = new ShapeGeneratorV2(this.p, this.mergedParams);

                // Get noise position for the letter from the ShapeDictionary
                const { x: noiseX, y: noiseY } = shapeDictionary.getValue(letter);

                // Set the noise position for the shape
                shape.setNoisePosition(noiseX, noiseY);

                shape.generate();
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
        const renderTop = Math.abs(this.scrollOffset) - this.cellHeight * 2;
        const renderBottom = Math.abs(this.scrollOffset) + p.height + this.cellHeight * 2;

        // Initialize downloadButtons array if it doesn't exist
        if (!this.downloadButtons) this.downloadButtons = [];
        
        // Draw grid cells
        for (let j = 0; j < this.grid.length; j++) {
            for (let i = 0; i < this.grid[j].length; i++) {
                const cell = this.grid[j][i];
                const cellYWithScroll = cell.y + this.scrollOffset;
                
                // Only draw cells that are visible
                if (cellYWithScroll + this.cellHeight < 0 || cellYWithScroll > p.height) {
                    continue;
                }
                
                // Draw cell borders and letter
                p.noFill();
                p.stroke(200);
                p.rect(cell.x, cellYWithScroll, this.cellWidth, this.cellHeight);
                
                // Draw letter in corner
                p.fill(0);
                p.noStroke();
                p.textSize(12);
                p.text(cell.letter, cell.x + 5, cellYWithScroll + 15);
            }
        }
        
        // Draw buttons for ALL cells, not just visible ones
        // This ensures that buttons exist for all cells even if not visible yet
        for (let j = 0; j < this.grid.length; j++) {
            if (!this.downloadButtons[j]) this.downloadButtons[j] = [];
            
            for (let i = 0; i < this.grid[j].length; i++) {
                const cell = this.grid[j][i];
                const cellYWithScroll = cell.y + this.scrollOffset;
                
                // Only draw buttons for visible cells to save rendering performance
                if (cellYWithScroll + this.cellHeight < 0 || cellYWithScroll > p.height) {
                    // Still create a button object for non-visible cells to maintain array structure
                    this.downloadButtons[j][i] = {
                        x: cell.x + (this.cellWidth - 80) / 2,
                        y: cell.y + this.cellHeight - 34,
                        width: 80,
                        height: 24,
                        isVisible: false
                    };
                    continue;
                }
                
                // Draw the download button
                this.drawDownloadButton(cell.x, cellYWithScroll, this.cellWidth, this.cellHeight, i, j);
            }
        }
    }

    // New method to draw download buttons
    drawDownloadButton(x, y, width, height, col, row) {
        const buttonWidth = 80;
        const buttonHeight = 24;
        const buttonX = x + (width - buttonWidth) / 2;
        const buttonY = y + height - buttonHeight - 10; // Position at bottom with 10px margin
        
        // Check if mouse is over this button
        const isHovered = this.p.mouseX > buttonX && this.p.mouseX < buttonX + buttonWidth &&
                         this.p.mouseY > buttonY && this.p.mouseY < buttonY + buttonHeight;
        
        // Store button position data for click detection
        if (!this.downloadButtons) this.downloadButtons = [];
        if (!this.downloadButtons[row]) this.downloadButtons[row] = [];
        
        this.downloadButtons[row][col] = {
            x: buttonX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight,
            isVisible: true  // Mark as visible
        };
        
        // Draw button
        this.p.noStroke();
        this.p.fill(isHovered ? '#4285F4' : '#5A9AF8');
        this.p.rect(buttonX, buttonY, buttonWidth, buttonHeight, 4);
        
        // Draw button text
        this.p.fill(255);
        this.p.textSize(12);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.text('Download', buttonX + buttonWidth/2, buttonY + buttonHeight/2);
    }

    drawShapes(xray = false){
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
                    p.scale(this.scale);

                    // Draw the shape relative to the translated origin (scaled to fit)
                    cell.shape.draw(xray);

                    p.pop(); // Restore the previous transformation state
                }
            }
        }
}
    updateMergedParams(mergedParams) {
        this.mergedParams = mergedParams;
        for (let j = 0; j < this.grid.length; j++) {
            for (let i = 0; i < this.grid[j].length; i++) {
                const cell = this.grid[j][i];
                cell.shape = new ShapeGeneratorV2(this.p, this.mergedParams);

                // Get noise position for the letter from the ShapeDictionary
                const { x: noiseX, y: noiseY } = shapeDictionary.getValue(cell.letter);

                // Set the noise position for the shape
                cell.shape.setNoisePosition(noiseX, noiseY);

                cell.shape.generate();
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
            this.addRows(ADD_ROW_COUNT);
        }

        // Purge rows above the visible area
        this.purgeOffscreenRows();

        // Reset download buttons array since positions will change
        this.downloadButtons = [];
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

                let shape = new ShapeGeneratorV2(this.p, this.mergedParams);
                // Get noise position for the letter from the ShapeDictionary
                const { x: noiseX, y: noiseY } = shapeDictionary.getValue(letter);

                // Set the noise position for the shape
                shape.setNoisePosition(noiseX, noiseY);

                shape.generate();

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

    // Add method to handle download of a specific cell
    handleMousePressed() {
        // Check if any download button was clicked
        if (this.downloadButtons) {
            for (let row = 0; row < this.downloadButtons.length; row++) {
                if (!this.downloadButtons[row]) continue;
                
                for (let col = 0; col < this.downloadButtons[row].length; col++) {
                    const button = this.downloadButtons[row][col];
                    if (!button || !button.isVisible) continue;  // Skip non-visible buttons
                    
                    if (
                        this.p.mouseX >= button.x && 
                        this.p.mouseX <= button.x + button.width &&
                        this.p.mouseY >= button.y && 
                        this.p.mouseY <= button.y + button.height
                    ) {
                        // Download the shape for this cell
                        if (!this.grid[row] || !this.grid[row][col]) return false;
            
                        const cell = this.grid[row][col];
                        const letter = cell.letter;
                        
                        // Initialize shapeSaver before using it
                        shapeSaver.init(this.p, this.mergedParams).download(letter);
                        return true; // Button was clicked
                    }
                }
            }
        }
        
        return false; // No button was clicked
    }

}
export default DisplayGrid;