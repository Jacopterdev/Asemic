import KeyboardGrid from "./KeyboardGrid.js";
import ShapeInputField from "./ShapeInputField.js";
import DownloadButton from "../DownloadButton.js";
// Import the shapeSaver utility
import shapeSaver from "../ShapeSaver.js";
import {SPACING as LAYOUT} from "../States/LayoutConstants.js";
import ShapeGeneratorV2 from "../ShapeGenerator/ShapeGeneratorV2.js";
import Effects from "../Effects.js";
import shapeDictionary from "../ShapeDictionary.js";
import keyboardGrid from "./KeyboardGrid.js";

class CompositionTool {
    constructor(p, mergedParams) {
        this.p = p;
        this.mergedParams = mergedParams;
        
        this.shapeInputField = new ShapeInputField(
            p,
            mergedParams,  // Make sure this is correctly passed
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
            "",                        // Button width
            false                         // Button height
        );

        // Add a download all button at the bottom of the KeyboardGrid
        this.downloadAllButton = new DownloadButton(
            p,
            p.width - 80,           // Position at right side
            p.height/2 + (3 * ((p.width - (2*50))/10)) + 20, // Position below the keyboard grid
            "",                     // Button width
            false                      // Button height (larger than standard)
        );
        this.backspaceTimer = null;
        this.initialDelayTimer = null; // Timer for the initial delay


    }
    
    // Handle mouse presses for the download button
    handleMousePressed() {
        // Check if download all button was clicked
        if (this.downloadAllButton && this.downloadAllButton.isClicked(this.p.mouseX, this.p.mouseY)) {
            console.log("Download all button clicked");
            
            try {
                // Use ShapeSaver's method instead of direct implementation
                const allCharacters = "QWERTYUIOPASDFGHJKL ZXCVBNM"; // Match your grid layout
                shapeSaver.init(this.p, this.mergedParams)
                    .downloadAllShapes(this.p, this.mergedParams, allCharacters);
                return true;
            } catch (error) {
                console.error("Error downloading all shapes:", error);
            }
            return true; // Event handled
        }
        
        // First check if the download button was clicked
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
        
        // Let the keyboard grid handle the mouse press
        if (this.keyboardGrid.handleMousePressed(this.p.mouseX, this.p.mouseY)) {
            return true; // Event handled by keyboard grid
        }
        
        return false; // Event not handled
    }

    handleMouseReleased() {
        this.keyboardGrid.handleMouseReleased();
    }
    
    // Draw method to render the CompositionTool components
    draw() {
        this.shapeInputField.draw();
        
        this.p.applyEffects(this.shapeInputField.scale * this.p.getShapeScale() * LAYOUT.SHAPE_SCALE);

        // Draw cursor if visible
        if (this.shapeInputField.cursorVisible) {
            const { x, y } = this.shapeInputField.getCursorPosition();
            this.shapeInputField.drawCursor(x, y);
        }

        const hoverInput = this.isMouseOverInputField();
        // Update download button visibility based on mouse position
        this.downloadButton.isVisible = hoverInput;
        
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
        
        // Always make the download all button visible
        this.downloadAllButton.isVisible = true;
        this.downloadAllButton.update(this.downloadAllButton.x, this.downloadAllButton.y);
        this.downloadAllButton.draw();
        
        // Optional: Add a label for the button
        //this.p.fill(0);
        //this.p.noStroke();
        //this.p.textSize(12);
        //this.p.textAlign(this.p.CENTER);
        //this.p.text("Download All", this.downloadAllButton.x, this.downloadAllButton.y + 50);
        //this.p.textAlign(this.p.LEFT);
        const hoverKeyboard = this.keyboardGrid.isBufferHovered();
        if (hoverKeyboard) this.p.cursor(this.p.HAND);
    }

    // Existing methods remain unchanged
    keyPressed(key) {
        //this.keyboardGrid.keyPressed(key);
        if (key === "Backspace") {
            // Call `removeLastShape()` immediately
            this.shapeInputField.removeLastShape();

            // Start the initial delay before the repeated execution
            if (!this.initialDelayTimer) {
                this.initialDelayTimer = setTimeout(() => {
                    // After the initial delay, start the faster interval timer
                    this.backspaceTimer = setInterval(() => {
                        this.shapeInputField.removeLastShape();
                    }, 50); // Faster pace after delay
                }, 400); // Initial delay of 400ms
            }

        } else {
            //this.shapeInputField.addShape(key); // Add shape based on key
        }
        this.keyboardGrid.keyPressed(key);
    }

    keyReleased(key){
        this.keyboardGrid.keyReleased(key);
        if (key === "Backspace") {
            // Clear all timers when Backspace is released
            if (this.initialDelayTimer) {
                clearTimeout(this.initialDelayTimer);
                this.initialDelayTimer = null;
            }
            if (this.backspaceTimer) {
                clearInterval(this.backspaceTimer);
                this.backspaceTimer = null;
            }
        }


    }

    onKeyPress(key) {
        // When a key in the keyboard grid is clicked, add the shape to the input field
        this.shapeInputField.addShape(key);
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