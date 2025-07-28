import SkeletonButton from "./SkeletonButton.js";

class GoToNextStateButton extends SkeletonButton{
    constructor(p, x, y, onGoToNextState, flipped=false) {
        super(p, x, y, onGoToNextState);
        this.size = 40;
        this.width = this.size / 3;
        this.height = this.size /3*6;
        this.flipped = flipped;
    }
    draw() {
        const width = this.width;
        const height = this.height;
        const iconX = this.x;
        const iconY = this.y;

        // Check if mouse is hovering over button
        this.isHovered =
            this.p.mouseX >= iconX &&
            this.p.mouseX <= iconX + width &&
            this.p.mouseY >= iconY &&
            this.p.mouseY <= iconY + height;

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
        this.p.rect(this.x, this.y, width, height, 4);

        // Use darker grey color
        this.p.stroke(75, 85, 99); // text-gray-600
        this.p.strokeWeight(1); // Slightly thicker stroke
        this.p.noFill();
        // Draw a triangle (">" icon) centered in the button
        // Draw '>' icon using two lines
        const arrowHeight = this.size * 0.2; // Height of the '>' icon
        const arrowWidth = this.size * 0.1; // Width of the '>' icon

        const opticalOffset = 0.1;
        const centerX = this.x + width / 2 * (this.flipped ? 1-opticalOffset : 1+opticalOffset);
        const centerY = this.y + height/2;

        // Calculate positions for the two lines
        let x1 = centerX - arrowWidth / 2;       // Left point
        const y1 = centerY - arrowHeight / 2;     // Top point
        let x2 = centerX - arrowWidth / 2;       // Bottom point
        const y2 = centerY + arrowHeight / 2;
        let x3 = centerX + arrowWidth / 2;       // Right tip (point outward)


        // Flip the icon if flipped is true
        if (this.flipped) {
            // Mirror the points horizontally by swapping x1 and x3
            const temp = x1;
            x1 = x3;
            x3 = temp;
        }

        // Draw lines forming the '>'
        this.p.line(x1, y1, x3, centerY); // Top line
        this.p.line(x1, y2, x3, centerY); // Bottom line

    }
    checkHover(mouseX, mouseY) {
        this.isHovered =
            mouseX >= this.x &&
            mouseX <= this.x + this.width &&
            mouseY >= this.y &&
            mouseY <= this.y + this.height;
        return this.isHovered;
    }


} export default GoToNextStateButton;