import SkeletonButton from "./SkeletonButton.js";

class RectGridButton extends SkeletonButton
     {
         constructor(p, x, y, onRadialGrid, toggleable) {
             super(p, x, y, onRadialGrid, toggleable);
         }

         draw(){
             super.draw();

             const size = this.size;
             const iconX = this.x;
             const iconY = this.y;

             this.p.stroke(75, 85, 99); // text-gray-600
             this.p.strokeWeight(1);
             this.p.noFill();
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

         }
     } export default RectGridButton;