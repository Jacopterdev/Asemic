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
        p.push();
        p.textFont(this.font); // Set font
        p.textSize(this.fontSize); // Set font size
        p.fill(0); // Text color
        p.noStroke(); // Disable outline
        p.textAlign(p.LEFT, p.CENTER); // Align text to the center vertically
        p.text(this.text, this.x, this.y); // Draw text
        p.pop();
    }
}

export default KnobLabel;