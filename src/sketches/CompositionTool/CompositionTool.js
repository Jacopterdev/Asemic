import KeyboardGrid from "./KeyboardGrid.js";
import ShapeInputField from "./ShapeInputField.js";
import DownloadButton from "../DownloadButton.js";
// Import the shapeSaver utility
import shapeSaver from "../ShapeSaver.js";

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
            mergedParams,
            50,        // x-coordinate of the grid's top-left corner
            p.height/2,        // y-coordinate of the grid's top-left corner
            (p.width - (2*50))/10,        // Size of each cell
            3,         // Number of rows
            10,         // Number of columns
            "QWERTYUIOPASDFGHJKL ZXCVBNM   ", // Alphabet to populate the grid
            (key) => this.onKeyPress(key) // Callback for key presses
        );

        // Add download button in the bottom-right corner of the input field area
        this.downloadButton = new DownloadButton(
            p,
            50 + (p.width - 100) - 40, // Position at right edge of input field, offset by button width
            50 + 200 - 40,            // Position at bottom edge of input field, offset by button height
            30,                        // Button width
            30                         // Button height
        );
    }
    
    // Handle mouse presses for the download button
    handleMousePressed() {
        if (this.downloadButton && this.downloadButton.isClicked(this.p.mouseX, this.p.mouseY)) {
            console.log("Download button clicked in CompositionTool");
            
            // Pass the entire ShapeInputField object to ShapeSaver
            try {
                shapeSaver.init(this.p, this.mergedParams)
                    .downloadFromInputField(this.shapeInputField);
                return true;
            } catch (error) {
                console.error("Error downloading composition:", error);
            }
            return true; // Event handled
        }
        return false; // Event not handled
    }
    
    // Draw method to render the CompositionTool components
    draw() {
        this.shapeInputField.draw();
        
        this.p.applyEffects(this.shapeInputField.scale);

        // Draw cursor if visible
        if (this.shapeInputField.cursorVisible) {
            const { x, y } = this.shapeInputField.getCursorPosition();
            this.shapeInputField.drawCursor(x, y);
        }
        
        // Update download button visibility based on mouse position
        this.downloadButton.isVisible = this.isMouseOverInputField();
        
        // Update hover state - this line was missing
        if (this.downloadButton.isVisible) {
            this.downloadButton.update(
                this.downloadButton.x, 
                this.downloadButton.y
            );
        }
        
        // Draw the download button (will only draw if isVisible is true)
        this.downloadButton.draw();
        
        // Draw the keyboard
        this.keyboardGrid.draw(this.p);
    }

    // Existing methods remain unchanged
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

    onKeyPress(key) {
        // Add any custom behavior for key presses here
    }
    
    updateMergedParams(mergedParams) {
        this.mergedParams = mergedParams;
        this.shapeInputField.updateMergedParams(mergedParams);
        this.keyboardGrid.updateMergedParams(mergedParams);
    }

    // Add this method to CompositionTool class
    isMouseOverInputField() {
        const inputField = this.shapeInputField;
        return (
            this.p.mouseX >= 50 && 
            this.p.mouseX <= 50 + (this.p.width - 100) &&
            this.p.mouseY >= 50 && 
            this.p.mouseY <= 50 + 200
        );
    }
}

export default CompositionTool;