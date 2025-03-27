class MouseEventHandler {
    constructor(p, gridContext, points, lineManager, possibleLinesRenderer, pointRenderer, onStateChange = null) {
        this.p = p; // Reference to p5 instance
        this.gridContext = gridContext; // GridContext to handle snapping
        this.points = points; // Array to store points
        this.lineManager = lineManager; // Reference to the LineManager
        this.possibleLinesRenderer = possibleLinesRenderer; // Reference to the PossibleLinesRenderer
        this.pointRenderer = pointRenderer; // Reference to the PointRenderer
        this.onStateChange = onStateChange; // Callback for state changes
        
        this.draggingPoint = null; // Currently dragged point
        this.mouseDragStart = null; // Start position of mouse drag
        this.snapThreshold = 10; // Hover distance to detect points
        
        // Hover state tracking
        this.hoveredLine = null; // Currently hovered line
        this.isDragging = false; // Flag for drag operations
        
        // Operation tracking
        this.didAddPoint = false; // Track if a point was added
        this.didAddLine = false; // Track if a line was added
        this.didRemovePoint = false; // Track if a point was removed
        this.didRemoveLine = false; // Track if a line was removed
        
        // Tool management
        this.toolMode = "connectToOne"; // Default tool
        this.lastAddedPoint = null; // For connect-to-one tool
    }
    
    /**
     * Set the current tool mode
     * @param {String} mode - The tool mode ("eraser", "connectToOne", "connectWithoutCrossing", "connectToAll")
     */
    setToolMode(mode) {
        this.toolMode = mode;
        console.log(`Tool mode set to: ${mode}`);
        
        // Reset the last added point when switching tools
        if (mode !== "connectToOne") {
            this.lastAddedPoint = null;
        }
    }
    
    /**
     * Handles mouse pressed event based on the current tool mode
     */
    handleMousePressed() {
        if (!this.isInCanvas()) return;
        
        // Record state at the beginning of any mouse interaction
        if (this.onStateChange) this.onStateChange("start");
        
        // Determine if mouse is over an existing point
        const hoveredPoint = this.getHoveredPoint(this.p.mouseX, this.p.mouseY);
        
        // ERASER TOOL MODE
        if (this.toolMode === "eraser") {
            if (hoveredPoint) {
                // Remove point and its associated lines
                this.removePoint(hoveredPoint);
                this.didRemovePoint = true;
                return true;
            }
            
            // Check if hovering over a line to erase
            const hoveredLine = this.getHoveredLine(this.p.mouseX, this.p.mouseY);
            if (hoveredLine) {
                this.lineManager.removeLine(hoveredLine);
                this.didRemoveLine = true;
                return true;
            }
            
            // Nothing was removed
            return false;
        }
        
        // CONNECT-TO-ONE TOOL MODE
        else if (this.toolMode === "connectToOne") {
            // If hovering over an existing point
            if (hoveredPoint) {
                // If we have a last point and it's not the same as this point
                if (this.lastAddedPoint && this.lastAddedPoint.id !== hoveredPoint.id) {
                    // Add a line between lastAddedPoint and hoveredPoint
                    this.lineManager.addLine(this.lastAddedPoint, hoveredPoint, true);
                    this.didAddLine = true;
                }
                
                // Update the last added point to this one
                this.lastAddedPoint = hoveredPoint;
                
                    // Set up dragging (both properties need to be set)
    this.draggingPoint = hoveredPoint;
    this.mouseDragStart = { x: this.p.mouseX, y: this.p.mouseY };
    this.isDragging = false;

                return true;
            } 
            
            // Check if clicking on a line (to split it)
            const hoveredLine = this.getHoveredLine(this.p.mouseX, this.p.mouseY);
            if (hoveredLine) {
                // Create a new point at the position where the line was clicked
                const projectedPoint = this.getProjectedPointOnLine(
                    this.p.mouseX, this.p.mouseY, hoveredLine
                );
                
                // Get the snapped position if grid snapping is active
                const snapPosition = this.gridContext.getSnapPosition(projectedPoint.x, projectedPoint.y);
                
                // Use the snapped position or the projected point
                const newPointPosition = snapPosition || projectedPoint;
                
                // Create the new point
                const newPoint = this.createPoint(newPointPosition.x, newPointPosition.y);
                this.points.push(newPoint);
                this.didAddPoint = true;
                
                // Remove the original line
                this.lineManager.removeLine(hoveredLine);
                
                // Add two new lines connecting the original endpoints to the new point
                this.lineManager.addLine(hoveredLine.start, newPoint, true);
                this.lineManager.addLine(newPoint, hoveredLine.end, true);
                this.didAddLine = true;
                
                // Update last added point
                this.lastAddedPoint = newPoint;
                
                // Add pulse effect for the new point if available
                if (this.ephemeralLineAnimator) {
                    this.ephemeralLineAnimator.addPoint(newPoint);
                }
                
                return true;
            }
            
            // If not hovering over a point or line, create a new point
            const snapPosition = this.gridContext.getSnapPosition(this.p.mouseX, this.p.mouseY);
            const newPoint = this.createPoint(
                snapPosition ? snapPosition.x : this.p.mouseX,
                snapPosition ? snapPosition.y : this.p.mouseY
            );
            
            // Add the new point
            this.points.push(newPoint);
            this.didAddPoint = true;
            
            // If we have a last point, connect it to the new point
            if (this.lastAddedPoint) {
                this.lineManager.addLine(this.lastAddedPoint, newPoint, true);
                this.didAddLine = true;
            }
            
            // Update last added point
            this.lastAddedPoint = newPoint;
            
            // Add pulse effect for the new point if available
            if (this.ephemeralLineAnimator) {
                this.ephemeralLineAnimator.addPoint(newPoint);
            }
            
            return true;
        }
        
        // Other tools will be implemented later
        // Default behavior for now: allow dragging points
        else {
            if (hoveredPoint) {
                console.log("Starting drag operation"); // Debug output
                this.draggingPoint = hoveredPoint;
                this.mouseDragStart = { x: this.p.mouseX, y: this.p.mouseY };
                this.isDragging = false;
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Calculate the projected point on a line where the mouse clicked
     * @param {Number} mouseX - X coordinate of mouse
     * @param {Number} mouseY - Y coordinate of mouse
     * @param {Object} line - The line object
     * @returns {Object} Projected point {x, y}
     */
    getProjectedPointOnLine(mouseX, mouseY, line) {
        const { x: x1, y: y1 } = line.start;
        const { x: x2, y: y2 } = line.end;
        
        // Calculate the projection
        const lineLength = this.p.dist(x1, y1, x2, y2);
        
        // Avoid division by zero for very short lines
        if (lineLength < 0.001) {
            return { x: x1, y: y1 };
        }
        
        // Calculate dot product for projection
        const dot = ((mouseX - x1) * (x2 - x1) + (mouseY - y1) * (y2 - y1)) / (lineLength * lineLength);
        
        // Clamp to line segment
        const t = Math.max(0, Math.min(1, dot));
        
        // Get the projected point
        const projectedX = x1 + t * (x2 - x1);
        const projectedY = y1 + t * (y2 - y1);
        
        return { x: projectedX, y: projectedY };
    }
    
    /**
     * Handles mouse dragged event
     */
    handleMouseDragged() {
        if (!this.isInCanvas()) return;
        
        // No dragging in eraser mode
        if (this.toolMode === "eraser") return;
        console.log("Dragging point"); // Debug output

        // Handle point dragging
        if (this.draggingPoint) {
            console.log("Dragging point:", this.draggingPoint.id); // Debug output
            
            // Update isDragging flag
            if (!this.isDragging) {
                const dragDistance = this.p.dist(
                    this.mouseDragStart.x, 
                    this.mouseDragStart.y, 
                    this.p.mouseX, 
                    this.p.mouseY
                );
                
                if (dragDistance > 3) {
                    this.isDragging = true;
                    // Change cursor while dragging
                    this.p.cursor(this.p.MOVE);
                }
            }
            
            // Update point position with snapping
            const snapPosition = this.gridContext.getSnapPosition(this.p.mouseX, this.p.mouseY);
            
            if (snapPosition) {
                this.draggingPoint.x = snapPosition.x;
                this.draggingPoint.y = snapPosition.y;
            } else {
                this.draggingPoint.x = this.p.mouseX;
                this.draggingPoint.y = this.p.mouseY;
            }
            
            return true; // Indicate event was handled
        }
        
        // Keep updating hover state during drag
        this.updateHoveredLine();
        return false; // Event not handled
    }
    
    /**
     * Handles mouse released event
     */
    handleMouseReleased() {
        if (!this.isInCanvas()) return;
        
        // Notify state change if we did something
        const didOperation = this.didAddPoint || this.didAddLine || this.didRemovePoint || this.didRemoveLine || this.isDragging;
        
        if (didOperation && this.onStateChange) {
            this.onStateChange("end");
        }
        
        // Reset dragging flags
        this.draggingPoint = null;
        this.mouseDragStart = null;
        this.isDragging = false;
        
        // Reset operation flags
        this.didAddPoint = false;
        this.didAddLine = false;
        this.didRemovePoint = false;
        this.didRemoveLine = false;
    }
    
    /**
     * Handles mouse moved event
     */
    handleMouseMoved() {
        if (!this.isInCanvas()) return;
        
        const hoveredPoint = this.getHoveredPoint(this.p.mouseX, this.p.mouseY);
        if (hoveredPoint) {
            this.p.cursor(this.p.HAND); // Change cursor to hand when over a point
        } else if (this.hoveredLine) {
            this.p.cursor(this.p.HAND); // Also change cursor when over a line
        } else {
            this.p.cursor(this.p.ARROW); // Reset cursor when not over interactive elements
        }
        
        this.updateHoveredLine();
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
            
            // If this was the last added point, clear that reference
            if (this.lastAddedPoint && this.lastAddedPoint.id === point.id) {
                this.lastAddedPoint = null;
            }
        }
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
    
    /**
     * Check if mouse is within canvas boundaries
     */
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
     * Helper method to create a point with a unique ID
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     * @returns {Object} New point object
     */
    createPoint(x, y) {
        return {
            id: Date.now() + Math.random().toString(36).substr(2, 9), // Generate unique ID
            x: x,
            y: y,
            selected: false // Points start unselected
        };
    }
    
    /**
     * Check if any point or line is hovered for cursor styling
     */
    getAnyHovered() {
        return this.getHoveredPoint(this.p.mouseX, this.p.mouseY) || this.hoveredLine;
    }
    
    /**
     * Set an ephemeral line animator for point creation effects
     */
    setEphemeralLineAnimator(animator) {
        this.ephemeralLineAnimator = animator;
    }
}

export default MouseEventHandler;
