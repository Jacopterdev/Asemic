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

        this.cNoise = new CustomNoise(p, this.noisePos);

        this.lineGenerator = null;
        this.subShapeGenerators = [];

    }

    generate() {
        this.cNoise.resetNoise();
        this.subShapeGenerators = [];

        /** LINE GENERATION */
        //Retrieve information for line generation
        const lineParams = this.configParser.getParameters();
        const configuredLines = this.configParser.getConfiguredLines();
        const lineType = this.configParser.getLineType();
        const lineMode = this.configParser.getLineGenerationMode();
        const points = this.configParser.getPoints();

        this.lineGenerator = new LineGenerator(this.p, this.cNoise, this.noisePos);
        this.lineGenerator.generateLines(lineParams, configuredLines, lineType, lineMode, points);

        //Update endpoints so the subshapes know them
        const lines = this.lineGenerator.getLines();
        const curves = this.lineGenerator.getCurves();

        /** SUBSHAPE GENERATION */
        //Retrieve Subshape information
        this.subShapes = this.configParser.getSubShapeConfigs();

        // Iterate through the subShapes
        for (const subShape of this.subShapes) {
            console.log("SubShape:", subShape.config);
            let subShapeGenerator = new SubShapeGenerator(this.p, subShape.config, this.cNoise, this.noisePos, lines, curves);
            this.subShapeGenerators.push(subShapeGenerator);
            subShapeGenerator.generate();
        }


    }

    draw(xray = false){
        //Draw lines based on lineGenerator
        this.lineGenerator.draw(xray);
        // Draw all subShapes by iterating through subShapeGenerators
        for (const subShapeGenerator of this.subShapeGenerators) {
            subShapeGenerator.draw(xray);
        }
    }

    setNoisePosition(x, y) {
        //this.noisePos.x = x;
        //this.noisePos.y = y;

        // Create a new object with numeric values instead of modifying existing object
        this.noisePos = {
            x: Number(x),
            y: Number(y)
        };
    }
}
export default ShapeGeneratorV2;