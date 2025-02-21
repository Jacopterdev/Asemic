class MouseEventHandler {
    constructor(p, gridContext, points) {
        this.p = p; // Reference to p5 instance
        this.gridContext = gridContext; // GridContext to handle snapping
        this.points = points; // Array to store points
        this.draggingPoint = null; // Currently dragged point
        this.mouseDragStart = null; // Start position of mouse drag
        this.snapThreshold = 10; // Hover distance to detect points
        this.maxPoints = 16;
    }

    /**
     * Handles mouse pressed event.
     */
    handleMousePressed() {
        // Check if a point is hovered (to determine dragging or deleting)
        const hoveredPoint = this.getHoveredPoint(this.p.mouseX, this.p.mouseY);

        if (hoveredPoint) {
            this.draggingPoint = hoveredPoint; // Start dragging the point
            this.mouseDragStart = { x: this.p.mouseX, y: this.p.mouseY }; // Keep track of drag start position
        } else {

            if(this.points.length >= this.maxPoints)return;

            // If no point is hovered, add a new point
            const snapPosition = this.gridContext.getSnapPosition(this.p.mouseX, this.p.mouseY);

            if (snapPosition) {
                // If snapping occurs, create a new point at the snap position
                this.points.push({ x: snapPosition.x, y: snapPosition.y });
            } else {
                // Otherwise, create a free point at the mouse position
                this.points.push({ x: this.p.mouseX, y: this.p.mouseY });
            }
        }
    }

    /**
     * Handles mouse dragged event.
     */
    handleMouseDragged() {
        if (this.draggingPoint) {
            // Update the position of the dragged point
            const snapPosition = this.gridContext.getSnapPosition(this.p.mouseX, this.p.mouseY);

            if (snapPosition) {
                // Snap point to nearest grid position
                this.draggingPoint.x = snapPosition.x;
                this.draggingPoint.y = snapPosition.y;
            } else {
                // Update to the current raw mouse position
                this.draggingPoint.x = this.p.mouseX;
                this.draggingPoint.y = this.p.mouseY;
            }
        }
    }

    /**
     * Handles mouse released event.
     */
    handleMouseReleased() {
        const movementThreshold = 5; // Define a small threshold for detecting dragging

        if (this.draggingPoint) {
            // If dragging, stop at the final position
            const hasDragged = Math.sqrt(
                Math.pow(this.mouseDragStart.x - this.p.mouseX, 2) +
                Math.pow(this.mouseDragStart.y - this.p.mouseY, 2)
            ) > movementThreshold;

            if (hasDragged) {
                // End the dragging operation
                this.draggingPoint = null;
            } else {
                // If the movement is below the threshold, interpret it as a click
                const index = this.points.indexOf(this.draggingPoint);
                if (index !== -1) {
                    this.points.splice(index, 1); // Delete the clicked point
                }
                this.draggingPoint = null;
            }
        } else if (this.mouseDragStart) {
            // Check if the mouse was clicked (not dragged) to add or delete a point
            const clickedPoint = this.getHoveredPoint(this.mouseDragStart.x, this.mouseDragStart.y);

            if (clickedPoint) {
                const index = this.points.indexOf(clickedPoint);
                if (index !== -1) {
                    this.points.splice(index, 1); // Delete the clicked point
                }
            }
        }

        this.mouseDragStart = null; // Reset drag start position
    }

    /**
     * Check if the mouse is hovering over a point.
     * @param {number} mouseX - The x-coordinate of the mouse.
     * @param {number} mouseY - The y-coordinate of the mouse.
     * @returns {object|null} The hovered point or null if there is no point hovered.
     */
    getHoveredPoint(mouseX, mouseY) {
        return this.points.find((point) => {
            const distance = Math.sqrt(
                Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
            );
            return distance <= this.snapThreshold; // Check if mouse is within snap threshold
        });
    }
}

export default MouseEventHandler;
