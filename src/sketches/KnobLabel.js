class KnobLabel {
    constructor(p, fontSize = 12) {
        this.p = p;
        this.fontSize = fontSize;
        this.visible = false; // Label visibility state
        this.text = ""; // Text to display
        this.x = 0; // Label x position
        this.y = 0; // Label y position
        this.font = "Roboto Mono"; // Font used for display
    }

    /**
     * Updates the position and text of the label.
     * This is called when dragging a knob.
     * @param {string} text - Text to display (e.g., "Cols: 6", "Radials: 5").
     * @param {number} x - X-coordinate of the label.
     * @param {number} y - Y-coordinate of the label.
     */
    update(text, x, y) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.visible = true; // Make the label visible when updated
    }

    /**
     * Hides the label when not needed (e.g., when dragging stops).
     */
    hide() {
        this.visible = false; // Hide the label
    }

    /**
     * Draws the label on the canvas.
     * Only visible if `this.visible` is true.
     */
    draw() {
        if (!this.visible) return;

        const p = this.p;
        const padding = 4; // Add some spacing around the text
        const textWidth = p.textWidth(this.text); // Get the width of the text
        const textHeight = this.fontSize; // Assume text height is approximately the font size
        const backdropWidth = textWidth + padding * 2; // Backdrop width (account for padding)
        const backdropHeight = textHeight + padding * 2; // Backdrop height

        p.push();

        // Draw the backdrop (white rectangle with grey stroke)
        p.fill(255); // White fill
        p.stroke(200); // Grey stroke
        p.strokeWeight(1); // Thin stroke
        p.rect(this.x - padding, this.y - backdropHeight / 2, backdropWidth, backdropHeight, 4); // Rounded rectangle

        // Draw the text
        p.textFont(this.font); // Set font
        p.textSize(this.fontSize); // Set font size
        p.fill(0); // Black text
        p.noStroke(); // Disable text stroke
        p.textAlign(p.LEFT, p.CENTER); // Align text
        p.text(this.text, this.x, this.y); // Draw the label

        p.pop();
    }
}

export default KnobLabel;