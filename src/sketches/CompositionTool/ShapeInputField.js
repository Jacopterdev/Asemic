import shapeDictionary from "../ShapeDictionary.js";
import ShapeGeneratorV2 from "../ShapeGenerator/ShapeGeneratorV2.js";
import {SPACING as LAYOUT} from "../States/LayoutConstants.js";

class ShapeInputField {
    constructor(p, mergedParams, x, y, width, height) {
        this.p = p;                // p5 instance
        this.mergedParams = mergedParams;
        this.x = x;                // X coordinate of the input field
        this.y = y;                // Y coordinate of the input field

        // Default distance between shapes
        this.width = width;        // Width of the input field
        this.height = height;      // Height of the input field
        this.shapes = [];          // Array to store the shapes

        this.cursorVisible = true; // Visibility flag for the blinking cursor
        this.lastBlinkTime = 0;    // Timer for managing cursor blinking
        this.cursorBlinkInterval = 500; // Blinking interval in milliseconds
        this.maxShapes = 12;
        this.kerning = -0.3;
        this.shapeWidth = this.width / (this.maxShapes+(this.maxShapes*this.kerning));
        this.scale = 0.2 // Scale factor
    }

    // Add a new shape based on a key/letter
    addShape(key) {
        if (this.shapes.length >= this.maxShapes) {
            this.shapes.shift(); // Remove the oldest shape if maximum is reached
        }

        // Handle space character specially
        if (key === ' ') {
            // Add a space "shape" (no actual shape to draw, just a placeholder)
            this.shapes.push({
                letter: ' ',
                shape: null,  // null shape indicates a space
                isSpace: true // Flag to identify this as a space
            });
        } else {
            // Normal character processing
            const shape = this.createShape(key);
            if (shape) {
                this.shapes.push({ letter: key, shape });
            }
        }

        this.lastBlinkTime = this.p.millis(); // Reset cursor blink timer
        this.cursorVisible = false; // Hide the cursor when typing
    }



    // Remove the last shape from the input field
    removeLastShape() {
        this.shapes.pop();
    }

    // Get the current cursor position
    getCursorPosition() {
        const p = this.p;

        // Use the same width calculation as in drawShapes for consistency
        const effectiveShapeWidth = this.shapeWidth * (1 + this.kerning);
        const totalWidth = this.shapes.length * effectiveShapeWidth;

        // Calculate the starting X position (same as in drawShapes)
        let startX = this.x + (this.width - totalWidth) / 2;

        // Move to where the next shape would be positioned
        let cursorX = startX + (this.shapes.length * effectiveShapeWidth);

        // Vertical position remains at the center of the input field
        const cursorY = this.y + this.height / 2;

        return { x: cursorX, y: cursorY };
    }

    // Refactored drawCursor method
    drawCursor(xPosition, yPosition) {
        const p = this.p;
        const cursorHeight = this.height / 1.5; // Set the height of the cursor line
        const cursorY = yPosition - cursorHeight / 2; // Adjust Y positioning to center the cursor vertically

        p.stroke(128); // Black cursor color
        p.strokeWeight(1); // Thickness of the cursor line
        p.line(xPosition, cursorY, xPosition, cursorY + cursorHeight); // Draw vertical line
    }

    // Render all the shapes
    drawShapes() {
        const p = this.p;

        // Calculate the total width all shapes will occupy together
        const effectiveShapeWidth = this.shapeWidth * (1 + this.kerning);
        const totalWidth = this.shapes.length * effectiveShapeWidth;

        let startX = this.x + (this.width - totalWidth) / 2;

        // Draw each shape
        this.shapes.forEach(({ shape, isSpace }) => {
            // If it's a space, just advance the position without drawing anything
            if (isSpace) {
                startX += effectiveShapeWidth;
                return;
            }
            if(!shape){return;}

            p.push();

            // Position at the current shape's starting position
            p.translate(startX, this.y); // Center vertically

            // Scale the shape to fit appropriately
            p.scale(this.scale);

            // Use the `draw` method to render the shape
            shape.draw();

            p.pop();

            // Advance to the next shape position
            startX += effectiveShapeWidth;
        });
    }



    // Render both the shapes and the cursor (optional combined method)
    // Render the shapes and the cursor
    draw() {
        this.manageCursorBlinking();

        // Draw the shapes
        this.drawShapes();
    }


    // Manage the blinking behavior for the cursor
    manageCursorBlinking() {
        const currentTime = this.p.millis();
        if (currentTime - this.lastBlinkTime >= this.cursorBlinkInterval) {
            this.cursorVisible = !this.cursorVisible; // Toggle visibility
            this.lastBlinkTime = currentTime;  // Reset the timer
        }
    }

    // Update the kerning value
    setKerning(value) {
        this.kerning = value; // Update the kerning (distance) between shapes
    }

    // Create a ShapeGeneratorV2 instance for a letter or key
    createShape(key) {
        // Create a new instance of ShapeGeneratorV2
        let shape = new ShapeGeneratorV2(this.p, this.mergedParams);

        // Get noise position for the key/letter from the ShapeDictionary
        const noisePosition = shapeDictionary.getValue(key);

        // Check if a noise position was retrieved
        if (!noisePosition) {
            return null; // Or handle the case differently if needed
        }

        // Destructure noise position if valid
        const { x: noiseX, y: noiseY } = noisePosition;

        // Set the noise position and generate the shape
        shape.setNoisePosition(noiseX, noiseY);
        shape.generate();

        return shape;
    }

    updateMergedParams(newParams) {
        this.mergedParams = newParams;

        // Regenerate all shapes based on stored letters, preserving spaces
        this.shapes = this.shapes.map(({ letter, isSpace }) => {
            // If it's a space, return it with the same structure
            if (isSpace || letter === ' ') {
                return {
                    letter: ' ',
                    shape: null,
                    isSpace: true
                };
            }

            // For non-space characters, regenerate the shape
            return {
                letter, // Keep the original letter
                shape: this.createShape(letter), // Regenerate the shape
                isSpace: false // Explicitly set isSpace to false
            };
        });
    }



}

export default ShapeInputField;