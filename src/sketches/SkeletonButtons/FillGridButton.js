import SkeletonButton from "./SkeletonButton.js";
import {SPACING as LAYOUT} from "../States/LayoutConstants.js";

class FillGridButton extends SkeletonButton{
    constructor(p, x, y, onFillGrid) {
        super(p, x, y, onFillGrid);
    }

    draw(){
        const size = this.size;
        const iconX = this.x;
        const iconY = this.y;

        super.draw();

        // Draw grid fill icon in text-gray-600 color (rgb(75, 85, 99))
        this.p.stroke(75, 85, 99); // text-gray-600
        this.p.strokeWeight(1);
        this.p.noFill();

        // Keep icon size the same - just centered in the larger button
        const iconSize = 18; // Icon size
        const gridSize = iconSize * 0.8;
        const gridX = iconX + (size - gridSize) / 2;
        const gridY = iconY + (size - gridSize) / 2;

        // Draw grid outline
        this.p.rect(gridX, gridY, gridSize, gridSize, 1);

        // Draw grid lines
        const cellSize = gridSize / 2;

        // Vertical line
        this.p.line(gridX + cellSize, gridY, gridX + cellSize, gridY + gridSize);

        // Horizontal line
        this.p.line(gridX, gridY + cellSize, gridX + gridSize, gridY + cellSize);

        // Draw points at the intersections
        this.p.noStroke();
        this.p.fill(75, 85, 99); // text-gray-600
        const dotSize = 2; // Small dots

        // Draw points at intersections
        for (let i = 0; i <= 2; i++) {
            for (let j = 0; j <= 2; j++) {
                this.p.ellipse(
                    gridX + i * cellSize,
                    gridY + j * cellSize,
                    dotSize,
                    dotSize
                );
            }
        }
    }
} export default FillGridButton;