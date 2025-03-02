import ConfigParser from "./ConfigParser.js";
import CustomNoise from "./CustomNoise.js";
import LineGenerator from "./LineGenerator.js";
import SubShapeGenerator from "./SubShapeGenerator.js";

class ShapeGeneratorV2 {
    constructor(p, config) {
        this.p = p;
        this.configParser = new ConfigParser(p, config);

        //Noise X & Y
        this.noisePos = {x: 0, y: 0};

        this.cNoise = new CustomNoise(p);

        this.lineGenerator = null;
        this.subShapeGenerators = [];

        this.endPoints = [];

        this.usedEndpoints = new Set();
    }

    generate() {
        /** LINE GENERATION */
        //Retrieve information for line generation
        const lineParams = this.configParser.getParameters();
        this.lineGenerator = new LineGenerator(this.p, lineParams, this.cNoise);
        this.lineGenerator.generateLines();

        //Update endpoints so the subshapes know them
        this.endPoints = this.lineGenerator.getEndpoints();

        /** SUBSHAPE GENERATION */
        //Retrieve Subshape information
        this.subShapes = this.configParser.getSubShapeConfigs();

        // Iterate through the subShapes
        for (const subShape of this.subShapes) {
            let subShapeGenerator = new SubShapeGenerator(this.p, subShape, this.endPoints, this.cNoise);
            this.subShapeGenerators.push(subShapeGenerator);
            subShapeGenerator.generate();
        }


    }

    draw(){
        //Draw lines based on lineGenerator
        this.lineGenerator.draw();
        // Draw all subShapes by iterating through subShapeGenerators
        for (const subShapeGenerator of this.subShapeGenerators) {
            subShapeGenerator.draw();
        }
    }
}
export default ShapeGeneratorV2;