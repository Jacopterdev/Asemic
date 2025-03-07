import shapeDictionary from "../ShapeDictionary.js";
import ShapeGeneratorV2 from "../ShapeGenerator/ShapeGeneratorV2.js";

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
        this.maxShapes = 12;    // Maximum number of shapes that fit in the field
        this.cursorVisible = true; // Visibility flag for the blinking cursor
        this.lastBlinkTime = 0;    // Timer for managing cursor blinking
        this.cursorBlinkInterval = 500; // Blinking interval in milliseconds

        this.kerning = 20;
        this.defaultOverlap = 0.33;

        this.scale = (this.width/p.width)/this.maxShapes / this.defaultOverlap; // Scale factor

    }

    // Add a new shape based on a key/letter
    addShape(key) {
        if (this.shapes.length >= this.maxShapes) {
            this.shapes.shift(); // Remove the oldest shape if maximum is reached
        }

        const shape = this.createShape(key);
        if (shape) {
            this.shapes.push({ letter: key, shape }); // Store both letter and shape
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
    drawShapes() {
        const p = this.p;

        // Calculate the base width available for each shape
        const baseShapeWidth = this.width / this.maxShapes * this.defaultOverlap;

        // Adjust kerning: influences the spacing between shapes
        const kerningOffset = this.kerning;

        // Calculate the actual spacing between shapes
        const adjustedSpacing = baseShapeWidth + kerningOffset;

        // Calculate starting X position to align shapes evenly, considering adjusted spacing
        const totalShapesWidth = this.shapes.length * adjustedSpacing;
        let startX = this.x + (this.width - (totalShapesWidth + baseShapeWidth)) / 2;

        // Draw each shape
        this.shapes.forEach(({ shape }) => {
            p.push();

            // Translate to the starting position of the current shape
            p.translate(startX - baseShapeWidth, this.y);

            // Scale the shape to fit appropriately
            p.scale(this.scale);

            // Use the `draw` method of ShapeGeneratorV2 to render the shape
            shape.draw();

            p.pop();

            // Advance position by dynamically adjusted spacing
            startX += adjustedSpacing;
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

        // Regenerate all shapes based on stored letters
        this.shapes = this.shapes.map(({ letter }) => ({
            letter, // Keep the original letter
            shape: this.createShape(letter) // Regenerate the shape
        }));
    }


}

export default ShapeInputField;