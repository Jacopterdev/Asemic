import {SPACING as LAYOUT} from "../States/LayoutConstants.js";

class SkeletonButton {
    constructor(p, x, y, onClick, toggleable=false) {
        this.p = p; // p5 instance
        this.x = x;
        this.y = y;
        this.size = LAYOUT.BUTTON_SIZE;
        this.onClick = onClick; // Callback for click event
        this.togglable = toggleable;
        this.isHovered = false; // Track hover state
        this.isToggled = false;
    }

    // Draw the button
    draw() {
        const size = this.size;
        const iconX = this.x;
        const iconY = this.y;

        // Check if mouse is hovering over button
        this.isHovered =
            this.p.mouseX >= iconX &&
            this.p.mouseX <= iconX + size &&
            this.p.mouseY >= iconY &&
            this.p.mouseY <= iconY + size;

        if(this.isHovered) this.p.cursor(this.p.HAND);


        // Match your index.css button styles
        if(this.isHovered) {
            this.p.fill(229, 231, 235); // hover:bg-gray-200 - matches the hover style
        } else if (this.togglable && this.isToggled){
            this.p.fill(229, 231, 235);
        } else {
            this.p.fill(209, 213, 219); // bg-gray-300 - matches the normal style
        }

        this.p.noStroke(); // No border like your buttons
        this.p.rect(iconX, iconY, size, size, 4); // rounded (4px is similar to your rounded class)
    }

    // Check if the button is hovered
    checkHover(mouseX, mouseY) {
        this.isHovered =
            mouseX >= this.x &&
            mouseX <= this.x + this.size &&
            mouseY >= this.y &&
            mouseY <= this.y + this.size;
        return this.isHovered;
    }

    // Handle click event
    click() {
        console.log("Clicked", this.isHovered, typeof this.onClick);
        if (this.isHovered && typeof this.onClick === "function") {
            this.onClick();
        }
    }
} export default SkeletonButton;