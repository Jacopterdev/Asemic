import {LINE_TYPE} from "./Constants.js";

class SubShapeGenerator {
    constructor(p, subShape, cNoise, noisePos, lines, curves) {
        this.p = p;
        this.subShape = subShape;
        this.cNoise = cNoise;
        this.noisePos = noisePos;

        this.lines = lines;
        this.curves = curves;

        this.shapeSides = subShape.sides;
        this.polygons = [];
        this.usedEndpoints = new Set();
        
        // Pre-calculate which original points are endpoints
        this._endpointCache = this.precomputeEndpoints();
    }

    // Modify the precomputeEndpoints method to create a usable cache of endpoint information
    precomputeEndpoints() {
        // Create a map of point keys to their connection counts
        const pointConnectionCount = new Map();
        
        // Process lines
        for (const line of this.lines) {
            // Use the original undistorted points
            const p1Key = `${line.origP1.x.toFixed(1)},${line.origP1.y.toFixed(1)}`;
            const p2Key = `${line.origP2.x.toFixed(1)},${line.origP2.y.toFixed(1)}`;
            
            pointConnectionCount.set(p1Key, (pointConnectionCount.get(p1Key) || 0) + 1);
            pointConnectionCount.set(p2Key, (pointConnectionCount.get(p2Key) || 0) + 1);
        }
        
        // Process curves
        for (const curve of this.curves) {
            const p1Key = `${curve.origP1.x.toFixed(1)},${curve.origP1.y.toFixed(1)}`;
            const p2Key = `${curve.origP2.x.toFixed(1)},${curve.origP2.y.toFixed(1)}`;
            
            pointConnectionCount.set(p1Key, (pointConnectionCount.get(p1Key) || 0) + 1);
            pointConnectionCount.set(p2Key, (pointConnectionCount.get(p2Key) || 0) + 1);
        }
        
        // Create a set of points that have exactly one connection (endpoints)
        const endpoints = new Map();
        
        for (const [pointKey, count] of pointConnectionCount.entries()) {
            endpoints.set(pointKey, count === 1);
        }
        
        return endpoints;
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
            if(!xray && this.shapeSides === 2){
                this.p.strokeWeight(8);
                this.p.stroke(0);
            }
            // Check if this is a curved polygon
            if (polygon.controlPoints && polygon.controlPoints.length > 0 && polygon.curveFactor !== 0) {
                // Draw bezier curves
                this.p.beginShape();
                const vertices = polygon.baseVertices;

                for (let i = 0; i < vertices.length; i++) {
                    // First vertex of each segment
                    if (i === 0) {
                        this.p.vertex(vertices[i].x, vertices[i].y);
                    }

                    // Find control point for this segment
                    const controlPoint = polygon.controlPoints.find(cp => cp.fromIndex === i);

                    if (controlPoint) {
                        const nextIdx = (i + 1) % vertices.length;

                        // Draw quadratic bezier curve
                        this.p.quadraticVertex(
                            controlPoint.x,
                            controlPoint.y,
                            vertices[nextIdx].x,
                            vertices[nextIdx].y
                        );
                    } else {
                        // If no control point, draw straight line to next vertex
                        const nextIdx = (i + 1) % vertices.length;
                        this.p.vertex(vertices[nextIdx].x, vertices[nextIdx].y);
                    }
                }
                this.p.endShape(this.p.CLOSE);
            } else {
                // Draw regular polygon for non-curved shapes
                this.p.beginShape();
                for (const v of polygon.baseVertices) {
                    this.p.vertex(v.x, v.y);
                }
                this.p.endShape(this.p.CLOSE);
            }
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
                curve: this.cNoise.noiseMap(this.noisePos, this.subShape.curve.min, this.subShape.curve.max),
                stretch: this.cNoise.noiseMap(this.noisePos, this.subShape.stretch.min, this.subShape.stretch.max),
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

    // Then modify the getPositionOnStraightLine method to use the precomputed endpoints
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
            // Use the original points for looking up in our endpoint cache
            const origP1Key = `${chosenLine.origP1.x.toFixed(1)},${chosenLine.origP1.y.toFixed(1)}`;
            const origP2Key = `${chosenLine.origP2.x.toFixed(1)},${chosenLine.origP2.y.toFixed(1)}`;
            
            // Check if p1 is an endpoint and hasn't been used
            if (this._endpointCache.get(origP1Key) === true && !this.usedEndpoints.has(origP1Key)) {
                this.usedEndpoints.add(origP1Key);
                return { 
                    base: chosenLine.p1, // Use the distorted point for drawing
                    direction: this.p.createVector(chosenLine.p2.x - chosenLine.p1.x, chosenLine.p2.y - chosenLine.p1.y).normalize() 
                };
            } 
            // Check if p2 is an endpoint and hasn't been used
            else if (this._endpointCache.get(origP2Key) === true && !this.usedEndpoints.has(origP2Key)) {
                this.usedEndpoints.add(origP2Key);
                return { 
                    base: chosenLine.p2, // Use the distorted point for drawing
                    direction: this.p.createVector(chosenLine.p1.x - chosenLine.p2.x, chosenLine.p1.y - chosenLine.p2.y).normalize() 
                };
            }
            return { base: null, direction: null };
        } 
        else if (placeAtPoints === "joints") {
            // Use the original points for looking up in our endpoint cache
            const origP1Key = `${chosenLine.origP1.x.toFixed(1)},${chosenLine.origP1.y.toFixed(1)}`;
            const origP2Key = `${chosenLine.origP2.x.toFixed(1)},${chosenLine.origP2.y.toFixed(1)}`;
            
            // Check if p1 is NOT an endpoint (has more than 1 connection) and hasn't been used
            // This means it's a join point
            if (this._endpointCache.get(origP1Key) === false && !this.usedEndpoints.has(origP1Key)) {
                this.usedEndpoints.add(origP1Key);
                return { 
                    base: chosenLine.p1, // Use the distorted point for drawing
                    direction: this.p.createVector(chosenLine.p2.x - chosenLine.p1.x, chosenLine.p2.y - chosenLine.p1.y).normalize() 
                };
            } 
            // Check if p2 is NOT an endpoint and hasn't been used
            else if (this._endpointCache.get(origP2Key) === false && !this.usedEndpoints.has(origP2Key)) {
                this.usedEndpoints.add(origP2Key);
                return { 
                    base: chosenLine.p2, // Use the distorted point for drawing
                    direction: this.p.createVector(chosenLine.p1.x - chosenLine.p2.x, chosenLine.p1.y - chosenLine.p2.y).normalize() 
                };
            }
            return { base: null, direction: null };
        }
        else if (placeAtPoints === "Along") {
            // For equidistant distribution, use the index of the shape and total count
            // to place it evenly along the line
            const numPolygons = this.p.round(this.cNoise.noiseMap(this.noisePos, this.subShape.amount.min, this.subShape.amount.max));
            const shapeIndex = this.polygons.length; // Current shape index
            
            // Calculate position along the line (0 to 1)
            // This ensures we place even at the endpoints if needed
            let offset;
            if (numPolygons <= 1) {
                offset = 0.5; // Place single shape in the middle
            } else if (shapeIndex >= numPolygons) {
                // Safety check to prevent going beyond the line
                return { base: null, direction: null };
            } else {
                offset = shapeIndex / (numPolygons - 1); // Distribute evenly, including endpoints
            }
            
            // Ensure offset is clamped between 0 and 1
            offset = Math.max(0, Math.min(1, offset));
            
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

        // Step 1-4: Calculate weights and select a curve (keep existing code)
        const curveLengths = this.curves.map(curve => this.calculateCurveLength(curve));
        const totalLength = curveLengths.reduce((sum, length) => sum + length, 0);
        const cumulativeWeights = curveLengths.reduce((acc, length, i) => {
            const previousSum = acc[i - 1] || 0;
            acc.push(previousSum + length / totalLength);
            return acc;
        }, []);

        const randomValue = this.cNoise.noiseMap(this.noisePos, 0, 1);
        const chosenCurveIndex = cumulativeWeights.findIndex(weight => randomValue <= weight);
        const chosenCurve = this.curves[chosenCurveIndex];

        const p1 = chosenCurve.p1;
        const cp = chosenCurve.cp;
        const p2 = chosenCurve.p2;

        if (placeAtPoints === "atEnd") {
            // Use the original points for looking up in our endpoint cache
            const origP1Key = `${chosenCurve.origP1.x.toFixed(1)},${chosenCurve.origP1.y.toFixed(1)}`;
            const origP2Key = `${chosenCurve.origP2.x.toFixed(1)},${chosenCurve.origP2.y.toFixed(1)}`;
            
            // Check if p1 is an endpoint and hasn't been used
            if (this._endpointCache.get(origP1Key) === true && !this.usedEndpoints.has(origP1Key)) {
                this.usedEndpoints.add(origP1Key);
                return { 
                    base: chosenCurve.p1, // Use the distorted point for drawing
                    direction: this.getBezierTangent(p1, cp, p2, 0).normalize() 
                };
            } 
            // Check if p2 is an endpoint and hasn't been used
            else if (this._endpointCache.get(origP2Key) === true && !this.usedEndpoints.has(origP2Key)) {
                this.usedEndpoints.add(origP2Key);
                return { 
                    base: chosenCurve.p2, // Use the distorted point for drawing
                    direction: this.getBezierTangent(p1, cp, p2, 1).normalize() 
                };
            }
            return { base: null, direction: null };
        } 
        else if (placeAtPoints === "joints") {
            // Use the original points for looking up in our endpoint cache
            const origP1Key = `${chosenCurve.origP1.x.toFixed(1)},${chosenCurve.origP1.y.toFixed(1)}`;
            const origP2Key = `${chosenCurve.origP2.x.toFixed(1)},${chosenCurve.origP2.y.toFixed(1)}`;
            
            // Check if p1 is NOT an endpoint (has more than 1 connection) and hasn't been used
            if (this._endpointCache.get(origP1Key) === false && !this.usedEndpoints.has(origP1Key)) {
                this.usedEndpoints.add(origP1Key);
                return { 
                    base: chosenCurve.p1, // Use the distorted point for drawing
                    direction: this.getBezierTangent(p1, cp, p2, 0).normalize()
                };
            } 
            // Check if p2 is NOT an endpoint and hasn't been used
            else if (this._endpointCache.get(origP2Key) === false && !this.usedEndpoints.has(origP2Key)) {
                this.usedEndpoints.add(origP2Key);
                return { 
                    base: chosenCurve.p2, // Use the distorted point for drawing
                    direction: this.getBezierTangent(p1, cp, p2, 1).normalize()
                };
            }
            return { base: null, direction: null };
        } 
        else if (placeAtPoints === "Along") {
            // For equidistant distribution (keep existing code)
            const numPolygons = this.p.round(this.cNoise.noiseMap(this.noisePos, this.subShape.amount.min, this.subShape.amount.max));
            const shapeIndex = this.polygons.length;
            
            let t;
            if (numPolygons <= 1) {
                t = 0.5;
            } else if (shapeIndex >= numPolygons) {
                return { base: null, direction: null };
            } else {
                t = shapeIndex / (numPolygons - 1);
            }
            
            t = Math.max(0, Math.min(1, t));
            
            const base = this.getBezierPoint(p1, cp, p2, t);
            const direction = this.getBezierTangent(p1, cp, p2, t).normalize();
            return { base, direction };
        } 
        else { // JOINTS PLACEHOLDER
            const t = this.cNoise.noiseMap(this.noisePos, 0.1, 0.9);
            const base = this.getBezierPoint(p1, cp, p2, t);
            const direction = this.getBezierTangent(p1, cp, p2, t).normalize();
            return { base, direction };
        }
    }


    adjustSizeForPolygon(sides, baseSize) {

        if (sides <= 2) return baseSize/2; // Special case - default to baseSize for line/point
        if (sides >= 20) return baseSize;

        // For regular polygons, we adjust based on area formula
        // Area ∝ n * r² * sin(2π/n), and we want this to be constant
        // So r² ∝ 1/(n * sin(2π/n))
        // Thus r ∝ 1/√(n * sin(2π/n))

        const angleRatio = Math.sin(2 * Math.PI / sides);
        const adjustmentFactor = Math.sqrt(4 / (sides * angleRatio));

        // Apply a cap to prevent extreme sizes for very low sided polygons
        return baseSize * Math.min(adjustmentFactor, 2);
    };

    createPolygon(base, params) {
        const angleStep = (2 * this.p.PI) / params.sides;
        let size = 1.5 * this.adjustSizeForPolygon(params.sides, params.size);

        const stretch = params.stretch / 100; // Convert 0-100 to 0-1
        let curveFactor = params.curve / 100; // Convert -100-100 to -1-1

        // Make curveFactor slightly stronger with more sides
        // This creates a progressive scaling effect as sides increase
        // The multiplier function grows logarithmically with sides
        // First, calculate the base size scaling factor

// Create a separate curvature scaling factor
        let curveScalingFactor;

        if (params.sides <= 3) {
            // For 3 sides and below:
            if (curveFactor > 0) {
                curveScalingFactor = 0.7; // Dampen positive effect (outward)
            } else {
                curveScalingFactor = 1.3; // Enhance negative effect (inward)
            }
        } else if (params.sides === 4) {
            // For 4 sides: keep as is
            curveScalingFactor = 1.0;
        } else {
            // For 5+ sides: different scaling based on curveFactor sign
            if (curveFactor < 0) {
                // Much stronger scaling for negative values (inward curves)
                const baseMultiplier = 1.5; // Strong fixed multiplier for each side above 4
                curveScalingFactor = 1.0 + baseMultiplier * (params.sides - 4);

            } else {
                // Regular scaling for positive values (outward curves)
                const baseIncrease = params.sides - 4;
                curveScalingFactor = 1.0 + baseIncrease/3;
                //const baseIncrease = (params.sides - 4) / 10;
                //curveScalingFactor = 1.0 + baseIncrease * Math.pow(params.sides - 4, 0.9);
            }
        }

// Create stretch scaling factors - separate for size and curve
        const sizeStretchScalingFactor = 1.0 - (stretch * 0.2); // Reduces size by up to 20% at max stretch
        const curveStretchImpact = 1.0 - (stretch * 0.3); // Reduces curve effect by up to 30% at max stretch

// Apply stretch scaling to size (this doesn't include curve effects)
        size *= sizeStretchScalingFactor;

        const sizeScalingFactor = 1.0 + (curveFactor * 0.4); // 0.2 is the sensitivity factor

// Apply both curve-specific scaling factors to curveFactor
        curveFactor *= curveScalingFactor * curveStretchImpact;

        size *= sizeScalingFactor;



        // Default rotation to align flat side to bottom (if even sides)
        // For odd sides, point at bottom
        const isEvenSides = params.sides % 2 === 0;
        const defaultRotation = isEvenSides
            ? -Math.PI / params.sides  // Flat side at bottom for even sides
            : Math.PI * (0.5 - 1/params.sides);  // Point at bottom for odd sides

        // First create the regular polygon vertices (centered at origin)
        const centeredVertices = [];
        for (let i = 0; i < params.sides; i++) {
            const angle = i * angleStep;

            // Step 1: Calculate basic polygon point
            let x = Math.cos(angle) * size;
            let y = Math.sin(angle) * size;

            // Step 2: Apply default rotation to get flat-bottomed polygon
            const xWithDefaultRotation = x * Math.cos(defaultRotation) - y * Math.sin(defaultRotation);
            const yWithDefaultRotation = x * Math.sin(defaultRotation) + y * Math.cos(defaultRotation);

            // Step 3: Apply stretch horizontally (along screen x-axis)
            const xStretched = xWithDefaultRotation * (1 + stretch);
            const yStretched = yWithDefaultRotation;

            // Add to temporary array (centered at origin, without user rotation yet)
            centeredVertices.push({
                x: xStretched,
                y: yStretched,
                angle: angle
            });
        }

        let pivotX, pivotY;

        if (isEvenSides) {
            // For even-sided shapes, use the bottom-left vertex
            // The bottom-left vertex is at index 0 after our default rotation
            pivotX = centeredVertices[0].x;
            pivotY = centeredVertices[0].y;

        } else {
            // For odd-sided shapes, the bottom vertex is always at index 0
            // after our defaultRotation
            pivotX = centeredVertices[0].x;
            pivotY = centeredVertices[0].y;
        }


        // Now we need to align the bottom point with the base position
        const finalVertices = [];

        // First, apply rotation around the pivot point
        for (let i = 0; i < centeredVertices.length; i++) {
            // Translate to pivot point as origin
            const translatedX = centeredVertices[i].x - pivotX;
            const translatedY = centeredVertices[i].y - pivotY;

            // Apply rotation around this new origin
            // Apply rotation around this new origin
            const rotatedX = translatedX * Math.cos(params.rotation) - translatedY * Math.sin(params.rotation);
            const rotatedY = translatedX * Math.sin(params.rotation) + translatedY * Math.cos(params.rotation);

            // The rotated pivot is now at (0,0) in the rotated coordinate system
            // We need to position the shape so that this rotated pivot aligns with base position

            finalVertices.push({
                x: base.x + rotatedX, // Base position is where the pivot should be
                y: base.y + rotatedY,
                angle: centeredVertices[i].angle
            });
        }

        // Calculate control points for bezier curves
        const controlPoints = [];

        if (curveFactor !== 0) {
            for (let i = 0; i < params.sides; i++) {
                const current = finalVertices[i];
                const next = finalVertices[(i + 1) % params.sides];

                // Calculate distance between points for scaling the curve
                const dx = next.x - current.x;
                const dy = next.y - current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Calculate midpoint between the two vertices
                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;

                // Calculate the perpendicular vector to the line
                const perpX = -dy;
                const perpY = dx;

                // Normalize perpendicular vector
                const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
                const normalizedPerpX = perpX / perpLength;
                const normalizedPerpY = perpY / perpLength;

                // Calculate control point (perpendicular to the midpoint)
                // Curve inward if curveFactor < 0, outward if curveFactor > 0
                const ctrlX = midX + normalizedPerpX * curveFactor * distance * 0.5;
                const ctrlY = midY + normalizedPerpY * curveFactor * distance * 0.5;

                controlPoints.push({
                    x: ctrlX,
                    y: ctrlY,
                    fromIndex: i,
                    toIndex: (i + 1) % params.sides,
                    curveFactor: curveFactor
                });
            }
        }

        // Store both regular vertices and curve control points
        return {
            baseVertices: finalVertices,
            controlPoints: controlPoints,
            curveFactor: curveFactor
        };
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

    calculateCurveLength(curve) {
        // Extract points from the curve
        const { p1, cp, p2 } = curve;

        // For Bézier curves, we need to approximate the length
        // using numerical methods since there's no exact formula
        const numSegments = 20; // Higher number = more accuracy
        let length = 0;
        let prevPoint = p1;

        // Sample points along the curve
        for (let i = 1; i <= numSegments; i++) {
            const t = i / numSegments;

            // Quadratic Bézier formula: B(t) = (1-t)²P₁ + 2(1-t)tCP + t²P₂
            const x = Math.pow(1-t, 2) * p1.x + 2 * (1-t) * t * cp.x + Math.pow(t, 2) * p2.x;
            const y = Math.pow(1-t, 2) * p1.y + 2 * (1-t) * t * cp.y + Math.pow(t, 2) * p2.y;

            const currentPoint = { x, y };

            // Calculate distance between current point and previous point
            const dx = currentPoint.x - prevPoint.x;
            const dy = currentPoint.y - prevPoint.y;
            length += Math.sqrt(dx * dx + dy * dy);

            prevPoint = currentPoint;
        }

        return length;
    }

    // Add a helper method to count connections for a point
    countPointConnections(point) {
        // Use more precise comparison with a small epsilon
        const epsilon = 0.01;
        
        // We need to determine if this is a true endpoint in the skeleton structure
        // First, identify which original point this is closest to
        let closestOrigPoint = null;
        let minDistance = Infinity;
        
        // Find the original point from the skeleton that this endpoint corresponds to
        for (const line of this.lines) {
            // Check if point is close to either endpoint of this line
            const distToP1 = Math.sqrt(
                Math.pow(line.origP1.x - point.x, 2) + 
                Math.pow(line.origP1.y - point.y, 2)
            );
            if (distToP1 < minDistance) {
                minDistance = distToP1;
                closestOrigPoint = line.origP1;
            }
            
            const distToP2 = Math.sqrt(
                Math.pow(line.origP2.x - point.x, 2) + 
                Math.pow(line.origP2.y - point.y, 2)
            );
            if (distToP2 < minDistance) {
                minDistance = distToP2;
                closestOrigPoint = line.origP2;
            }
        }
        
        for (const curve of this.curves) {
            const distToP1 = Math.sqrt(
                Math.pow(curve.origP1.x - point.x, 2) + 
                Math.pow(curve.origP1.y - point.y, 2)
            );
            if (distToP1 < minDistance) {
                minDistance = distToP1;
                closestOrigPoint = curve.origP1;
            }
            
            const distToP2 = Math.sqrt(
                Math.pow(curve.origP2.x - point.x, 2) + 
                Math.pow(curve.origP2.y - point.y, 2)
            );
            if (distToP2 < minDistance) {
                minDistance = distToP2;
                closestOrigPoint = curve.origP2;
            }
        }
        
        // If we couldn't find a close enough original point
        if (!closestOrigPoint || minDistance > 30) {
            return 0; // Not a valid endpoint
        }
        
        // Now count connections to this original skeleton point
        const connectionCount = this.countOrigPointConnections(closestOrigPoint);
        
        console.log(`Point near (${closestOrigPoint.x}, ${closestOrigPoint.y}) has ${connectionCount} connections`);
        
        return connectionCount;
    }

    // Count connections for an original skeleton point
    countOrigPointConnections(origPoint) {
        const epsilon = 0.1;
        let count = 0;
        
        // Count original lines connected to this point
        for (const line of this.lines) {
            if ((Math.abs(line.origP1.x - origPoint.x) < epsilon && 
                 Math.abs(line.origP1.y - origPoint.y) < epsilon) ||
                (Math.abs(line.origP2.x - origPoint.x) < epsilon && 
                 Math.abs(line.origP2.y - origPoint.y) < epsilon)) {
                count++;
            }
        }
        
        // Count original curves connected to this point
        for (const curve of this.curves) {
            if ((Math.abs(curve.origP1.x - origPoint.x) < epsilon && 
                 Math.abs(curve.origP1.y - origPoint.y) < epsilon) ||
                (Math.abs(curve.origP2.x - origPoint.x) < epsilon && 
                 Math.abs(curve.origP2.y - origPoint.y) < epsilon)) {
                count++;
            }
        }
        
        return count;
    }

}
export default SubShapeGenerator;