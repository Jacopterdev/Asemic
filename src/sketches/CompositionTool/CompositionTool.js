import KeyboardGrid from "./KeyboardGrid.js";

class CompositionTool {
    constructor(p) {
        // Initialize the KeyboardGrid with the required parameters,
        // including a callback function bound to this instance
        this.keyboardGrid = new KeyboardGrid(
            p,         // Pass the p5 instance
            50,        // x-coordinate of the grid's top-left corner
            p.height/2,        // y-coordinate of the grid's top-left corner
            (p.width - (2*50))/9,        // Size of each cell
            3,         // Number of rows
            9,         // Number of columns
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ", // Alphabet to populate the grid
            (key) => this.onKeyPress(key) // Callback for key presses
        );

    }
    // Handle key presses from the p5 sketch and forward them to the KeyboardGrid
    keyPressed(key) {
        this.keyboardGrid.keyPressed(key);
    }

    // Callback for when a key is pressed (add custom behavior here)
    onKeyPress(key) {
        console.log(`Key "${key}" pressed in CompositionTool!`);
        // Add any additional behavior to handle the key press
    }

    // Render the keyboard grid
    draw(p) {
        this.keyboardGrid.draw(p);
    }

}
export default CompositionTool;