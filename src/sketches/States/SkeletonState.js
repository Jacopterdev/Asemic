import MouseEventHandler from "../MouseEventHandler.js";
import RadialGrid from "../RadialGrid.js";
import RectGrid from "../RectGrid.js";
import NoGrid from "../NoGrid.js";
import PointRenderer from "../PointRenderer.js";
import PossibleLinesRenderer from "../PossibleLinesRenderer.js";

import EphemeralLineAnimator from "../EphemeralLineAnimator.js";
import GridContext from "../GridContext.js";
import {SPACING as LAYOUT, SPACING} from "./LayoutConstants.js";
class SkeletonState {
    constructor(p, points, lineManager, mergedParams, toolConfig) {
        this.p = p;
        this.name = "Edit Skeleton";
        this.mergedParams = mergedParams;
        this.toolConfig = toolConfig;
        this.currentGridType = "none"; // Track the current grid type
        this.possibleLinesRenderer = null;
        this.pointRenderer = null;
        this.gridContext = null;
        this.points = points;
        this.lineManager = lineManager;
        this.ephemeralLineAnimator = null;
        this.gridContext  = null;
        this.possibleLinesRenderer  = null;
        this.mouseHandler = null;
        this.deleteButtonPosition = { x: 0, y: 0 }; // Will be set in updateGridContext
        this.deleteButtonSize = { width: 40, height: 40 };
        this.isDeleteButtonHovered = false;
        // Add new fill grid button properties
        this.fillGridButtonPosition = { x: 0, y: 0 }; // Will be set in updateGridContext
        this.fillGridButtonSize = { width: 40, height: 40 };
        this.isFillGridButtonHovered = false;
        this.init();
    }

    init(){
        // Other initialization code...

        // Initialize the gridContext based on the default `currentGridType` ("none")
        this.gridContext = new GridContext(RectGrid, this.p, SPACING.MARGIN, SPACING.MARGIN, this.p.width - SPACING.MARGIN * 2);

        this.pointRenderer = new PointRenderer(this.p, this.mergedParams.missRadius); // Initialize the PointRenderer

        this.possibleLinesRenderer = new PossibleLinesRenderer(this.p); // Initialize PossibleLinesRenderer

        //Animator
        this.ephemeralLineAnimator = new EphemeralLineAnimator(this.p, this.lineManager);

        this.ephemeralLineAnimator.start(); // Start the animation

        // Create the possible lines renderer
        this.possibleLinesRenderer = new PossibleLinesRenderer(this.p);

        // Create the mouse handler and pass the linesRenderer
        this.mouseHandler = new MouseEventHandler(
            this.p, 
            this.gridContext, 
            this.points, 
            this.lineManager,
            this.possibleLinesRenderer // Pass the renderer
        );

        // Other initialization code...
    }

    // Update delete button method
    drawDeleteButton() {
        // Make button smaller
        const size = 30; // Reduced from 40
        const iconX = this.p.width - size - LAYOUT.MARGIN;
        const iconY = this.p.height - size - LAYOUT.MARGIN;
        
        // Check if mouse is hovering over button
        this.isDeleteButtonHovered = 
            this.p.mouseX >= iconX && 
            this.p.mouseX <= iconX + size && 
            this.p.mouseY >= iconY && 
            this.p.mouseY <= iconY + size;
        
        // Draw button background with lighter grayscale colors
        this.p.strokeWeight(0);
        // Use lighter grays for both states
        const buttonColor = this.isDeleteButtonHovered ? 180 : 210;
        this.p.fill(buttonColor);
        this.p.rect(iconX, iconY, size, size, 4); // Smaller corner radius
        
        // Draw trash can icon - slightly smaller proportions
        this.p.noStroke();
        this.p.fill(255); // Changed to white instead of dark gray
        
        // Draw trash can body - slightly smaller
        const margin = size * 0.2;
        const trashWidth = size * 0.5; // Reduced width
        const trashHeight = size * 0.45; // Reduced height
        const trashX = iconX + (size - trashWidth) / 2;
        const trashY = iconY + margin + size * 0.15;
        
        // Trash can body
        this.p.rect(trashX, trashY, trashWidth, trashHeight, 2);
        
        // Trash can lid - slightly smaller
        const lidWidth = trashWidth * 1.1; // Less exaggerated
        const lidHeight = size * 0.08;
        const lidX = iconX + (size - lidWidth) / 2;
        const lidY = trashY - lidHeight - 1;
        this.p.rect(lidX, lidY, lidWidth, lidHeight);
        
        // Handle on lid
        const handleWidth = lidWidth * 0.2;
        const handleHeight = size * 0.06;
        const handleX = iconX + (size - handleWidth) / 2;
        const handleY = lidY - handleHeight;
        this.p.rect(handleX, handleY, handleWidth, handleHeight, 1);
        
        // Draw vertical lines inside trash can - use the same light gray color as the background
        this.p.strokeWeight(1);
        this.p.stroke(buttonColor); // Changed to use the same color as the button background
        
        const lineCount = 3;
        const lineSpacing = trashWidth / (lineCount + 1);
        
        for (let i = 1; i <= lineCount; i++) {
            const lineX = trashX + i * lineSpacing;
            this.p.line(lineX, trashY + 4, lineX, trashY + trashHeight - 4);
        }
        
        // Update the position and size properties for hit detection
        this.deleteButtonPosition = { x: iconX, y: iconY };
        this.deleteButtonSize = { width: size, height: size };
    }

    // Add new method to draw the fill grid button
    drawFillGridButton() {
        // Make button smaller - same size as delete button
        const size = 30; // Reduced from 40
        const iconX = this.p.width - size * 2 - LAYOUT.MARGIN * 1.5; // Position it to the left of the delete button
        const iconY = this.p.height - size - LAYOUT.MARGIN;
        
        // Check if mouse is hovering over button
        this.isFillGridButtonHovered = 
            this.p.mouseX >= iconX && 
            this.p.mouseX <= iconX + size && 
            this.p.mouseY >= iconY && 
            this.p.mouseY <= iconY + size;
        
        // Draw button background with lighter grayscale colors - same as delete button
        this.p.strokeWeight(0);
        // Use lighter grays for both states
        this.p.fill(this.isFillGridButtonHovered ? 180 : 210);
        this.p.rect(iconX, iconY, size, size, 4); // Smaller corner radius
        
        // Draw grid fill icon with white instead of dark gray
        this.p.noStroke();
        this.p.fill(255); // Changed to white
        
        // Draw grid representation - slightly smaller
        const margin = size * 0.2;
        const gridSize = size * 0.55; // Reduced size
        const gridX = iconX + (size - gridSize) / 2;
        const gridY = iconY + (size - gridSize) / 2;
        
        // Draw grid outline
        this.p.strokeWeight(1);
        this.p.stroke(255); // Changed to white
        this.p.noFill();
        this.p.rect(gridX, gridY, gridSize, gridSize, 2);
        
        // Draw grid lines - thinner, in white
        const cellSize = gridSize / 2;
        
        // Vertical line
        this.p.line(gridX + cellSize, gridY, gridX + cellSize, gridY + gridSize);
        
        // Horizontal line
        this.p.line(gridX, gridY + cellSize, gridX + gridSize, gridY + cellSize);
        
        // Draw points at the intersections - smaller, in white
        this.p.noStroke();
        this.p.fill(255); // Changed to white
        const dotSize = 3; // Smaller dots
        
        // Draw points at intersections
        for (let i = 0; i <= 2; i++) {
            for (let j = 0; j <= 2; j++) {
                this.p.ellipse(
                    gridX + i * cellSize,
                    gridY + j * cellSize,
                    dotSize,
                    dotSize
                );
            }
        }
        
        // Update the position and size properties for hit detection
        this.fillGridButtonPosition = { x: iconX, y: iconY };
        this.fillGridButtonSize = { width: size, height: size };
    }
    
    // Add method to fill grid with points
    fillGridWithPoints() {
        // Clear existing points and lines first
        this.points.length = 0;
        this.lineManager.clearAllLines();
        
        // Get the current grid type and dimensions
        const grid = this.gridContext.getGrid();
        
        // Create points at grid intersections
        const gridPoints = grid.getIntersections();
        
        // Add points at each intersection
        let pointId = 0;
        gridPoints.forEach(point => {
            this.points.push({
                x: point.x,
                y: point.y,
                id: pointId++
            });
        });
        
        // For rectangular grid - add lines only between adjacent points
        if (this.currentGridType === "rect") {
            const cols = grid.cols;
            const rows = grid.rows;
            
            // Loop through all points
            for (let i = 0; i < this.points.length; i++) {
                const col = i % (cols + 1);
                const row = Math.floor(i / (cols + 1));
                
                // Connect to right neighbor (if not at right edge)
                if (col < cols) {
                    const rightNeighbor = this.points[i + 1];
                    this.lineManager.lines.push({
                        start: this.points[i],
                        end: rightNeighbor,
                        selected: true
                    });
                }
                
                // Connect to bottom neighbor (if not at bottom edge)
                if (row < rows) {
                    const bottomNeighbor = this.points[i + cols + 1];
                    this.lineManager.lines.push({
                        start: this.points[i],
                        end: bottomNeighbor,
                        selected: true
                    });
                }
            }
        }
        // For radial grid - connect adjacent points on same radius and same angle
        else if (this.currentGridType === "radial") {
            const angularDivisions = grid.angularDivisions;
            const radialDivisions = grid.radialDivisions;
            
            // Connect points on the same circle (adjacent angles)
            for (let r = 1; r <= radialDivisions; r++) {
                for (let a = 0; a < angularDivisions; a++) {
                    const currentIndex = (r - 1) * angularDivisions + a;
                    const nextIndex = (r - 1) * angularDivisions + ((a + 1) % angularDivisions);
                    
                    this.lineManager.lines.push({
                        start: this.points[currentIndex],
                        end: this.points[nextIndex],
                        selected: true
                    });
                }
            }
            
            // Connect points on the same radius (adjacent circles)
            for (let r = 1; r < radialDivisions; r++) {
                for (let a = 0; a < angularDivisions; a++) {
                    const currentIndex = (r - 1) * angularDivisions + a;
                    const nextRadiusIndex = r * angularDivisions + a;
                    
                    this.lineManager.lines.push({
                        start: this.points[currentIndex],
                        end: this.points[nextRadiusIndex],
                        selected: true
                    });
                }
            }
            
            // Connect center point to first circle
            const centerIndex = this.points.length - 1; // Last point is center
            for (let a = 0; a < angularDivisions; a++) {
                this.lineManager.lines.push({
                    start: this.points[centerIndex],
                    end: this.points[a],
                    selected: true
                });
            }
        }
        // For NoGrid - no specific structure, don't add lines
        else {
            // No lines for "none" grid type
        }
    }

    // Add this method to handle delete functionality
    deleteAllPoints() {
        // Clear all points
        this.points.length = 0;
        
        // Remove all lines
        this.lineManager.clearAllLines();
    }

    // Modify the draw method to handle the null selectedPoint
    draw() {
        this.updateGridContext();
        const missRadius = this.mergedParams.missArea;
        this.pointRenderer.setMissRadius(missRadius);

        this.p.noStroke();
        this.p.fill(0); // Color: black

        this.ephemeralLineAnimator.updateAndDraw();

        this.gridContext.draw();

        // Get the currently hovered line for the hover effect
        const hoveredLine = this.mouseHandler.getHoveredLineForRendering();
        
        // Draw lines between points (we pass null for selectedPoint since we don't use it anymore)
        this.possibleLinesRenderer.drawLines(this.lineManager.getLines(), null, this.mouseHandler.getHoveredLineForRendering());

        // Draw all points with hover effect
        this.points.forEach((point) => {
            const isHovered = this.pointRenderer.isHovered(point, this.p.mouseX, this.p.mouseY);
            this.pointRenderer.draw(point, isHovered);
        });
        
        // Draw the delete button
        this.drawDeleteButton();
        
        // Draw the fill grid button
        this.drawFillGridButton();
    }

    updateMergedParams(newMergedParams) {
        this.mergedParams = newMergedParams;
    }

    updateToolConfig(newToolConfig) {
        this.toolConfig = newToolConfig;
    }


    mousePressed() {
        if (!this.mouseHandler) return;
        
        // Check if the delete button was clicked
        if (this.isDeleteButtonHovered) {
            this.deleteAllPoints();
            return;
        }
        
        // Check if the fill grid button was clicked
        if (this.isFillGridButtonHovered) {
            this.fillGridWithPoints();
            return;
        }
        
        const knobDragged = this.gridContext.mousePressed(this.p.mouseX, this.p.mouseY);
        if (knobDragged) return;
        this.mouseHandler.handleMousePressed();
    }

    mouseDragged() {
        if (!this.mouseHandler) return;
        const knobDragged = this.gridContext.mouseDragged(this.p.mouseX, this.p.mouseY);
        if (knobDragged) return;
        this.mouseHandler.handleMouseDragged();
    }

    mouseReleased() {
        if (!this.mouseHandler) return;
        const knobDragged = this.gridContext.mouseReleased();
        if (knobDragged) return;
        this.mouseHandler.handleMouseReleased();
    }

    mouseMoved() {
        if (this.mouseHandler) {
            this.mouseHandler.handleMouseMoved();
        }
    }

    updateGridContext = () => {
        let xStart = LAYOUT.MARGIN;
        let yStart = LAYOUT.MARGIN;
        let gridSize = this.p.width - LAYOUT.MARGIN * 2;

        // Position the delete button at the bottom right corner of the canvas
        this.deleteButtonPosition = { 
            x: this.p.width - this.deleteButtonSize.width - LAYOUT.MARGIN, 
            y: this.p.height - this.deleteButtonSize.height - LAYOUT.MARGIN 
        };

        // Retrieve the latest grid type from toolConfig
        const toolConfig = this.toolConfig;
        const gridType = toolConfig?.grid || "none";
        // Only update the gridContext if the gridType has changed
        if (this.currentGridType !== gridType) {
            if (gridType === "radial") {
                this.gridContext.setGridType(RadialGrid,
                    this.p,
                    xStart,
                    yStart,
                    gridSize / 2,
                    5,
                    12
                ); // Adjust parameters
            } else if (gridType === "rect") {
                this.gridContext.setGridType(RectGrid, this.p, 3, 3, xStart, yStart, gridSize);
            } else if (gridType === "none") {
                this.gridContext.setGridType(NoGrid, this.p, xStart, yStart, gridSize);
            }
            this.currentGridType = gridType; // Update current grid type
        }
    };
}
export default SkeletonState;