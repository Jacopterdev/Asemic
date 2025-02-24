class KeyboardCell {
    constructor(x, y, size, char, callback, fontSize = 8, fontType = "Roboto Mono", fontFillColor = 128) {
        this.x = x; // X coordinate of the cell
        this.y = y; // Y coordinate of the cell
        this.size = size; // Size of the square cell
        this.char = char; // The bound alphabet character
        this.callback = callback; // Callback when the key is pressed

        this.fontSize = fontSize; // Font size for the character
        this.fontType = fontType; // Font type for the character
        this.fontFillColor = fontFillColor; // Font fill color for the character

        this.isActive = false; // Track if the cell is active
    }

    draw(p) {
        // Change fill color based on whether the cell is active or not
        if (this.isActive) {
            p.fill(200, 100, 255); // Active fill color (example: purple)
        } else {
            p.fill(255); // Default fill color (white)
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
            console.log(`Key "${this.char}" pressed!`);

            // Activate the cell (change its state)
            this.isActive = true;

            // Call the callback if it exists
            if (this.callback) {
                this.callback(this.char);
            }
        }
    }
}
export default KeyboardCell;