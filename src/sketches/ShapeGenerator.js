import {defaultConfig, exampleConfig, LINE_MODE, LINE_TYPE} from './Constants';
import ConfigParser from "./ConfigParser.js";


// ShapeGenerator class - updated to use ConfigParser instead of state
class ShapeGenerator {
    constructor(p, config = exampleConfig) {
      this.p = p;
      this.configParser = new ConfigParser(p, config);

      //Noise X & Y
      this.noiseX = 0;
      this.noiseY = 0;
      this.noisePaddings = 0;

      this.noiseOffset = p.random(1000);
      this.blurValue = 0;
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
      
      // Generate appropriate number of polygons
      const numPolygons = this.p.floor(this.getNoise(0) * (params.polygonCount.max - params.polygonCount.min + 1) + params.polygonCount.min);
      const numOfLines = params.lineCount.min;
      
      // Generate lines based on the selected type
      this.generateLines(numOfLines, params);
      
      // Generate polygons along lines
      this.generatePolygonsAlongPaths(numPolygons, params);
    }
  
    // Generate noise value with offset
    getNoise(offset = 0) {
      return this.p.noise(this.noiseOffset + offset * 0.01);
    }
  
    // Generate lines based on the selected line type
    generateLines(numOfLines, params) {
      const points = this.configParser.getPoints();
      if (points.length < 2) return;
      
      const lineType = this.configParser.getLineType();
      
      if (lineType === LINE_TYPE.BOTH) {
        // Split line count between straight and curved
        const straightCount = this.p.floor(numOfLines / 2);
        const curvedCount = numOfLines - straightCount;
        
        this.generateLinesByType(LINE_TYPE.STRAIGHT, straightCount, params);
        this.generateLinesByType(LINE_TYPE.CURVED, curvedCount, params);
      } else {
        this.generateLinesByType(lineType, numOfLines, params);
      }
    }
  
    // Generate specific type of lines (straight or curved)
    generateLinesByType(type, count, params) {
      const points = this.configParser.getPoints();
      
      // Skip if not enough points
      if (type === LINE_TYPE.CURVED && points.length < 3) return;
      if (type === LINE_TYPE.STRAIGHT && points.length < 2) return;
      
      const lineGenerationMode = this.configParser.getLineGenerationMode();
      
      switch (lineGenerationMode) {
        case LINE_MODE.RANDOM:
          this.generateRandomLines(type, count, params);
          break;
        case LINE_MODE.BRANCHING:
          this.generateBranchingLines(type, count, params);
          break;
        case LINE_MODE.SEQUENTIAL:
          this.generateSequentialLines(type, count, params);
          break;
      }
    }
  
    // Random line generation - modified to respect connection constraints
    generateRandomLines(type, count, params) {
      const points = this.configParser.getPoints();
      const missAreaRadius = params.missArea;
      let attempts = 0;
      const maxAttempts = count * 10; // Avoid infinite loops
      
      for (let i = 0; i < count && attempts < maxAttempts; i++, attempts++) {
        if (type === LINE_TYPE.STRAIGHT) {
          const p1 = this.p.random(points);
          // Filter to only valid connections
          const validConnections = this.configParser.getValidConnectionsFor(p1);
          
          if (validConnections.length === 0) {
            i--; // Try again for this line
            continue;
          }
          
          const p2 = this.p.random(validConnections);
          
          // Create points with offset for visual variation
          const offsetP1 = this.getOffsetPosition(p1, missAreaRadius);
          const offsetP2 = this.getOffsetPosition(p2, missAreaRadius);
          
          const lineWidth = this.mapNoiseToRange(i * 0.4, params.lineWidth);
          // Store both original points for connection logic and offset points for drawing
          this.lines.push({ 
            p1: offsetP1, 
            p2: offsetP2, 
            origP1: p1,
            origP2: p2,
            lineWidth 
          });
        } else {
          const p1 = this.p.random(points);
          // Filter to only valid connections
          const validConnections = this.configParser.getValidConnectionsFor(p1);
          
          if (validConnections.length === 0) {
            i--; // Try again for this line
            continue;
          }
          
          const p2 = this.p.random(validConnections);
          
          // For control points, we need a point that's not p1 or p2
          const otherPoints = points.filter(p => p !== p1 && p !== p2);
          if (otherPoints.length === 0) {
            i--; // Try again for this line
            continue;
          }
          
          const cp = this.p.random(otherPoints);
          
          // Create points with offset for visual variation
          const offsetP1 = this.getOffsetPosition(p1, missAreaRadius);
          const offsetP2 = this.getOffsetPosition(p2, missAreaRadius);
          const offsetCP = this.getOffsetPosition(cp, missAreaRadius);
          
          const lineWidth = this.mapNoiseToRange(i * 0.4, params.lineWidth);
          // Store both original points and offset points
          this.curves.push({ 
            p1: offsetP1, 
            cp: offsetCP, 
            p2: offsetP2,
            origP1: p1,
            origP2: p2,
            origCP: cp,
            lineWidth 
          });
        }
      }
    }
  
    // Branching line generation - modified to respect connection constraints
    generateBranchingLines(type, count, params) {
      const points = this.configParser.getPoints();
      const missAreaRadius = params.missArea;
      
      if (points.length < (type === LINE_TYPE.CURVED ? 3 : 2)) return;
      
      // Track visited points to prevent loops
      let visitedConnections = new Set();
      
      // Find a point with multiple possible connections to use as the root
      const pointsWithMultipleConnections = points.filter(p => 
        this.configParser.getValidConnectionsFor(p).length >= 2
      );
      
      // If no points have multiple connections, try to use any point
      const root = pointsWithMultipleConnections.length > 0 
        ? this.p.random(pointsWithMultipleConnections)
        : this.p.random(points);
        
      // Max branch depth to prevent infinite recursion
      const maxDepth = count;
      
      if (type === LINE_TYPE.STRAIGHT) {
        // Create branches recursively starting from root
        this.createStraightBranches(root, count, params, 0, maxDepth, visitedConnections);
      } else {
        // Create curved branches recursively starting from root
        this.createCurvedBranches(root, count, params, 0, maxDepth, visitedConnections);
      }
    }
  
    // New helper method for recursive straight line branching
    createStraightBranches(point, branchesLeft, params, depth, maxDepth, visitedConnections) {
      // Stop conditions: no branches left, max depth reached
      if (branchesLeft <= 0 || depth >= maxDepth) return;
      
      const missAreaRadius = params.missArea;
      const offsetPoint = this.getOffsetPosition(point, missAreaRadius);
      
      // Get valid connections that haven't been used
      const validConnections = this.configParser.getValidConnectionsFor(point)
        .filter(p2 => !visitedConnections.has(`${point.index}-${p2.index}`));
      
      if (validConnections.length === 0) return;
      
      // Shuffle connections for randomness
      this.shuffleArray(validConnections);
      
      // Create branches up to branches left or available connections
      const branchesToCreate = this.p.min(branchesLeft, validConnections.length);
      let branchesCreated = 0;
      
      for (let i = 0; i < branchesToCreate; i++) {
        const endpoint = validConnections[i];
        
        // Record this connection as visited
        visitedConnections.add(`${point.index}-${endpoint.index}`);
        visitedConnections.add(`${endpoint.index}-${point.index}`);
        
        // Create offset for endpoint
        const offsetEndpoint = this.getOffsetPosition(endpoint, missAreaRadius);
        
        // Add line
        const lineWidth = params.lineWidth.min;
        this.lines.push({
          p1: offsetPoint,
          p2: offsetEndpoint,
          origP1: point,
          origP2: endpoint,
          lineWidth
        });
        
        branchesCreated++;
        
        // Recursively branch from the endpoint
        // Each branch gets fewer sub-branches as we go deeper
        const subBranches = this.p.floor(branchesLeft / branchesToCreate) - 1;
        if (subBranches > 0) {
          this.createStraightBranches(
            endpoint, 
            subBranches, 
            params, 
            depth + 1, 
            maxDepth, 
            visitedConnections
          );
        }
      }
      
      return branchesCreated;
    }
  
    // New helper method for recursive curved line branching
    createCurvedBranches(point, branchesLeft, params, depth, maxDepth, visitedConnections) {
      // Stop conditions: no branches left, max depth reached
      if (branchesLeft <= 0 || depth >= maxDepth) return;
      
      const points = this.configParser.getPoints();
      const missAreaRadius = params.missArea;
      const offsetPoint = this.getOffsetPosition(point, missAreaRadius);
      
      // Get valid connections that haven't been used
      const validConnections = this.configParser.getValidConnectionsFor(point)
        .filter(p2 => !visitedConnections.has(`${point.index}-${p2.index}`));
      
      if (validConnections.length === 0) return;
      
      // Shuffle connections for randomness
      this.shuffleArray(validConnections);
      
      // Create branches up to branches left or available connections
      const branchesToCreate = this.p.min(branchesLeft, validConnections.length);
      let branchesCreated = 0;
      
      for (let i = 0; i < branchesToCreate; i++) {
        const endpoint = validConnections[i];
        
        // Record this connection as visited
        visitedConnections.add(`${point.index}-${endpoint.index}`);
        visitedConnections.add(`${endpoint.index}-${point.index}`);
        
        // Find potential control points
        const potentialControlPoints = points.filter(p => 
          p !== point && p !== endpoint
        );
        
        if (potentialControlPoints.length === 0) continue;
        
        // Pick a control point
        const cp = this.p.random(potentialControlPoints);
        
        // Create offsets
        const offsetEndpoint = this.getOffsetPosition(endpoint, missAreaRadius);
        const offsetCP = this.getOffsetPosition(cp, missAreaRadius);
        
        // Add curve
        const lineWidth = params.lineWidth.min;
        this.curves.push({
          p1: offsetPoint,
          cp: offsetCP,
          p2: offsetEndpoint,
          origP1: point,
          origP2: endpoint,
          origCP: cp,
          lineWidth
        });
        
        branchesCreated++;
        
        // Recursively branch from the endpoint
        // Each branch gets fewer sub-branches as we go deeper
        const subBranches = this.p.floor(branchesLeft / branchesToCreate) - 1;
        if (subBranches > 0) {
          this.createCurvedBranches(
            endpoint,
            subBranches,
            params,
            depth + 1,
            maxDepth,
            visitedConnections
          );
        }
      }
      
      return branchesCreated;
    }
  
    // Sequential line generation - modified to respect connection constraints
    generateSequentialLines(type, count, params) {
      const points = this.configParser.getPoints();
      const missAreaRadius = params.missArea;
      
      if (points.length < (type === LINE_TYPE.CURVED ? 3 : 2)) return;
      
      if (type === LINE_TYPE.STRAIGHT) {
        // Find a point with a connection to start with
        let startPoints = points.filter(p => this.configParser.getValidConnectionsFor(p).length > 0);
        if (startPoints.length === 0) return;
        
        let p1 = this.p.random(startPoints);
        let usedPoints = new Set([p1]);
        let createdLines = 0;
        
        // Apply miss area offset to first point
        let offsetP1 = this.getOffsetPosition(p1, missAreaRadius);
        
        while (createdLines < count) {
          // Get valid connections that haven't been used yet
          const validConnections = this.configParser.getValidConnectionsFor(p1)
            .filter(p => !usedPoints.has(p));
          
          if (validConnections.length === 0) {
            // No more connections from this point, try to find another unused point with connections
            const remainingPoints = points.filter(p => !usedPoints.has(p));
            if (remainingPoints.length === 0) break;
            
            p1 = this.p.random(remainingPoints);
            offsetP1 = this.getOffsetPosition(p1, missAreaRadius);
            usedPoints.add(p1);
            continue;
          }
          
          const p2 = this.p.random(validConnections);
          usedPoints.add(p2);
          
          // Apply miss area offset to second point
          const offsetP2 = this.getOffsetPosition(p2, missAreaRadius);
          
          const lineWidth = params.lineWidth.min;
          this.lines.push({ 
            p1: offsetP1, 
            p2: offsetP2, 
            origP1: p1,
            origP2: p2,
            lineWidth 
          });
          
          p1 = p2; // Continue from this point
          offsetP1 = offsetP2; // Continue from offset point
          createdLines++;
        }
      } else {
        // For curved sequential lines
        let startPoints = points.filter(p => this.configParser.getValidConnectionsFor(p).length > 0);
        if (startPoints.length === 0) return;
        
        let p1 = this.p.random(startPoints);
        let offsetP1 = this.getOffsetPosition(p1, missAreaRadius);
        let usedConnections = new Set(); // Track which connections have been used
        let createdCurves = 0;
        
        while (createdCurves < count) {
          // Get valid connections that haven't created a curve from p1 yet
          const validConnections = this.configParser.getValidConnectionsFor(p1)
            .filter(p2 => !usedConnections.has(`${p1.index}-${p2.index}`));
          
          if (validConnections.length === 0) {
            // Try to find another point with unused connections
            const remainingPoints = points.filter(p => 
              this.configParser.getValidConnectionsFor(p)
                .some(conn => !usedConnections.has(`${p.index}-${conn.index}`))
            );
            
            if (remainingPoints.length === 0) break;
            
            p1 = this.p.random(remainingPoints);
            offsetP1 = this.getOffsetPosition(p1, missAreaRadius);
            continue;
          }
          
          const p2 = this.p.random(validConnections);
          
          // Mark this connection as used in both directions
          usedConnections.add(`${p1.index}-${p2.index}`);
          usedConnections.add(`${p2.index}-${p1.index}`);
          
          // Find a control point that's not one of the endpoints
          const potentialControlPoints = points.filter(p => p !== p1 && p !== p2);
          
          if (potentialControlPoints.length === 0) {
            // No valid control points, skip this curve
            continue;
          }
          
          const cp = this.p.random(potentialControlPoints);
          
          // Apply miss area offset to second point and control point
          const offsetP2 = this.getOffsetPosition(p2, missAreaRadius);
          const offsetCP = this.getOffsetPosition(cp, missAreaRadius);
          
          const lineWidth = params.lineWidth.min;
          
          this.curves.push({ 
            p1: offsetP1, 
            cp: offsetCP, 
            p2: offsetP2,
            origP1: p1,
            origP2: p2,
            origCP: cp, 
            lineWidth 
          });
          
          p1 = p2; // Continue from the end point
          offsetP1 = offsetP2; // Continue from offset point
          createdCurves++;
        }
      }
    }
  
    // Map noise to a range
    mapNoiseToRange(offset, range) {
      if (typeof range === 'object') {
        return this.p.map(this.p.noise(this.noiseOffset + offset), 0, 1, range.min, range.max);
      }
      return range; // If it's a fixed value
    }
  
    // Generate polygons along the created paths
    generatePolygonsAlongPaths(numPolygons, params) {
      const lineType = this.configParser.getLineType();
      
      for (let i = 0; i < numPolygons; i++) {
        // Determine if we should place along straight or curved path
        const availableTypes = [];
        if (this.lines.length > 0 && (lineType === LINE_TYPE.STRAIGHT || lineType === LINE_TYPE.BOTH)) {
          availableTypes.push(LINE_TYPE.STRAIGHT);
        }
        if (this.curves.length > 0 && (lineType === LINE_TYPE.CURVED || lineType === LINE_TYPE.BOTH)) {
          availableTypes.push(LINE_TYPE.CURVED);
        }
        
        if (availableTypes.length === 0) continue;
        const pathType = this.p.random(availableTypes);
        
        // Generate a base position and direction for the polygon
        const { base, direction } = this.determinePolygonPosition(pathType);
        if (!base) continue;
        
        // Create the polygon with the determined parameters
        const polygonParams = {
          size: this.mapNoiseToRange(i * 0.1, params.size),
          sides: this.p.floor(this.mapNoiseToRange(i * 0.2, params.sides)),
          rotation: this.configParser.getLockRotation() && direction 
                  ? this.p.atan2(direction.y, direction.x)
                  : this.mapNoiseToRange(i * 0.3, params.rotation),
          distortion: this.mapNoiseToRange(i * 0.5, params.distortion)
        };
        
        polygonParams.sides = this.p.constrain(polygonParams.sides, 3, params.sides.max);
        this.blurValue = params.blur; // Use single blur value
        
        const polygonVertices = this.createPolygon(base, polygonParams);
        this.polygons.push(polygonVertices);
      }
    }
  
    // Determine position for a polygon based on path type
    determinePolygonPosition(pathType) {
      if (pathType === LINE_TYPE.STRAIGHT) {
        return this.getPositionOnStraightLine();
      } else {
        return this.getPositionOnCurvedLine();
      }
    }
  
    // Get position on a straight line
    getPositionOnStraightLine() {
      const chosenLine = this.p.random(this.lines);
      const p1 = chosenLine.p1;
      const p2 = chosenLine.p2;
      
      if (this.configParser.getPlaceAtPoints()) {
        if (!this.usedEndpoints.has(p1)) {
          this.usedEndpoints.add(p1);
          return { base: p1, direction: this.p.createVector(p2.x - p1.x, p2.y - p1.y).normalize() };
        } else if (!this.usedEndpoints.has(p2)) {
          this.usedEndpoints.add(p2);
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
    getPositionOnCurvedLine() {
      const chosenCurve = this.p.random(this.curves);
      const p1 = chosenCurve.p1;
      const cp = chosenCurve.cp;
      const p2 = chosenCurve.p2;
      
      if (this.configParser.getPlaceAtPoints()) {
        if (!this.usedEndpoints.has(p1)) {
          this.usedEndpoints.add(p1);
          return { base: p1, direction: this.getBezierTangent(p1, cp, p2, 0).normalize() };
        } else if (!this.usedEndpoints.has(p2)) {
          this.usedEndpoints.add(p2);
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
      const params = this.configParser.getParameters();
      for (const curveObj of this.curves) {
        this.p.strokeWeight(curveObj.lineWidth);
        this.p.noFill();
        
        // Set curve tightness before drawing
        this.p.curveTightness(0);

        this.p.beginShape();
        this.p.vertex(curveObj.p1.x, curveObj.p1.y);
        this.p.quadraticVertex(curveObj.cp.x, curveObj.cp.y, curveObj.p2.x, curveObj.p2.y);
        this.p.endShape();
      }
    }
  
    drawPolygons() {
      this.p.fill(0);
      for (const polygon of this.polygons) {
        this.p.beginShape();
        for (const v of polygon) {
          this.p.vertex(v.x, v.y);
        }
        this.p.endShape(this.p.CLOSE);
      }
    }
  
    applyEffects() {
      // Use the single blur value directly
      const params = this.configParser.getParameters();
      this.p.filter(this.p.BLUR, params.blur);
      this.p.filter(this.p.THRESHOLD, 0.5);
    }
  
    // Add a helper method to shuffle an array (for random selection without repetition)
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
  
    // Add this method to the ShapeGenerator class to apply missArea to line positions
  
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