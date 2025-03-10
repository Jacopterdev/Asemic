import ShapeGeneratorV2 from "./ShapeGenerator/ShapeGeneratorV2.js";
import shapeDictionary from "./ShapeDictionary";
import Effects from "./Effects.js";

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
        
        // Use a reasonable output size
        const outputSize = 800; // Fixed size for output
        const buffer = this.p.createGraphics(outputSize, outputSize);
        buffer.background(255);
        
        // Calculate a more appropriate scale factor
        const displayScale = 1; // Adjust this value to size the shape appropriately 
        
        // Draw the shape centered in the buffer
        buffer.push();
        //buffer.translate(80, 80); // Center properly in buffer
        buffer.scale(displayScale); // Use a fixed display scale
        
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

        // Save the buffer as PNG
        buffer.save(`shape_${letter}.png`);
        
        // Clean up
        buffer.remove();
        
        console.log(`Downloaded shape ${letter}`);
        return true;
    }

}   // This static property will hold the singleton instance of ShapeDictionary


const shapeSaver = new ShapeSaver();
export default shapeSaver;

