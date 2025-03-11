class DownloadButton {
    constructor(p, x, y, letter) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.letter = letter;
        
        // Fixed size properties
        this.size = 24;
        this.margin = 8;
        
        this.isVisible = true;
        this.isHovered = false;
    }
    
    update(x, y) {
        this.x = x;
        this.y = y;
        
        // Check if mouse is over this button
        const centerX = this.x + this.size/2;
        const centerY = this.y + this.size/2;
        const distance = Math.sqrt(Math.pow(this.p.mouseX - centerX, 2) + Math.pow(this.p.mouseY - centerY, 2));
        this.isHovered = distance <= this.size/2;
    }
    
    draw() {
        if (!this.isVisible) return;
        
        const p = this.p;
        
        // Draw circular button background
        p.noStroke();
        p.fill(this.isHovered ? '#4285F4' : '#5A9AF8');
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
    }
    
    isClicked(mx, my) {
        if (!this.isVisible) return false;
        
        const centerX = this.x + this.size/2;
        const centerY = this.y + this.size/2;
        const distance = Math.sqrt(Math.pow(mx - centerX, 2) + Math.pow(my - centerY, 2));
        
        return distance <= this.size/2;
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