import {LINE_TYPE} from "./Constants.js";

class SubShapeGenerator {
    constructor(p, subShape, cNoise, noisePos, lines, curves, shapeSides) {
        this.p = p;
        this.subShape = subShape;
        this.cNoise = cNoise;
        this.noisePos = noisePos;

        this.lines = lines;
        this.curves = curves;

        this.shapeSides = shapeSides;

        this.polygons = [];

        this.usedEndpoints = new Set();
    }

    generate() {
        const placeAtPoints = this.subShape.connection;
        this.generatePolygonsForSubShape(placeAtPoints);
    }

    draw(xray = false){
        this.p.fill(0);
        this.p.strokeWeight(0);

        if(xray){
            this.p.strokeWeight(3);this.p.stroke(255,150,0); this.p.noFill();
        }

        for (const polygon of this.polygons) {
            this.p.beginShape();
            for (const v of polygon) {
                this.p.vertex(v.x, v.y);
            }
            this.p.endShape(this.p.CLOSE);
        }
    }

    generatePolygonsForSubShape(placeAtPoints) {
        // Get the number of polygons to generate for this shape
        const numPolygons = this.p.round(this.cNoise.noiseMap(this.noisePos, this.subShape.amount.min, this.subShape.amount.max));
        //const numPolygons = this.p.floor(this.p.random(shapeConfig.amount.min, shapeConfig.amount.max));

        for (let i = 0; i < numPolygons; i++) {
            // Determine if we should place along straight or curved path
            const availableTypes = [];
            if (this.lines.length > 0) {
                availableTypes.push(LINE_TYPE.STRAIGHT);
            }
            if (this.curves.length > 0) {
                availableTypes.push(LINE_TYPE.CURVED);
            }

            if (availableTypes.length === 0) continue;
            //const pathType = this.p.random(availableTypes);
            const pathType = availableTypes[this.p.floor(this.cNoise.noiseMap(this.noisePos, 0, availableTypes.length))];

            // Generate a base position and direction for the polygon
            const { base, direction } = this.determinePolygonPosition(pathType, placeAtPoints);
            if (!base) continue;

            // Create the polygon with the determined parameters
            const polygonParams = {
                size: this.cNoise.noiseMap(this.noisePos, this.subShape.size.min, this.subShape.size.max),
                sides: this.shapeSides,
                rotation: this.subShape.rotationType === "relative" && direction
                    ? this.p.atan2(direction.y, direction.x) +
                    this.cNoise.noiseMap(this.noisePos, this.subShape.angle.min, this.subShape.angle.max) * (this.p.PI / 180)
                    : this.cNoise.noiseMap(this.noisePos, this.subShape.angle.min, this.subShape.angle.max) * (this.p.PI / 180),
                distortion: this.cNoise.noiseMap(this.noisePos, this.subShape.distort.min, this.subShape.distort.max)
            };
            const polygonVertices = this.createPolygon(base, polygonParams);
            this.polygons.push(polygonVertices);
        }
    }

    // Determine position for a polygon based on path type and placement preference
    determinePolygonPosition(pathType, placeAtPoints) {
        if (pathType === LINE_TYPE.STRAIGHT) {
            return this.getPositionOnStraightLine(placeAtPoints);
        } else {
            return this.getPositionOnCurvedLine(placeAtPoints);
        }
    }

    // Get position on a straight line
    getPositionOnStraightLine(placeAtPoints) {
        if (this.lines.length === 0) {
            return { base: null, direction: null };
        }

        // Step 1: Calculate the weights based on line lengths
        const lineLengths = this.lines.map(line => line.length || this.calculateLineLength(line));

        // Step 2: Compute cumulative weights
        const totalLength = lineLengths.reduce((sum, length) => sum + length, 0);
        const cumulativeWeights = lineLengths.reduce((acc, length, i) => {
            const previousSum = acc[i - 1] || 0;
            acc.push(previousSum + length / totalLength);
            return acc;
        }, []);

        // Step 3: Generate a weighted random index
        const randomValue = this.cNoise.noiseMap(this.noisePos, 0, 1); // Generates a number between 0 and 1
        const chosenLineIndex = cumulativeWeights.findIndex(weight => randomValue <= weight);

        // Step 4: Use the index to select the line
        const chosenLine = this.lines[chosenLineIndex];

        const p1 = chosenLine.p1;
        const p2 = chosenLine.p2;

        if (placeAtPoints === "atEnd") {
            if (!this.usedEndpoints.has(p1.toString())) {
                this.usedEndpoints.add(p1.toString());
                return { base: p1, direction: this.p.createVector(p2.x - p1.x, p2.y - p1.y).normalize() };
            } else if (!this.usedEndpoints.has(p2.toString())) {
                this.usedEndpoints.add(p2.toString());
                return { base: p2, direction: this.p.createVector(p2.x - p1.x, p2.y - p1.y).normalize() };
            }
            return { base: null, direction: null };
        } else if (placeAtPoints === "Along") {
            const offset = this.cNoise.noiseMap(this.noisePos, 0.1, 0.9); // Avoid extreme ends
            const base = this.p.createVector(
                this.p.lerp(p1.x, p2.x, offset),
                this.p.lerp(p1.y, p2.y, offset)
            );
            const direction = this.p.createVector(p2.x - p1.x, p2.y - p1.y).normalize();
            return { base, direction };
        } else { //JOINTS PLACEHOLDER!
            const offset = this.cNoise.noiseMap(this.noisePos, 0.1, 0.9); // Avoid extreme ends
            const base = this.p.createVector(
                this.p.lerp(p1.x, p2.x, offset),
                this.p.lerp(p1.y, p2.y, offset)
            );
            const direction = this.p.createVector(p2.x - p1.x, p2.y - p1.y).normalize();
            return { base, direction };
        }
    }

    // Get position on a curved line
    getPositionOnCurvedLine(placeAtPoints) {
        if (this.curves.length === 0) {
            return { base: null, direction: null };
        }

        // Step 1: Calculate the weights based on curve lengths
        const curveLengths = this.curves.map(curve => curve.length || this.calculateCurveLength(curve));

        // Step 2: Compute cumulative weights
        const totalLength = curveLengths.reduce((sum, length) => sum + length, 0);
        const cumulativeWeights = curveLengths.reduce((acc, length, i) => {
            const previousSum = acc[i - 1] || 0;
            acc.push(previousSum + length / totalLength);
            return acc;
        }, []);

        // Step 3: Generate a weighted random index
        const randomValue = this.cNoise.noiseMap(this.noisePos, 0, 1); // Generates a number between 0 and 1
        const chosenCurveIndex = cumulativeWeights.findIndex(weight => randomValue <= weight);

        // Step 4: Use the index to select the curve
        const chosenCurve = this.curves[chosenCurveIndex];

        const p1 = chosenCurve.p1;
        const cp = chosenCurve.cp;
        const p2 = chosenCurve.p2;

        if (placeAtPoints === "atEnd") {
            if (!this.usedEndpoints.has(p1.toString())) {
                this.usedEndpoints.add(p1.toString());
                return { base: p1, direction: this.getBezierTangent(p1, cp, p2, 0).normalize() };
            } else if (!this.usedEndpoints.has(p2.toString())) {
                this.usedEndpoints.add(p2.toString());
                return { base: p2, direction: this.getBezierTangent(p1, cp, p2, 1).normalize() };
            }
            return { base: null, direction: null };
        } else if (placeAtPoints === "Along") {
            const t = this.cNoise.noiseMap(this.noisePos, 0.1, 0.9);
            const base = this.getBezierPoint(p1, cp, p2, t);
            const direction = this.getBezierTangent(p1, cp, p2, t).normalize();
            return { base, direction };
        } else {//JOINTS PLACEHOLDER
            const t = this.cNoise.noiseMap(this.noisePos, 0.1, 0.9);
            const base = this.getBezierPoint(p1, cp, p2, t);
            const direction = this.getBezierTangent(p1, cp, p2, t).normalize();
            return { base, direction };
        }
    }


    createPolygon(base, params) {
        const angleStep = this.p.TWO_PI / params.sides;
        const vertices = [];

        // Create the polygon vertices without rotation first
        for (let i = 0; i < params.sides; i++) {
            const angle = angleStep * i;
            const distortionOffset = this.cNoise.noiseMap(this.noisePos, -params.distortion, params.distortion);
            const distortedSize = params.size + distortionOffset;

            const vertex = this.p.createVector(
                this.p.cos(angle) * distortedSize,
                this.p.sin(angle) * distortedSize
            );

            vertices.push(vertex);
        }

        // Apply rotation around the bottom point and translate to final position
        return this.rotateAroundBottom(vertices, base, params.rotation);
    }

    // New method to rotate polygon around its bottom point
    rotateAroundBottom(vertices, base, rotation) {
        if (vertices.length === 0) return vertices;
        
        // Find the bottom-most point in the ORIGINAL non-rotated shape
        let bottomIndex = 0;
        for (let i = 1; i < vertices.length; i++) {
            if (vertices[i].y > vertices[bottomIndex].y) {
                bottomIndex = i;
            }
        }
        
        const bottomPoint = vertices[bottomIndex].copy();
        
        // Create a new array for rotated vertices
        const rotatedVertices = [];
        
        // Rotate each vertex around the bottom point
        for (let i = 0; i < vertices.length; i++) {
            // Translate to make bottom point the origin
            let x = vertices[i].x - bottomPoint.x;
            let y = vertices[i].y - bottomPoint.y;
            
            // Apply rotation
            const rotatedX = x * this.p.cos(rotation) - y * this.p.sin(rotation);
            const rotatedY = x * this.p.sin(rotation) + y * this.p.cos(rotation);
            
            // Position the rotated polygon so that the bottom point is at the base position
            rotatedVertices.push(this.p.createVector(
                rotatedX + base.x,
                rotatedY + base.y
            ));
        }
        
        return rotatedVertices;
    }

    // Quadratic Bezier point calculation
    getBezierPoint(p1, cp, p2, t) {
        const x = (1-t)*(1-t)*p1.x + 2*(1-t)*t*cp.x + t*t*p2.x;
        const y = (1-t)*(1-t)*p1.y + 2*(1-t)*t*cp.y + t*t*p2.y;
        return this.p.createVector(x, y);
    }

    // Bezier tangent calculation for direction
    getBezierTangent(p1, cp, p2, t) {
        const x = 2*(1-t)*(cp.x-p1.x) + 2*t*(p2.x-cp.x);
        const y = 2*(1-t)*(cp.y-p1.y) + 2*t*(p2.y-cp.y);
        return this.p.createVector(x, y);
    }

    calculateLineLength(line) {
        return Math.sqrt(
            Math.pow(line.p2.x - line.p1.x, 2) + Math.pow(line.p2.y - line.p1.y, 2)
        );
    }


}
export default SubShapeGenerator;