import KeyboardCell from "./KeyboardCell.js";
import Effects from "../Effects.js";
import {defaultConfig as mergedParams} from "../ShapeGenerator/Constants.js";
import effects from "../Effects.js";

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

        // Create a p5 graphics buffer for the entire grid
        this.buffer = p.createGraphics(this.cols * this.cellSize, this.rows * this.cellSize);
        this.effect = new Effects(this.buffer);

        // Create the cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const char = this.alphabet[index];
                // Create a new Cell object
                const cell = new KeyboardCell(this.p,
                    this.buffer,
                    col * this.cellSize, // x position
                    row * this.cellSize, // y position
                    this.cellSize, // Size of the cell
                    char, // Alphabet character
                    callback // Callback to handle key press
                );

                this.cells.push(cell);
                index = (index + 1) % this.alphabet.length; // Loop through the alphabet
            }
        }


    }

    draw() {
        this.buffer.clear();
        this.buffer.background(255);

        this.cells.forEach((cell) => cell.drawShape());
        const scaleFactor =  this.cellSize / this.p.width; // Adjust scale factor to fit the cell size
        this.effect.applyEffects(scaleFactor);

        // Draw all cells in the grid
        this.cells.forEach((cell) => cell.draw(this.buffer));

        // Draw the buffer to the main canvas at the grid's position
        this.p.image(this.buffer, this.x, this.y);
    }

    keyPressed(key) {
        // Pass the key press event to each cell
        this.cells.forEach((cell) => cell.checkKeyPressed(key));
    }
    keyReleased(key){
        this.cells.forEach((cell) => cell.checkKeyReleased(key));
    }

    updateMergedParams(newParams){
        this.effect.setSmoothAmount(mergedParams.smoothAmount);
        this.cells.forEach((cell) => cell.updateMergedParams(newParams));
    }
}
export default KeyboardGrid;