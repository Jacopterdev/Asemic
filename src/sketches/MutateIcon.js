// MutantButton.js
import {SPACING as LAYOUT} from "./States/LayoutConstants";

class MutantButton {
    constructor(p, x, y) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.size = 24; // Match DownloadButton size
        this.margin = 8; // Match DownloadButton margin

        this.animationOffset = 0;

    }


    draw() {
        const p = this.p;

        // Update hover state
        const centerX = this.x + this.size/2;
        const centerY = this.y + this.size/2;
        // Draw circular button background
        p.noStroke();
        // Animate the stroke color when hovered
        this.animationOffset += 0.05; // Control animation speed

        // Create a pulsing effect between two orange shades
        const pulseValue = p.sin(this.animationOffset) * 40; // -40 to 40 range
        const r = 255;
        const g = 127 + pulseValue; // Pulsing between 87-167
        const b = 0 + pulseValue / 2; // Slight blue variation for depth

        p.stroke(r, g, b);

        const strokePulse = 1.5 + p.sin(this.animationOffset) * 0.5; // Oscillates between 1-2
        p.strokeWeight(strokePulse);


        p.noFill();

        const iconSize = this.size * 0.6;
        const halfSize = iconSize / 2;

        const animOffset = 5 + p.sin(this.animationOffset) * 1.5;


// Define the diagonal corners
        const topLeft = {x: centerX - halfSize+animOffset, y: centerY - halfSize};
        const bottomRight = {x: centerX + halfSize-animOffset, y: centerY + halfSize};
        const topRight = {x: centerX + halfSize-animOffset, y: centerY - halfSize};
        const bottomLeft = {x: centerX - halfSize+animOffset, y: centerY + halfSize};

// Control points slightly offset vertically
        const controlOffset = iconSize / 2.3;

// First strand (top-left to bottom-right)
        p.noFill();
        p.beginShape();
        p.vertex(topLeft.x, topLeft.y);
        p.bezierVertex(
            topLeft.x, topLeft.y + controlOffset, // slightly below top-left
            bottomRight.x, bottomRight.y - controlOffset, // slightly above bottom-right
            bottomRight.x, bottomRight.y
        );
        p.endShape();

// Second strand (top-right to bottom-left), symmetrical around vertical axis
        p.beginShape();
        p.vertex(topRight.x, topRight.y);
        p.bezierVertex(
            topRight.x, topRight.y + controlOffset, // slightly below top-right
            bottomLeft.x, bottomLeft.y - controlOffset, // slightly above bottom-left
            bottomLeft.x, bottomLeft.y
        );
        p.endShape();

        p.strokeWeight(1);
// Rungs connecting horizontally at 1/3 and 2/3 positions along diagonal
        const rungOffset = iconSize / 3;
        p.line(centerX - rungOffset+animOffset, centerY - rungOffset, centerX-animOffset + rungOffset, centerY - rungOffset);
        p.line(centerX - rungOffset+animOffset, centerY + rungOffset, centerX-animOffset + rungOffset, centerY + rungOffset);
    }
}

export default MutantButton;