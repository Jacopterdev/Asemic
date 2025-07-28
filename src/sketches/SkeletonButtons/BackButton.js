// BackButton.js
import SkeletonButton from "./SkeletonButton.js";

class BackButton extends SkeletonButton {
    constructor(p, x, y, onBack) {
        super(p, x, y, onBack);
    }

    draw() {
        super.draw();
        // Draw a cross instead of the text "X"
        const p = this.p;
        const centerX = this.x + this.size/2;
        const centerY = this.y + this.size/2;
        const crossSize = this.size * 0.2; // Size of the cross

        p.push();
        p.stroke(75, 85, 99); // text-gray-600
        p.strokeWeight(1);
        p.noFill();

        // Draw the diagonal lines forming an X
        // First diagonal (top-left to bottom-right)
        p.line(
            centerX - crossSize/2,
            centerY - crossSize/2,
            centerX + crossSize/2,
            centerY + crossSize/2
        );

        // Second diagonal (top-right to bottom-left)
        p.line(
            centerX + crossSize/2,
            centerY - crossSize/2,
            centerX - crossSize/2,
            centerY + crossSize/2
        );

        p.pop();


    }
}

export default BackButton;