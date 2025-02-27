// Constants
const LINE_MODE = {
  RANDOM: 0,
  BRANCHING: 1,
  SEQUENTIAL: 2
};

const LINE_TYPE = {
  STRAIGHT: 0,
  CURVED: 1,
  BOTH: 2
};

// Example config with multiple shapes and connections - updated with Circle shape
let defaultConfig = {
  "1": {
      "subShape": "Square",
      "connection": "atEnd",
      "rotationType": "relative",
      "angle": {
          "min": 0,
          "max": 360
      },
      "amount": {
          "min": 0,
          "max": 3
      },
      "size": {
          "min": 0,
          "max": 100
      },
      "distort": {
          "min": 0,
          "max": 100
      }
  },
  "2": {
      "subShape": "Triangle",
      "connection": "Along",
      "rotationType": "absolute",
      "angle": {
          "min": 0,
          "max": 360
      },
      "amount": {
          "min": 1,
          "max": 2
      },
      "size": {
          "min": 20,
          "max": 80
      },
      "distort": {
          "min": 5,
          "max": 50
      }
  },
  "3": {
      "subShape": "Circle",
      "connection": "atEnd", 
      "rotationType": "absolute",
      "angle": {
          "min": 0,
          "max": 360
      },
      "amount": {
          "min": 10,
          "max": 10
      },
      "size": {
          "min": 10,
          "max": 30
      },
      "distort": {
          "min": 0,
          "max": 5
      }
  },
  "missArea": 1,
  "numberOfLines": {min: 5, max: 5}, // Using more lines
  "smoothAmount": 6,
  "lineWidth": {min: 15, max: 15},
  "lineType": "straight", // Set to both to test that functionality
  "lineComposition": "Random",
  "points": [
      { "x": 225.5, "y": 290 },    // Point 0
      { "x": 252.5, "y": 506 },    // Point 1
      { "x": 540.5, "y": 317 },    // Point 2
      { "x": 525.5, "y": 569 },    // Point 3
      { "x": 100.0, "y": 350 },    // Point 4 (new)
      { "x": 400.0, "y": 120 },    // Point 5 (new)
      { "x": 450.0, "y": 400 },    // Point 6 (new)
      { "x": 150.0, "y": 150 },    // Point 7 (new)
      { "x": 350.0, "y": 250 },    // Point 8 (new)
      { "x": 300.0, "y": 400 },    // Point 9 (new)
      { "x": 200.0, "y": 200 },    // Point 10 (new)
      { "x": 480.0, "y": 220 },    // Point 11 (new)
      { "x": 175.0, "y": 450 },    // Point 12 (new)
      { "x": 425.0, "y": 500 },    // Point 13 (new)
      { "x": 75.0,  "y": 250 }     // Point 14 (new)
  ],
  "lines": [
      // Original lines
      {
          "start": { "x": 225.5, "y": 290 },
          "end": { "x": 252.5, "y": 506 }
      },
      {
          "start": { "x": 225.5, "y": 290 },
          "end": { "x": 540.5, "y": 317 }
      },
      {
          "start": { "x": 252.5, "y": 506 },
          "end": { "x": 540.5, "y": 317 }
      },
      {
          "start": { "x": 225.5, "y": 290 },
          "end": { "x": 525.5, "y": 569 }
      },
      {
          "start": { "x": 252.5, "y": 506 },
          "end": { "x": 525.5, "y": 569 }
      },
      {
          "start": { "x": 540.5, "y": 317 },
          "end": { "x": 525.5, "y": 569 }
      },
      // New lines
      {
          "start": { "x": 100.0, "y": 350 },
          "end": { "x": 225.5, "y": 290 }
      },
      {
          "start": { "x": 100.0, "y": 350 },
          "end": { "x": 252.5, "y": 506 }
      },
      {
          "start": { "x": 400.0, "y": 120 },
          "end": { "x": 225.5, "y": 290 }
      },
      {
          "start": { "x": 400.0, "y": 120 },
          "end": { "x": 540.5, "y": 317 }
      },
      {
          "start": { "x": 450.0, "y": 400 },
          "end": { "x": 540.5, "y": 317 }
      },
      {
          "start": { "x": 450.0, "y": 400 },
          "end": { "x": 525.5, "y": 569 }
      },
      {
          "start": { "x": 150.0, "y": 150 },
          "end": { "x": 225.5, "y": 290 }
      },
      {
          "start": { "x": 150.0, "y": 150 },
          "end": { "x": 400.0, "y": 120 }
      },
      {
          "start": { "x": 350.0, "y": 250 },
          "end": { "x": 225.5, "y": 290 }
      },
      {
          "start": { "x": 350.0, "y": 250 },
          "end": { "x": 540.5, "y": 317 }
      },
      {
          "start": { "x": 350.0, "y": 250 },
          "end": { "x": 400.0, "y": 120 }
      },
      {
          "start": { "x": 150.0, "y": 150 },
          "end": { "x": 100.0, "y": 350 }
      },
      // New lines with the new points
      {
          "start": { "x": 300.0, "y": 400 },
          "end": { "x": 252.5, "y": 506 }
      },
      {
          "start": { "x": 300.0, "y": 400 },
          "end": { "x": 450.0, "y": 400 }
      },
      {
          "start": { "x": 300.0, "y": 400 },
          "end": { "x": 350.0, "y": 250 }
      },
      {
          "start": { "x": 200.0, "y": 200 },
          "end": { "x": 150.0, "y": 150 }
      },
      {
          "start": { "x": 200.0, "y": 200 },
          "end": { "x": 225.5, "y": 290 }
      },
      {
          "start": { "x": 200.0, "y": 200 },
          "end": { "x": 350.0, "y": 250 }
      },
      {
          "start": { "x": 480.0, "y": 220 },
          "end": { "x": 400.0, "y": 120 }
      },
      {
          "start": { "x": 480.0, "y": 220 },
          "end": { "x": 540.5, "y": 317 }
      },
      {
          "start": { "x": 175.0, "y": 450 },
          "end": { "x": 100.0, "y": 350 }
      },
      {
          "start": { "x": 175.0, "y": 450 },
          "end": { "x": 252.5, "y": 506 }
      },
      {
          "start": { "x": 175.0, "y": 450 },
          "end": { "x": 300.0, "y": 400 }
      },
      {
          "start": { "x": 425.0, "y": 500 },
          "end": { "x": 450.0, "y": 400 }
      },
      {
          "start": { "x": 425.0, "y": 500 },
          "end": { "x": 525.5, "y": 569 }
      },
      {
          "start": { "x": 425.0, "y": 500 },
          "end": { "x": 252.5, "y": 506 }
      },
      {
          "start": { "x": 75.0, "y": 250 },
          "end": { "x": 100.0, "y": 350 }
      },
      {
          "start": { "x": 75.0, "y": 250 },
          "end": { "x": 150.0, "y": 150 }
      }
  ]
};


// Configuration parser - modified to handle multiple subshapes
class ConfigParser {
  constructor(jsonConfig) {
    this.config = jsonConfig;
    this.points = [];
    this.configuredLines = []; // Store predefined lines
    this.subShapeConfigs = []; // Store each subshape configuration
    this.parsePointsAndLines();
    this.parseSubShapes();
  }

  parsePointsAndLines() {
    // Parse points from configuration
    this.points = [];
    this.configuredLines = [];
    
    if (Array.isArray(this.config.points)) {
      this.config.points.forEach((point, index) => {
        const newPoint = createVector(point.x, point.y);
        newPoint.index = index; // Store the original index with the point
        this.points.push(newPoint);
      });
    }
    
    // Parse predefined lines from configuration
    if (Array.isArray(this.config.lines)) {
      this.config.lines.forEach(line => {
        const startPoint = createVector(line.start.x, line.start.y);
        const endPoint = createVector(line.end.x, line.end.y);
        
        // Match start and end points with their corresponding indices from the points array
        startPoint.index = this.findPointIndex(startPoint);
        endPoint.index = this.findPointIndex(endPoint);
        
        this.configuredLines.push({
          start: startPoint,
          end: endPoint
        });
      });
    }
  }

  parseSubShapes() {
    // Find all numeric keys which represent subshape configurations
    for (const key in this.config) {
      if (this.config.hasOwnProperty(key) && !isNaN(parseInt(key))) {
        this.subShapeConfigs.push({
          id: parseInt(key),
          config: this.config[key]
        });
      }
    }
    
    // Sort by ID to maintain consistent order
    this.subShapeConfigs.sort((a, b) => a.id - b.id);
  }
  
  // Helper method to find a point's index based on coordinates
  findPointIndex(point) {
    for (let i = 0; i < this.points.length; i++) {
      if (Math.abs(this.points[i].x - point.x) < 0.1 && 
          Math.abs(this.points[i].y - point.y) < 0.1) {
        return i;
      }
    }
    return -1; // Not found
  }

  getPoints() {
    return this.points;
  }
  
  getConfiguredLines() {
    return this.configuredLines;
  }
  
  getSubShapeConfigs() {
    return this.subShapeConfigs;
  }
  
  // Check if two points connect based on the predefined lines
  canConnect(point1, point2) {
    // Check if there's a line connecting these points
    return this.configuredLines.some(line => 
      (this.pointsEqual(line.start, point1) && this.pointsEqual(line.end, point2)) ||
      (this.pointsEqual(line.start, point2) && this.pointsEqual(line.end, point1))
    );
  }
  
  // Helper method to check if two points are the same
  pointsEqual(p1, p2) {
    return Math.abs(p1.x - p2.x) < 0.1 && Math.abs(p1.y - p2.y) < 0.1;
  }

  // Get all valid connection points for a given point
  getValidConnectionsFor(point) {
    const validConnections = [];
    
    // Check all configured lines for connections to this point
    for (const line of this.configuredLines) {
      if (this.pointsEqual(line.start, point)) {
        validConnections.push(this.points.find(p => this.pointsEqual(p, line.end)) || line.end);
      } else if (this.pointsEqual(line.end, point)) {
        validConnections.push(this.points.find(p => this.pointsEqual(p, line.start)) || line.start);
      }
    }
    
    return validConnections;
  }

  getLineGenerationMode() {
    switch (this.config.lineComposition) {
      case "Random":
        return LINE_MODE.RANDOM;
      case "Branched":
        return LINE_MODE.BRANCHING;
      case "Sequential":
        return LINE_MODE.SEQUENTIAL;
      default:
        return LINE_MODE.SEQUENTIAL;
    }
  }
  
  getLineType() {
    switch (this.config.lineType?.toLowerCase()) {
      case "straight":
        return LINE_TYPE.STRAIGHT;
      case "curved":
        return LINE_TYPE.CURVED;
      case "both":
        return LINE_TYPE.BOTH;
      default:
        return LINE_TYPE.BOTH;
    }
  }
  
  getPlaceAtPoints(shapeConfig) {
    return shapeConfig.connection === "atEnd";
  }
  
  getLockRotation(shapeConfig) {
    return shapeConfig.rotationType === "absolute";
  }

  getParameters() {
    // Map general configuration to parameters
    // Handle numberOfLines as an object with min/max or a single number
    let lineCountObj = { min: 2, max: 2 }; // Default
    
    if (typeof this.config.numberOfLines === 'object') {
      lineCountObj = {
        min: this.config.numberOfLines.min || 1,
        max: this.config.numberOfLines.max || this.config.numberOfLines.min || 1
      };
    } else if (typeof this.config.numberOfLines === 'number') {
      lineCountObj = {
        min: this.config.numberOfLines,
        max: this.config.numberOfLines
      };
    }
    
    return {
      lineCount: lineCountObj,
      lineWidth: { 
        min: this.config.lineWidth?.min || 2, 
        max: this.config.lineWidth?.max || 15 
      },
      missArea: this.config.missArea || 0,
      smoothAmount: this.config.smoothAmount || 0
    };
  }
  
  getShapeSides(shapeName) {
    // Convert shape name to number of sides
    switch (shapeName) {
      case "Triangle":
        return 3;
      case "Square":
        return 4;
      case "Pentagon":
        return 5;
      case "Hexagon":
        return 6;
      case "Circle":
        return 12;
      default:
        return 3;
    }
  }
}

// ShapeGenerator class - updated to handle multiple subshapes and create ConfigParser internally
class ShapeGenerator {
  constructor(jsonConfig) {
    // Create the ConfigParser internally
    this.configParser = new ConfigParser(jsonConfig);
    this.noiseOffset = random(1000);
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
    const numLines = floor(random(params.lineCount.min, params.lineCount.max + 1));
    this.useConfiguredLines(numLines, params);
    
    // Generate polygons for each subshape type
    const subShapeConfigs = this.configParser.getSubShapeConfigs();
    
    for (const subShapeConfig of subShapeConfigs) {
      this.generatePolygonsForSubShape(subShapeConfig.config, params);
    }
  }

  // Generate noise value with offset
  getNoise(offset = 0) {
    return noise(this.noiseOffset + offset * 0.01);
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
      const lineWidth = random(params.lineWidth.min, params.lineWidth.max);
      
      // For the "both" type, randomly choose between straight and curved for each line
      const shouldBeCurved = lineType === LINE_TYPE.CURVED || 
                            (lineType === LINE_TYPE.BOTH && random() > 0.5);
      
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
          const cp = random(otherPoints);
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
          const midpoint = createVector(
            (line.start.x + line.end.x) / 2,
            (line.start.y + line.end.y) / 2
          );
          
          // Add some perpendicular offset to make it curved
          const dx = line.end.x - line.start.x;
          const dy = line.end.y - line.start.y;
          const perpDistance = 50; // Control curvature amount
          
          midpoint.x += -dy / sqrt(dx*dx + dy*dy) * perpDistance;
          midpoint.y += dx / sqrt(dx*dx + dy*dy) * perpDistance;
          
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
    const startLineIndex = floor(random(allLines.length));
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
    const startLineIndex = floor(random(allLines.length));
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
            if (random() < 0.7) { // 70% chance to allow branching
              branchablePoints.add(startPointStr);
            }
          }
          
          if (!usedPointsSet.has(endPointStr)) {
            usedPointsSet.add(endPointStr);
            // Each new endpoint has a chance to become a branch point
            if (random() < 0.7) { // 70% chance to allow branching
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
              if (random() < 0.4) { // 40% chance
                branchablePoints.add(startPointStr);
              }
            }
            
            if (!usedPointsSet.has(endPointStr)) {
              usedPointsSet.add(endPointStr);
              if (random() < 0.4) { // 40% chance
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
      return map(noise(this.noiseOffset + offset), 0, 1, range.min, range.max);
    }
    return range; // If it's a fixed value
  }

  // Generate polygons for a specific subshape configuration
  generatePolygonsForSubShape(shapeConfig, globalParams) {
    // Get the number of polygons to generate for this shape
    const numPolygons = floor(random(shapeConfig.amount.min, shapeConfig.amount.max));
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
      const pathType = random(availableTypes);
      
      // Generate a base position and direction for the polygon
      const { base, direction } = this.determinePolygonPosition(pathType, placeAtPoints);
      if (!base) continue;
      
      // Create the polygon with the determined parameters
      const polygonParams = {
        size: random(shapeConfig.size.min, shapeConfig.size.max),
        sides: this.configParser.getShapeSides(shapeConfig.subShape),
        rotation: this.configParser.getLockRotation(shapeConfig) && direction 
                ? atan2(direction.y, direction.x)
                : random(shapeConfig.angle.min, shapeConfig.angle.max) * (PI/180),
        distortion: random(shapeConfig.distort.min, shapeConfig.distort.max)
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
    
    const chosenLine = random(this.lines);
    const p1 = chosenLine.p1;
    const p2 = chosenLine.p2;
    
    if (placeAtPoints) {
      if (!this.usedEndpoints.has(p1.toString())) {
        this.usedEndpoints.add(p1.toString());
        return { base: p1, direction: createVector(p2.x - p1.x, p2.y - p1.y).normalize() };
      } else if (!this.usedEndpoints.has(p2.toString())) {
        this.usedEndpoints.add(p2.toString());
        return { base: p2, direction: createVector(p2.x - p1.x, p2.y - p1.y).normalize() };
      }
      return { base: null, direction: null };
    } else {
      const offset = random(0.1, 0.9); // Avoid extreme ends
      const base = createVector(
        lerp(p1.x, p2.x, offset), 
        lerp(p1.y, p2.y, offset)
      );
      const direction = createVector(p2.x - p1.x, p2.y - p1.y).normalize();
      return { base, direction };
    }
  }

  // Get position on a curved line
  getPositionOnCurvedLine(placeAtPoints) {
    if (this.curves.length === 0) {
      return { base: null, direction: null };
    }
    
    const chosenCurve = random(this.curves);
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
      const t = random(0.1, 0.9);
      const base = this.getBezierPoint(p1, cp, p2, t);
      const direction = this.getBezierTangent(p1, cp, p2, t).normalize();
      return { base, direction };
    }
  }

  // Create polygon at the specified position
  createPolygon(base, params) {
    const angleStep = TWO_PI / params.sides;
    const vertices = [];

    for (let i = 0; i < params.sides; i++) {
      const angle = angleStep * i + params.rotation;
      const distortionOffset = random(-params.distortion, params.distortion);
      const distortedSize = params.size + distortionOffset;
      
      const vertex = createVector(
        base.x + cos(angle) * distortedSize,
        base.y + sin(angle) * distortedSize
      );
      
      vertices.push(vertex);
    }

    return vertices;
  }

  // Quadratic Bezier point calculation
  getBezierPoint(p1, cp, p2, t) {
    const x = (1-t)*(1-t)*p1.x + 2*(1-t)*t*cp.x + t*t*p2.x;
    const y = (1-t)*(1-t)*p1.y + 2*(1-t)*t*cp.y + t*t*p2.y;
    return createVector(x, y);
  }

  // Bezier tangent calculation for direction
  getBezierTangent(p1, cp, p2, t) {
    const x = 2*(1-t)*(cp.x-p1.x) + 2*t*(p2.x-cp.x);
    const y = 2*(1-t)*(cp.y-p1.y) + 2*t*(p2.y-cp.y);
    return createVector(x, y);
  }

  // Method to get polygons for drawing
  getPolygons() {
    return this.polygons;
  }

  // Drawing methods
  drawLines() {
    stroke(0);
    
    // Draw straight lines
    for (const lineObj of this.lines) {
      strokeWeight(lineObj.lineWidth);
      line(lineObj.p1.x, lineObj.p1.y, lineObj.p2.x, lineObj.p2.y);
    }
    
    // Draw curved lines with control points
    for (const curveObj of this.curves) {
      strokeWeight(curveObj.lineWidth);
      noFill();
      
      beginShape();
      vertex(curveObj.p1.x, curveObj.p1.y);
      quadraticVertex(curveObj.cp.x, curveObj.cp.y, curveObj.p2.x, curveObj.p2.y);
      endShape();
    }
  }

  drawPolygons() {
    fill(0);
    for (const polygon of this.polygons) {
      beginShape();
      for (const v of polygon) {
        vertex(v.x, v.y);
      }
      endShape(CLOSE);
    }
  }

  applyEffects() {
    // Apply smoothing/blur if specified
    const params = this.configParser.getParameters();
    if (params.smoothAmount > 0) {
      filter(BLUR, params.smoothAmount);
      filter(THRESHOLD, 0.5);
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
    const angle = random(TWO_PI);
    const distance = random(missAreaRadius);
    
    return createVector(
      point.x + cos(angle) * distance,
      point.y + sin(angle) * distance
    );
  }
}

// Main app setup - updated to create only ShapeGenerator
let shapeGenerator;

function setup() {
  createCanvas(600, 600);
  noStroke();

  // Create ShapeGenerator directly with the config
  shapeGenerator = new ShapeGenerator(defaultConfig);
  
  // Automatically generate shapes when starting
  shapeGenerator.generateCompositeForms();
}

function keyPressed() {
  if (key === 'g') {
    shapeGenerator.generateCompositeForms();
  } else if (key === 'l') {
    loadConfig();
  }
}

function loadConfig() {
  // Function to load a new configuration
  let configJson = prompt("Paste your JSON configuration:");
  if (configJson) {
    try {
      const newConfig = JSON.parse(configJson);
      // Create a new ShapeGenerator with the new config
      shapeGenerator = new ShapeGenerator(newConfig);
      shapeGenerator.generateCompositeForms();
    } catch (e) {
      console.error("Invalid JSON configuration:", e);
    }
  }
}

function draw() {
  background(255);

  // Draw all generative elements
  shapeGenerator.drawLines();
  shapeGenerator.drawPolygons();
  shapeGenerator.applyEffects();
}