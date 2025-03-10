import shapeDictionary from "../ShapeDictionary.js";
import ShapeGeneratorV2 from "../ShapeGenerator/ShapeGeneratorV2.js";

class KeyboardCell {
    constructor(p, buffer, x, y, size, char, callback, fontSize = 8, fontType = "Roboto Mono", fontFillColor = 128) {
        this.p = p;
        this.buffer = buffer;
        this.x = x; // X coordinate of the cell
        this.y = y; // Y coordinate of the cell
        this.size = size; // Size of the square cell
        this.char = char; // The bound alphabet character
        this.callback = callback; // Callback when the key is pressed

        this.fontSize = fontSize; // Font size for the character
        this.fontType = fontType; // Font type for the character
        this.fontFillColor = fontFillColor; // Font fill color for the character
        this.mergedParams = {};
        this.isActive = false; // Track if the cell is active
        this.shape = this.createShape();
    }

    createShape(){
        // Initialize ShapeGeneratorV2 instance
        const noisePosition = shapeDictionary.getValue(this.char); // Noise position for the character
        let shape = null;
        if (noisePosition) {
            const { x: noiseX, y: noiseY } = noisePosition;
            // Create and configure ShapeGeneratorV2
            shape = new ShapeGeneratorV2(this.buffer, this.mergedParams);
            shape.setNoisePosition(noiseX, noiseY);
            shape.generate();
        } else {
            shape = null; // No shape if noise position not found
        }
        return shape;
    }

    drawShape(){
        // Scale the shape to fit appropriately in the cell
        const scaleFactor =  this.size / this.p.width; // Adjust scale factor to fit the cell size

        // Draw the shape if it exists
        if (this.shape) {
            this.buffer.push();

            console.log(this.p.getShapeScale());
            const shapeScale = this.p.getShapeScale();

            // Translate to the center of the cell
            this.buffer.translate(this.x, this.y);

            // Center the scale behavior
            this.buffer.translate(this.size / 2, this.size / 2); // Move origin to the center of the cell (assuming size represents the intended bounding box for the shape)

            this.buffer.scale(scaleFactor * shapeScale);

            this.buffer.translate(-this.size / 2, -this.size / 2); // Move origin back to the original position

            // Render the shape
            this.shape.draw();

            this.buffer.pop();
        }

    }
    draw(p) {
        // Change fill color based on whether the cell is active or not
        if (this.isActive) {
            p.fill(64, 64, 64, 32); // Active fill color (example: semi-transparent gray)
        } else {
            p.fill(255,255,255,0); // Default fill color (white)
        }

        // Draw the cell background
        p.stroke(196); // Black stroke around the cell
        p.rect(this.x, this.y, this.size, this.size);

        p.noStroke();

        // Set the font properties
        p.fill(this.fontFillColor); // Use the font fill color
        p.textSize(this.fontSize); // Use the configured font size
        p.textFont(this.fontType); // Use the configured font type

        // Draw the character in the bottom-left corner
        const padding = 5; // Some padding from the edges
        p.textAlign(p.LEFT, p.BOTTOM); // Align text at the bottom-left corner
        p.text(
            this.char,
            this.x + padding, // X-coordinate with padding
            this.y + this.size - padding // Y-coordinate with padding from the bottom
        );
    }

    checkKeyPressed(key) {
        // Check if the key matches the cell's character (case-insensitive)
        if (key.toLowerCase() === this.char.toLowerCase()) {

            // Activate the cell (change its state)
            this.isActive = true;

            // Call the callback if it exists
            if (this.callback) {
                this.callback(this.char);
            }
        }
    }

    checkKeyReleased(key) {
        // Check if the key matches the cell's character (case-insensitive)
        if (key.toLowerCase() === this.char.toLowerCase()) {

            // Deactivate the cell (reset its state)
            this.isActive = false;
        }
    }

    updateMergedParams(newParams){
        this.mergedParams = newParams;
        this.shape = this.createShape();
    }
}
export default KeyboardCell;