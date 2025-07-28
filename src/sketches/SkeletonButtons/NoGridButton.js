import SkeletonButton from "./SkeletonButton.js";

class NoGridButton extends SkeletonButton{
    constructor(p, x, y, onNoGrid, toggleable) {
        super(p, x, y, onNoGrid, toggleable);
    }
    draw() {
        super.draw();
        const margin = 10;
        this.p.stroke(75, 85, 99); // text-gray-600
        this.p.strokeWeight(1);
        this.p.noFill();
        this.p.rect(this.x + margin, this.y + margin, this.size - 2* margin, this.size - 2* margin);
    }
} export default NoGridButton;