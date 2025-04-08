class MouseEventHandler {
    constructor(p, gridContext, points, lineManager, possibleLinesRenderer, onStateChange = null) {
        this.p = p; // Reference to p5 instance
        this.gridContext = gridContext; // GridContext to handle snapping
        this.points = points; // Array to store points
        this.lineManager = lineManager; // Reference to the LineManager
        this.possibleLinesRenderer = possibleLinesRenderer; // Reference to the PossibleLinesRenderer
        this.onStateChange = onStateChange; // Callback for state changes
        
        this.draggingPoint = null; // Currently dragged point
        this.mouseDragStart = null; // Start position of mouse drag
        this.snapThreshold = 18; // Hover distance to detect points
        
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
        this.selectedPoint = null; // Currently selected point (for highlighting and deletion)

        // Add these new properties for line previewing
        this.previewLines = []; // Array to store preview lines
        this.previewPoint = null; // Virtual point for previews

        this.connectionRadius = 150; // Default connection radius for connectToNearest tool
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
        // Clear preview lines when interacting
        this.previewLines = [];

        if (!this.isInCanvas()) return;
        
        // Record state at the beginning of any mouse interaction
        if (this.onStateChange) this.onStateChange("start");
        
        // Determine if mouse is over an existing point
        const hoveredPoint = this.getHoveredPoint(this.p.mouseX, this.p.mouseY);
        
        // Update selected point
        if (hoveredPoint) {
            this.selectedPoint = hoveredPoint;
        }
        
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
                this.selectedPoint = newPoint; // Make sure to set this as the selected point
                
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
            this.selectedPoint = newPoint; // Set as selected point too

            // Add pulse effect for the new point if available
            if (this.ephemeralLineAnimator) {
                this.ephemeralLineAnimator.addPoint(newPoint);
            }
            
            return true;
        }
        
        // CONNECT-TO-ALL TOOL MODE
        else if (this.toolMode === "connectToAll") {
            // If hovering over an existing point, connect it to all other points
            if (hoveredPoint) {
                // Get all points except the hovered one
                const otherPoints = this.points.filter(p => p.id !== hoveredPoint.id);
                
                // Add lines from this point to all other points
                if (otherPoints.length > 0) {
                    const addedLines = this.lineManager.addLinesForPoint(hoveredPoint, otherPoints, true);
                    this.didAddLine = addedLines; // Set to true if any lines were added
                }
                
                // Set as selected point and allow dragging
                this.selectedPoint = hoveredPoint;
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
                
                // Connect the new point to all other points
                const otherPoints = this.points.filter(p => 
                    p.id !== newPoint.id && 
                    p.id !== hoveredLine.start.id && 
                    p.id !== hoveredLine.end.id
                );
                this.lineManager.addLinesForPoint(newPoint, otherPoints, true);
                this.didAddLine = true;
                
                // Update last added point and selected point
                this.selectedPoint = newPoint;
                
                // Add pulse effect for the new point if available
                if (this.ephemeralLineAnimator) {
                    this.ephemeralLineAnimator.addPoint(newPoint);
                }
                
                return true;
            }
            
            // If not hovering over a point or line, create a new point and connect to all others
            const snapPosition = this.gridContext.getSnapPosition(this.p.mouseX, this.p.mouseY);
            const newPoint = this.createPoint(
                snapPosition ? snapPosition.x : this.p.mouseX,
                snapPosition ? snapPosition.y : this.p.mouseY
            );
            
            // Add the new point
            this.points.push(newPoint);
            this.didAddPoint = true;
            
            // Connect the new point to all other existing points
            if (this.points.length > 1) {
                const otherPoints = this.points.filter(p => p.id !== newPoint.id);
                this.lineManager.addLinesForPoint(newPoint, otherPoints, true);
                this.didAddLine = true;
            }
            
            // Set as selected point
            this.selectedPoint = newPoint;
            
            // Add pulse effect for the new point if available
            if (this.ephemeralLineAnimator) {
                this.ephemeralLineAnimator.addPoint(newPoint);
            }
            
            return true;
        }
        
        // CONNECT-WITHOUT-CROSSING TOOL MODE
        else if (this.toolMode === "connectWithoutCrossing") {
            // If hovering over an existing point
            if (hoveredPoint) {
                // Get all points except the hovered one
                const otherPoints = this.points.filter(p => p.id !== hoveredPoint.id);
                
                // Try to connect to all other points, skipping those that would create crossings
                if (otherPoints.length > 0) {
                    let addedAtLeastOneLine = false;
                    
                    // Try connecting to each point
                    otherPoints.forEach(otherPoint => {
                        // Skip if line already exists
                        if (this.lineManager.lineExists(hoveredPoint, otherPoint)) {
                            return;
                        }
                        
                        // Check if this connection would cross any existing lines
                        const wouldCross = this.wouldLineCrossExisting(hoveredPoint, otherPoint);
                        
                        // Add line if it won't cause crossings
                        if (!wouldCross) {
                            this.lineManager.addLine(hoveredPoint, otherPoint, true);
                            addedAtLeastOneLine = true;
                        }
                    });
                    
                    this.didAddLine = addedAtLeastOneLine;
                }
                
                // Set up dragging and selection
                this.draggingPoint = hoveredPoint;
                this.mouseDragStart = { x: this.p.mouseX, y: this.p.mouseY };
                this.isDragging = false;
                this.selectedPoint = hoveredPoint;
                
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
                
                // Now try to connect to all other points without crossing
                const otherPoints = this.points.filter(p => 
                    p.id !== newPoint.id && 
                    p.id !== hoveredLine.start.id && 
                    p.id !== hoveredLine.end.id
                );
                
                // Try connecting to each point that doesn't cause crossings
                otherPoints.forEach(otherPoint => {
                    // Check if this connection would cross any existing lines
                    const wouldCross = this.wouldLineCrossExisting(newPoint, otherPoint);
                    
                    // Add line if it won't cause crossings
                    if (!wouldCross) {
                        this.lineManager.addLine(newPoint, otherPoint, true);
                    }
                });
                
                this.didAddLine = true;
                this.selectedPoint = newPoint;
                
                // Add pulse effect for the new point if available
                if (this.ephemeralLineAnimator) {
                    this.ephemeralLineAnimator.addPoint(newPoint);
                }
                
                return true;
            }
            
            // If not hovering over a point or line, create a new point and connect without crossing
            const snapPosition = this.gridContext.getSnapPosition(this.p.mouseX, this.p.mouseY);
            const newPoint = this.createPoint(
                snapPosition ? snapPosition.x : this.p.mouseX,
                snapPosition ? snapPosition.y : this.p.mouseY
            );
            
            // Add the new point
            this.points.push(newPoint);
            this.didAddPoint = true;
            
            // Connect to all other points that won't cause crossings
            if (this.points.length > 1) {
                const otherPoints = this.points.filter(p => p.id !== newPoint.id);
                
                // Try connecting to each point
                otherPoints.forEach(otherPoint => {
                    // Check if this connection would cross any existing lines
                    const wouldCross = this.wouldLineCrossExisting(newPoint, otherPoint);
                    
                    // Add line if it won't cause crossings
                    if (!wouldCross) {
                        this.lineManager.addLine(newPoint, otherPoint, true);
                    }
                });
                
                this.didAddLine = true;
            }
            
            // Update selected point
            this.selectedPoint = newPoint;
            
            // Add pulse effect for the new point if available
            if (this.ephemeralLineAnimator) {
                this.ephemeralLineAnimator.addPoint(newPoint);
            }
            
            return true;
        }

        // CONNECT-TO-NEAREST TOOL MODE
        else if (this.toolMode === "connectToNearest") {
            // Define the connection radius
            const connectionRadius = this.connectionRadius; // Adjust this value as needed
            
            // If hovering over an existing point
            if (hoveredPoint) {
                // Get all points except the hovered one
                const otherPoints = this.points.filter(p => p.id !== hoveredPoint.id);
                
                // Find points within the radius
                if (otherPoints.length > 0) {
                    let addedAtLeastOneLine = false;
                    
                    otherPoints.forEach(otherPoint => {
                        // Calculate distance
                        const distance = this.p.dist(
                            hoveredPoint.x, hoveredPoint.y,
                            otherPoint.x, otherPoint.y
                        );
                        
                        // Connect if within radius and not already connected
                        if (distance <= connectionRadius && !this.lineManager.lineExists(hoveredPoint, otherPoint)) {
                            this.lineManager.addLine(hoveredPoint, otherPoint, true);
                            addedAtLeastOneLine = true;
                        }
                    });
                    
                    this.didAddLine = addedAtLeastOneLine;
                }
                
                // Set up for dragging
                this.selectedPoint = hoveredPoint;
                this.draggingPoint = hoveredPoint;
                this.mouseDragStart = { x: this.p.mouseX, y: this.p.mouseY };
                this.isDragging = false;
                
                return true;
            }
            
            // If clicking on a line, split it and connect new point to nearby points
            const hoveredLine = this.getHoveredLine(this.p.mouseX, this.p.mouseY);
            if (hoveredLine) {
                // Create a new point where the line was clicked
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
                
                // Connect the new point to all points within radius
                const nearbyPoints = this.points.filter(p => 
                    p.id !== newPoint.id && 
                    p.id !== hoveredLine.start.id && 
                    p.id !== hoveredLine.end.id
                );
                
                nearbyPoints.forEach(otherPoint => {
                    // Calculate distance
                    const distance = this.p.dist(
                        newPoint.x, newPoint.y,
                        otherPoint.x, otherPoint.y
                    );
                    
                    // Connect if within radius
                    if (distance <= connectionRadius) {
                        this.lineManager.addLine(newPoint, otherPoint, true);
                    }
                });
                
                this.didAddLine = true;
                this.selectedPoint = newPoint;
                
                // Add pulse effect for the new point if available
                if (this.ephemeralLineAnimator) {
                    this.ephemeralLineAnimator.addPoint(newPoint);
                }
                
                return true;
            }
            
            // If not hovering over anything, create a new point and connect to nearby points
            const snapPosition = this.gridContext.getSnapPosition(this.p.mouseX, this.p.mouseY);
            const newPoint = this.createPoint(
                snapPosition ? snapPosition.x : this.p.mouseX,
                snapPosition ? snapPosition.y : this.p.mouseY
            );
            
            // Add the new point
            this.points.push(newPoint);
            this.didAddPoint = true;
            
            // Connect to points within radius
            if (this.points.length > 1) {
                const nearbyPoints = this.points.filter(p => p.id !== newPoint.id);
                
                nearbyPoints.forEach(otherPoint => {
                    // Calculate distance
                    const distance = this.p.dist(
                        newPoint.x, newPoint.y,
                        otherPoint.x, otherPoint.y
                    );
                    
                    // Connect if within radius
                    if (distance <= connectionRadius) {
                        this.lineManager.addLine(newPoint, otherPoint, true);
                    }
                });
                
                this.didAddLine = true;
            }
            
            // Update selected point
            this.selectedPoint = newPoint;
            
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
        // Clear preview lines during drag
        this.previewLines = [];

        if (!this.isInCanvas()) return;
        
        // Special handling for eraser tool - continuously erase while dragging
        if (this.toolMode === "eraser") {
            // Check if hovering over a point to erase
            const hoveredPoint = this.getHoveredPoint(this.p.mouseX, this.p.mouseY);
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
            
            return false;
        }

        // Handle normal point dragging (for other tools)
        if (this.draggingPoint) {
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
        
       
        const didOperation = this.didAddPoint || this.didAddLine || this.didRemovePoint || this.didRemoveLine || this.isDragging;
        
        if (didOperation && this.onStateChange) {
            this.onStateChange("end");
        }
        
        // Reset cursor when dragging ends
        if (this.isDragging) {
            this.p.cursor(this.p.ARROW);
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
        
        // Re-check cursor after releasing
        const hoveredPoint = this.getHoveredPoint(this.p.mouseX, this.p.mouseY);
        const hoveredLine = this.getHoveredLine(this.p.mouseX, this.p.mouseY);
        if (hoveredPoint || hoveredLine) {
            this.p.cursor(this.p.HAND);
        }

        // Update preview lines after operation
        this.updatePreviewLines();
    }
    
    /**
     * Handles mouse moved event
     */
    handleMouseMoved() {
        if (!this.isInCanvas()) {
            this.previewLines = []; // Clear previews when outside canvas
            return;
        }
        
        // First update the hoveredLine state
        this.updateHoveredLine();
        
        const hoveredPoint = this.getHoveredPoint(this.p.mouseX, this.p.mouseY);
        if (hoveredPoint) {
            this.p.cursor(this.p.HAND); // Change cursor to hand when over a point
            this.previewLines = []; // Clear previews when over a point
        } else if (this.hoveredLine) {
            this.p.cursor(this.p.HAND); // Also change cursor when over a line
            this.updatePreviewLines(); // Update preview lines when over a line
        } else {
            this.p.cursor(this.p.ARROW); // Reset cursor when not over interactive elements
            this.updatePreviewLines(); // Update preview lines when in empty space
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

    /**
     * Check if a new line would cross any existing lines
     * @param {Object} point1 - First endpoint of the new line
     * @param {Object} point2 - Second endpoint of the new line
     * @returns {Boolean} True if the new line would cross an existing line
     */
    wouldLineCrossExisting(point1, point2) {
        // Get all existing lines
        const existingLines = this.lineManager.getLines();
        
        // Check each line for intersection
        for (const line of existingLines) {
            // Skip lines that share an endpoint with the new line
            if (
                line.start.id === point1.id || 
                line.start.id === point2.id || 
                line.end.id === point1.id || 
                line.end.id === point2.id
            ) {
                continue;
            }
            
            // Check for intersection between the new line and this existing line
            if (this.doLineSegmentsIntersect(
                point1.x, point1.y, point2.x, point2.y,
                line.start.x, line.start.y, line.end.x, line.end.y
            )) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if two line segments intersect
     * @param {Number} x1 - First line first point x
     * @param {Number} y1 - First line first point y
     * @param {Number} x2 - First line second point x
     * @param {Number} y2 - First line second point y
     * @param {Number} x3 - Second line first point x
     * @param {Number} y3 - Second line first point y
     * @param {Number} x4 - Second line second point x
     * @param {Number} y4 - Second line second point y
     * @returns {Boolean} True if the lines intersect
     */
    doLineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Calculate the direction of the lines
        const d1x = x2 - x1;
        const d1y = y2 - y1;
        const d2x = x4 - x3;
        const d2y = y4 - y3;
        
        // Calculate the determinant
        const determinant = d1x * d2y - d1y * d2x;
        
        // If determinant is zero, lines are parallel or collinear
        if (Math.abs(determinant) < 0.0001) {
            return false;
        }
        
        // Calculate the parameters for the intersection point
        const dx = x3 - x1;
        const dy = y3 - y1;
        const t = (dx * d2y - dy * d2x) / determinant;
        const u = (dx * d1y - dy * d1x) / determinant;
        
        // Check if the intersection is within both line segments
        return (t >= 0 && t <= 1 && u >= 0 && u <= 1);
    }

    /**
     * Project a point onto a line segment
     * @param {Number} mouseX - The x-coordinate of the point to project
     * @param {Number} mouseY - The y-coordinate of the point to project
     * @param {Object} line - The line object with start and end points
     * @returns {Object} The projected point coordinates
     */
    getProjectedPointOnLine(mouseX, mouseY, line) {
        const { x: x1, y: y1 } = line.start;
        const { x: x2, y: y2 } = line.end;
        
        // Calculate the line length squared
        const lineLengthSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        
        // If the line is a point, return that point
        if (lineLengthSq === 0) {
            return { x: x1, y: y1 };
        }
        
        // Calculate the projection parameter t
        let t = ((mouseX - x1) * (x2 - x1) + (mouseY - y1) * (y2 - y1)) / lineLengthSq;
        
        // Clamp t to the range [0, 1] to stay within the line segment
        t = Math.max(0, Math.min(1, t));
        
        // Calculate the projected point coordinates
        const projectedX = x1 + t * (x2 - x1);
        const projectedY = y1 + t * (y2 - y1);
        
        return { x: projectedX, y: projectedY };
    }

    // Add this new method to handle preview line generation
    updatePreviewLines() {
        // Clear previous preview lines
        this.previewLines = [];
        
        // If not in canvas or dragging a point, don't show previews
        if (!this.isInCanvas() || this.draggingPoint) {
            return;
        }
        
        // Get current mouse position, with snapping if applicable
        const snapPosition = this.gridContext.getSnapPosition(this.p.mouseX, this.p.mouseY);
        const previewX = snapPosition ? snapPosition.x : this.p.mouseX;
        const previewY = snapPosition ? snapPosition.y : this.p.mouseY;
        
        // Check if we're hovering over an existing point - if so, no preview needed
        const hoveredPoint = this.getHoveredPoint(this.p.mouseX, this.p.mouseY);
        if (hoveredPoint) {
            return;
        }
        
        // Create a virtual point for the preview that will always be at the current position
        this.previewPoint = { x: previewX, y: previewY, id: 'preview' };
        
        // Check if we're hovering over a line
        const hoveredLine = this.getHoveredLine(this.p.mouseX, this.p.mouseY);
        
        // Different preview behavior based on tool mode
        switch (this.toolMode) {
            case "connectToOne":
                // If hovering over a line, show how it would split
                if (hoveredLine) {
                    // Get the projected point on the line for more accurate preview
                    const projectedPoint = this.getProjectedPointOnLine(
                        this.p.mouseX, this.p.mouseY, hoveredLine
                    );
                    
                    // Use the snapped position if available, otherwise use the projected point
                    const splitX = snapPosition ? snapPosition.x : projectedPoint.x;
                    const splitY = snapPosition ? snapPosition.y : projectedPoint.y;
                    
                    // Update the preview point position to be exactly on the line (or snapped)
                    this.previewPoint.x = splitX;
                    this.previewPoint.y = splitY;
                    
                    // Add the preview for both segments of the split line
                    this.previewLines.push({
                        start: hoveredLine.start,
                        end: this.previewPoint,
                        preview: true,
                        originalLine: hoveredLine
                    });
                    this.previewLines.push({
                        start: this.previewPoint,
                        end: hoveredLine.end,
                        preview: true,
                        originalLine: hoveredLine
                    });
                } 
                // Show a single connection to last added point if not over a line
                else if (this.lastAddedPoint) {
                    this.previewLines.push({
                        start: this.lastAddedPoint,
                        end: this.previewPoint,
                        preview: true
                    });
                }
                break;
                
            case "connectToAll":
                // If hovering over a line, show how it would split PLUS connections to all other points
                if (hoveredLine) {
                    // Get the projected point on the line for more accurate preview
                    const projectedPoint = this.getProjectedPointOnLine(
                        this.p.mouseX, this.p.mouseY, hoveredLine
                    );
                    
                    // Use the snapped position if available, otherwise use the projected point
                    const splitX = snapPosition ? snapPosition.x : projectedPoint.x;
                    const splitY = snapPosition ? snapPosition.y : projectedPoint.y;
                    
                    // Update the preview point position to be exactly on the line (or snapped)
                    this.previewPoint.x = splitX;
                    this.previewPoint.y = splitY;
                    
                    // Add the preview for both segments of the split line
                    this.previewLines.push({
                        start: hoveredLine.start,
                        end: this.previewPoint,
                        preview: true,
                        originalLine: hoveredLine
                    });
                    this.previewLines.push({
                        start: this.previewPoint,
                        end: hoveredLine.end,
                        preview: true,
                        originalLine: hoveredLine
                    });
                    
                    // Also show connections to all other points
                    for (const point of this.points) {
                        // Skip the endpoints of the hovered line
                        if (point.id === hoveredLine.start.id || point.id === hoveredLine.end.id) {
                            continue;
                        }
                        
                        this.previewLines.push({
                            start: point,
                            end: this.previewPoint,
                            preview: true
                        });
                    }
                } 
                // Show connections to all points when not over a line
                else {
                    for (const point of this.points) {
                        this.previewLines.push({
                            start: point,
                            end: this.previewPoint,
                            preview: true
                        });
                    }
                }
                break;
                
            case "connectWithoutCrossing":
                // If hovering over a line, show how it would split PLUS valid connections
                if (hoveredLine) {
                    // Get the projected point on the line for more accurate preview
                    const projectedPoint = this.getProjectedPointOnLine(
                        this.p.mouseX, this.p.mouseY, hoveredLine
                    );
                    
                    // Use the snapped position if available, otherwise use the projected point
                    const splitX = snapPosition ? snapPosition.x : projectedPoint.x;
                    const splitY = snapPosition ? snapPosition.y : projectedPoint.y;
                    
                    // Update the preview point position to be exactly on the line (or snapped)
                    this.previewPoint.x = splitX;
                    this.previewPoint.y = splitY;
                    
                    // Add the preview for both segments of the split line
                    this.previewLines.push({
                        start: hoveredLine.start,
                        end: this.previewPoint,
                        preview: true,
                        originalLine: hoveredLine
                    });
                    this.previewLines.push({
                        start: this.previewPoint,
                        end: hoveredLine.end,
                        preview: true,
                        originalLine: hoveredLine
                    });
                    
                    // Temporarily add these preview segments to check for valid connections
                    const tempLines = [...this.lineManager.getLines()];
                    tempLines.push({
                        start: hoveredLine.start,
                        end: this.previewPoint,
                        preview: true
                    });
                    tempLines.push({
                        start: this.previewPoint,
                        end: hoveredLine.end,
                        preview: true
                    });
                    
                    // Also show connections that won't cross with the new segments
                    for (const point of this.points) {
                        // Skip the endpoints of the hovered line
                        if (point.id === hoveredLine.start.id || point.id === hoveredLine.end.id) {
                            continue;
                        }
                        
                        // Check against the temporary line set
                        const wouldCross = this.wouldLineCrossExisting(point, this.previewPoint);
                        if (!wouldCross) {
                            this.previewLines.push({
                                start: point,
                                end: this.previewPoint,
                                preview: true
                            });
                        }
                    }
                } 
                // Show valid connections when not over a line
                else {
                    for (const point of this.points) {
                        const wouldCross = this.wouldLineCrossExisting(point, this.previewPoint);
                        if (!wouldCross) {
                            this.previewLines.push({
                                start: point,
                                end: this.previewPoint,
                                preview: true
                            });
                        }
                    }
                }
                break;
                
            case "eraser":
                // No preview lines for eraser tool
                break;

            // Add this case in the switch statement in updatePreviewLines() method in MouseEventHandler.js
            case "connectToNearest":
                // Show the preview point
                this.previewPoint = { x: previewX, y: previewY, id: 'preview' };
                
                // Define the connection radius - same as in handleMousePressed for connectToNearest
                const connectionRadius = this.connectionRadius; // Adjust as needed to match your handleMousePressed
                
                // If hovering over a line, show how it would split
                if (hoveredLine) {
                    // Get the projected point on the line for more accurate preview
                    const projectedPoint = this.getProjectedPointOnLine(
                        this.p.mouseX, this.p.mouseY, hoveredLine
                    );
                    
                    // Use the snapped position if available, otherwise use the projected point
                    const splitX = snapPosition ? snapPosition.x : projectedPoint.x;
                    const splitY = snapPosition ? snapPosition.y : projectedPoint.y;
                    
                    // Update the preview point position to be exactly on the line (or snapped)
                    this.previewPoint.x = splitX;
                    this.previewPoint.y = splitY;
                    
                    // Add the preview for both segments of the split line
                    this.previewLines.push({
                        start: hoveredLine.start,
                        end: this.previewPoint,
                        preview: true,
                        originalLine: hoveredLine
                    });
                    this.previewLines.push({
                        start: this.previewPoint,
                        end: hoveredLine.end,
                        preview: true,
                        originalLine: hoveredLine
                    });
                    
                    // Also show connections to nearby points within radius
                    for (const point of this.points) {
                        // Skip the endpoints of the hovered line
                        if (point.id === hoveredLine.start.id || point.id === hoveredLine.end.id) {
                            continue;
                        }
                        
                        // Calculate distance to each point
                        const distance = this.p.dist(
                            this.previewPoint.x, this.previewPoint.y,
                            point.x, point.y
                        );
                        
                        // Only add preview lines for points within the connection radius
                        if (distance <= connectionRadius) {
                            this.previewLines.push({
                                start: point,
                                end: this.previewPoint,
                                preview: true
                            });
                        }
                    }
                }
                // When not hovering over a line but still within canvas
                else {
                    // Find all points within the connection radius
                    for (const point of this.points) {
                        // Calculate distance to each point
                        const distance = this.p.dist(
                            this.previewPoint.x, this.previewPoint.y,
                            point.x, point.y
                        );
                        
                        // Only add preview lines for points within the connection radius
                        if (distance <= connectionRadius) {
                            this.previewLines.push({
                                start: point,
                                end: this.previewPoint,
                                preview: true
                            });
                        }
                    }
                }
                
                // Add a flag to indicate this tool should show the connection radius circle
                this.showConnectionRadius = true;
                this.connectionRadius = connectionRadius;
                break;
        }
    }

    // Add a method to draw the preview lines
    drawPreviewLines() {
        // Get the line to hide (if any) for the parent component to avoid rendering it twice
        let lineToHide = null;
        for (const line of this.previewLines || []) {
            if (line.originalLine) {
                lineToHide = line.originalLine;
                break;
            }
        }
        
        this.p.push();
        
        // Draw the connection radius circle for connectToNearest tool
        // Now we always draw it when the tool is active, not just during preview
        if (this.toolMode === "connectToNearest" && this.isInCanvas()) {
            // Use the dynamic connection radius from the class property
            const connectionRadius = this.connectionRadius;
            
            // Get current mouse position or preview point
            const centerX = this.previewPoint ? this.previewPoint.x : this.p.mouseX;
            const centerY = this.previewPoint ? this.previewPoint.y : this.p.mouseY;
            
            // Draw a filled circle with light orange color - no outline
            this.p.noStroke(); // Remove the stroke completely
            this.p.fill(250, 140, 0, 20); // Light orange with low opacity (20%)
            this.p.ellipse(centerX, centerY, connectionRadius * 2);
        }
        
        // If there are no preview lines to draw, we can return now
        if (!this.previewLines || this.previewLines.length === 0) {
            this.p.pop();
            return lineToHide;
        }
        
        // Use dashed line for preview
        this.p.strokeWeight(1);
        this.p.stroke(250, 140, 0, 150); // Semi-transparent orange
        
        // Draw dashed lines for previews
        this.p.drawingContext.setLineDash([5, 3]); // Dashed line pattern [dash, gap]
        
        for (const line of this.previewLines) {
            this.p.line(
                line.start.x, line.start.y,
                line.end.x, line.end.y
            );
        }
        
        // Reset line dash
        this.p.drawingContext.setLineDash([]);
        
        // Draw the preview point
        if (this.previewPoint) {
            this.p.fill(250, 140, 0, 100);
            this.p.ellipse(this.previewPoint.x, this.previewPoint.y, 12, 12);
        }
        
        this.p.pop();
        
        return lineToHide;
    }


}

export default MouseEventHandler;
