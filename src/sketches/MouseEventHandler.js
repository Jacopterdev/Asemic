class MouseEventHandler {
    constructor(p, gridContext, points, lineManager, possibleLinesRenderer) {
        this.p = p; // Reference to p5 instance
        this.gridContext = gridContext; // GridContext to handle snapping
        this.points = points; // Array to store points
        this.lineManager = lineManager; // Reference to the LineManager
        this.possibleLinesRenderer = possibleLinesRenderer; // Reference to the PossibleLinesRenderer
        
        this.draggingPoint = null; // Currently dragged point
        this.mouseDragStart = null; // Start position of mouse drag
        this.snapThreshold = 10; // Hover distance to detect points
        this.maxPoints = 16;
        
        // No more selectedPoint, we only track hover state
        this.hoveredLine = null; // Currently hovered line
    }
    
    /**
     * Handles mouse pressed event.
     */
    handleMousePressed() {
        if (!this.isInCanvas()) {return;}
        
        // Determine if the mouse is over an existing point
        const hoveredPoint = this.getHoveredPoint(this.p.mouseX, this.p.mouseY);

        if (hoveredPoint) {
            // Set up for potential drag operation
            this.draggingPoint = hoveredPoint;
            this.mouseDragStart = { x: this.p.mouseX, y: this.p.mouseY };
            this.isDragging = false;
            return true;
        } else {
            // Check if we're clicking on a line
            const hoveredLine = this.getHoveredLine(this.p.mouseX, this.p.mouseY);
            
            // Only select the line if it's still visible (not faded out)
            if (hoveredLine && this.isLineHoverActive(hoveredLine)) {
                hoveredLine.selected = !hoveredLine.selected;
                this.hoveredLine = null;
                return true;
            }
            
            // If we're not clicking on a point or line, create a new point
            if (this.points.length < this.maxPoints) {
                // Rest of your point creation code remains the same...
                const snapPosition = this.gridContext.getSnapPosition(this.p.mouseX, this.p.mouseY);
                const newPoint = this.createPoint(
                    snapPosition ? snapPosition.x : this.p.mouseX,
                    snapPosition ? snapPosition.y : this.p.mouseY
                );
                
                this.points.push(newPoint);
                
                // Get the most recent point (exclude the one we just added)
                const previousPoints = this.points.filter(p => p.id !== newPoint.id);
                const mostRecentPoint = previousPoints.length > 0 ? 
                    previousPoints[previousPoints.length - 1] : null;
                
                // If shift is pressed, only connect visibly to the last added point
                if (this.p.keyIsDown(16)) { // 16 is the keyCode for shift
                    if (mostRecentPoint) {
                        // Connect to most recent point with visible line
                        this.lineManager.lines.push({
                            start: newPoint,
                            end: mostRecentPoint,
                            selected: true
                        });
                        
                        // Connect to all other points with invisible lines
                        previousPoints.forEach(point => {
                            if (point.id !== mostRecentPoint.id) {
                                this.lineManager.lines.push({
                                    start: newPoint,
                                    end: point,
                                    selected: false // Invisible line
                                });
                            }
                        });
                    }
                } else {
                    // Normal behavior: connect to all points with visible lines
                    this.lineManager.addLinesForPoint(newPoint, previousPoints);
                }
            }
            return true;
        }
    }
    
    /**
     * Remove a point and its associated lines
     * @param {Object} point - The point to remove
     */
    removePoint(point) {
        // Find the index of the point in the points array
        const pointIndex = this.points.findIndex(p => p.id === point.id);
        
        if (pointIndex !== -1) {
            // Remove the point from the points array
            this.points.splice(pointIndex, 1);
            
            // Remove any lines connected to this point
            this.lineManager.removePointLines(point);
        }
    }

    /**
     * Handles mouse moved event.
     */
    handleMouseMoved() {
        if (!this.isInCanvas()) {return;}
        this.updateHoveredLine();
    }

    /**
     * Handles mouse dragged event.
     */
    handleMouseDragged() {
        if (!this.isInCanvas()) {return;}
        
        if (this.draggingPoint && this.mouseDragStart) {
            // Calculate how far the mouse has moved
            const dragDistance = this.p.dist(
                this.mouseDragStart.x, 
                this.mouseDragStart.y, 
                this.p.mouseX, 
                this.p.mouseY
            );
            
            // If we've moved beyond a small threshold, consider this a drag operation
            if (dragDistance > 3) {
                this.isDragging = true;
            }
            
            // If a point is being dragged, update its position
            const snapPosition = this.gridContext.getSnapPosition(this.p.mouseX, this.p.mouseY);

            if (snapPosition) {
                this.draggingPoint.x = snapPosition.x;
                this.draggingPoint.y = snapPosition.y;
            } else {
                this.draggingPoint.x = this.p.mouseX;
                this.draggingPoint.y = this.p.mouseY;
            }
        }
        
        // Keep updating hover state during drag
        this.updateHoveredLine();
    }

    /**
     * Handles mouse released event.
     */
    handleMouseReleased() {
        if (!this.isInCanvas()) {return;}
        
        if (this.draggingPoint) {
            // If we didn't drag the point (just clicked it), delete it
            if (!this.isDragging) {
                this.removePoint(this.draggingPoint);
            }
        }
        
        // Reset dragging state
        this.draggingPoint = null;
        this.mouseDragStart = null; 
        this.isDragging = false;
    }
    
    /**
     * Updates the hoveredLine property for hover effects
     */
    updateHoveredLine() {
        this.hoveredLine = this.getHoveredLine(this.p.mouseX, this.p.mouseY);
    }
    
    /**
     * Get the currently hovered line for rendering hover effects
     */
    getHoveredLineForRendering() {
        return this.hoveredLine;
    }

    /**
     * Get the line under the mouse cursor
     * @param {Number} mouseX - Mouse x-coordinate
     * @param {Number} mouseY - Mouse y-coordinate
     * @returns {Object|null} The hovered line or null if none hovered
     */
    getHoveredLine(mouseX, mouseY) {
        const threshold = 8; // Distance threshold for line detection
        const lines = this.lineManager.getLines();
        
        // Find closest line to the mouse
        let closestLine = null;
        let minDistance = Infinity;
        
        lines.forEach(line => {
            // Calculate distance from point to line
            const { x: x1, y: y1 } = line.start;
            const { x: x2, y: y2 } = line.end;
            
            // Distance from point to line segment using vector projection
            const lineLength = this.p.dist(x1, y1, x2, y2);
            if (lineLength === 0) return; // Skip zero-length lines
            
            const d1 = this.p.dist(mouseX, mouseY, x1, y1);
            const d2 = this.p.dist(mouseX, mouseY, x2, y2);
            
            // Use the formula for distance from point to line segment
            let distance;
            
            // If point is outside the line segment endpoints, use distance to closest endpoint
            if (d1*d1 > lineLength*lineLength + d2*d2) {
                distance = d2; // Point is beyond end point
            } else if (d2*d2 > lineLength*lineLength + d1*d1) {
                distance = d1; // Point is beyond start point
            } else {
                // Point is beside the line segment, use perpendicular distance
                const dot = ((mouseX - x1) * (x2 - x1) + (mouseY - y1) * (y2 - y1)) / (lineLength * lineLength);
                const closestX = x1 + dot * (x2 - x1);
                const closestY = y1 + dot * (y2 - y1);
                distance = this.p.dist(mouseX, mouseY, closestX, closestY);
            }
            
            if (distance < minDistance && distance <= threshold) {
                minDistance = distance;
                closestLine = line;
            }
        });
        
        return closestLine;
    }

    isInCanvas() {
        const { xStart, yStart, gridSize } = this.gridContext.grid;
        // Check if the mouse position is within the canvas boundaries
        return (
            this.p.mouseX >= xStart &&
            this.p.mouseX <= xStart + gridSize &&
            this.p.mouseY >= yStart &&
            this.p.mouseY <= yStart + gridSize
        );
    }

    /**
     * Get the selected point.
     * @returns {Object|null} The selected point or null since we no longer have selection.
     */
    getSelectedPoint() {
        return null; // We no longer track selected points
    }

    // Helper method to create a point with a unique ID
    createPoint(x, y) {
        return {
            id: Date.now() + Math.random().toString(36).substr(2, 9), // Generate unique ID
            x: x,
            y: y,
            selected: false // Points start unselected
        };
    }

    /**
     * Get the point under the mouse cursor
     * @param {Number} mouseX - Mouse x-coordinate
     * @param {Number} mouseY - Mouse y-coordinate
     * @returns {Object|null} The hovered point or null if none hovered
     */
    getHoveredPoint(mouseX, mouseY) {
        // Find the first point that is being hovered
        return this.points.find(point => {
            const distance = this.p.dist(point.x, point.y, mouseX, mouseY);
            return distance <= this.snapThreshold;
        }) || null;
    }

    /**
     * Checks if a line's hover effect is still active (not faded out)
     * @param {Object} line - The line to check
     * @returns {Boolean} True if the line's hover is active
     */
    isLineHoverActive(line) {
        // We need access to the PossibleLinesRenderer to check the hover state
        if (!this.possibleLinesRenderer) {
            return true; // Default to true if we can't check
        }
        
        // Check if this line is the currently hovered line
        const currentHoveredLine = this.possibleLinesRenderer.currentHoveredLine;
        
        if (!currentHoveredLine) {
            return false; // No line is being hovered
        }
        
        // Check if this is the line we're checking
        const isThisLine = line.start.id === currentHoveredLine.start.id && 
                           line.end.id === currentHoveredLine.end.id;
        
        if (!isThisLine) {
            return false; // Not the hovered line
        }
        
        // Check if it's in the fade-out state and animation is complete
        const isFadingOut = !this.possibleLinesRenderer.hoverFadeIn;
        const isCompletelyFaded = isFadingOut && this.possibleLinesRenderer.hoverTransition <= 0;
        
        // Line is active if it's not completely faded out
        return !isCompletelyFaded;
    }
}

export default MouseEventHandler;
