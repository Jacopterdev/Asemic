class ShapeInputField {
    constructor(p, x, y, width, height) {
        this.p = p;                // p5 instance
        this.x = x;                // X coordinate of the input field
        this.y = y;                // Y coordinate of the input field
        this.kerning = 30;          // Default distance between shapes
        this.width = width;        // Width of the input field
        this.height = height;      // Height of the input field
        this.shapes = [];          // Array to store the shapes
        this.maxShapes = width/this.kerning;    // Maximum number of shapes that fit in the field
        this.cursorVisible = true; // Visibility flag for the blinking cursor
        this.lastBlinkTime = 0;    // Timer for managing cursor blinking
        this.cursorBlinkInterval = 500; // Blinking interval in milliseconds
    }

    // Add a shape based on a key
    addShape(key) {
        if (this.shapes.length >= this.maxShapes) {
            this.shapes.shift(); // Remove the oldest shape if maximum is reached
        }
        const shape = this.createShape(key);
        if (shape) {
            this.shapes.push(shape); // Add new shape
        }

        this.lastBlinkTime = this.p.millis();  // Reset the timer
        this.cursorVisible = false;
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

        // Calculate the starting X position to center-align the shapes
        const totalShapesWidth = this.shapes.length * this.kerning;
        let startX = this.x + (this.width - totalShapesWidth) / 2;

        // Draw each shape
        this.shapes.forEach((shape) => {
            p.fill(shape.color);
            if (shape.type === "circle") {
                p.circle(startX + shape.size / 2, this.y + this.height / 2, shape.size);
            } else if (shape.type === "square") {
                p.square(startX, this.y + this.height / 2 - shape.size / 2, shape.size);
            } else if (shape.type === "triangle") {
                const halfSize = shape.size / 2;
                p.triangle(
                    startX, // Left vertex (center point of the base)
                    this.y + this.height / 2 - halfSize, // Top point of the triangle
                    startX, // Left vertex (center point of the base)
                    this.y + this.height / 2 + halfSize, // Bottom point of the triangle
                    startX + shape.size, // Far-right tip of the triangle
                    this.y + this.height / 2 // Center point
                );


            }
            startX += this.kerning; // Advance position based on kerning
        });
    }

    // Render both the shapes and the cursor (optional combined method)
    draw() {
        const p = this.p;
        this.manageCursorBlinking(); // Check if the cursor should blink

        // Draw the shapes
        this.drawShapes();

        // Draw the blinking cursor, if visible
        if (this.cursorVisible) {
            const { x, y } = this.getCursorPosition(); // Get the cursor position
            this.drawCursor(x, y); // Draw the cursor at its position
        }
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

    // Create a shape based on the key pressed
    createShape(key) {
        const shapeTypeMap = {
            Q: "circle",
            W: "square",
            E: "triangle",
            // Map other keys to shapes
        };

        const shapeType = shapeTypeMap[key.toUpperCase()] || "circle"; // Default to 'circle'

        return {
            type: shapeType,
            size: 50, // Size of the shape
            color: this.p.color(0), // Example color
        };
    }
}

export default ShapeInputField;