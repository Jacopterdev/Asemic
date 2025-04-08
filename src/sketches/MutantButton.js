// MutantButton.js
import {SPACING as LAYOUT} from "./States/LayoutConstants";

class MutantButton {
    constructor(p, x, y, letter) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.size = 24; // Match DownloadButton size
        this.margin = 8; // Match DownloadButton margin
        this.letter = letter;
        this.isHovered = false;
        this.isVisible = true;
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
        const distance = Math.sqrt(Math.pow(p.mouseX - centerX, 2) + Math.pow(p.mouseY - centerY, 2));
        this.isHovered = distance <= this.size/2;

        // Draw circular button background
        p.noStroke();
        if (this.isHovered) {
            p.fill(255, 127, 0); // Matching DownloadButton hover color
            p.cursor(p.HAND);
        } else {
            p.fill(64, 64, 64, 64); // Matching DownloadButton normal color with transparency
            p.cursor(p.ARROW);
        }

        p.ellipse(centerX, centerY, this.size, this.size);

        // Draw DNA-like icon
        p.stroke(255); // White icon color like DownloadButton
        p.strokeWeight(2);
        p.noFill();

        // Draw a more simplified DNA helix - properly centered
        const iconSize = this.size * 0.4;


        p.beginShape();
        p.vertex(centerX - iconSize/2, centerY - iconSize/2);
        p.bezierVertex(
            centerX + iconSize/4, centerY - iconSize/4,
            centerX - iconSize/4, centerY + iconSize/4,
            centerX + iconSize/2, centerY + iconSize/2
        );
        p.endShape();

        // Second strand
        p.beginShape();
        p.vertex(centerX + iconSize/2, centerY - iconSize/2);
        p.bezierVertex(
            centerX - iconSize/4, centerY - iconSize/4,
            centerX + iconSize/4, centerY + iconSize/4,
            centerX - iconSize/2, centerY + iconSize/2
        );
        p.endShape();


        p.strokeWeight(2);
        // Draw connecting rungs - centered and properly spaced
        p.line(
            centerX-iconSize/3, centerY - iconSize/3,
            centerX-iconSize/3, centerY + iconSize/3
        );

        p.line(
            centerX+iconSize/3, centerY - iconSize/3,
            centerX+iconSize/3, centerY + iconSize/3
        );


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

        // Check if mouse is over this button
        const centerX = this.x + this.size/2;
        const centerY = this.y + this.size/2;
        const distance = Math.sqrt(Math.pow(this.p.mouseX - centerX, 2) + Math.pow(this.p.mouseY - centerY, 2));
        this.isHovered = distance <= this.size/2;

        //check for if the mouse is near the menu.
        // Close the menu if it's open but the mouse is not over the menu or button
        if (this.menu && this.menu.isVisible && !this.isHovered && !this.menu.isHovered()) {
            this.menu.close();
        }

    }
}

export default MutantButton;