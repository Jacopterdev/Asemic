import ShapeGenerator from "./ShapeGenerator/ShapeGenerator.js";
import ShapeGeneratorV2 from "./ShapeGenerator/ShapeGeneratorV2.js";
import shapeDictionary from "./ShapeDictionary.js";
import shapeSaver from "./ShapeSaver.js";
import DownloadButton from "./DownloadButton.js";
import {SPACING as LAYOUT} from "./States/LayoutConstants.js";

class DisplayGrid {
    constructor(p, cols, rows, xStart, yStart, gridSize, mergedParams, buffer=null) {
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
        this.scale = this.cellWidth / p.width;

        this.suffix = 0;

        this.initGrid();

        // Initialize downloadButtons array
        this.downloadButtons = [];
        
        // Create initial buttons for all cells
        if(!buffer) this.createDownloadButtons();

        this.hoveredCellRow = -1;
        this.hoveredCellCol = -1;

        this.buffer = buffer;
    }

    // Initialize the grid and assign letters
    initGrid() {
        this.cellWidth = this.gridSize / this.cols;
        this.cellHeight = this.cellWidth;
        this.grid = [];
        let letterCode = 65; // Start with 'A' (ASCII code)

        for (let j = 0; j < this.rows; j++) {
            this.grid[j] = [];
            for (let i = 0; i < this.cols; i++) {
                let x = i * this.cellWidth + this.xStart;
                let y = j * this.cellHeight + this.yStart;

                // Assign letter to the cell and wrap after 'Z'
                let letter;
                // If suffix is 0 (initial state), use only letters A-Z
                if (this.suffix === 0) {
                    letter = String.fromCharCode(letterCode);
                } else {
                    // Once we exceed Z, append the number suffix (e.g., A1, B1, etc.)
                    letter = String.fromCharCode(letterCode) + this.suffix;
                }
                //letterCode = letterCode === 90 ? 65 : letterCode + 1; // Wrap from 'Z' to 'A'
                const wrap = letterCode === 90;
                if(wrap){
                    letterCode = 65;
                    this.suffix++;
                } else {
                    letterCode++;
                }

                let shape = new ShapeGeneratorV2(this.p, this.mergedParams);
                if(this.buffer){shape = new ShapeGeneratorV2(this.buffer, this.mergedParams);}

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

    // New method to create buttons for all grid cells
    createDownloadButtons() {
        this.downloadButtons = [];
        
        for (let j = 0; j < this.grid.length; j++) {
            this.downloadButtons[j] = [];
            for (let i = 0; i < this.grid[j].length; i++) {
                const cell = this.grid[j][i];
                const pos = DownloadButton.positionInCell(cell);
                
                this.downloadButtons[j][i] = new DownloadButton(
                    this.p, 
                    pos.x, 
                    pos.y, 
                    cell.letter,
                    true
                );
            }
        }
    }

    drawGrid() {
        let p = this.p;
        if (this.buffer) {
            p = this.buffer;
        }

        // First check which cell is being hovered
        this.updateHoveredCell();

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
                p.fill(64);
                p.noStroke();
                p.textSize(12);
                p.text(cell.letter, cell.x + LAYOUT.PADDING, cellYWithScroll + LAYOUT.PADDING + 10);
            }
        }

        //Only draw download buttons if its not a buffer.
        if(this.buffer) return;
        
        // Draw buttons for visible cells
        for (let j = 0; j < this.grid.length; j++) {
            if (!this.downloadButtons[j]) this.downloadButtons[j] = [];
            
            for (let i = 0; i < this.grid[j].length; i++) {
                const cell = this.grid[j][i];
                const cellYWithScroll = cell.y + this.scrollOffset;
                
                // Check if cell is visible
                const isVisible = !(cellYWithScroll + this.cellHeight < 0 || cellYWithScroll > this.p.height);
                
                // Create button if it doesn't exist
                if (!this.downloadButtons[j][i]) {
                    const pos = DownloadButton.positionInCell(cell);
                    this.downloadButtons[j][i] = new DownloadButton(
                        this.p, 
                        pos.x, 
                        pos.y, 
                        cell.letter,
                        true
                    );
                }
                
                // Update button position with scroll and visibility
                const pos = DownloadButton.positionInCell(cell, this.scrollOffset);
                
                const button = this.downloadButtons[j][i];
                button.update(pos.x, pos.y);
                button.isVisible = ((j === this.hoveredCellRow && i === this.hoveredCellCol && isVisible));
                
                // Draw the button if visible
                if (button.isVisible) {
                    button.draw();
                }
            }
        }
    }

    drawShapes(xray = false){
        let p = this.p;
        if (this.buffer) {
            p = this.buffer;
        }

        for (let j = 0; j < this.grid.length; j++) {
            for (let i = 0; i < this.grid[j].length; i++) {
                const cell = this.grid[j][i];
                const cellYWithScroll = cell.y + this.scrollOffset;

                if (cell.shape !== null) {
                    p.push(); // Save the current transformation state

                    const {totalScale, newX, newY} = this.p.findScale(this.scale, cell.x, cellYWithScroll, cell.w);

                    p.translate(newX, newY);

                    p.scale(totalScale);

                    // Draw the shape relative to the translated and scaled origin
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
                if(this.buffer){cell.shape = new ShapeGeneratorV2(this.buffer, this.mergedParams);}

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

                // Assign letter to the cell and wrap after 'Z'
                let letter;
                // If suffix is 0 (initial state), use only letters A-Z
                if (this.suffix === 0) {
                    letter = String.fromCharCode(letterCode);
                } else {
                    // Once we exceed Z, append the number suffix (e.g., A1, B1, etc.)
                    letter = String.fromCharCode(letterCode) + this.suffix;
                }

                const wrap = letterCode === 90;
                if(wrap){
                    letterCode = 65;
                    this.suffix++;
                } else {
                    letterCode++;
                }

                let shape = new ShapeGeneratorV2(this.p, this.mergedParams);
                if(this.buffer){shape = new ShapeGeneratorV2(this.buffer, this.mergedParams);}
                // Get noise position for the letter from the ShapeDictionary
                //const { x: noiseX, y: noiseY } = shapeDictionary.getValue(letter);

                const value = shapeDictionary.getValue(letter);
                if (!value) {return;}
                const { x: noiseX, y: noiseY } = value;

                // Set the noise position for the shape
                shape.setNoisePosition(noiseX, noiseY);

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
            // Create download buttons for the new rows
        for (let j = this.grid.length - numRows; j < this.grid.length; j++) {
            this.downloadButtons[j] = [];
            for (let i = 0; i < this.grid[j].length; i++) {
                const cell = this.grid[j][i];
                const pos = DownloadButton.positionInCell(cell);
                
                this.downloadButtons[j][i] = new DownloadButton(
                    this.p, 
                    pos.x, 
                    pos.y, 
                    cell.letter
                );
            }
        }
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
                    if (!button || !button.isVisible) continue;
                    
                    if (button.isClicked(this.p.mouseX, this.p.mouseY)) {
                        // Make sure we have a valid cell
                        if (!this.grid[row] || !this.grid[row][col] || !this.grid[row][col].shape) {
                            console.error("Invalid grid cell or missing shape");
                            return false;
                        }
            
                        const cell = this.grid[row][col];
                        const letter = cell.letter;
                        
                        console.log("Download button clicked for letter:", letter);
                        
                        try {
                            // Initialize shapeSaver before using it
                            const selectedOption = button.getSelectedOption().type;
                            shapeSaver.init(this.p, this.mergedParams);
                            if(selectedOption == "svg"){
                                shapeSaver.saveAsSvg(letter);
                            } else if (selectedOption == "png") {
                                shapeSaver.download(letter);
                            } else {return;}
                            return true;
                        } catch (error) {
                            console.error("Error downloading shape:", error);
                        }
                    }
                }
            }
        }
        
        return false; // No button was clicked
    }

    updateHoveredCell() {
        const p = this.p;
        
        // Reset hovered cell
        this.hoveredCellRow = -1;
        this.hoveredCellCol = -1;
        
        // Check if mouse is over any cell
        for (let j = 0; j < this.grid.length; j++) {
            for (let i = 0; i < this.grid[j].length; i++) {
                const cell = this.grid[j][i];
                const cellYWithScroll = cell.y + this.scrollOffset;
                
                // Check if mouse is over this cell
                if (
                    p.mouseX >= cell.x && 
                    p.mouseX <= cell.x + cell.w &&
                    p.mouseY >= cellYWithScroll && 
                    p.mouseY <= cellYWithScroll + cell.h
                ) {
                    this.hoveredCellRow = j;
                    this.hoveredCellCol = i;
                    return; // Exit the loop once we found the hovered cell
                }
            }
        }
    }

}
export default DisplayGrid;