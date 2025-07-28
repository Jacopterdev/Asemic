import KeyboardCell from "./KeyboardCell.js";
import Effects from "../Effects.js";
import {SPACING as LAYOUT} from "../States/LayoutConstants.js";

class KeyboardGrid {
    constructor(p, mergedParams, x, y, cellSize, rows, cols, alphabet, callback) {
        this.p = p; // p5 instance
        this.x = x; // Top-left x position of the grid
        this.y = y; // Top-left y position of the grid
        this.cellSize = cellSize; // Size of each cell
        this.rows = rows; // Number of rows
        this.cols = cols; // Number of columns
        this.cells = []; // Array to hold all Cell instances
        this.alphabet = alphabet.split(""); // Ensure alphabet is an array
        this.callback = callback; // Store the callback function - THIS LINE WAS MISSING

        this.mergedParams = mergedParams;

        let index = 0;

        // Create a p5 graphics buffer for the entire grid
        this.buffer = p.createGraphics(this.cols * this.cellSize, this.rows * this.cellSize);
        this.effect = new Effects(this.buffer);
        this.lastKeyPressed = null;

        // Add this property to the class constructor
        this.cellMap = new Map(); // Maps grid positions (col,row) to alphabet characters


        // Create the cells
        // Create the cells
        // Create the cells
        let skipCounter = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // Skip cells if needed
                if (skipCounter > 0) {
                    skipCounter--;
                    continue; // Skip this cell position, leaving an empty space
                }

                const char = this.alphabet[index];

                // After 'L', set up to skip 1 cell
                if (char === 'L') {
                    skipCounter = 1;
                }
                // After 'M', set up to skip 3 cells
                else if (char === ' ') {
                    skipCounter = 3;
                }

                // Create a new Cell object
                const cell = new KeyboardCell(this.p,
                    this.buffer,
                    col * this.cellSize, // x position
                    row * this.cellSize, // y position
                    this.cellSize, // Size of the cell
                    char, // Alphabet character
                    callback // Callback to handle key press
                );

                this.cellMap.set(`${col},${row}`, char);


                this.cells.push(cell);
                index = (index + 1) % this.alphabet.length; // Loop through the alphabet
            }
        }


    }

    draw() {
        //this.buffer.clear();
        this.buffer.background(255);

        this.cells.forEach((cell) => cell.drawShape());
        const key = this.getKeyFromMouse(
            this.p.mouseX,
            this.p.mouseY)
        const hover = key !== null;
        this.cells.forEach((cell) => cell.checkKeyHovered(key, hover));


        const scaleFactor = this.cellSize / this.p.width; // Adjust scale factor to fit the cell size
        this.effect.applyEffects(scaleFactor * this.p.getShapeScale() * LAYOUT.SHAPE_SCALE);

        // Draw all cells in the grid
        this.cells.forEach((cell) => cell.draw(this.buffer));

        // Draw the buffer to the main canvas at the grid's position
        this.p.image(this.buffer, this.x, this.y);
    }

    keyPressed(key) {
        // Pass the key press event to each cell
        this.cells.forEach((cell) => cell.checkKeyPressed(key));
    }

    keyReleased(key) {
        this.cells.forEach((cell) => cell.checkKeyReleased(key));
    }

    updateMergedParams(newParams) {
        this.mergedParams = newParams;
        this.effect.setSmoothAmount(this.mergedParams.smoothAmount);
        this.cells.forEach((cell) => cell.updateMergedParams(newParams));
    }

    handleMousePressed(mouseX, mouseY) {
        this.lastKeyPressed = this.getKeyFromMouse(mouseX, mouseY);
        // Only process non-space keys
        if (this.lastKeyPressed) {
            this.cells.forEach((cell) => cell.checkKeyPressed(this.lastKeyPressed));
            return true; // Click was handled
        }

        return false; // Click was not on a valid key
    }

    handleMouseReleased() {
        if (this.lastKeyPressed) this.cells.forEach((cell) => cell.checkKeyReleased(this.lastKeyPressed));
    }

    getKeyFromMouse(mouseX, mouseY) {
        // Check if the click is within the grid bounds
        if (mouseX < this.x || mouseX > this.x + this.cols * this.cellSize ||
            mouseY < this.y || mouseY > this.y + this.rows * this.cellSize) {
            return null; // Click is outside the grid
        }

        // Translate mouse coordinates to be relative to the grid
        const relativeX = mouseX - this.x;
        const relativeY = mouseY - this.y;

        // Calculate which cell was clicked
        const col = Math.floor(relativeX / this.cellSize);
        const row = Math.floor(relativeY / this.cellSize);

        // Look up the key in our cell map
        const key = this.cellMap.get(`${col},${row}`);

        // Return the key if found, otherwise null
        return key || null;
    }


    /**
     * Checks if the current mouse position is hovering over the buffer.
     * @returns {boolean} True if the buffer is hovered; otherwise, false.
     */
    isBufferHovered() {
        const mouseX = this.p.mouseX;
        const mouseY = this.p.mouseY;

        // Check if the mouse position falls within the buffer's boundaries
        return mouseX >= this.x &&
            mouseX <= this.x + this.buffer.width &&
            mouseY >= this.y &&
            mouseY <= this.y + this.buffer.height;
    }


}
export default KeyboardGrid;