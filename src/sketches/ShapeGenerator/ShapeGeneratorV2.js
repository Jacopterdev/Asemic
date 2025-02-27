import {exampleConfig} from "./Constants.js";
import ConfigParser from "./ConfigParser.js";
import CustomNoise from "./CustomNoise.js";
import LineGenerator from "./LineGenerator.js";
import ShapeGenerator from "./ShapeGenerator.js";
import SubShapeGenerator from "./SubShapeGenerator.js";
import lineGenerator from "./LineGenerator.js";
import subShapeGenerator from "./SubShapeGenerator.js";

class ShapeGeneratorV2 {
    constructor(p, config = exampleConfig) {
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
        this.lineGenerator.generateLines(lineParams);

        //Update endpoints so the subshapes know them
        this.endPoints = lineGenerator.getEndpoints();

        /** SUBSHAPE GENERATION */
        //Retrieve Subshape information
        this.subShapes = this.configParser.getSubShapes();
        // Iterate through the subShapes
        for (const subShape of this.subShapes) {
            let subShapeGenerator = new SubShapeGenerator(this.p, subShape, this.endPoints, this.cNoise);
            this.subShapeGenerators.push(subShapeGenerator);
            subShapeGenerator.generate();
        }


    }

    draw(){
        //Draw lines based on lineGenerator

        //Draw all subShapes based on subShapeGenerators[]


        return;
    }
}
export default ShapeGeneratorV2;