import { LINE_MODE, LINE_TYPE } from './Constants';

class ConfigParser {
  constructor(p, jsonConfig) {
    this.p = p;                          // Reference to the p5 instance
    this.config = jsonConfig;            // Configuration object
    this.points = [];                    // Array to hold parsed points
    this.lines = [];                     // Array to hold parsed lines
    this.connectionMap = new Map();      // Map of point indices to lines
    this.parsePointsAndLines();          // Parse points & lines from config
  }

  parsePointsAndLines() {
    // Step 1: Parse points
    this.points = [];
    this.connectionMap.clear();

    if (Array.isArray(this.config.points)) {
      this.config.points.forEach((point, index) => {
        // Create p5 vector for each point
        const newPoint = this.p.createVector(point.x, point.y);
        newPoint.index = index; // Store the index for reference
        this.points.push(newPoint);

        // Initialize an empty connection set for each point
        this.connectionMap.set(index, new Set());
      });
    }

    // Step 2: Parse lines and map connections
    this.lines = [];
    if (Array.isArray(this.config.lines)) {
      this.config.lines.forEach((line) => {
        // Convert start & end points to p5 vectors
        const startPoint = this.p.createVector(line.start.x, line.start.y);
        const endPoint = this.p.createVector(line.end.x, line.end.y);

        // Find indices of start and end points in the points array
        const startIndex = this.findPointIndex(startPoint);
        const endIndex = this.findPointIndex(endPoint);

        if (startIndex !== -1 && endIndex !== -1) {
          // Store the line
          this.lines.push({ start: startPoint, end: endPoint });

          // Map connections
          this.connectionMap.get(startIndex).add(endIndex);
          this.connectionMap.get(endIndex).add(startIndex); // Bidirectional connection
        }
      });
    }
  }

  findPointIndex(target) {
    // Find the index of a point in this.points array matching target (by x, y)
    return this.points.findIndex(
        (point) => point.x === target.x && point.y === target.y
    );
  }

  getPoints() {
    return this.points;
  }

  getLines() {
    return this.lines;
  }

  // Check if two points can connect based on the connectionMap
  canConnect(point1, point2) {
    const idx1 = point1.index;
    const idx2 = point2.index;

    // If no connection information is available, disallow connection
    if (!this.connectionMap.has(idx1) || !this.connectionMap.has(idx2)) {
      return false;
    }

    // Check if the connection exists between the two indices
    return this.connectionMap.get(idx1).has(idx2);
  }

  // Get all valid connection points for a given point
  getValidConnectionsFor(point) {
    const validConnections = [];
    const pointIdx = point.index;

    if (this.connectionMap.has(pointIdx)) {
      const allowedIndices = this.connectionMap.get(pointIdx);
      allowedIndices.forEach((connectedIndex) => {
        validConnections.push(this.points[connectedIndex]);
      });
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
    switch (this.config.lineType) {
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

  getPlaceAtPoints() {
    return this.config.connection === "atEnd";
  }

  getLockRotation() {
    return this.config.rotationType === "absolute";
  }

  getShape() {
    return this.config.subShape;
  }

  getParameters() {
    console.log("CONFIG:", this.config);
    // Map configuration to parameters
    return {
      lineCount: {
        min: this.config.numberOfLines,
        max: this.config.numberOfLines
      },
      size: {
        min: this.config.size.min,
        max: this.config.size.max
      },
      polygonCount: {
        min: this.config.amount.min,
        max: this.config.amount.max
      },
      blur: this.config.blur, // Single value instead of min/max
      sides: {
        min: this.getShapeSides(),
        max: this.getShapeSides()
      },
      rotation: {
        min: this.config.angle.min * (this.p.PI / 180),
        max: this.config.angle.max * (this.p.PI / 180)
      },
      lineWidth: {
        min: this.config.lineWidth,
        max: this.config.lineWidth
      },
      distortion: {
        min: this.config.distort.min,
        max: this.config.distort.max
      },
      missArea: this.config.missArea
    };
  }

  getShapeSides() {
    // Convert shape name to number of sides
    switch (this.config.subShape) {
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

export default ConfigParser;