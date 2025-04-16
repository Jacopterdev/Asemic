import BaseGrid from "./BaseGrid.js";
import KnobLabel from "./KnobLabel.js";

class RectGrid extends BaseGrid {
    constructor(p, xStart, yStart, gridSize) {
        super(p, xStart, yStart, gridSize);

        this.cols = 3;
        this.rows = 3;
        this.cellWidth = gridSize/this.cols;
        this.cellHeight = gridSize/this.rows;
        this.grid = [];

        this.initGrid();

        // Smaller knob size
        const knobSize = 20; // Reduced from 24

        // Position knobs directly on the grid edges
        this.colsKnob = { 
            x: xStart + this.gridSize / 2, // Center horizontally
            y: yStart + this.gridSize, // Exactly on the bottom grid line
            size: knobSize
        };
        
        // Row knob goes on right edge
        this.rowsKnob = { 
            x: xStart + this.gridSize, // Exactly on the right grid line
            y: yStart + this.gridSize / 2, // Center vertically
            size: knobSize
        };

        // Tracking dragging state
        this.draggingColsKnob = false;
        this.draggingRowsKnob = false;
        
        // To track mouse offset when dragging starts
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        // To track the initial counts when dragging starts
        this.initialCols = this.cols;
        this.initialRows = this.rows;

        // Create knob label
        this.knobLabel = new KnobLabel(p);
        
        // Update knob positions based on current grid settings
        this.updateKnobPositions();
    }

    // New method to update knob positions based on grid settings
    updateKnobPositions() {
        // Calculate position for column knob (moves horizontally)
        const colFraction = (this.cols - 1) / 9; // 1-10 range mapped to 0-1
        this.colsKnob.x = this.xStart + colFraction * this.gridSize;
        
        // Calculate position for row knob (moves vertically)
        const rowFraction = (this.rows - 1) / 9; // 1-10 range mapped to 0-1
        this.rowsKnob.y = this.yStart + rowFraction * this.gridSize;
    }

    initGrid() {
        this.grid = [];
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = {
                    x: this.xStart + i * this.cellWidth,
                    y: this.yStart + j * this.cellHeight,
                    w: this.cellWidth,
                    h: this.cellHeight
                };
            }
        }
    }

    getIntersections() {
        let intersections = [];
        
        for (let i = 0; i <= this.cols; i++) {
            for (let j = 0; j <= this.rows; j++) {
                intersections.push({
                    x: this.xStart + i * this.cellWidth,
                    y: this.yStart + j * this.cellHeight
                });
            }
        }
        
        return intersections;
    }

    // Helper method to draw improved round knobs with better hover/drag effects
    drawKnob(knob, isDragging) {
        const p = this.p;
        
        // Check if mouse is hovering over this knob
        const distToKnob = p.dist(p.mouseX, p.mouseY, knob.x, knob.y);
        const isHovered = distToKnob < knob.size / 2 * 1.2;
        
        // Determine visual state (normal, hover, active) - using darker grays
        let knobColor, knobSize;
        
        if (isDragging) {
            // Active state
            knobColor = 120; // Darker gray when dragging
            knobSize = knob.size * 1.1; // Slightly larger
        } else if (isHovered) {
            // Hover state
            knobColor = 140; // Medium gray when hovered (darker)
            knobSize = knob.size * 1.05; // Very slightly larger
        } else {
            // Normal state
            knobColor = 180; // Darker gray than before
            knobSize = knob.size; // Normal size
        }
        
        // Draw knob with no stroke
        p.noStroke();
        p.fill(knobColor);
        p.ellipse(knob.x, knob.y, knobSize);
        
        p.stroke(255); // White lines
        p.strokeWeight(1.5);
        
        // Draw the three lines based on knob type (columns or rows)
        p.push();
        p.translate(knob.x, knob.y);
        
        const lineLength = knobSize * 0.6;
        const spacing = knobSize * 0.2;
        
        if (knob === this.colsKnob) {
            // For columns knob, draw three vertical lines
            // (rotated 90° so they align with vertical column lines)
            p.line(-spacing, -lineLength/2, -spacing, lineLength/2); // Left line
            p.line(0, -lineLength/2, 0, lineLength/2); // Middle line
            p.line(spacing, -lineLength/2, spacing, lineLength/2); // Right line
        } else if (knob === this.rowsKnob) {
            // For rows knob, draw three horizontal lines
            // (rotated 90° so they align with horizontal row lines)
            p.line(-lineLength/2, -spacing, lineLength/2, -spacing); // Top line
            p.line(-lineLength/2, 0, lineLength/2, 0); // Middle line
            p.line(-lineLength/2, spacing, lineLength/2, spacing); // Bottom line
        }
        
        p.pop();
        
        // Draw directional arrow indicators only when hovering or dragging
        if (isHovered || isDragging) {
            const arrowSize = knobSize * 0.5;
            
            p.push();
            p.noStroke();
            p.fill(knobColor); // Use the same color as the knob itself
            
            if (knob === this.colsKnob) {
                // Position arrows with slight overlap
                const arrowDistance = knobSize * 0.9;
                
                // Left arrow (decrease columns)
                p.push();
                p.translate(knob.x - arrowDistance, knob.y);
                p.triangle(
                    0, 0,
                    arrowSize, -arrowSize/2,
                    arrowSize, arrowSize/2
                );
                p.pop();
                
                // Right arrow (increase columns)
                p.push();
                p.translate(knob.x + arrowDistance, knob.y);
                p.triangle(
                    0, 0,
                    -arrowSize, -arrowSize/2,
                    -arrowSize, arrowSize/2
                );
                p.pop();
            } else if (knob === this.rowsKnob) {
                // Position arrows with slight overlap
                const arrowDistance = knobSize * 0.9;
                
                // Up arrow (decrease rows)
                p.push();
                p.translate(knob.x, knob.y - arrowDistance);
                p.triangle(
                    0, 0,
                    -arrowSize/2, arrowSize,
                    arrowSize/2, arrowSize
                );
                p.pop();
                
                // Down arrow (increase rows)
                p.push();
                p.translate(knob.x, knob.y + arrowDistance);
                p.triangle(
                    0, 0,
                    -arrowSize/2, -arrowSize,
                    arrowSize/2, -arrowSize
                );
                p.pop();
            }
            
            p.pop();
        }
    }

    draw() {
        const p = this.p;
        
        // Draw grid cells
        p.noFill();
        p.stroke(this.strokeColor);
        p.strokeWeight(this.strokeWeight);
        
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                let cell = this.grid[i][j];
                p.rect(cell.x, cell.y, cell.w, cell.h);
            }
        }
        
        // Draw grid border lines with slightly highlighted stroke
        p.stroke(this.strokeColor);
        p.strokeWeight(this.strokeWeight * 1.5);
        
        // Bottom line (for columns knob)
        p.line(
            this.xStart, 
            this.yStart + this.gridSize, 
            this.xStart + this.gridSize, 
            this.yStart + this.gridSize
        );
        
        // Right line (for rows knob)
        p.line(
            this.xStart + this.gridSize, 
            this.yStart,
            this.xStart + this.gridSize, 
            this.yStart + this.gridSize
        );
        
        // Reset stroke weight for later elements
        p.strokeWeight(this.strokeWeight);
        
        // Draw the knobs with the new helper method
        this.drawKnob(this.colsKnob, this.draggingColsKnob);
        this.drawKnob(this.rowsKnob, this.draggingRowsKnob);
        
        // Update cursor when hovering over knobs
        const distToColsKnob = p.dist(p.mouseX, p.mouseY, this.colsKnob.x, this.colsKnob.y);
        const distToRowsKnob = p.dist(p.mouseX, p.mouseY, this.rowsKnob.x, this.rowsKnob.y);
        
        if (distToColsKnob < this.colsKnob.size / 2) {
            p.cursor(p.HAND);
        } else if (distToRowsKnob < this.rowsKnob.size / 2) {
            p.cursor(p.HAND);
        } else {
            p.cursor(p.ARROW);
        }
        
        // Draw the knob label
        this.knobLabel.draw();
    }

    updateParams(p, xStart, yStart, gridSize) {
        // Update the p5.js instance if needed
        this.p = p;

        // Update position and size parameters
        this.xStart = xStart;
        this.yStart = yStart;
        this.gridSize = gridSize;

        // Reinitialize the grid with new dimensions
        this.initGrid();

        // Update knob positions
        this.colsKnob.x = xStart + this.gridSize / 2; // Center horizontally
        this.colsKnob.y = yStart + this.gridSize; // Exactly on the bottom grid line

        this.rowsKnob.x = xStart + this.gridSize; // Exactly on the right grid line
        this.rowsKnob.y = yStart + this.gridSize / 2; // Center vertically

        // Update the knob positions based on current grid settings
        this.updateKnobPositions();
    }


    mousePressed(mouseX, mouseY) {
        const distToColsKnob = this.p.dist(mouseX, mouseY, this.colsKnob.x, this.colsKnob.y);
        const distToRowsKnob = this.p.dist(mouseX, mouseY, this.rowsKnob.x, this.rowsKnob.y);

        // Slightly larger hitboxes for better UX
        const hitboxMultiplier = 1.3;

        // Check if either knob is clicked
        if (distToColsKnob < (this.colsKnob.size / 2) * hitboxMultiplier) {
            this.draggingColsKnob = true;
            this.dragOffsetX = mouseX - this.colsKnob.x; // Record drag offset
            this.initialCols = this.cols; // Save the starting number of columns
            this.knobLabel.update(this.cols, this.colsKnob.x, this.colsKnob.y - 20); // Show initial value
            return true;
        }
        
        if (distToRowsKnob < (this.rowsKnob.size / 2) * hitboxMultiplier) {
            this.draggingRowsKnob = true;
            this.dragOffsetY = mouseY - this.rowsKnob.y; // Record drag offset
            this.initialRows = this.rows; // Save the starting number of rows
            this.knobLabel.update(this.rows, this.rowsKnob.x - 20, this.rowsKnob.y); // Show initial value
            return true;
        }

        return false;
    }

    mouseDragged(mouseX, mouseY) {
        if (!this.draggingColsKnob && !this.draggingRowsKnob) {
            return false;
        }

        if (this.draggingColsKnob) {
            // Move knob horizontally along the bottom edge
            const newX = mouseX - this.dragOffsetX;
            
            // Constrain knob to grid width
            const constrainedX = Math.max(
                this.xStart, 
                Math.min(this.xStart + this.gridSize, newX)
            );
            
            // Update knob position
            this.colsKnob.x = constrainedX;
            
            // Calculate new column count based on position (1-10 range)
            const fraction = (constrainedX - this.xStart) / this.gridSize;
            const newCols = Math.max(1, Math.min(10, Math.round(fraction * 9) + 1));
            
            // Only update if the value changed
            if (newCols !== this.cols) {
                this.cols = newCols;
                this.cellWidth = this.gridSize / this.cols;
                this.initGrid();
                
                // Update label with new value
                this.knobLabel.update(this.cols, this.colsKnob.x, this.colsKnob.y - 20);
            }
            
            return true;
        }
        
        if (this.draggingRowsKnob) {
            // Move knob vertically along the right edge
            const newY = mouseY - this.dragOffsetY;
            
            // Constrain knob to grid height
            const constrainedY = Math.max(
                this.yStart, 
                Math.min(this.yStart + this.gridSize, newY)
            );
            
            // Update knob position
            this.rowsKnob.y = constrainedY;
            
            // Calculate new row count based on position (1-10 range)
            const fraction = (constrainedY - this.yStart) / this.gridSize;
            const newRows = Math.max(1, Math.min(10, Math.round(fraction * 9) + 1));
            
            // Only update if the value changed
            if (newRows !== this.rows) {
                this.rows = newRows;
                this.cellHeight = this.gridSize / this.rows;
                this.initGrid();
                
                // Update label with new value
                this.knobLabel.update(this.rows, this.rowsKnob.x - 20, this.rowsKnob.y);
            }
            
            return true;
        }
        
        return false;
    }

    mouseReleased() {
        const wasDraggingKnob = this.draggingColsKnob || this.draggingRowsKnob;
        
        // Stop dragging and finalize the columns/rows
        this.draggingColsKnob = false;
        this.draggingRowsKnob = false;

        // Finalize the column and row count
        this.initialCols = this.cols;
        this.initialRows = this.rows;

        // Hide the label when dragging stops
        this.knobLabel.hide();
        
        return wasDraggingKnob;
    }

    // Method to get a snapped position (nearest grid intersection)
    getSnapPosition(mouseX, mouseY) {
        
        // Find nearest column and row grid lines
        const colWidth = this.gridSize / this.cols;
        const rowHeight = this.gridSize / this.rows;
        
        const relX = mouseX - this.xStart;
        const relY = mouseY - this.yStart;
        
        // Calculate the nearest grid line indices
        const colIndex = Math.round(relX / colWidth);
        const rowIndex = Math.round(relY / rowHeight);
        
        // Constrain to grid boundaries
        const constrainedColIndex = Math.max(0, Math.min(this.cols, colIndex));
        const constrainedRowIndex = Math.max(0, Math.min(this.rows, rowIndex));
        
        // Calculate the actual grid intersection position
        const gridX = this.xStart + constrainedColIndex * colWidth;
        const gridY = this.yStart + constrainedRowIndex * rowHeight;
        
        // Calculate distance to nearest grid intersection
        const distToGridPoint = this.p.dist(mouseX, mouseY, gridX, gridY);
        
        // Only snap if we're close enough to a grid point
        if (distToGridPoint <= this.snapThreshold) {
            return { x: gridX, y: gridY };
        } else {
            // Otherwise return the original mouse position
            return { x: mouseX, y: mouseY };
        }
    }
}

export default RectGrid;