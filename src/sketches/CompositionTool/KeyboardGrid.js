import KeyboardCell from "./KeyboardCell.js";

class KeyboardGrid {
    constructor(p, x, y, cellSize, rows, cols, alphabet, callback) {
        this.p = p; // p5 instance
        this.x = x; // Top-left x position of the grid
        this.y = y; // Top-left y position of the grid
        this.cellSize = cellSize; // Size of each cell
        this.rows = rows; // Number of rows
        this.cols = cols; // Number of columns
        this.cells = []; // Array to hold all Cell instances
        this.alphabet = alphabet.split(""); // Ensure alphabet is an array

        let index = 0;

        // Create the cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const char = this.alphabet[index];
                // Create a new Cell object
                const cell = new KeyboardCell(
                    this.x + col * this.cellSize, // x position
                    this.y + row * this.cellSize, // y position
                    this.cellSize, // Size of the cell
                    char, // Alphabet character
                    callback // Callback to handle key press
                );

                this.cells.push(cell);
                index = (index + 1) % this.alphabet.length; // Loop through the alphabet
            }
        }
    }

    draw(p) {
        // Draw all cells in the grid
        this.cells.forEach((cell) => cell.draw(p));
    }

    keyPressed(key) {
        // Pass the key press event to each cell
        this.cells.forEach((cell) => cell.checkKeyPressed(key));
    }
}
export default KeyboardGrid;