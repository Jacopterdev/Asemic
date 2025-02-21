
class MouseEventHandler {
    constructor(p, gridContext, points, lineManager) {
        this.p = p; // Reference to p5 instance
        this.gridContext = gridContext; // GridContext to handle snapping
        this.points = points; // Array to store points
        this.lineManager = lineManager // Unified list of all lines

        this.draggingPoint = null; // Currently dragged point
        this.mouseDragStart = null; // Start position of mouse drag
        this.snapThreshold = 10; // Hover distance to detect points
        this.maxPoints = 16;

        this.toggledLines = new Set(); // Tracks toggled lines during a single drag

    }

    /**
     * Handles mouse pressed event.
     */
    handleMousePressed() {
        if (!this.isInCanvas()) {return;}
        // Determine if the mouse is over an existing point
        const hoveredPoint = this.getHoveredPoint(this.p.mouseX, this.p.mouseY);

        if (hoveredPoint) {
            // Start dragging this point
            this.draggingPoint = hoveredPoint;
            this.mouseDragStart = { x: this.p.mouseX, y: this.p.mouseY };

        } else {
            // Reset toggled lines for toggling interactions
            this.toggledLines.clear();
            this.mouseDragStart = { x: this.p.mouseX, y: this.p.mouseY }; // Track drag start position

        }
    }


    /**
     * Handles mouse dragged event.
     */
    handleMouseDragged() {
        if (!this.isInCanvas()) {return;}
        if (this.draggingPoint) {
            // If a point is being dragged, update its position
            const snapPosition = this.gridContext.getSnapPosition(this.p.mouseX, this.p.mouseY);

            if (snapPosition) {
                this.draggingPoint.x = snapPosition.x;
                this.draggingPoint.y = snapPosition.y;
            } else {
                this.draggingPoint.x = this.p.mouseX;
                this.draggingPoint.y = this.p.mouseY;
            }
        } else{
            // If no point is being dragged, toggle line selection
            const hoveredLine = this.getHoveredLine(this.p.mouseX, this.p.mouseY);
            console.log("hoveredLine: ", hoveredLine);

            if (hoveredLine) {
                // Use an identifier for toggling the selection state of lines
                const lineId = `${hoveredLine.start.x},${hoveredLine.start.y}-${hoveredLine.end.x},${hoveredLine.end.y}`;

                // Avoid toggling the same line multiple times during a single drag
                if (!this.toggledLines.has(lineId)) {
                    hoveredLine.selected = !hoveredLine.selected; // Toggle selection
                    console.log("toggled a line");
                    this.toggledLines.add(lineId); // Mark as toggled
                }
            }
        }
    }

    /**
     * Handles mouse released event.
     */
    handleMouseReleased() {
        if (!this.isInCanvas()) {return;}
        const movementThreshold = 5; // Threshold to decide between dragging and clicking

        if (this.draggingPoint) {
            // Check if a drag occurred or if it was just a click
            const hasDragged = Math.sqrt(
                Math.pow(this.mouseDragStart.x - this.p.mouseX, 2) +
                Math.pow(this.mouseDragStart.y - this.p.mouseY, 2)
            ) > movementThreshold;

            if (!hasDragged) {
                // If no significant drag, delete the clicked point
                const index = this.points.indexOf(this.draggingPoint);
                if (index !== -1) {
                    // Remove lines involving this point
                    this.lineManager.removeLinesForPoint(this.draggingPoint);
                    this.points.splice(index, 1); // Remove the point
                }
            }


            // Reset dragging state
            this.draggingPoint = null;
        } else {
            // Check if the release was a significant drag
            const hasDragged = Math.sqrt(
                Math.pow(this.mouseDragStart.x - this.p.mouseX, 2) +
                Math.pow(this.mouseDragStart.y - this.p.mouseY, 2)
            ) > movementThreshold;

            const hoveredPoint = this.getHoveredPoint(this.p.mouseX, this.p.mouseY);
            if (!hoveredPoint && this.toggledLines.size === 0) {
                // Only add a new point if we didn't hover over an existing one
                if (this.points.length < this.maxPoints) {
                    const snapPosition = this.gridContext.getSnapPosition(this.p.mouseX, this.p.mouseY);
                    const newPoint = snapPosition
                        ? { x: snapPosition.x, y: snapPosition.y }
                        : { x: this.p.mouseX, y: this.p.mouseY };
                    this.points.push(newPoint);
                    this.lineManager.addLinesForPoint(newPoint, this.points); // Add lines for the new point
                }
            }
        }
        // Reset drag state and toggled lines
        this.mouseDragStart = null;
        this.toggledLines.clear();
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

    /**
     * Retrieves hovered line information by delegating to the LineManager.
     */
    getHoveredLine(mouseX, mouseY) {
        const threshold = 0.01;
        const lines = this.lineManager.getLines(); // Get current lines from LineManager

        return lines.find((line) => {
            const { x: x1, y: y1 } = line.start;
            const { x: x2, y: y2 } = line.end;

            const d1 = this.p.dist(x1, y1, mouseX, mouseY);
            const d2 = this.p.dist(x2, y2, mouseX, mouseY);
            const lineLength = this.p.dist(x1, y1, x2, y2);

            return Math.abs(d1 + d2 - lineLength) <= threshold; // Check if near line
        });
    }

    isInCanvas() {
        console.log(this.gridContext.grid);
        const { xStart, yStart, gridSize } = this.gridContext.grid;
        console.log(xStart, yStart, gridSize);

        // Check if the mouse position is within the canvas boundaries
        return (
            this.p.mouseX >= xStart &&
            this.p.mouseX <= xStart + gridSize &&
            this.p.mouseY >= yStart &&
            this.p.mouseY <= yStart + gridSize
        );
    }


}

export default MouseEventHandler;
