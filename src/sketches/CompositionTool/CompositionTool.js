import KeyboardGrid from "./KeyboardGrid.js";
import ShapeInputField from "./ShapeInputField.js";

class CompositionTool {
    constructor(p, mergedParams) {
        this.p = p;
        this.mergedParams = mergedParams;
        // Create the ShapeInputField
        this.shapeInputField = new ShapeInputField(
            p,
            this.mergedParams,
            50,           // X position
            50,           // Y position (above the keyboard)
            p.width - 100, // Width of the input field
            200           // Height of the input field
        );

        // Initialize the KeyboardGrid with the required parameters,
        // including a callback function bound to this instance
        this.keyboardGrid = new KeyboardGrid(
            p,         // Pass the p5 instance
            50,        // x-coordinate of the grid's top-left corner
            p.height/2,        // y-coordinate of the grid's top-left corner
            (p.width - (2*50))/10,        // Size of each cell
            3,         // Number of rows
            10,         // Number of columns
            "QWERTYUIOPASDFGHJKL ZXCVBNM   ", // Alphabet to populate the grid
            (key) => this.onKeyPress(key) // Callback for key presses
        );

    }
    // Handle key presses from the p5 sketch and forward them to the KeyboardGrid
    keyPressed(key) {
        this.keyboardGrid.keyPressed(key);
        if (key === "Backspace") {
            this.shapeInputField.removeLastShape(); // Handle backspace
        } else {
            this.shapeInputField.addShape(key); // Add shape based on key
        }
    }

    keyReleased(key){
        this.keyboardGrid.keyReleased(key);

    }

    // Callback for when a key is pressed (add custom behavior here)
    onKeyPress(key) {
        console.log(`Key "${key}" pressed in CompositionTool!`);
    }

    // Render the keyboard grid
    draw(p) {
        this.shapeInputField.draw();

        this.p.applyEffects(this.shapeInputField.scale);

        if (this.shapeInputField.cursorVisible) {      // Conditional logic for cursor
            const { x, y } = this.shapeInputField.getCursorPosition();
            this.shapeInputField.drawCursor(x, y); // Draw cursor separately
        }

        this.keyboardGrid.draw(p);

    }

    updateMergedParams(mergedParams){
        this.mergedParams = mergedParams;
        this.shapeInputField.updateMergedParams(mergedParams);
    }

}
export default CompositionTool;