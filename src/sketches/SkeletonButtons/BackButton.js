// BackButton.js
import SkeletonButton from "./SkeletonButton.js";

class BackButton extends SkeletonButton {
    constructor(p, x, y, onBack) {
        super(p, x, y, onBack);
    }

    draw() {
        super.draw();
        // Draw an X instead of a question mark
        this.p.fill(75, 85, 99); // text-gray-600
        this.p.textSize(16); // Appropriate size for the X
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.text("X", this.x + this.size/2, this.y + this.size/2 + 1); // +1 for better vertical alignment
    }
}

export default BackButton;