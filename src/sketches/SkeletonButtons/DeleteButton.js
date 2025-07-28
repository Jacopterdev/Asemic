import SkeletonButton from "./SkeletonButton.js";
import {SPACING as LAYOUT} from "../States/LayoutConstants.js";

class DeleteButton extends SkeletonButton{
    constructor(p, x, y, onDelete) {
        super(p, x, y, onDelete);
    }

    draw(){
        const size = this.size;
        const iconX = this.x;
        const iconY = this.y;
        //Draw the backdrop.
        super.draw();

        // Draw trash can icon in text-gray-600 color (rgb(75, 85, 99))
        this.p.stroke(75, 85, 99); // text-gray-600
        this.p.strokeWeight(1);
        this.p.noFill();

        // Keep icon size the same - just centered in the larger button
        const iconSize = 18; // Icon size (unchanged)
        const margin = (size - iconSize) / 2; // Center the icon
        const trashWidth = iconSize * 0.6;
        const trashHeight = iconSize * 0.5;
        const trashX = iconX + (size - trashWidth) / 2;
        const trashY = iconY + margin + size * 0.15;

        // Trash can body
        this.p.rect(trashX, trashY, trashWidth, trashHeight, 1);

        // Trash can lid
        const lidWidth = trashWidth * 1.1;
        const lidHeight = size * 0.05;
        const lidX = iconX + (size - lidWidth) / 2;
        const lidY = trashY - lidHeight - 1;
        this.p.line(lidX, lidY, lidX + lidWidth, lidY);

        // Handle on lid
        const handleWidth = lidWidth * 0.2;
        const handleHeight = size * 0.05;
        const handleX = iconX + (size - handleWidth) / 2;
        const handleY = lidY - handleHeight;
        this.p.rect(handleX, handleY, handleWidth, handleHeight, 1);
    }

} export default DeleteButton;