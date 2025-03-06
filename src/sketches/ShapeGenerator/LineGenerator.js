
import { LINE_MODE, LINE_TYPE } from "./Constants.js";
class LineGenerator {
    constructor(p, cNoise, noisePos) {
        this.p = p;
        this.cNoise = cNoise;

        this.lines = [];
        this.curves = [];

        this.noisePos = noisePos;

        this.points = [];
    }
    generateLines(lineParams, configuredLines, lineType, lineMode, points) {
        this.points = points;

        //Determine lineCount!
        const lineCountMin = lineParams.lineCount.min; const lineCountMax = lineParams.lineCount.max;
        const numOfLines = this.cNoise.noiseMap(this.noisePos, lineCountMin, lineCountMax);

        this.useConfiguredLines(numOfLines, lineParams, configuredLines, lineType, lineMode);

    }

    getLines() {
        return this.lines;
    }
    getCurves() {
        return this.curves;
    }

    draw(xray = false){
        this.p.stroke(0);
        if(xray) this.p.stroke(255,150,0);

        // Draw straight lines
        for (const lineObj of this.lines) {
            this.p.strokeWeight(lineObj.lineWidth);
            if (xray) this.p.strokeWeight(3);
            this.p.line(lineObj.p1.x, lineObj.p1.y, lineObj.p2.x, lineObj.p2.y);
        }

        // Draw curved lines with control points
        for (const curveObj of this.curves) {
            this.p.strokeWeight(curveObj.lineWidth);
            if (xray) this.p.strokeWeight(3);
            this.p.noFill();

            this.p.beginShape();
            this.p.vertex(curveObj.p1.x, curveObj.p1.y);
            this.p.quadraticVertex(curveObj.cp.x, curveObj.cp.y, curveObj.p2.x, curveObj.p2.y);
            this.p.endShape();
        }
    }

    // Use predefined lines from the configuration
    useConfiguredLines(numOfLines, lineParams, configuredLines, lineType, lineMode) {

        const missAreaRadius = lineParams.missArea;

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
            //const lineWidth = this.p.random(params.lineWidth.min, params.lineWidth.max);
            const lineWidth = this.cNoise.noiseMap(this.noisePos, lineParams.lineWidth.min, lineParams.lineWidth.max);

            // For the "both" type, randomly choose between straight and curved for each line
            const shouldBeCurved = lineType === LINE_TYPE.CURVED ||
                (lineType === LINE_TYPE.BOTH && this.cNoise.noiseMap(this.noisePos, 0, 1) > 0.5);

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
                const otherPoints = this.points.filter(p =>
                    !this.pointsEqual(p, line.start) &&
                    !this.pointsEqual(p, line.end)
                );

                if (otherPoints.length > 0) {
                    //const cp = this.p.random(otherPoints);
                    const cpIndex = Math.floor(this.cNoise.noiseMap(this.noisePos, 0, otherPoints.length)); // Get the index
                    const cp = otherPoints[cpIndex];
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
                    //console.log("Creating own midpoint for line: " + line.start + " -> " + line.end + "");
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

    // Get a position with random offset from the original point
    getOffsetPosition(point, missAreaRadius) {
        // If missArea is 0, return the original point
        //if (missAreaRadius <= 0) return point;

        // Generate random offset within the miss area
        //const angle = this.p.random(this.p.TWO_PI);
        const angle = this.cNoise.noiseMap(this.noisePos, 0, this.p.TWO_PI);

        //const distance = this.p.random(missAreaRadius);
        const distance = this.cNoise.noiseMap(this.noisePos, 0, missAreaRadius);

        return this.p.createVector(
            point.x + this.p.cos(angle) * distance,
            point.y + this.p.sin(angle) * distance
        );
    }

    selectSequentialLines(allLines, numOfLines) {
        if (allLines.length === 0 || numOfLines <= 0) {
            return [];
        }

        // Start with a random line
        const startLineIndex = this.p.floor(this.cNoise.noiseMap(this.noisePos, 0, allLines.length));
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
    selectBranchingLines(allLines, numOfLines) {
        if (allLines.length === 0 || numOfLines <= 0) {
            return [];
        }

        // Start with a random line
        const startLineIndex = this.p.floor(this.cNoise.noiseMap(this.noisePos, 0, allLines.length));
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
                        if (this.cNoise.noiseMap(this.noisePos,0,1) < 0.7) { // 70% chance to allow branching
                            branchablePoints.add(startPointStr);
                        }
                    }

                    if (!usedPointsSet.has(endPointStr)) {
                        usedPointsSet.add(endPointStr);
                        // Each new endpoint has a chance to become a branch point
                        if (this.cNoise.noiseMap(this.noisePos,0,1) < 0.7) { // 70% chance to allow branching
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
                            if (this.cNoise.noiseMap(this.noisePos,0,1) < 0.4) { // 40% chance
                                branchablePoints.add(startPointStr);
                            }
                        }

                        if (!usedPointsSet.has(endPointStr)) {
                            usedPointsSet.add(endPointStr);
                            if (this.cNoise.noiseMap(this.noisePos,0,1) < 0.4) { // 40% chance
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

    // Helper method to shuffle an array
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(this.cNoise.noiseMap(this.noisePos, 0, 1) * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    pointsEqual(p1, p2) {
        return Math.abs(p1.x - p2.x) < 0.1 && Math.abs(p1.y - p2.y) < 0.1;
    }
}
export default LineGenerator;