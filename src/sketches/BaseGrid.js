class BaseGrid {
    constructor(p, xStart, yStart, gridSize) {
        this.p = p; // Reference to p5 instance
        this.xStart = xStart;
        this.yStart = yStart;
        this.gridSize = gridSize;
        this.snapThreshold = 10; // Default value, can be overridden
        this.strokeColor = 200;
        this.strokeWeight = 0.5;
    }

    // Initialize grid - placeholder to be overridden by subclasses
    initGrid() {
        throw new Error("initGrid() must be implemented in a subclass");
    }

    // Draw method - to be customized by subclasses
    draw() {
        throw new Error("draw() must be implemented in a subclass");
    }

    // Generic snapping logic
    getSnapPosition(mouseX, mouseY) {
        throw new Error("getSnapPosition() must be implemented in a subclass");
    }

    // Add other shared utilities or methods, if needed
    setSnapThreshold(threshold) {
        this.snapThreshold = threshold;
    }
    mousePressed(x,y) {return;}
    mouseReleased() {return;}
    mouseDragged(x,y) {return;}
}

export default BaseGrid;