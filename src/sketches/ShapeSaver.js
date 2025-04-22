import ShapeGeneratorV2 from "./ShapeGenerator/ShapeGeneratorV2.js";
import shapeDictionary from "./ShapeDictionary";
import Effects from "./Effects.js";
import {SPACING as LAYOUT} from "./States/LayoutConstants.js";
import Potrace from "./potrace.js";

class ShapeSaver {
    static #instance;

    constructor() {
        if (ShapeSaver.#instance) {
            return ShapeSaver.#instance;
        }
        ShapeSaver.#instance = this;
        
        // Initialize these properties to null
        this.p = null;
        this.mergedParams = null;
    }
    
    // Add this initialization method
    init(p, mergedParams) {
        this.p = p;
        this.mergedParams = mergedParams;
        return this; // For method chaining
    }
    
    download(letter) {
        // Check if properly initialized
        if (!this.p || !this.mergedParams) {
            console.error("ShapeSaver not properly initialized. Call init() first.");
            return false;
        }
        
        const buffer = this.setUpShapeForExport(letter);

        // Save the buffer as PNG
        buffer.save(`shape_${letter}.png`);
        
        // Clean up
        buffer.remove();
        
        console.log(`Downloaded shape ${letter}`);
        return true;
    }

    async saveAsSvg(letter) {
        // Check if properly initialized
        if (!this.p || !this.mergedParams) {
            console.error("ShapeSaver not properly initialized. Call init() first.");
            return false;
        }

        const buffer = this.setUpShapeForExport(letter);

        // Step 2: Extract the buffer contents as a base64 image
        const base64Image = buffer.elt.toDataURL("image/png");
        buffer.remove();

        // Step 3: Use potrace.js to generate SVG
        const potrace = Potrace; // Assuming Potrace is globally available
        potrace.loadImageFromUrl(base64Image); // Load the buffer image
        /**potrace.setParameter({
            turnpolicy: "minority",
            optcurve: true,
            alphamax: 1.0,
            opttolerance: 0.2,
        });*/

        return new Promise((resolve, reject) => {
            potrace.process(() => {
                let svg = potrace.getSVG(1.0); // Generate the SVG with size and curve
                if (svg) {
                    // Create a downloadable link
                    const blob = new Blob([svg], { type: "image/svg+xml" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `shape_${letter}.svg`;
                    link.click();
                    URL.revokeObjectURL(link.href);

                    console.log(`Saved shape ${letter} as SVG.`);
                    resolve(true);
                } else {
                    console.error("Failed to generate SVG.");
                    reject(false);
                }
            });
        });
    }

    setUpShapeForExport(letter){
        // Check if properly initialized
        if (!this.p || !this.mergedParams) {
            console.error("ShapeSaver not properly initialized. Call init() first.");
            return false;
        }

        // Use a reasonable output size
        const outputSize = 1600; // Fixed size for output
        const buffer = this.p.createGraphics(outputSize, outputSize);
        buffer.background(255);

        // Calculate a more appropriate scale factor
        //const displayScale = LAYOUT.SHAPE_SCALE * this.p.getShapeScale(); // Adjust this value to size the shape appropriately
        const shapeOffset = this.p.getShapeOffset();
        console.log("shapeOffset", shapeOffset);

        // Draw the shape centered in the buffer
        buffer.push();
        const margin = 400;

        buffer.translate((margin)-shapeOffset.x, (margin)-shapeOffset.y);

        buffer.scale(1); // Use a fixed display scale

        // Create a fresh shape instance for the buffer
        const bufferShape = new ShapeGeneratorV2(buffer, this.mergedParams);
        const { x: noiseX, y: noiseY } = shapeDictionary.getValue(letter);
        bufferShape.setNoisePosition(noiseX, noiseY);
        bufferShape.generate();

        // Draw to the buffer
        bufferShape.draw(false);
        buffer.pop();

        // Apply the same effects as in the main canvas
        let effect = new Effects(buffer);
        effect.setSmoothAmount(this.mergedParams.smoothAmount);
        effect.applyEffects(1);
        return buffer;
    }


    // Add this method to the ShapeSaver class

    downloadComposition(composition, kerning = 350, scale = 0.4) {
        // Check if properly initialized
        if (!this.p || !this.mergedParams) {
            console.error("ShapeSaver not properly initialized. Call init() first.");
            return false;
        }
        
        // Check if composition is empty
        if (!composition || composition.length === 0) {
            console.warn("Cannot download empty composition");
            return false;
        }
        
        console.log(`Downloading composition: ${composition} with kerning=${kerning}, scale=${scale}`);
        
        // Calculate dimensions for the composition
        const letterHeight = 800;
        const bufferWidth = composition.length * kerning + 400; // Add padding
        const bufferHeight = letterHeight;
        
        // Create graphics buffer
        const buffer = this.p.createGraphics(bufferWidth, bufferHeight);
        buffer.background(255);
        
        // Start position for drawing (center the composition)
        let xPosition = 100; // Starting padding
        
        // Use the passed scale value instead of hardcoding it
        const shapeScale = scale;


        // Draw each letter in the composition
        for (let i = 0; i < composition.length; i++) {
            const letter = composition[i];
            
            // Skip spaces but advance the position
            if (letter === ' ') {
                xPosition += kerning;
                continue;
            }
            
            // Get noise position from dictionary
            const noisePosition = shapeDictionary.getValue(letter);
            if (!noisePosition) {
                console.warn(`No shape data found for letter: ${letter}`);
                xPosition += kerning;
                continue;
            }
            
            const { x: noiseX, y: noiseY } = noisePosition;
            
            // Draw the shape at the current position
            buffer.push();
            buffer.translate(xPosition, bufferHeight/2); // Center vertically
            buffer.scale(shapeScale); // Scale down the shape
            
            // Create shape instance for this letter
            const bufferShape = new ShapeGeneratorV2(buffer, this.mergedParams);
            bufferShape.setNoisePosition(noiseX, noiseY);
            bufferShape.generate();
            
            // Draw to the buffer
            bufferShape.draw(false);
            buffer.pop();
            
            // Advance position for next letter
            xPosition += kerning;
        }

        // Apply effects to the entire composition
        let effect = new Effects(buffer);
        effect.setSmoothAmount(this.mergedParams.smoothAmount);
        effect.applyEffects(1);
        
        // Save the composition
        buffer.save(`composition_${Date.now()}.png`);

        // Clean up
        buffer.remove();
        
        console.log(`Downloaded composition: ${composition}`);
        return true;
    }

    downloadFromInputField(shapeInputField) {
        // Check if properly initialized
        if (!this.p || !this.mergedParams) {
            console.error("ShapeSaver not properly initialized. Call init() first.");
            return false;
        }
        
        // Check if shapeInputField has shapes
        if (!shapeInputField.shapes || shapeInputField.shapes.length === 0) {
            console.warn("Cannot download empty composition");
            return false;
        }
        
        // Get composition as string of letters
        const composition = shapeInputField.shapes.map(item => item.letter).join('');
        console.log(`Downloading composition: ${composition}`);
        
        // Calculate dimensions based on input field parameters
        const bufferWidth = shapeInputField.width * 2;
        const bufferHeight = shapeInputField.height * 1.5;
        
        // Create buffer with white background
        const buffer = this.p.createGraphics(bufferWidth, bufferHeight);
        buffer.background(255);
        
        // Get values needed for layout
        const baseShapeWidth = shapeInputField.width / shapeInputField.maxShapes * shapeInputField.defaultOverlap;
        const kerningOffset = shapeInputField.kerning;
        const adjustedSpacing = baseShapeWidth + kerningOffset;
        
        // Calculate starting X position to center shapes
        const totalShapesWidth = shapeInputField.shapes.length * adjustedSpacing;
        let startX = (bufferWidth - totalShapesWidth) / 2;
        
        // Draw each shape to buffer
        for (let i = 0; i < shapeInputField.shapes.length; i++) {
            const { letter } = shapeInputField.shapes[i];
            
            // Get noise position for this letter
            const noisePosition = shapeDictionary.getValue(letter);
            if (!noisePosition) continue;
            
            const { x: noiseX, y: noiseY } = noisePosition;
            
            buffer.push();
            // Position properly in buffer
            //buffer.translate(startX, bufferHeight / 2);
            buffer.translate(startX, (bufferHeight / 2) - (bufferHeight * shapeInputField.scale));
            // Apply scale
            buffer.scale(shapeInputField.scale);
            
            // Create a new shape instance for the buffer
            const bufferShape = new ShapeGeneratorV2(buffer, this.mergedParams);
            bufferShape.setNoisePosition(noiseX, noiseY);
            bufferShape.generate();
            
            // Draw to buffer
            bufferShape.draw();
            
            buffer.pop();
            
            // Advance position
            startX += adjustedSpacing;
        }
        
        // Apply effects to the composition
        const effect = new Effects(buffer);
        effect.setSmoothAmount(this.mergedParams.smoothAmount);
        effect.applyEffects(shapeInputField.scale);
        
        // Save the composition
        buffer.save(`composition_${Date.now()}.png`);
        
        console.log("Downloaded composition successfully");
        return true;
    }

    downloadAllShapes(p, mergedParams, alphabet) {
        // Check if properly initialized
        if (!this.p || !this.mergedParams) {
            console.error("ShapeSaver not properly initialized. Call init() first.");
            return false;
        }
        
        console.log("Creating shape catalog PNG");
        
        // Filter out spaces from the alphabet
        const filteredAlphabet = alphabet.split('').filter(char => char !== ' ');
        
        // Define grid layout parameters
        const shapeSize = LAYOUT.GRID_SIZE-(LAYOUT.MARGIN*2);
        const spacing = LAYOUT.MARGIN*4;
        const columns = 5;
        const rows = Math.ceil(filteredAlphabet.length / columns);
        
        // Fix the buffer dimensions to include ALL shapes properly
        const bufferWidth = (columns * (shapeSize + spacing))+LAYOUT.MARGIN*4;
        const bufferHeight = (rows * (shapeSize + spacing))+LAYOUT.MARGIN*4;
        
        console.log(`Creating buffer with dimensions ${bufferWidth}x${bufferHeight}`);
        
        // Create two buffers - one for shapes (with effects) and one for text (without effects)
        const shapeBuffer = this.p.createGraphics(bufferWidth, bufferHeight);
        
        // Fill shape buffer with white background
        shapeBuffer.background(255);
        
        // Draw each shape to the shape buffer
        for (let i = 0; i < filteredAlphabet.length; i++) {
            const char = filteredAlphabet[i];
            
            // Calculate grid position
            const col = i % columns;
            const row = Math.floor(i / columns);
            
            // Calculate pixel position
            const x = (col * (shapeSize + spacing)) + LAYOUT.MARGIN*4;
            const y = (row * (shapeSize + spacing)) + LAYOUT.MARGIN*4;
            
            // Get noise position from dictionary
            const noisePos = shapeDictionary.getValue(char);
            if (!noisePos) {
                console.warn(`No noise position for char: ${char}`);
                continue;
            }
            
            // Draw the shape only to shape buffer
            shapeBuffer.push();
            shapeBuffer.translate(x, y); // Center in cell
            shapeBuffer.scale(1);
            
            const shape = new ShapeGeneratorV2(shapeBuffer, this.mergedParams);
            shape.setNoisePosition(noisePos.x, noisePos.y);
            shape.generate();
            shape.draw();
            
            shapeBuffer.pop();
        }
        
        // Apply effects to the shape buffer only
        const effect = new Effects(shapeBuffer);
        effect.setSmoothAmount(this.mergedParams.smoothAmount);
        effect.applyEffects(1);
        
        // Add text labels on top (not affected by smoothing)
        for (let i = 0; i < filteredAlphabet.length; i++) {
            const char = filteredAlphabet[i];
            
            // Calculate grid position
            const col = i % columns;
            const row = Math.floor(i / columns);
            
            // Calculate pixel position
            const x = (col * (shapeSize + spacing)) + LAYOUT.MARGIN*4;
            const y = (row * (shapeSize + spacing)) + LAYOUT.MARGIN*4;
            
            // Draw character label on the final buffer
            shapeBuffer.fill(0);
            shapeBuffer.noStroke();
            shapeBuffer.textSize(48);
            shapeBuffer.textAlign(shapeBuffer.LEFT, shapeBuffer.TOP);
            shapeBuffer.text(char, x, y + LAYOUT.MARGIN);
        }
        
        // Save the final composition
        shapeBuffer.save(`shape_catalog_${Date.now()}.png`);
        // Clean up
        shapeBuffer.remove();
        
        console.log("Shape catalog downloaded successfully");
        return true;
    }

}   // This static property will hold the singleton instance of ShapeDictionary


const shapeSaver = new ShapeSaver();
export default shapeSaver;

