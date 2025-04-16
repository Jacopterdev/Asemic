import SkeletonButton from "./SkeletonButton.js";

class HelpButton extends SkeletonButton{
    constructor(p, x, y, onHelp) {
        super(p, x, y, onHelp);
    }
    draw() {
        super.draw();
        // Keep question mark size similar but centered in the larger button
        this.p.fill(75, 85, 99); // text-gray-600
        //this.p.noStroke();
        this.p.textSize(16); // Appropriate size for the question mark
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.text("?", this.x + this.size/2, this.y + this.size/2 + 1); // +1 for better vertical alignment
    }
} export default HelpButton;