import ConfigParser from "./ConfigParser.js";
import { LINE_MODE, LINE_TYPE } from "./Constants.js";

//HAJ JAKOB

class ShapeGenerator {
  constructor(p, jsonConfig) {
    this.p = p;
    // Create the ConfigParser internally
    this.configParser = new ConfigParser(p, jsonConfig);
    this.noiseOffset = this.p.random(1000);
    this.lines = [];
    this.curves = [];
    this.polygons = [];
    this.usedEndpoints = new Set();
  }

  // Main generator method
  generateCompositeForms() {
    this.usedEndpoints.clear();
    this.polygons = [];
    const params = this.configParser.getParameters();

    // Clear previous lines
    this.lines = [];
    this.curves = [];

    // Use predefined lines from the configuration
    // Randomly select number of lines within the range
    const numLines = this.p.floor(this.p.random(params.lineCount.min, params.lineCount.max + 1));
    this.useConfiguredLines(numLines, params);

    // Generate polygons for each subshape type
    const subShapeConfigs = this.configParser.getSubShapeConfigs();

    for (const subShapeConfig of subShapeConfigs) {
      this.generatePolygonsForSubShape(subShapeConfig.config, params);
    }
  }

  // Generate noise value with offset
  getNoise(offset = 0) {
    return this.p.noise(this.noiseOffset + offset * 0.01);
  }

  // Use predefined lines from the configuration
  useConfiguredLines(numOfLines, params) {
    const configuredLines = this.configParser.getConfiguredLines();
    const lineType = this.configParser.getLineType();
    const lineMode = this.configParser.getLineGenerationMode();
    const missAreaRadius = params.missArea;

    // Select lines based on the line composition mode
    let selectedLines = [];

    if (lineMode === LINE_MODE.SEQUENTIAL) {
      // Sequential mode: Lines must connect in sequence
      selectedLines = this.selectSequentialLines(configuredLines, numOfLines);
    } else if (lineMode === LINE_MODE.BRANCHING) {
      // Branching mode: Lines must branch from a common point
      selectedLines = this.selectBranchingLines(configuredLines, numOfLines);
    } else {
      // Random mode: Any lines can be selected
      selectedLines = [...configuredLines];
      if (selectedLines.length > numOfLines) {
        this.shuffleArray(selectedLines);
        selectedLines = selectedLines.slice(0, numOfLines);
      }
    }

    // Convert the selected lines to the format used by the generator
    for (const line of selectedLines) {
      const offsetStart = this.getOffsetPosition(line.start, missAreaRadius);
      const offsetEnd = this.getOffsetPosition(line.end, missAreaRadius);
      const lineWidth = this.p.random(params.lineWidth.min, params.lineWidth.max);

      // For the "both" type, randomly choose between straight and curved for each line
      const shouldBeCurved = lineType === LINE_TYPE.CURVED ||
          (lineType === LINE_TYPE.BOTH && this.p.random() > 0.5);

      if (!shouldBeCurved) {
        // Create a straight line
        this.lines.push({
          p1: offsetStart,
          p2: offsetEnd,
          origP1: line.start,
          origP2: line.end,
          lineWidth
        });
      } else {
        // Create a curved line
        // Find a point that's not one of the endpoints
        const otherPoints = this.configParser.getPoints().filter(p =>
            !this.configParser.pointsEqual(p, line.start) &&
            !this.configParser.pointsEqual(p, line.end)
        );

        if (otherPoints.length > 0) {
          const cp = this.p.random(otherPoints);
          const offsetCP = this.getOffsetPosition(cp, missAreaRadius);

          this.curves.push({
            p1: offsetStart,
            cp: offsetCP,
            p2: offsetEnd,
            origP1: line.start,
            origP2: line.end,
            origCP: cp,
            lineWidth
          });
        } else {
          // If no other points available, create a midpoint with offset
          const midpoint = this.p.createVector(
              (line.start.x + line.end.x) / 2,
              (line.start.y + line.end.y) / 2
          );

          // Add some perpendicular offset to make it curved
          const dx = line.end.x - line.start.x;
          const dy = line.end.y - line.start.y;
          const perpDistance = 50; // Control curvature amount

          midpoint.x += -dy / this.p.sqrt(dx*dx + dy*dy) * perpDistance;
          midpoint.y += dx / this.p.sqrt(dx*dx + dy*dy) * perpDistance;

          const offsetCP = this.getOffsetPosition(midpoint, missAreaRadius);

          this.curves.push({
            p1: offsetStart,
            cp: offsetCP,
            p2: offsetEnd,
            origP1: line.start,
            origP2: line.end,
            origCP: midpoint,
            lineWidth
          });
        }
      }
    }
  }

  // Select lines that form a sequential path without revisiting points
  selectSequentialLines(allLines, numOfLines) {
    if (allLines.length === 0 || numOfLines <= 0) {
      return [];
    }

    // Start with a random line
    const startLineIndex = this.p.floor(this.p.random(allLines.length));
    const selectedLines = [allLines[startLineIndex]];

    // Track points that have been used as endpoints
    const usedPoints = new Set();
    usedPoints.add(this.pointToString(selectedLines[0].start));

    // Track the current endpoint that we need to connect from
    let currentEndPoint = selectedLines[0].end;
    let currentEndPointStr = this.pointToString(currentEndPoint);
    usedPoints.add(currentEndPointStr);

    // Try to find a sequence of connected lines
    while (selectedLines.length < numOfLines && selectedLines.length < allLines.length) {
      let foundNextLine = false;

      // Shuffle the remaining lines to avoid predictable patterns
      const remainingLines = allLines.filter(line => !selectedLines.includes(line));
      this.shuffleArray(remainingLines);

      // Find a line that connects to our current endpoint and leads to a new point
      for (const line of remainingLines) {
        const startPointStr = this.pointToString(line.start);
        const endPointStr = this.pointToString(line.end);

        // Check if this line starts at our current endpoint
        if (startPointStr === currentEndPointStr && !usedPoints.has(endPointStr)) {
          selectedLines.push(line);
          usedPoints.add(endPointStr);
          currentEndPoint = line.end;
          currentEndPointStr = endPointStr;
          foundNextLine = true;
          break;
        }

        // Check if this line ends at our current endpoint
        else if (endPointStr === currentEndPointStr && !usedPoints.has(startPointStr)) {
          selectedLines.push(line);
          usedPoints.add(startPointStr);
          currentEndPoint = line.start;
          currentEndPointStr = startPointStr;
          foundNextLine = true;
          break;
        }
      }

      // If we couldn't find a connecting line to a new point, we're done
      // Priority is to avoid revisiting points rather than using exact number of lines
      if (!foundNextLine) break;
    }

    return selectedLines;
  }

  // Select lines that branch from multiple points - no disconnected components
  selectBranchingLines(allLines, numOfLines) {
    if (allLines.length === 0 || numOfLines <= 0) {
      return [];
    }

    // Start with a random line
    const startLineIndex = this.p.floor(this.p.random(allLines.length));
    const selectedLines = [allLines[startLineIndex]];

    // Track all points that are part of our structure
    const usedPointsSet = new Set([
      this.pointToString(selectedLines[0].start),
      this.pointToString(selectedLines[0].end)
    ]);

    // Track which points can potentially branch
    const branchablePoints = new Set([
      this.pointToString(selectedLines[0].start),
      this.pointToString(selectedLines[0].end)
    ]);

    // Continue adding branches until we have enough lines
    while (selectedLines.length < numOfLines && selectedLines.length < allLines.length) {
      // Get remaining available lines
      const remainingLines = allLines.filter(line => !selectedLines.includes(line));
      if (remainingLines.length === 0) break;

      // Shuffle to randomize branch selection
      this.shuffleArray(remainingLines);

      // Find a line that connects to any existing point in our structure
      let foundBranch = false;

      // Prioritize lines that connect to branchable points
      for (const line of remainingLines) {
        const startPointStr = this.pointToString(line.start);
        const endPointStr = this.pointToString(line.end);

        // Check if this line connects to our structure at a branchable point
        if (branchablePoints.has(startPointStr) || branchablePoints.has(endPointStr)) {
          // Add this line to our selected lines
          selectedLines.push(line);

          // Add any new points to our used points set
          if (!usedPointsSet.has(startPointStr)) {
            usedPointsSet.add(startPointStr);
            // Each new endpoint has a chance to become a branch point
            if (this.p.random() < 0.7) { // 70% chance to allow branching
              branchablePoints.add(startPointStr);
            }
          }

          if (!usedPointsSet.has(endPointStr)) {
            usedPointsSet.add(endPointStr);
            // Each new endpoint has a chance to become a branch point
            if (this.p.random() < 0.7) { // 70% chance to allow branching
              branchablePoints.add(endPointStr);
            }
          }

          foundBranch = true;
          break;
        }
      }

      // If we didn't find a branch at a branchable point, try any connection point
      if (!foundBranch) {
        for (const line of remainingLines) {
          const startPointStr = this.pointToString(line.start);
          const endPointStr = this.pointToString(line.end);

          // Check if this line connects to our structure at any point
          if (usedPointsSet.has(startPointStr) || usedPointsSet.has(endPointStr)) {
            // Add this line to our selected lines
            selectedLines.push(line);

            // Add any new points to our used points set
            if (!usedPointsSet.has(startPointStr)) {
              usedPointsSet.add(startPointStr);
              // Lower chance to branch from these fallback connections
              if (this.p.random() < 0.4) { // 40% chance
                branchablePoints.add(startPointStr);
              }
            }

            if (!usedPointsSet.has(endPointStr)) {
              usedPointsSet.add(endPointStr);
              if (this.p.random() < 0.4) { // 40% chance
                branchablePoints.add(endPointStr);
              }
            }

            foundBranch = true;
            break;
          }
        }
      }

      // If we couldn't find any connecting line, we're done
      // Don't create disconnected components!
      if (!foundBranch) break;
    }

    return selectedLines;
  }

  // Helper method to convert a point to a string for comparison
  pointToString(point) {
    return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }

  // Map noise to a range
  mapNoiseToRange(offset, range) {
    if (typeof range === 'object') {
      return this.p.map(this.p.noise(this.noiseOffset + offset), 0, 1, range.min, range.max);
    }
    return range; // If it's a fixed value
  }

  // Generate polygons for a specific subshape configuration
  generatePolygonsForSubShape(shapeConfig, globalParams) {
    // Get the number of polygons to generate for this shape
    const numPolygons = this.p.floor(this.p.random(shapeConfig.amount.min, shapeConfig.amount.max));
    const placeAtPoints = this.configParser.getPlaceAtPoints(shapeConfig);

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
      const pathType = this.p.random(availableTypes);

      // Generate a base position and direction for the polygon
      const { base, direction } = this.determinePolygonPosition(pathType, placeAtPoints);
      if (!base) continue;

      // Create the polygon with the determined parameters
      const polygonParams = {
        size: this.p.random(shapeConfig.size.min, shapeConfig.size.max),
        sides: this.configParser.getShapeSides(shapeConfig.subShape),
        rotation: this.configParser.getLockRotation(shapeConfig) && direction
            ? this.p.atan2(direction.y, direction.x)
            : this.p.random(shapeConfig.angle.min, shapeConfig.angle.max) * (this.p.PI/180),
        distortion: this.p.random(shapeConfig.distort.min, shapeConfig.distort.max)
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

    const chosenLine = this.p.random(this.lines);
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
      const offset = this.p.random(0.1, 0.9); // Avoid extreme ends
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

    const chosenCurve = this.p.random(this.curves);
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
      const t = this.p.random(0.1, 0.9);
      const base = this.getBezierPoint(p1, cp, p2, t);
      const direction = this.getBezierTangent(p1, cp, p2, t).normalize();
      return { base, direction };
    }
  }

  // Create polygon at the specified position
  createPolygon(base, params) {
    const angleStep = this.p.TWO_PI / params.sides;
    const vertices = [];

    for (let i = 0; i < params.sides; i++) {
      const angle = angleStep * i + params.rotation;
      const distortionOffset = this.p.random(-params.distortion, params.distortion);
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

  // Method to get polygons for drawing
  getPolygons() {
    return this.polygons;
  }

  // Drawing methods
  drawLines() {

    this.p.stroke(0);

    // Draw straight lines
    for (const lineObj of this.lines) {
      this.p.strokeWeight(lineObj.lineWidth);
      this.p.line(lineObj.p1.x, lineObj.p1.y, lineObj.p2.x, lineObj.p2.y);
    }

    // Draw curved lines with control points
    for (const curveObj of this.curves) {
      this.p.strokeWeight(curveObj.lineWidth);
      this.p.noFill();

      this.p.beginShape();
      this.p.vertex(curveObj.p1.x, curveObj.p1.y);
      this.p.quadraticVertex(curveObj.cp.x, curveObj.cp.y, curveObj.p2.x, curveObj.p2.y);
      this.p.endShape();
    }
  }

  drawPolygons() {
    this.p.fill(0);
    this.p.stroke(255,0,0);
    this.p.strokeWeight(2);
    for (const polygon of this.polygons) {
      this.p.beginShape();
      for (const v of polygon) {
        this.p.vertex(v.x, v.y);
      }
      this.p.endShape(this.p.CLOSE);
    }
  }

  applyEffects() {
    // Apply smoothing/blur if specified
    const params = this.configParser.getParameters();
    if (params.smoothAmount > 0) {
      this.p.filter(this.p.BLUR, params.smoothAmount);
      this.p.filter(this.p.THRESHOLD, 0.5);
    }
  }

  // Helper method to shuffle an array
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Get a position with random offset from the original point
  getOffsetPosition(point, missAreaRadius) {
    // If missArea is 0, return the original point
    if (missAreaRadius <= 0) return point;

    // Generate random offset within the miss area
    const angle = this.p.random(this.p.TWO_PI);
    const distance = this.p.random(missAreaRadius);

    return this.p.createVector(
        point.x + this.p.cos(angle) * distance,
        point.y + this.p.sin(angle) * distance
    );
  }
}

export default ShapeGenerator;