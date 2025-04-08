import ShapeGeneratorV2 from "./ShapeGenerator/ShapeGeneratorV2.js";
import shapeDictionary from "./ShapeDictionary.js";

class MutantShopping {
    constructor(p, x, y, width, height, mergedParams, letter = 'A') {
        this.p = p;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.noiseJump = 0.1;

        this.rows = 3;
        this.cols = 3;
        this.mergedParams = mergedParams;

        this.cellWidth = this.width / this.cols;
        this.cellHeight = this.height / this.rows;

        this.grid = [];
        this.buffers = [];
        this.scale = 0.3;

        // Store the central letter
        this.centerLetter = letter;

        // Animation properties
        this.isAnimating = false;
        this.animationStartTime = 0;
        this.animationDuration = 800; // milliseconds
        this.startNoiseX = 0;
        this.startNoiseY = 0;
        this.targetNoiseX = 0;
        this.targetNoiseY = 0;

        // Initialize grid with the center shape based on the letter
        this.initGridWithLetter(letter);
    }

    initGridWithLetter(letter) {
        // Get noise position for the letter from the ShapeDictionary
        const centerPosition = shapeDictionary.getValue(letter);

        // Ensure we're working with numbers, not strings
        const centerNoiseX = typeof centerPosition.x === 'string' ?
            parseFloat(centerPosition.x) : centerPosition.x;
        const centerNoiseY = typeof centerPosition.y === 'string' ?
            parseFloat(centerPosition.y) : centerPosition.y;

        // The noise offset to create adjacent shapes
        const noiseOffset = this.noiseJump;

        // Create a 3x3 grid of cells with buffers
        for (let j = 0; j < this.rows; j++) {
            this.grid[j] = [];
            this.buffers[j] = [];

            for (let i = 0; i < this.cols; i++) {
                // Create cell coordinates
                const x = i * this.cellWidth + this.x;
                const y = j * this.cellHeight + this.y;

                // Create buffer for this cell
                const buffer = this.p.createGraphics(this.cellWidth, this.cellHeight);
                buffer.background(255);

                // Calculate noise position based on grid position relative to center
                let noiseX, noiseY;

                // Determine noise position relative to center
                if (i === 1 && j === 1) {
                    // Center cell - use the exact noise position from the dictionary
                    noiseX = centerNoiseX;
                    noiseY = centerNoiseY;
                } else {
                    // Adjacent cells - offset from center
                    const offsetX = (i - 1) * noiseOffset;
                    const offsetY = (j - 1) * noiseOffset;

                    // Ensure we use numeric operations, not string concatenation
                    noiseX = Number(centerNoiseX) + Number(offsetX);
                    noiseY = Number(centerNoiseY) + Number(offsetY);
                }

                // Create shape within buffer
                // Inside the loops in initGridWithLetter where you set the noise position
                const shape = new ShapeGeneratorV2(buffer, this.mergedParams);

                // Convert to numbers before setting the position
                const numericNoiseX = Number(noiseX);
                const numericNoiseY = Number(noiseY);
                shape.setNoisePosition(numericNoiseX, numericNoiseY);
                shape.generate();


                // Store buffer
                this.buffers[j][i] = buffer;

                // Store cell information with converted numeric values
                this.grid[j][i] = {
                    x: x,
                    y: y,
                    w: this.cellWidth,
                    h: this.cellHeight,
                    shape: shape,
                    noiseX: noiseX,
                    noiseY: noiseY,
                    letter: i === 1 && j === 1 ? letter : null
                };
            }
        }
    }

    drawShapes(xray = false) {
        // If we're animating, we'll handle it separately
        if (this.isAnimating) {
            this.drawAnimationFrame();
            return;
        }

        // Draw all shapes normally
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                const cell = this.grid[j][i];
                const buffer = this.buffers[j][i];

                // Only update buffer if not in xray mode
                if (!xray) {
                    // Clear the buffer and redraw shape
                    buffer.clear();
                    buffer.background(255);
                    buffer.push();
                    buffer.scale(this.scale);
                    cell.shape.draw();
                    buffer.pop();
                }

                // Draw the buffer to main canvas
                this.p.image(buffer, cell.x, cell.y, cell.w, cell.h);
            }
        }
    }



    drawGrid() {
        this.p.stroke(64);
        this.p.strokeWeight(1);
        this.p.noFill();

        // Draw horizontal and vertical grid lines
        for (let i = 0; i <= this.rows; i++) {
            const y = i * this.cellHeight + this.y;
            this.p.line(this.x, y, this.x + this.width, y);
        }

        for (let i = 0; i <= this.cols; i++) {
            const x = i * this.cellWidth + this.x;
            this.p.line(x, this.y, x, this.y + this.height);
        }

        // Highlight the center cell
        const centerCell = this.grid[1][1];

        if (centerCell.letter) {
            this.p.fill(0);
            this.p.noStroke();
            this.p.textAlign(this.p.RIGHT, this.p.BOTTOM);
            this.p.textSize(16);
            this.p.text(centerCell.letter, centerCell.x + centerCell.w - 5, centerCell.y + centerCell.h - 5);
        }
        this.p.noFill();

        this.p.stroke(255, 128, 0);
        this.p.strokeWeight(2);
        this.p.rect(centerCell.x, centerCell.y, centerCell.w, centerCell.h);
    }



    // Separate method to handle animation frame drawing
    drawAnimationFrame() {
        if (!this.isAnimating) return;

        // Calculate animation progress
        const elapsedTime = this.p.millis() - this.animationStartTime;
        let progress = elapsedTime / this.animationDuration;

        // If animation is complete
        if (progress >= 1) {
            this.finishAnimation();
            return;
        }

        // Ease the progress for smoother animation
        progress = this.easeInOutCubic(progress);

        // Interpolate between start and target positions
        const currentNoiseX = Number(this.startNoiseX) +
            (Number(this.targetNoiseX) - Number(this.startNoiseX)) * progress;
        const currentNoiseY = Number(this.startNoiseY) +
            (Number(this.targetNoiseY) - Number(this.startNoiseY)) * progress;

        // Get the center cell and buffer
        const centerCell = this.grid[1][1];
        const centerBuffer = this.buffers[1][1];

        // First, draw all cells that are not animating
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                // Skip the center cell which will be handled separately
                if (i === 1 && j === 1) continue;

                const cell = this.grid[j][i];
                const buffer = this.buffers[j][i];

                // Draw the buffer to the main canvas
                this.p.image(buffer, cell.x, cell.y, cell.w, cell.h);
            }
        }

        // Now handle the animating center cell
        centerCell.shape.setNoisePosition(currentNoiseX, currentNoiseY);
        centerCell.shape.generate();

        // Clear the buffer before redrawing
        centerBuffer.clear();
        centerBuffer.background(255);

        // Draw the shape to the buffer
        centerBuffer.push();
        centerBuffer.scale(this.scale);
        centerCell.shape.draw();
        centerBuffer.pop();

        // Draw the buffer to the main canvas
        this.p.image(centerBuffer, centerCell.x, centerCell.y, centerCell.w, centerCell.h);
    }



    // Easing function for smoother animation
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    finishAnimation() {
        // Update the shape dictionary with the new noise position (fixing the parameter order)
        shapeDictionary.setValue(this.centerLetter, this.targetNoiseX, this.targetNoiseY);
        console.log(`Updated noise position for ${this.centerLetter}: ${this.targetNoiseX}, ${this.targetNoiseY}`);

        // Reset animation flags
        this.isAnimating = false;

        // Update the center cell's stored noise position
        const centerCell = this.grid[1][1];
        centerCell.noiseX = this.targetNoiseX;
        centerCell.noiseY = this.targetNoiseY;

        // Reinitialize the grid with the updated noise position
        this.initGridWithLetter(this.centerLetter);
    }


    updateMergedParams(mergedParams) {
        this.mergedParams = mergedParams;

        // Preserve the noise positions from the current grid
        for (let j = 0; j < this.grid.length; j++) {
            for (let i = 0; i < this.grid[j].length; i++) {
                const cell = this.grid[j][i];
                const buffer = this.buffers[j][i];

                // Create new shape but keep the same noise position
                cell.shape = new ShapeGeneratorV2(buffer, this.mergedParams);
                cell.shape.setNoisePosition(cell.noiseX, cell.noiseY);
                cell.shape.generate();
            }
        }
    }

    setLetter(letter) {
        // Update the center letter and reinitialize the grid
        this.centerLetter = letter;
        this.initGridWithLetter(letter);
    }

    mousePressed(mouseX, mouseY) {
        // Don't handle clicks during animation
        if (this.isAnimating) return;

        // Check if mouse is inside any cell
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                // Skip the center cell - we can't click on our own position
                if (i === 1 && j === 1) continue;

                const cell = this.grid[j][i];

                if (mouseX >= cell.x && mouseX <= cell.x + cell.w &&
                    mouseY >= cell.y && mouseY <= cell.y + cell.h) {

                    // Start animation from center to clicked cell
                    this.startAnimation(cell.noiseX, cell.noiseY);
                    return; // Mouse click handled
                }
            }
        }

        return; // Mouse click not on any cell
    }

    startAnimation(targetNoiseX, targetNoiseY) {
        const centerCell = this.grid[1][1];
        const centerBuffer = this.buffers[1][1];
        centerBuffer.clear();

        // Store starting position with proper numeric conversion
        this.startNoiseX = Number(centerCell.noiseX);
        this.startNoiseY = Number(centerCell.noiseY);

        // Store target position with numeric conversion
        this.targetNoiseX = Number(targetNoiseX);
        this.targetNoiseY = Number(targetNoiseY);

        this.isAnimating = true;
        this.animationStartTime = this.p.millis();
    }

}

export default MutantShopping;