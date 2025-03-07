import shapeDictionary from "../ShapeDictionary.js";
import ShapeGeneratorV2 from "../ShapeGenerator/ShapeGeneratorV2.js";

class ShapeInputField {
    constructor(p, mergedParams, x, y, width, height) {
        this.p = p;                // p5 instance
        this.mergedParams = mergedParams;
        this.x = x;                // X coordinate of the input field
        this.y = y;                // Y coordinate of the input field
        this.kerning = 30;          // Default distance between shapes
        this.width = width;        // Width of the input field
        this.height = height;      // Height of the input field
        this.shapes = [];          // Array to store the shapes
        this.maxShapes = 10;    // Maximum number of shapes that fit in the field
        this.cursorVisible = true; // Visibility flag for the blinking cursor
        this.lastBlinkTime = 0;    // Timer for managing cursor blinking
        this.cursorBlinkInterval = 500; // Blinking interval in milliseconds

        this.scale = 1*(this.width/p.width)/this.maxShapes; // Scale factor

    }

    // Add a new shape based on a key/letter
    addShape(key) {
        if (this.shapes.length >= this.maxShapes) {
            this.shapes.shift(); // Remove the oldest shape if maximum is reached
        }
        const shape = this.createShape(key);
        if (shape) {
            this.shapes.push(shape); // Add the new `ShapeGeneratorV2` object
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
        const totalShapesWidth = this.shapes.length * this.kerning; // Total width occupied by shapes
        let cursorX =
            this.x + (this.width - totalShapesWidth) / 2 + this.shapes.length * this.kerning; // Position after last shape
        const cursorY = this.y + this.height / 2; // Midpoint of the input field vertically

        return { x: cursorX, y: cursorY }; // Return cursor position
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
    // Draw the shapes (use ShapeGeneratorV2 instances)
    drawShapes() {
        const p = this.p;

        // Calculate the starting X position to center-align the shapes
        const totalShapesWidth = this.shapes.length * this.kerning;
        let startX = this.x + (this.width - totalShapesWidth) / 2;

        // Draw each ShapeGeneratorV2 shape
        this.shapes.forEach((shapeInstance) => {
            // Push p5 context to handle individual transformations safely
            p.push();

            // Translate to the starting position of the current shape
            p.translate(startX, this.y + this.height / 2);

            p.scale(this.scale);

            // Use the `draw` method of ShapeGeneratorV2 to render the shape
            shapeInstance.draw();

            // Restore p5 context
            p.pop();

            // Advance position based on kerning
            startX += this.kerning;
        });
    }


    // Render both the shapes and the cursor (optional combined method)
    // Render the shapes and the cursor
    draw() {
        this.manageCursorBlinking();

        // Draw the shapes
        this.drawShapes();

        // Draw the cursor (if it's visible)
        if (this.cursorVisible) {
            const cursorPos = this.getCursorPosition();
            this.drawCursor(cursorPos.x, cursorPos.y);
        }
        this.p.fill(0,0,0,0);
        this.p.stroke(64);
        this.p.strokeWeight(2);
        this.p.rect(this.x, this.y, this.width, this.height);
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

    updateMergedParams(mergedParams){
        this.mergedParams = mergedParams;
    }

}

export default ShapeInputField;