import SkeletonButton from "./SkeletonButton.js";

class RadialGridButton extends SkeletonButton{
    constructor(p, x, y, onRadialGrid, toggleable) {
        super(p, x, y, onRadialGrid, toggleable);
    }
    draw() {
        super.draw();
        // Draw the miniature radial grid icon
        const p = this.p; // p5 instance
        const margin = 8; // Amount of margin around the icon

        // Adjust the center to account for the margin
        const centerX = this.x + this.size / 2; // Center X within the button
        const centerY = this.y + this.size / 2; // Center Y within the button
        const maxRadius = this.size / 2 - margin; // Adjust radius for margin
        const radius = maxRadius / 3; // Base size for concentric rings

        this.p.stroke(75, 85, 99); // text-gray-600
        this.p.strokeWeight(1);
        this.p.noFill();

        // Draw concentric circles with margin applied
        for (let i = 1; i <= 2; i++) {
            p.ellipse(centerX, centerY, 2* radius * i, 2* radius * i);
        }

        // Draw radial lines with margin applied
        const numLines = 4; // Number of radial lines
        for (let i = 0; i < numLines; i++) {
            const angle = (p.TWO_PI / numLines) * i;

            // Adjust line endpoint to respect the margin
            const lineX = centerX + Math.cos(angle) * maxRadius;
            const lineY = centerY + Math.sin(angle) * maxRadius;

            p.line(centerX, centerY, lineX, lineY);
        }

    }
}export default RadialGridButton;