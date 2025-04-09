// MutantButton.js
import {SPACING as LAYOUT} from "./States/LayoutConstants";

class MutantButton {
    constructor(p, x, y, letter, parentSize) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.size = 24; // Match DownloadButton size
        this.margin = 8; // Match DownloadButton margin
        this.letter = letter;
        this.isHovered = false;
        this.isVisible = true;
        this.parentSize = parentSize;
        this.animationOffset = 0;

    }

    // Helper method to calculate button position within a cell
    static positionInCell(cell, scrollOffset = 0) {
        // Position the mutant button in the top-right corner (different from download button)
        return {
            x: cell.x + cell.w - (24 + 8), // size + margin
            y: cell.y + scrollOffset + 8, // margin
        };
    }

    draw() {
        if (!this.isVisible) return;

        const p = this.p;

        // Update hover state
        const centerX = this.x + this.size/2;
        const centerY = this.y + this.size/2;

        // Update hover state - check if mouse is within parent
        const parentLeft = this.x - (this.parentSize) + this.size;
        const parentTop = this.y;
        const parentRight = this.x + this.size;
        const parentBottom = this.y + this.parentSize  - (2*LAYOUT.BUTTON_SIZE);

        // Update hover state - check if mouse is within parent
        this.isHovered = p.mouseX >= parentLeft && p.mouseX <= parentRight &&
            p.mouseY >= parentTop && p.mouseY <= parentBottom;

        // Draw circular button background
        p.noStroke();
        if (this.isHovered) {
            // Animate the stroke color when hovered
            this.animationOffset += 0.05; // Control animation speed

            // Create a pulsing effect between two orange shades
            const pulseValue = p.sin(this.animationOffset) * 40; // -40 to 40 range
            const r = 255;
            const g = 127 + pulseValue; // Pulsing between 87-167
            const b = 0 + pulseValue/2; // Slight blue variation for depth

            p.stroke(r, g, b);
            p.cursor(p.HAND);

            const strokePulse = 1.5 + p.sin(this.animationOffset) * 0.5; // Oscillates between 1-2
            p.strokeWeight(strokePulse);

        } else {
            p.stroke(64, 64, 64, 64); // Matching DownloadButton normal color with transparency
            p.strokeWeight(2); // Regular strokeWeight
            // Reset animation when not hovered

            // Reset animation when not hovered
            this.animationOffset = 0;
        }

        p.noFill();

        const iconSize = this.size * 0.6;
        const halfSize = iconSize / 2;

// Define the diagonal corners
        const topLeft = {x: centerX - halfSize+3, y: centerY - halfSize};
        const bottomRight = {x: centerX + halfSize-3, y: centerY + halfSize};
        const topRight = {x: centerX + halfSize-3, y: centerY - halfSize};
        const bottomLeft = {x: centerX - halfSize+3, y: centerY + halfSize};

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
        p.line(centerX - rungOffset+2, centerY - rungOffset, centerX-2 + rungOffset, centerY - rungOffset);
        p.line(centerX - rungOffset+2, centerY + rungOffset, centerX-2 + rungOffset, centerY + rungOffset);
    }

    // Check if a point is inside the button
    isPointInside(px, py) {
        const centerX = this.x + this.size/2;
        const centerY = this.y + this.size/2;
        const distance = Math.sqrt(Math.pow(px - centerX, 2) + Math.pow(py - centerY, 2));
        return distance <= this.size/2;
    }

    // Handle click event
    handleClick() {
        if (this.isHovered) {
            // Return the letter to trigger mutant shopping in the parent component
            return this.letter;
        }
        return null;
    }

    // Added for consistency with DownloadButton
    isClicked(mx, my) {
        if (!this.isVisible) return false;
        return this.isPointInside(mx, my);
    }

    update(x, y) {
        this.x = x;
        this.y = y;

        // Calculate parent bounds
        const parentLeft = this.x - this.parentSize + this.size;
        const parentTop = this.y;
        const parentRight = this.x + this.size;
        const parentBottom = this.y + this.parentSize - (2*LAYOUT.BUTTON_SIZE);

        // Check if mouse is within parent
        this.isHovered = this.p.mouseX >= parentLeft && this.p.mouseX <= parentRight &&
            this.p.mouseY >= parentTop && this.p.mouseY <= parentBottom;

    }
}

export default MutantButton;