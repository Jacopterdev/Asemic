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

    generate(placeAtPoints) {

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

        //const chosenLine = this.p.random(this.lines);
        // Calculate an index using cNoise.noiseMap
        const chosenLineIndex = Math.floor(this.cNoise.noiseMap(this.noisePos, 0, this.lines.length));
        // Use the index to get the line object from the this.lines array
        const chosenLine = this.lines[chosenLineIndex];

        const p1 = chosenLine.p1;
        const p2 = chosenLine.p2;

        if (placeAtPoints) {
            if (!this.usedEndpoints.has(p1.toString())) {
                this.usedEndpoints.add(p1.toString());
                return { base: p1, direction: this.p.createVector(p2.x - p1.x, p2.y - p1.y).normalize() };
            } else if (!this.usedEndpoints.has(p2.toString())) {
                this.usedEndpoints.add(p2.toString());
                return { base: p2, direction: this.p.createVector(p2.x - p1.x, p2.y - p1.y).normalize() };
            }
            return { base: null, direction: null };
        } else {
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

        //const chosenCurve = this.p.random(this.curves);
        const chosenCurveIndex = Math.floor(this.cNoise.noiseMap(this.noisePos, 0, this.curves.length));
        // Use the index to get the curve object from the this.curves array
        const chosenCurve = this.curves[chosenCurveIndex];

        const p1 = chosenCurve.p1;
        const cp = chosenCurve.cp;
        const p2 = chosenCurve.p2;

        if (placeAtPoints) {
            if (!this.usedEndpoints.has(p1.toString())) {
                this.usedEndpoints.add(p1.toString());
                return { base: p1, direction: this.getBezierTangent(p1, cp, p2, 0).normalize() };
            } else if (!this.usedEndpoints.has(p2.toString())) {
                this.usedEndpoints.add(p2.toString());
                return { base: p2, direction: this.getBezierTangent(p1, cp, p2, 1).normalize() };
            }
            return { base: null, direction: null };
        } else {
            //const t = this.p.random(0.1, 0.9);
            const t = this.cNoise.noiseMap(this.noisePos, 0.1, 0.9);
            const base = this.getBezierPoint(p1, cp, p2, t);
            const direction = this.getBezierTangent(p1, cp, p2, t).normalize();
            return { base, direction };
        }
    }


    createPolygon(base, params) {
        const angleStep = this.p.TWO_PI / params.sides;
        const vertices = [];

        for (let i = 0; i < params.sides; i++) {
            const angle = angleStep * i + params.rotation;
            const distortionOffset = this.cNoise.noiseMap(this.noisePos, -params.distortion, params.distortion);
            const distortedSize = params.size + distortionOffset;

            const vertex = this.p.createVector(
                base.x + this.p.cos(angle) * distortedSize,
                base.y + this.p.sin(angle) * distortedSize
            );

            vertices.push(vertex);
        }

        return vertices;
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

}
export default SubShapeGenerator;