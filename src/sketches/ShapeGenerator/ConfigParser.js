import {defaultConfig, LINE_TYPE, LINE_MODE, exampleConfig} from "./Constants.js";

class ConfigParser {
  constructor(p, jsonConfig= defaultConfig) {
    this.p = p;
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
        const newPoint = this.p.createVector(point.x, point.y);
        newPoint.index = index; // Store the original index with the point
        this.points.push(newPoint);
      });
    }

    // Parse predefined lines from configuration
    if (Array.isArray(this.config.lines)) {
      this.config.lines.forEach(line => {
        const startPoint = this.p.createVector(line.start.x, line.start.y);
        const endPoint = this.p.createVector(line.end.x, line.end.y);

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
        return 30;
      default:
        return 3;
    }
  }
}
export default ConfigParser;