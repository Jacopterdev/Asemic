class ExportMenu {
    constructor(p, ownerButton, options) {
        this.p = p;
        this.ownerButton = ownerButton; // Reference to the button that owns this menu
        this.options = options; // Array of menu options (e.g., [{ label: "SVG", type: "svg" }])
        this.isVisible = false; // Visibility state of the menu
        this.selectedOption = null; // Selected menu option

        // Menu dimensions
        this.optionWidth = 46;  // Fixed width for individual options
        this.optionHeight = 20; // Fixed height for individual options
    }

    // Opens the menu
    open() {
        this.isVisible = true;
    }

    // Closes the menu
    close() {
        this.isVisible = false;
    }

    // Checks if the mouse is hovering over the menu
    isHovered() {
        if (!this.isVisible) return false;

        const menuX = this.ownerButton.x - this.optionWidth * this.options.length - this.ownerButton.margin;
        const menuY = this.ownerButton.y + (this.ownerButton.size / 2) - (this.optionHeight / 2);
        const menuWidth = this.optionWidth * this.options.length + this.ownerButton.margin;
        const menuHeight = this.optionHeight;
        const hoverMargin = 15;

        return (
            this.p.mouseX > menuX - hoverMargin &&
            this.p.mouseX < menuX + menuWidth + hoverMargin &&
            this.p.mouseY > menuY - hoverMargin &&
            this.p.mouseY < menuY + menuHeight + hoverMargin
        );
    }

    // Handles drawing the menu
    draw() {
        if (!this.isVisible) return;

        const p = this.p;
        const menuX = this.ownerButton.x - this.optionWidth * this.options.length - this.ownerButton.margin;
        const menuY = this.ownerButton.y + (this.ownerButton.size / 2) - (this.optionHeight / 2);

        p.cursor(p.HAND);
        // Draw menu background
        p.fill(255); // White background
        p.stroke(127); // Light gray stroke
        p.strokeWeight(1); // Thin border
        p.rect(menuX, menuY, this.optionWidth * this.options.length, this.optionHeight, 4);
        p.noStroke();
        // Draw options
        this.options.forEach((option, index) => {
            const optionXStart = menuX + index * this.optionWidth;
            const isHovered =
                this.p.mouseX > optionXStart &&
                this.p.mouseX < optionXStart + this.optionWidth &&
                this.p.mouseY > menuY &&
                this.p.mouseY < menuY + this.optionHeight;

            // Highlight hovered option
            if (isHovered) {
                p.fill(255, 127, 0); // Orange
                p.rect(optionXStart, menuY, this.optionWidth, this.optionHeight, 4);
                p.fill(255); // White text
            } else {
                p.fill(127); // Grey text
            }

            // Draw option label
            const textX = optionXStart + 8; // Padding for text inside the option
            const textY = menuY + 15; // Vertically centered text
            p.noStroke();
            p.text(option.label, textX, textY);
        });
    }

    // Handles clicks on menu items
    handleClick() {
        if (!this.isVisible) return null;

        const menuX = this.ownerButton.x - this.optionWidth * this.options.length - this.ownerButton.margin;
        const menuY = this.ownerButton.y + (this.ownerButton.size / 2) - (this.optionHeight / 2);

        for (let index = 0; index < this.options.length; index++) {
            const optionXStart = menuX + index * this.optionWidth;
            const isClicked =
                this.p.mouseX > optionXStart &&
                this.p.mouseX < optionXStart + this.optionWidth &&
                this.p.mouseY > menuY &&
                this.p.mouseY < menuY + this.optionHeight;

            if (isClicked) {
                this.selectedOption = this.options[index];
                this.close(); // Close the menu after selecting an option
                return this.selectedOption;
            }
        }

        return null;
    }
}
export default ExportMenu;