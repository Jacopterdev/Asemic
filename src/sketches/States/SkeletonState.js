import MouseEventHandler from "../MouseEventHandler.js";
import RadialGrid from "../RadialGrid.js";
import RectGrid from "../RectGrid.js";
import NoGrid from "../NoGrid.js";
import PointRenderer from "../PointRenderer.js";
import PossibleLinesRenderer from "../PossibleLinesRenderer.js";
import EphemeralLineAnimator from "../EphemeralLineAnimator.js";
import GridContext from "../GridContext.js";
import {SPACING as LAYOUT, SPACING} from "./LayoutConstants.js";
import Tutorial from "../Tutorial.js";
import {p5 as p} from "p5/lib/p5.js";
import RandomPointGenerator from '../RandomPointGenerator.js';

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
        
        // Initialize tutorial system
        const tutorialSeen = typeof localStorage !== 'undefined' && localStorage.getItem('tutorialCompleted') === 'true';
        this.tutorial = new Tutorial(p);
        this.tutorial.active = !tutorialSeen; // Only show if not seen before
        
        // Help button properties
        this.helpButtonSize = 40;
        this.helpButtonX = LAYOUT.GRID_SIZE - 60;
        this.helpButtonY = 20;
        
        this.init();
    }

    init(){
        // Other initialization code...

        // Initialize the gridContext based on the default `currentGridType` ("none")
        this.gridContext = new GridContext(RectGrid, this.p, SPACING.MARGIN, SPACING.MARGIN, LAYOUT.GRID_SIZE - SPACING.MARGIN * 2);

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
            this.possibleLinesRenderer, // Pass the renderer
            // Add callback for state changes
            () => {
                // Record state after significant changes
                if (typeof this.p.recordCurrentState === 'function') {
                    this.p.recordCurrentState("skeletonChange");
                }
            }
        );

        // Other initialization code...
    }

    // Update drawDeleteButton method to make the button bigger
    drawDeleteButton() {
        const size = 30; // Larger button size (was 24)
        const iconX = LAYOUT.GRID_SIZE;
        const iconY = LAYOUT.GRID_SIZE - size - LAYOUT.MARGIN;
        
        // Check if mouse is hovering over button
        this.isDeleteButtonHovered = 
            this.p.mouseX >= iconX && 
            this.p.mouseX <= iconX + size && 
            this.p.mouseY >= iconY && 
            this.p.mouseY <= iconY + size;

        if(this.isDeleteButtonHovered) this.p.cursor(this.p.HAND);
        
        // Match your index.css button styles
        if(this.isDeleteButtonHovered) {
            this.p.fill(229, 231, 235); // hover:bg-gray-200 - matches the hover style
        } else {
            this.p.fill(209, 213, 219); // bg-gray-300 - matches the normal style
        }
        
        this.p.noStroke(); // No border like your buttons
        this.p.rect(iconX, iconY, size, size, 4); // rounded (4px is similar to your rounded class)
        
        // Draw trash can icon in text-gray-600 color (rgb(75, 85, 99))
        this.p.stroke(75, 85, 99); // text-gray-600
        this.p.strokeWeight(1);
        this.p.noFill();
        
        // Keep icon size the same - just centered in the larger button
        const iconSize = 18; // Icon size (unchanged)
        const margin = (size - iconSize) / 2; // Center the icon
        const trashWidth = iconSize * 0.6;
        const trashHeight = iconSize * 0.5;
        const trashX = iconX + (size - trashWidth) / 2;
        const trashY = iconY + margin + size * 0.15;
        
        // Trash can body
        this.p.rect(trashX, trashY, trashWidth, trashHeight, 1);
        
        // Trash can lid
        const lidWidth = trashWidth * 1.1;
        const lidHeight = size * 0.05;
        const lidX = iconX + (size - lidWidth) / 2;
        const lidY = trashY - lidHeight - 1;
        this.p.line(lidX, lidY, lidX + lidWidth, lidY);
        
        // Handle on lid
        const handleWidth = lidWidth * 0.2;
        const handleHeight = size * 0.05;
        const handleX = iconX + (size - handleWidth) / 2;
        const handleY = lidY - handleHeight;
        this.p.rect(handleX, handleY, handleWidth, handleHeight, 1);
        
        // Update position and size properties for hit detection
        this.deleteButtonPosition = { x: iconX, y: iconY };
        this.deleteButtonSize = { width: size, height: size };
    }

    // Update drawFillGridButton method to make the button bigger
    drawFillGridButton() {
        const size = 30; // Larger button size (was 24)
        const iconX = LAYOUT.GRID_SIZE; // Position left of delete button
        const iconY = LAYOUT.GRID_SIZE - 2*size - LAYOUT.MARGIN - 1 * 0.5 * LAYOUT.PADDING;
        
        // Check if mouse is hovering over button
        this.isFillGridButtonHovered = 
            this.p.mouseX >= iconX && 
            this.p.mouseX <= iconX + size && 
            this.p.mouseY >= iconY && 
            this.p.mouseY <= iconY + size;

        if(this.isFillGridButtonHovered) this.p.cursor(this.p.HAND);
        
        // Match your index.css button styles
        if(this.isFillGridButtonHovered) {
            this.p.fill(229, 231, 235); // hover:bg-gray-200 - matches the hover style
        } else {
            this.p.fill(209, 213, 219); // bg-gray-300 - matches the normal style
        }
        
        this.p.noStroke(); // No border like your buttons
        this.p.rect(iconX, iconY, size, size, 4); // rounded (4px is similar to your rounded class)
        
        // Draw grid fill icon in text-gray-600 color (rgb(75, 85, 99))
        this.p.stroke(75, 85, 99); // text-gray-600
        this.p.strokeWeight(1);
        this.p.noFill();
        
        // Keep icon size the same - just centered in the larger button
        const iconSize = 18; // Icon size
        const margin = (size - iconSize) / 2; // Center the icon
        const gridSize = iconSize * 0.8;
        const gridX = iconX + (size - gridSize) / 2;
        const gridY = iconY + (size - gridSize) / 2;
        
        // Draw grid outline
        this.p.rect(gridX, gridY, gridSize, gridSize, 1);
        
        // Draw grid lines
        const cellSize = gridSize / 2;
        
        // Vertical line
        this.p.line(gridX + cellSize, gridY, gridX + cellSize, gridY + gridSize);
        
        // Horizontal line
        this.p.line(gridX, gridY + cellSize, gridX + gridSize, gridY + cellSize);
        
        // Draw points at the intersections
        this.p.noStroke();
        this.p.fill(75, 85, 99); // text-gray-600
        const dotSize = 2; // Small dots
        
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
        
        // Update position and size properties for hit detection
        this.fillGridButtonPosition = { x: iconX, y: iconY };
        this.fillGridButtonSize = { width: size, height: size };
    }

    // Add method to fill grid with points
    fillGridWithPoints() {
        // Record state before filling if recordCurrentState exists
        if (typeof this.p.recordCurrentState === 'function') {
            this.p.recordCurrentState("beforeFillGrid");
        }
        
        console.log("Starting fillGridWithPoints");
        
        // Clear existing points and lines first
        this.points.length = 0;
        this.lineManager.clearAllLines();
        
        // Get the current grid type and dimensions
        const grid = this.gridContext.getGrid();
        console.log("Grid object:", grid);
        
        // Force grid update before proceeding
        this.updateGridContext();
        console.log("heeey");

        // Check grid type in multiple ways to be sure
        const toolConfigType = this.toolConfig?.grid || "NoGrid";
        console.log("Grid types - current:", this.currentGridType, 
                    "toolConfig:", toolConfigType,
                    "grid constructor:", grid.constructor.name);
        
        // More robust check for NoGrid: check multiple conditions
        if (this.currentGridType === "none"){
            
   this.generateRandomPoints();

        } else if (this.currentGridType === "rect") {
            // Get grid dimensions - use current grid values or user settings
            const cols = grid.cols || 5;  // Default to 5 if undefined
            const rows = grid.rows || 5;  // Default to 5 if undefined
            console.log(`Rectangle grid dimensions: ${cols}x${rows}`);
            
            // Calculate grid cell dimensions
            const gridWidth = grid.width || (LAYOUT.GRID_SIZE - 2 * LAYOUT.MARGIN);
            const gridHeight = grid.height || (LAYOUT.GRID_SIZE - 2 * LAYOUT.MARGIN);
            const cellWidth = gridWidth / cols;
            const cellHeight = gridHeight / rows;
            const startX = grid.x || LAYOUT.MARGIN;
            const startY = grid.y || LAYOUT.MARGIN;
            
            // Create points in row-column order to match our indexing
            let pointId = 0;
            for (let row = 0; row <= rows; row++) {
                for (let col = 0; col <= cols; col++) {
                    const point = {
                        x: startX + col * cellWidth,
                        y: startY + row * cellHeight,
                        id: pointId++
                    };
                    this.points.push(point);
                }
            }
            
            // Total points per row is cols + 1 (for intersections)
            const pointsPerRow = cols + 1;
            
            // Create lines between adjacent points
            for (let row = 0; row <= rows; row++) {
                for (let col = 0; col <= cols; col++) {
                    const currentIndex = row * pointsPerRow + col;
                    
                    // Connect to right neighbor (if not at right edge)
                    if (col < cols && this.points[currentIndex] && this.points[currentIndex + 1]) {
                        this.lineManager.lines.push({
                            start: this.points[currentIndex],
                            end: this.points[currentIndex + 1],
                            selected: true
                        });
                    }
                    
                    // Connect to bottom neighbor (if not at bottom edge)
                    if (row < rows && this.points[currentIndex] && this.points[currentIndex + pointsPerRow]) {
                        this.lineManager.lines.push({
                            start: this.points[currentIndex],
                            end: this.points[currentIndex + pointsPerRow],
                            selected: true
                        });
                    }
                }
            }
            
            console.log(`Created ${this.points.length} points and ${this.lineManager.lines.length} lines for rectangular grid`);
        } 
        else if (this.currentGridType === "radial") {
            // Get radial grid parameters
            const angularDivisions = grid.angularDivisions || 12; // Default to 12 if undefined 
            const radialDivisions = grid.radialDivisions || 5;   // Default to 5 if undefined
            const centerX = grid.centerX || (LAYOUT.GRID_SIZE / 2);
            const centerY = grid.centerY || (LAYOUT.GRID_SIZE / 2);
            const radius = grid.radius || (Math.min(LAYOUT.GRID_SIZE, LAYOUT.GRID_SIZE) / 2 - LAYOUT.MARGIN);
            
            console.log(`Radial grid parameters: ${angularDivisions} angles, ${radialDivisions} circles`);
            
            // Add points for each intersection on concentric circles
            let pointId = 0;
            
            // Add points on the circles
            for (let r = 1; r <= radialDivisions; r++) {
                const currentRadius = (radius / radialDivisions) * r;
                
                for (let a = 0; a < angularDivisions; a++) {
                    const angle = (2 * Math.PI * a) / angularDivisions;
                    const x = centerX + currentRadius * Math.cos(angle);
                    const y = centerY + currentRadius * Math.sin(angle);
                    
                    this.points.push({
                        x: x,
                        y: y,
                        id: pointId++
                    });
                }
            }
            
            // Add center point last
            const centerPointId = pointId++;
            this.points.push({
                x: centerX,
                y: centerY,
                id: centerPointId
            });
            
            // NOW ADD LINES BETWEEN POINTS:
            
            // Connect points along each circle (adjacent angular points)
            for (let r = 0; r < radialDivisions; r++) {
                for (let a = 0; a < angularDivisions; a++) {
                    const currentIndex = r * angularDivisions + a;
                    const nextAngleIndex = r * angularDivisions + ((a + 1) % angularDivisions);
                    
                    this.lineManager.lines.push({
                        start: this.points[currentIndex],
                        end: this.points[nextAngleIndex],
                        selected: true
                    });
                }
            }
            
            // Connect points along radial lines (between adjacent circles)
            for (let r = 0; r < radialDivisions - 1; r++) {
                for (let a = 0; a < angularDivisions; a++) {
                    const currentIndex = r * angularDivisions + a;
                    const nextRadiusIndex = (r + 1) * angularDivisions + a;
                    
                    this.lineManager.lines.push({
                        start: this.points[currentIndex],
                        end: this.points[nextRadiusIndex],
                        selected: true
                    });
                }
            }
            
            // Connect center point to the innermost circle
            for (let a = 0; a < angularDivisions; a++) {
                this.lineManager.lines.push({
                    start: this.points[centerPointId],
                    end: this.points[a],
                    selected: true
                });
            }
            
            console.log(`Created ${this.points.length} points and ${this.lineManager.lines.length} lines for radial grid`);
        }
        
        console.log(`Generated ${this.points.length} grid points`);
        
        // Record state after filling if recordCurrentState exists
        if (typeof this.p.recordCurrentState === 'function') {
            this.p.recordCurrentState("fillGrid");
        }
    }

    // Add this method to handle delete functionality
    deleteAllPoints() {
        // Record state before deletion if recordCurrentState exists
        if (typeof this.p.recordCurrentState === 'function') {
            this.p.recordCurrentState("beforeDelete");
        }
        
        // Clear all points
        this.points.length = 0;
        
        // Remove all lines
        this.lineManager.clearAllLines();
        
        // Record state after deletion if recordCurrentState exists
        if (typeof this.p.recordCurrentState === 'function') {
            this.p.recordCurrentState("deleteAll");
        }
    }

    // Add a method to generate random points
    generateRandomPoints() {
        const generator = new RandomPointGenerator(this.p, LAYOUT.GRID_SIZE, LAYOUT.GRID_SIZE);
        const { points, lines } = generator.generate();
        
        // Clear existing points and lines
        this.points.length = 0;
        this.lineManager.clearAllLines();
        
        // Add new points
        points.forEach(point => this.points.push(point));
        
        // Add new lines to the line manager
        lines.forEach(line => this.lineManager.lines.push(line));
    }



    // Modify the draw method to handle the null selectedPoint
    draw() {
        this.p.cursor(this.p.ARROW)
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

        //For changing the cursor
        let anyHovered = this.possibleLinesRenderer.getAnyHoveredLine();

        // Draw all points with hover effect
        this.points.forEach((point) => {
            const isHovered = this.pointRenderer.isHovered(point, this.p.mouseX, this.p.mouseY);
            if (isHovered) {
                anyHovered = true; // At least one point is hovered
            }
            this.pointRenderer.draw(point, isHovered); // Render the point with hover state

        });
        // Update cursor based on whether any point is hovered
        if (anyHovered) this.p.cursor(this.p.HAND);

        // Draw the delete button
        this.drawDeleteButton();
        
        // Draw the fill grid button
        this.drawFillGridButton();
        
        // Draw help button if tutorial is inactive
        if (this.tutorial && !this.tutorial.active) {
            this.drawHelpButton();
        }
        
        // Draw tutorial overlay last so it appears on top
        if (this.tutorial && this.tutorial.active) {
            this.tutorial.draw();
        }
    }

    // Update drawHelpButton method to make the button bigger
    drawHelpButton() {
        this.p.push();
    
        // Make the button the same size as utility buttons
        const size = 30; // Larger button size (was 24)
    
        // Position at top-right
        const iconX = LAYOUT.GRID_SIZE;
        const iconY = LAYOUT.MARGIN; // Keep it at the top
    
        // Update the class properties to reflect size and position
        this.helpButtonSize = size;
        this.helpButtonX = iconX;
        this.helpButtonY = iconY;
    
        // Check if mouse is hovering over button
        const isHovered = 
            this.p.mouseX >= iconX && 
            this.p.mouseX <= iconX + size && 
            this.p.mouseY >= iconY && 
            this.p.mouseY <= iconY + size;
    
        // Change cursor to hand when hovering
        if(isHovered) this.p.cursor(this.p.HAND);
    
        // Match your index.css button styles
        if(isHovered) {
            this.p.fill(229, 231, 235); // hover:bg-gray-200 - matches the hover style
        } else {
            this.p.fill(209, 213, 219); // bg-gray-300 - matches the normal style
        }
        
        this.p.noStroke(); // No border like your buttons
        this.p.rect(iconX, iconY, size, size, 4); // rounded (4px is similar to your rounded class)
        
        // Keep question mark size similar but centered in the larger button
        this.p.fill(75, 85, 99); // text-gray-600
        this.p.noStroke();
        this.p.textSize(16); // Appropriate size for the question mark
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.text("?", iconX + size/2, iconY + size/2 + 1); // +1 for better vertical alignment
    
        this.p.pop();
    }

    updateMergedParams(newMergedParams) {
        this.mergedParams = newMergedParams;
    }

    updateToolConfig(newToolConfig) {
        this.toolConfig = newToolConfig;
    }


    mousePressed() {
        if (!this.mouseHandler) return;
        
        // First check if the tutorial handled the click
        if (this.tutorial && this.tutorial.active) {
            if (this.tutorial.handleMousePressed(this.p.mouseX, this.p.mouseY)) {
                return true; // Tutorial handled the click
            }
        }
        
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
        
        // Check for help button clicks when tutorial is inactive
        if (this.tutorial && !this.tutorial.active &&
            this.p.mouseX >= this.helpButtonX && 
            this.p.mouseX <= this.helpButtonX + this.helpButtonSize &&
            this.p.mouseY >= this.helpButtonY && 
            this.p.mouseY <= this.helpButtonY + this.helpButtonSize) {
            
            this.tutorial.toggleTutorial();
            return true;
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
        let gridSize = LAYOUT.GRID_SIZE - LAYOUT.MARGIN * 2;

        // Position the delete button at the bottom right corner of the canvas
        this.deleteButtonPosition = { 
            x: LAYOUT.GRID_SIZE - this.deleteButtonSize.width - LAYOUT.MARGIN,
            y: LAYOUT.GRID_SIZE - this.deleteButtonSize.height - LAYOUT.MARGIN
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