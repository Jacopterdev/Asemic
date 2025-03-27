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
import DisplayGrid from "../DisplayGrid.js";
import * as buffer from "node:buffer";
import Effects from "../Effects.js";
import DeleteButton from "../SkeletonButtons/DeleteButton.js";
import FillGridButton from "../SkeletonButtons/FillGridButton.js";
import HelpButton from "../SkeletonButtons/HelpButton.js";
import RadialGridButton from "../SkeletonButtons/RadialGridButton.js";
import RectGridButton from "../SkeletonButtons/RectGridButton.js";
import NoGridButton from "../SkeletonButtons/NoGridButton.js";
import ToggleButtonGroup from "../SkeletonButtons/ToggleButtonGroup.js";
import radialGridButton from "../SkeletonButtons/RadialGridButton.js";
import rectGridButton from "../SkeletonButtons/RectGridButton.js";
import noGridButton from "../SkeletonButtons/NoGridButton.js";
import EraserToolButton from "../SkeletonButtons/EraserToolButton.js"; // Import DisplayGrid if not already imported
import ConnectToOneButton from "../SkeletonButtons/ConnectToOneButton.js";
import ConnectWithoutCrossingButton from "../SkeletonButtons/ConnectWithoutCrossingButton.js";
import ConnectToAllButton from "../SkeletonButtons/ConnectToAllButton.js";

class SkeletonState {
    constructor(p, points, lineManager, mergedParams, toolConfig) {
        this.p = p;
        this.name = "Edit Skeleton";
        this.mergedParams = mergedParams;
        this.toolConfig = toolConfig;
        this.currentGridType = "none"; // Track the current grid type
        this.previousGridType = null;
        this.possibleLinesRenderer = null;
        this.pointRenderer = null;
        this.gridContext = null;
        this.points = points;
        this.lineManager = lineManager;
        this.ephemeralLineAnimator = null;
        this.possibleLinesRenderer  = null;
        this.mouseHandler = null;

        this.xray = false;
        this.resetXrayTimer = null;



        this.createSkeletonButtons();

        // Initialize tutorial system
        const tutorialSeen = typeof localStorage !== 'undefined' && localStorage.getItem('tutorialCompleted') === 'true';
        this.tutorial = new Tutorial(p);
        this.tutorial.active = false; // Only show if not seen before
        
        // Help button properties
        this.helpButtonSize = LAYOUT.BUTTON_SIZE;
        this.helpButtonX = LAYOUT.GRID_SIZE - 60;
        this.helpButtonY = LAYOUT.MARGIN;
        
        this.init();

        //BUFFER
        this.bufferWidth = 350; // Buffer width
        this.bufferHeight = 800; // Buffer height

        // Initialize the buffer (off-screen graphics canvas)
        this.buffer = p.createGraphics(this.bufferWidth, this.bufferHeight);
        this.initBufferGrid(); // Initialize the buffer grid

    }

    createSkeletonButtons(){
        let x = LAYOUT.GRID_SIZE;
        let y = LAYOUT.MARGIN;

        const buttonsCanFit = Math.floor((LAYOUT.GRID_SIZE - LAYOUT.BUTTON_SIZE - LAYOUT.MARGIN) / (LAYOUT.BUTTON_SIZE + LAYOUT.BUTTON_PADDING));
        console.log("Buttons can fit:", buttonsCanFit);

        // Function to calculate button position based on index
        const calculateButtonY = (index) => {
            return y + index * (LAYOUT.BUTTON_SIZE + LAYOUT.BUTTON_PADDING);
        };

        // Create an array to store the buttons
        this.skeletonButtons = [];

        // Add buttons dynamically based on index
        this.deleteButton = new DeleteButton(
            this.p,
            x, // x-coordinate for all buttons in the column
            calculateButtonY(buttonsCanFit), // Dynamic y-coordinate for the button
            () => this.deleteAllPoints() // Define delete callback
        );
        this.skeletonButtons.push(this.deleteButton);

        this.fillGridButton = new FillGridButton(
            this.p,
            x,
            calculateButtonY(buttonsCanFit-1),
            () => this.fillGridWithPoints()
        );
        this.skeletonButtons.push(this.fillGridButton);

        this.helpButton = new HelpButton(
            this.p,
            x,
            calculateButtonY(0),
            () => this.tutorial.toggleTutorial()
        )
        this.skeletonButtons.push(this.helpButton);

        /** GRID BUTTONS */
        this.radialGridButton = new RadialGridButton(
            this.p,
            x,
            calculateButtonY(3),
            () => {
                this.setGrid("radial");
                this.gridButtons.toggle(this.radialGridButton);
            },
            true
        )
        this.skeletonButtons.push(this.radialGridButton);

        this.rectGridButton = new RectGridButton(
            this.p,
            x,
            calculateButtonY(4),
            () => {
                this.setGrid("rect");
                this.gridButtons.toggle(this.rectGridButton);
            },
            true
        )
        this.skeletonButtons.push(this.rectGridButton);

        this.noGridButton = new NoGridButton(
            this.p,
            x,
            calculateButtonY(5),
            () => {
                this.setGrid("none");
                this.gridButtons.toggle(this.noGridButton);
            },
            true
        )
        this.skeletonButtons.push(this.noGridButton);

        this.gridButtons = new ToggleButtonGroup([this.radialGridButton, this.rectGridButton, this.noGridButton]);
        this.gridButtons.toggle(this.noGridButton); //Default Grid.

        /** TOOL BUTTONS */
        //Add her, i draw og i onclick.
        this.eraserToolButton = new EraserToolButton(
            this.p,
            x,
            calculateButtonY(7),
            () => {
                this.setTool("eraser"); // Define the tool type for eraser
                this.toolButtons.toggle(this.eraserToolButton);
            },
            true
        )
        this.skeletonButtons.push(this.eraserToolButton);

        // Connect to one button (simple line between two points)
        this.connectToOneButton = new ConnectToOneButton(
            this.p,
            x,
            calculateButtonY(8),
            () => {
                this.setTool("connectToOne");
                this.toolButtons.toggle(this.connectToOneButton);
            },
            true
        )
        this.skeletonButtons.push(this.connectToOneButton);

        // Connect without crossing (four connected points forming a square)
        this.connectWithoutCrossingButton = new ConnectWithoutCrossingButton(
            this.p,
            x,
            calculateButtonY(9),
            () => {
                this.setTool("connectWithoutCrossing");
                this.toolButtons.toggle(this.connectWithoutCrossingButton);
            },
            true
        )
        this.skeletonButtons.push(this.connectWithoutCrossingButton);

        // Connect to all (six points with crossing connections)
        this.connectToAllButton = new ConnectToAllButton(
            this.p,
            x,
            calculateButtonY(10),
            () => {
                this.setTool("connectToAll");
                this.toolButtons.toggle(this.connectToAllButton);
            },
            true
        )
        this.skeletonButtons.push(this.connectToAllButton);

        // Create the toggle button group
        this.toolButtons = new ToggleButtonGroup([
            this.eraserToolButton, 
            this.connectToOneButton, 
            this.connectWithoutCrossingButton,
            this.connectToAllButton
        ]);

        // Set connectToOneButton as the default tool
        this.toolButtons.toggle(this.connectToOneButton);

    }



    init(){
        // Other initialization code...

        // Initialize the gridContext based on the default `currentGridType` ("none")
        //this.gridContext = new GridContext(RectGrid, this.p, SPACING.MARGIN, SPACING.MARGIN, LAYOUT.GRID_SIZE - SPACING.MARGIN * 2);
        this.gridContext = new GridContext(RectGrid, this.p, SPACING.MARGIN, SPACING.MARGIN, 800); //Is updated somewhere else!

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
                this.p.previousPoints = JSON.parse(JSON.stringify(this.points));
                this.p.previousLines = JSON.parse(JSON.stringify(this.lineManager.getLines()));
            }
        );

        // Other initialization code...
    }

    initBufferGrid() {
        // Initialize a grid with 1 column and 3 rows inside the buffer
        this.bufferGrid = new DisplayGrid(
            this.p,
            1, // 1 column
            3, // 3 rows
            LAYOUT.MARGIN, // X start in the buffer (relative to buffer)
            LAYOUT.MARGIN, // Y start in the buffer
            this.bufferWidth - LAYOUT.MARGIN*2, // Total height of the grid
            this.mergedParams,
            this.buffer
        );
        this.effect = new Effects(this.buffer);

        // Render the grid onto the buffer immediately
        this.drawBufferGrid();
    }

    drawBufferGrid() {
        // Clear the buffer and draw the grid
        this.buffer.background(255);
        this.bufferGrid.drawShapes();
        this.effect.applyEffects(this.bufferGrid.scale * this.p.getShapeScale() * LAYOUT.SHAPE_SCALE);

        //this.bufferGrid.drawShapes(true);
        this.bufferGrid.drawGrid(); // Pass buffer as P5 canvas for drawing
        if (this.xray) this.bufferGrid.drawShapes(true);

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

    // Add this method to your SkeletonState class
    setTool(toolType) {
        // You can store the current tool type for use in other methods
        this.currentToolType = toolType;
        
        // Update the mouseHandler behavior based on the selected tool
        if (this.mouseHandler) {
            this.mouseHandler.setToolMode(toolType);
            
            // Reset the lastAddedPoint when switching to connectToOne tool
            if (toolType === "connectToOne") {
                this.mouseHandler.lastAddedPoint = null;
            }
        }
        
        console.log(`Tool changed to: ${toolType}`);
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
        this.p.cursor(this.p.ARROW);
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
        //this.drawDeleteButton();
        this.deleteButton.draw();
        
        // Draw the fill grid button
        //this.drawFillGridButton();
        this.fillGridButton.draw();
        
        // Draw help button if tutorial is inactive
        if (this.tutorial && !this.tutorial.active) {
            this.helpButton.draw();
        }
        
        // Draw tutorial overlay last so it appears on top
        if (this.tutorial && this.tutorial.active) {
            this.tutorial.draw();
        }

        this.radialGridButton.draw();
        this.rectGridButton.draw();
        this.noGridButton.draw();

        this.eraserToolButton.draw();
        this.connectToOneButton.draw();
        this.connectWithoutCrossingButton.draw();
        this.connectToAllButton.draw();

        this.drawBufferGrid();
        // Render the buffer on the right-hand side of the canvas
        const bufferX = this.p.width - this.bufferWidth; // Position 10px from the right edge
        const bufferY = 0; // Position 0px from the top
        this.p.image(this.buffer, bufferX, bufferY);
    }


    updateMergedParams(newMergedParams) {
        this.mergedParams = newMergedParams;
        this.effect.setSmoothAmount(this.mergedParams.smoothAmount);
        this.bufferGrid.updateMergedParams(newMergedParams);

        // Clear any existing timer
        if (this.resetXrayTimer) {
            clearTimeout(this.resetXrayTimer);
        }

        // Set a timer to disable xray mode after 1 second
        this.resetXrayTimer = setTimeout(() => {
            this.xray = false;
        }, 1000);
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


        if(!this.isMouseWithinGrid()){
            this.xray = true;
        }


        if(this.deleteButton.checkHover(this.p.mouseX, this.p.mouseY)) {
            this.deleteButton.click();
            return;
        }
        
        // Check if the fill grid button was clicked
        if (this.fillGridButton.checkHover(this.p.mouseX, this.p.mouseY)) {
            this.fillGridButton.click();
            return;
        }
        
        // Check for help button clicks when tutorial is inactive
        if (this.helpButton.checkHover(this.p.mouseX, this.p.mouseY) && !this.tutorial.active) {
            this.helpButton.click();
            return;
        }

        if(this.radialGridButton.checkHover(this.p.mouseX, this.p.mouseY)) {
            this.radialGridButton.click();
            return;
        }

        if(this.rectGridButton.checkHover(this.p.mouseX, this.p.mouseY)) {
            this.rectGridButton.click();
            return;
        }

        if(this.noGridButton.checkHover(this.p.mouseX, this.p.mouseY)) {
            this.noGridButton.click();
            return;
        }

        if(this.eraserToolButton.checkHover(this.p.mouseX, this.p.mouseY)) {
            this.eraserToolButton.click();
            return;
        }
        
        if(this.connectToOneButton.checkHover(this.p.mouseX, this.p.mouseY)) {
            this.connectToOneButton.click();
            return;
        }
        
        if(this.connectWithoutCrossingButton.checkHover(this.p.mouseX, this.p.mouseY)) {
            this.connectWithoutCrossingButton.click();
            return;
        }
        
        if(this.connectToAllButton.checkHover(this.p.mouseX, this.p.mouseY)) {
            this.connectToAllButton.click();
            return;
        }
        
        const knobDragged = this.gridContext.mousePressed(this.p.mouseX, this.p.mouseY);
        if (knobDragged) return;
        this.mouseHandler.handleMousePressed();
    }

    mouseDragged() {
        if (!this.mouseHandler) return;
        // First check if the grid is being interacted with
        const knobDragged = this.gridContext.mouseDragged(this.p.mouseX, this.p.mouseY);
        if (knobDragged) return;
        this.mouseHandler.handleMouseDragged();

        if(!this.isMouseWithinGrid()){
            this.xray = true;
        }
    }

    mouseReleased() {
        if (!this.mouseHandler) return;
        const knobDragged = this.gridContext.mouseReleased();
        if (knobDragged) return;
        this.mouseHandler.handleMouseReleased();

        this.xray = false;
    }

    mouseMoved() {
        if (this.mouseHandler) {
            this.mouseHandler.handleMouseMoved();
        }
    }

    mouseWheel(event) {
        this.bufferGrid.handleScroll(event.delta);
    }

    setGrid(type = "none"){
        this.currentGridType = type;
    }

    updateGridContext = () => {
        let xStart = LAYOUT.MARGIN;
        let yStart = LAYOUT.MARGIN;
        let gridSize = LAYOUT.GRID_SIZE - LAYOUT.MARGIN * 2;

        // Retrieve the latest grid type from toolConfig
        //const toolConfig = this.toolConfig;
        //const gridType = toolConfig?.grid || "none";

        const gridType = this.currentGridType;
        const previousGridType = this.previousGridType;

        // Only update the gridContext if the gridType has changed
        if (previousGridType !== gridType) {
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
            this.previousGridType = gridType; // Backup the current grid type

        }
    };

    isMouseWithinGrid() {
        // Define the grid boundaries (adjust these values as per your grid dimensions)
        const gridStartX = LAYOUT.MARGIN; // Grid's starting X position
        const gridStartY = LAYOUT.MARGIN; // Grid's starting Y position
        const gridEndX = LAYOUT.GRID_SIZE + 2* LAYOUT.MARGIN; // Grid's ending X position
        const gridEndY = LAYOUT.GRID_SIZE + LAYOUT.MARGIN; // Grid's ending Y position

        // Check if the mouse is within the grid boundaries
        const isWithinX = this.p.mouseX >= gridStartX && this.p.mouseX <= gridEndX;
        const isWithinY = this.p.mouseY >= gridStartY && this.p.mouseY <= gridEndY;

        return isWithinX && isWithinY;
    }

}
export default SkeletonState;