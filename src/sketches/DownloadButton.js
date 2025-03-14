import ExportMenu from "./ExportMenu.js";

class DownloadButton {
    constructor(p, x, y, letter, svg=false) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.letter = letter;
        
        // Fixed size properties
        this.size = 24;
        this.margin = 8;
        
        this.isVisible = true; // Default to not visible
        this.isHovered = false;

        this.svgAvailable = svg;
        this.selectedOption = null;

        // Create a menu instance if SVG is available
        this.menu = this.svgAvailable
            ? new ExportMenu(this.p, this, [
                { label: "PNG", type: "png" },
                { label: "SVG", type: "svg" },
            ])
            : null;

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
    
    draw() {
        if (!this.isVisible) return;
        
        const p = this.p;

        // Draw circular button background - grey by default
        p.noStroke();
        //p.fill(this.isHovered ? '#FFA500' : '#888888'); // Grey when not hovered
        if(this.isHovered){
            p.fill(255,127,0);
        } else {
            p.fill(64,64,64,64);
        }
        if(this.isHovered){
            this.p.cursor(this.p.HAND);
        } else {
            this.p.cursor(this.p.ARROW);
        }

        p.ellipse(this.x + this.size/2, this.y + this.size/2, this.size, this.size);
        
        // Draw download icon (arrow pointing down)
        p.stroke(255);
        p.strokeWeight(2);
        p.noFill();
        
        // Calculate icon positions based on button size
        const centerX = this.x + this.size/2;
        const centerY = this.y + this.size/2;
        const arrowSize = this.size * 0.4;
        
        // Draw vertical line of arrow
        p.line(centerX, centerY - arrowSize/2, centerX, centerY + arrowSize/2);
        
        // Draw arrow head
        p.line(centerX - arrowSize/3, centerY + arrowSize/4, centerX, centerY + arrowSize/2);
        p.line(centerX + arrowSize/3, centerY + arrowSize/4, centerX, centerY + arrowSize/2);
        
        p.strokeWeight(1);

        // If the menu is open, draw the selection menu
        if (this.menu) {
            this.menu.draw();
        }

    }

    isClicked(mx, my) {
        if (!this.isVisible) return false;

        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        const distance = Math.sqrt(Math.pow(mx - centerX, 2) + Math.pow(my - centerY, 2));

        if (distance <= this.size / 2) {
            if (this.menu) {
                this.menu.open();
            } else {return true;}
        }


        // Check if menu is open and if a menu option is clicked
        // If clicked on the menu, handle menu action
        if (this.menu && this.menu.isHovered()) {
            const selectedOption = this.menu.handleClick();
            if (selectedOption) {
                this.selectedOption = selectedOption;
                return true;
            }
        }
        return false; // Button or menu was not clicked
    }

    getSelectedOption(){
        return this.selectedOption;
    }


    // Helper method to position button in bottom right corner of a cell
    static positionInCell(cell, scrollOffset = 0) {
        const size = 24;
        const margin = 8;
        
        return {
            x: cell.x + cell.w - size - margin,
            y: cell.y + scrollOffset + cell.h - size - margin
        };
    }

}

export default DownloadButton;