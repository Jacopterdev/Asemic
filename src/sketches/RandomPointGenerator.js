// src/sketches/RandomPointGenerator.js
class RandomPointGenerator {
    constructor(p, canvasWidth, canvasHeight, margin = 50) {
        this.p = p;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.margin = margin; // Margin from the edges of the canvas
    }

    /**
     * Generate random points and lines using one of several methods
     * @param {number} minPoints - Minimum number of points (default: 5)
     * @param {number} maxPoints - Maximum number of points (default: 35)
     * @returns {Object} Object with points and lines arrays
     */
    generate(minPoints = 5, maxPoints = 35) {
        // Create an array with methods, with recursive pattern appearing more frequently
        const methods = [
            this.generateStandard,          // Standard method (once)
            this.generateNonOverlapping,    // Non-overlapping lines method (once)
            this.generateSymmetricShape,    // Symmetric shapes method (once)
            this.generateOverlappingPolygons, // Overlapping polygons method (once)
            this.generateClustered,         // Clustered method (once)
            this.generateRecursivePattern,  // Recursive pattern method (first occurrence)
            this.generateRecursivePattern,  // Recursive pattern method (second occurrence)
            this.generateSpiderWeb          // Spider web method (once)
        ];
        
        const randomMethod = methods[Math.floor(this.p.random(methods.length))];
        console.log(`Using generation method: ${randomMethod.name}`);
        
        return randomMethod.call(this, minPoints, maxPoints);
    }
    
    /**
     * Standard method (current implementation)
     */
    generateStandard(minPoints = 5, maxPoints = 35) {
        // Generate a random number of points between min and max
        const numPoints = this.p.floor(this.p.random(minPoints, maxPoints + 1));
        console.log(`Standard method: generating ${numPoints} points`);
        
        // Create the points array
        const points = this.createRandomPoints(numPoints);
        
        // Create lines ensuring each point has at least one connection
        const lines = [];
        
        // First, ensure each point has at least one connection
        const connectedPoints = new Set();
        
        // Make sure each point gets at least one connection
        for (let i = 0; i < points.length; i++) {
            if (connectedPoints.has(i)) continue; // Skip if already connected

            // Pick a target point that's not this one
            let targetIndex;
            do {
                targetIndex = this.p.floor(this.p.random(points.length));
            } while (targetIndex === i);
            
            // Add the line
            lines.push({
                start: points[i],
                end: points[targetIndex],
                selected: true
            });
            
            // Mark both points as connected
            connectedPoints.add(i);
            connectedPoints.add(targetIndex);
        }
        
        // Add some additional random connections (roughly half as many as points)
        const additionalLines = this.p.floor(numPoints * 0.5);
        for (let i = 0; i < additionalLines; i++) {
            const startIndex = this.p.floor(this.p.random(points.length));
            let endIndex;
            
            // Make sure we don't create duplicate connections
            do {
                endIndex = this.p.floor(this.p.random(points.length));
            } while (
                endIndex === startIndex || 
                lines.some(line => 
                    (line.start.id === startIndex && line.end.id === endIndex) || 
                    (line.start.id === endIndex && line.end.id === startIndex)
                )
            );
            
            lines.push({
                start: points[startIndex],
                end: points[endIndex],
                selected: true
            });
        }
        
        return { points, lines };
    }
    
    /**
     * Non-overlapping lines method
     */
    generateNonOverlapping(minPoints = 5, maxPoints = 35) {
        const numPoints = this.p.floor(this.p.random(minPoints, maxPoints + 1));
        console.log(`Non-overlapping method: generating ${numPoints} points`);
        
        const points = this.createRandomPoints(numPoints);
        const lines = [];
        
        // Ensure each point has at least one connection
        for (let i = 0; i < points.length; i++) {
            // Find the closest point that won't create an overlapping line
            let bestPoint = -1;
            let shortestDistance = Infinity;
            
            for (let j = 0; j < points.length; j++) {
                if (i === j) continue;
                
                // Calculate distance
                const dist = this.p.dist(
                    points[i].x, points[i].y,
                    points[j].x, points[j].y
                );
                
                // Check if this line would intersect with any existing line
                const newLine = {
                    start: points[i],
                    end: points[j]
                };
                
                let intersects = false;
                for (const line of lines) {
                    if (this.doLinesIntersect(newLine, line)) {
                        intersects = true;
                        break;
                    }
                }
                
                // If it doesn't intersect and is closer than current best
                if (!intersects && dist < shortestDistance) {
                    shortestDistance = dist;
                    bestPoint = j;
                }
            }
            
            // If we found a valid connection, add it
            if (bestPoint !== -1) {
                lines.push({
                    start: points[i],
                    end: points[bestPoint],
                    selected: true
                });
            }
        }
        
        // Add additional non-crossing lines until we have enough
        const targetLines = Math.min(35, Math.max(5, numPoints * 1.5));
        let attempts = 0;
        
        while (lines.length < targetLines && attempts < 1000) {
            attempts++;
            
            // Choose two random points
            const i = Math.floor(this.p.random(points.length));
            const j = Math.floor(this.p.random(points.length));
            
            if (i === j) continue;
            
            // Check if this line already exists
            if (lines.some(line => 
                (line.start.id === i && line.end.id === j) || 
                (line.start.id === j && line.end.id === i)
            )) continue;
            
            // Check if this line would intersect with any existing line
            const newLine = {
                start: points[i],
                end: points[j]
            };
            
            let intersects = false;
            for (const line of lines) {
                if (this.doLinesIntersect(newLine, line)) {
                    intersects = true;
                    break;
                }
            }
            
            if (!intersects) {
                lines.push({
                    start: points[i],
                    end: points[j],
                    selected: true
                });
            }
        }
        
        return { points, lines };
    }
    
    /**
     * Generate points that form a symmetric shape with more variety
     */
    generateSymmetricShape(minPoints = 5, maxPoints = 35) {
        // Choose one of several symmetric patterns
        const patterns = ["star", "snowflake", "polygon", "spiral", "concentric"];
        const pattern = patterns[Math.floor(this.p.random(patterns.length))];
        console.log(`Symmetric shape method: ${pattern} pattern`);
        
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const points = [];
        const lines = [];
        
        // Add center point (not always used)
        const centerPoint = {
            x: centerX,
            y: centerY,
            id: 0
        };
        points.push(centerPoint);
        
        // Maximum radius (based on canvas size)
        const maxRadius = Math.min(this.canvasWidth, this.canvasHeight) * 0.4;
        
        switch (pattern) {
            case "star":
                // Create a star pattern with varying number of points
                const starPoints = this.p.floor(this.p.random(5, 12));
                const innerRadius = maxRadius * 0.4;
                const outerRadius = maxRadius;
                
                // Create star points alternating between inner and outer radius
                for (let i = 0; i < starPoints * 2; i++) {
                    const angle = (Math.PI * 2 * i) / (starPoints * 2);
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    
                    points.push({
                        x: centerX + radius * Math.cos(angle),
                        y: centerY + radius * Math.sin(angle),
                        id: points.length
                    });
                }
                
                // Connect center to all points
                for (let i = 1; i < points.length; i++) {
                    lines.push({
                        start: points[0],
                        end: points[i],
                        selected: true
                    });
                }
                
                // Connect points in sequence to form the star outline
                for (let i = 1; i < points.length; i++) {
                    lines.push({
                        start: points[i],
                        end: points[i === points.length - 1 ? 1 : i + 1],
                        selected: true
                    });
                }
                break;
                
            case "snowflake":
                // Create a snowflake with branches
                const branches = this.p.floor(this.p.random(4, 9));
                const segments = this.p.floor(this.p.random(2, 5));
                
                // Create main branches
                for (let branch = 0; branch < branches; branch++) {
                    const angle = (Math.PI * 2 * branch) / branches;
                    let prevPoint = centerPoint;
                    
                    // Create points along each branch
                    for (let seg = 1; seg <= segments; seg++) {
                        const radius = (maxRadius * seg) / segments;
                        const point = {
                            x: centerX + radius * Math.cos(angle),
                            y: centerY + radius * Math.sin(angle),
                            id: points.length
                        };
                        points.push(point);
                        
                        // Connect to previous segment
                        lines.push({
                            start: prevPoint,
                            end: point,
                            selected: true
                        });
                        
                        prevPoint = point;
                        
                        // Add perpendicular mini-branches at each segment (except the first)
                        if (seg > 1 && seg < segments) {
                            const sideAngle1 = angle + Math.PI/2;
                            const sideAngle2 = angle - Math.PI/2;
                            const sideLength = maxRadius * 0.15 * (seg / segments);
                            
                            const sidePoint1 = {
                                x: point.x + sideLength * Math.cos(sideAngle1),
                                y: point.y + sideLength * Math.sin(sideAngle1),
                                id: points.length
                            };
                            points.push(sidePoint1);
                            
                            const sidePoint2 = {
                                x: point.x + sideLength * Math.cos(sideAngle2),
                                y: point.y + sideLength * Math.sin(sideAngle2),
                                id: points.length
                            };
                            points.push(sidePoint2);
                            
                            lines.push({
                                start: point,
                                end: sidePoint1,
                                selected: true
                            });
                            
                            lines.push({
                                start: point,
                                end: sidePoint2,
                                selected: true
                            });
                        }
                    }
                }
                break;
                
            case "polygon":
                // Create a regular polygon with internal structure
                const sides = this.p.floor(this.p.random(5, 12));
                
                // Create vertices of the polygon
                for (let i = 0; i < sides; i++) {
                    const angle = (Math.PI * 2 * i) / sides;
                    points.push({
                        x: centerX + maxRadius * Math.cos(angle),
                        y: centerY + maxRadius * Math.sin(angle),
                        id: points.length
                    });
                }
                
                // Connect vertices to form polygon
                for (let i = 1; i <= sides; i++) {
                    lines.push({
                        start: points[i],
                        end: points[i === sides ? 1 : i + 1],
                        selected: true
                    });
                }
                
                // Connect all vertices to center
                for (let i = 1; i <= sides; i++) {
                    lines.push({
                        start: points[0],
                        end: points[i],
                        selected: true
                    });
                }
                
                // Add some diagonal connections for more structure
                for (let i = 1; i <= sides; i++) {
                    const target = ((i + Math.floor(sides/2)) % sides) + 1;
                    lines.push({
                        start: points[i],
                        end: points[target],
                        selected: true
                    });
                }
                break;
                
            case "spiral":
                // Create a spiral of points
                const loops = this.p.floor(this.p.random(2, 5));
                const pointsPerLoop = this.p.floor(this.p.random(8, 16));
                const totalPoints = loops * pointsPerLoop;
                
                // Remove center point as we won't use it
                points.pop();
                
                // Create spiral points
                for (let i = 1; i <= totalPoints; i++) {
                    const angle = (Math.PI * 2 * i) / pointsPerLoop * loops;
                    const radius = (maxRadius * i) / totalPoints;
                    
                    points.push({
                        x: centerX + radius * Math.cos(angle),
                        y: centerY + radius * Math.sin(angle),
                        id: i - 1
                    });
                }
                
                // Connect points in sequence
                for (let i = 0; i < points.length - 1; i++) {
                    lines.push({
                        start: points[i],
                        end: points[i + 1],
                        selected: true
                    });
                }
                
                // Add some cross connections
                const crossCount = this.p.floor(this.p.random(3, 10));
                for (let i = 0; i < crossCount; i++) {
                    const idx1 = this.p.floor(this.p.random(points.length));
                    const idx2 = this.p.floor(this.p.random(points.length));
                    
                    if (Math.abs(idx1 - idx2) > pointsPerLoop/2) {
                        lines.push({
                            start: points[idx1],
                            end: points[idx2],
                            selected: true
                        });
                    }
                }
                break;
                
            case "concentric":
                // Create concentric shapes with varying number of points
                const rings = this.p.floor(this.p.random(2, 5));
                const basePointCount = this.p.floor(this.p.random(5, 12));
                
                // Create points in concentric rings with varying point counts
                const ringPoints = [];
                
                for (let r = 1; r <= rings; r++) {
                    const ringRadius = (maxRadius * r) / rings;
                    const pointsInRing = basePointCount * r;
                    const ringPointsArray = [];
                    
                    // Slight offset for each ring to create more interesting patterns
                    const offset = r % 2 === 0 ? Math.PI / pointsInRing : 0;
                    
                    for (let i = 0; i < pointsInRing; i++) {
                        const angle = offset + (Math.PI * 2 * i) / pointsInRing;
                        const point = {
                            x: centerX + ringRadius * Math.cos(angle),
                            y: centerY + ringRadius * Math.sin(angle),
                            id: points.length
                        };
                        points.push(point);
                        ringPointsArray.push(point);
                    }
                    
                    ringPoints.push(ringPointsArray);
                }
                
                // Connect points within each ring
                for (let r = 0; r < rings; r++) {
                    const ring = ringPoints[r];
                    for (let i = 0; i < ring.length; i++) {
                        lines.push({
                            start: ring[i],
                            end: ring[(i + 1) % ring.length],
                            selected: true
                        });
                    }
                }
                
                // Connect rings - connect some points between adjacent rings
                for (let r = 0; r < rings - 1; r++) {
                    const innerRing = ringPoints[r];
                    const outerRing = ringPoints[r + 1];
                    
                    // Connect every nth point
                    const stride = Math.max(1, Math.floor(outerRing.length / innerRing.length));
                    
                    for (let i = 0; i < innerRing.length; i++) {
                        const outerIndex = (i * stride) % outerRing.length;
                        lines.push({
                            start: innerRing[i],
                            end: outerRing[outerIndex],
                            selected: true
                        });
                    }
                }
                
                // Connect center to innermost ring
                for (let i = 0; i < ringPoints[0].length; i += 2) {
                    lines.push({
                        start: points[0],
                        end: ringPoints[0][i],
                        selected: true
                    });
                }
                break;
        }
        
        // Add some random additional points if we haven't reached max
        if (points.length < maxPoints) {
            const additionalPoints = this.p.floor(this.p.random(1, Math.max(1, maxPoints - points.length)));
            for (let i = 0; i < additionalPoints; i++) {
                const newPoint = {
                    x: this.p.random(this.margin, this.canvasWidth - this.margin),
                    y: this.p.random(this.margin, this.canvasHeight - this.margin),
                    id: points.length
                };
                points.push(newPoint);
                
                // Connect to nearest point
                const nearestIndex = this.findNearestPoint(points, points.length - 1);
                if (nearestIndex >= 0) {
                    lines.push({
                        start: newPoint,
                        end: points[nearestIndex],
                        selected: true
                    });
                }
            }
        }
        
        return { points, lines };
    }
    
    /**
     * Generate Olympic-logo inspired design
     * Overlapping circles/shapes made of points and lines
     */
    generateOlympicLogo(minPoints = 5, maxPoints = 35) {
        const points = [];
        const lines = [];
        
        // Create 5 overlapping rings like the Olympic logo
        const centers = [
            { x: this.canvasWidth * 0.3, y: this.canvasHeight * 0.4 },  // Top left
            { x: this.canvasWidth * 0.5, y: this.canvasHeight * 0.4 },  // Top center
            { x: this.canvasWidth * 0.7, y: this.canvasHeight * 0.4 },  // Top right
            { x: this.canvasWidth * 0.4, y: this.canvasHeight * 0.6 },  // Bottom left
            { x: this.canvasWidth * 0.6, y: this.canvasHeight * 0.6 }   // Bottom right
        ];
        
        // Number of points per ring
        const pointsPerRing = Math.floor(maxPoints / 5);
        console.log(`Olympic logo method: ~${pointsPerRing} points per ring`);
        
        // Create rings
        for (let r = 0; r < centers.length; r++) {
            const ringPoints = [];
            const ringRadius = Math.min(this.canvasWidth, this.canvasHeight) * 0.15;
            
            // Create points in this ring
            for (let i = 0; i < pointsPerRing; i++) {
                const angle = (Math.PI * 2 * i) / pointsPerRing;
                const point = {
                    x: centers[r].x + ringRadius * Math.cos(angle),
                    y: centers[r].y + ringRadius * Math.sin(angle),
                    id: points.length
                };
                points.push(point);
                ringPoints.push(point);
            }
            
            // Connect points within the ring
            for (let i = 0; i < ringPoints.length; i++) {
                lines.push({
                    start: ringPoints[i],
                    end: ringPoints[(i + 1) % ringPoints.length],
                    selected: true
                });
            }
        }
        
        // Add some additional connections between points from different rings
        for (let i = 0; i < 8; i++) {
            const ring1 = Math.floor(this.p.random(centers.length));
            const ring2 = (ring1 + 1 + Math.floor(this.p.random(centers.length - 1))) % centers.length;
            
            const point1Index = Math.floor(this.p.random(pointsPerRing)) + ring1 * pointsPerRing;
            const point2Index = Math.floor(this.p.random(pointsPerRing)) + ring2 * pointsPerRing;
            
            lines.push({
                start: points[point1Index],
                end: points[point2Index],
                selected: true
            });
        }
        
        return { points, lines };
    }
    
    /**
     * Generate points clustered in groups with adequate spacing
     */
    generateClustered(minPoints = 5, maxPoints = 35) {
        // Create 2-4 clusters of points
        const numClusters = Math.floor(this.p.random(2, 5));
        console.log(`Clustered method: ${numClusters} clusters`);
        
        const points = [];
        const clusters = [];
        const minPointDistance = 30; // Minimum 30px between points
        
        // Create cluster centers with good separation
        for (let i = 0; i < numClusters; i++) {
            // Use a grid approach to position clusters more evenly
            const gridCols = Math.ceil(Math.sqrt(numClusters));
            const gridRows = Math.ceil(numClusters / gridCols);
            
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            
            const cellWidth = (this.canvasWidth - this.margin * 4) / gridCols;
            const cellHeight = (this.canvasHeight - this.margin * 4) / gridRows;
            
            // Position within cell with some randomness
            const centerX = this.margin * 2 + col * cellWidth + this.p.random(cellWidth * 0.2, cellWidth * 0.8);
            const centerY = this.margin * 2 + row * cellHeight + this.p.random(cellHeight * 0.2, cellHeight * 0.8);
            
            clusters.push({
                x: centerX,
                y: centerY,
                points: []
            });
        }
        
        // Distribute points among clusters
        // Fewer points per cluster to ensure we can maintain spacing
        const pointsPerCluster = Math.floor(this.p.random(
            Math.max(3, minPoints / numClusters), 
            Math.max(5, maxPoints / numClusters)
        ));
        
        for (let i = 0; i < numClusters; i++) {
            const cluster = clusters[i];
            // Set cluster radius based on number of points and minimum spacing
            const clusterRadius = Math.max(100, pointsPerCluster * minPointDistance * 0.35);
            
            let attempts = 0;
            let pointsCreated = 0;
            
            // Create points with minimum spacing
            while (pointsCreated < pointsPerCluster && attempts < 100) {
                // Create point at random angle and distance from cluster center
                const angle = this.p.random(Math.PI * 2);
                // Use square root distribution for more even filling of the cluster
                const distance = clusterRadius * Math.sqrt(this.p.random(0.1, 1.0));
                
                const x = cluster.x + Math.cos(angle) * distance;
                const y = cluster.y + Math.sin(angle) * distance;
                
                // Check if this point is too close to any existing points
                let tooClose = false;
                for (const existingPoint of points) {
                    const dist = this.p.dist(x, y, existingPoint.x, existingPoint.y);
                    if (dist < minPointDistance) {
                        tooClose = true;
                        break;
                    }
                }
                
                attempts++;
                
                // If point is not too close to others, add it
                if (!tooClose) {
                    const point = {
                        x: x,
                        y: y,
                        id: points.length,
                        clusterId: i
                    };
                    
                    points.push(point);
                    cluster.points.push(point);
                    pointsCreated++;
                }
            }
        }
        
        // Create lines within each cluster
        const lines = [];
        
        for (const cluster of clusters) {
            const clusterPoints = cluster.points;
            
            // Connect each point to its nearest neighbor in the cluster
            for (const point of clusterPoints) {
                let nearest = null;
                let minDist = Infinity;
                
                for (const other of clusterPoints) {
                    if (point.id === other.id) continue;
                    
                    const dist = this.p.dist(point.x, point.y, other.x, other.y);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = other;
                    }
                }
                
                if (nearest) {
                    // Check if this connection already exists
                    const connectionExists = lines.some(line => 
                        (line.start.id === point.id && line.end.id === nearest.id) || 
                        (line.start.id === nearest.id && line.end.id === point.id)
                    );
                    
                    if (!connectionExists) {
                        lines.push({
                            start: point,
                            end: nearest,
                            selected: true
                        });
                    }
                }
            }
        }
        
        // Add some connections between clusters
        for (let i = 0; i < numClusters; i++) {
            const nextCluster = (i + 1) % numClusters;
            
            // Connect closest points between clusters
            let minDist = Infinity;
            let pointA = null;
            let pointB = null;
            
            for (const p1 of clusters[i].points) {
                for (const p2 of clusters[nextCluster].points) {
                    const dist = this.p.dist(p1.x, p1.y, p2.x, p2.y);
                    if (dist < minDist) {
                        minDist = dist;
                        pointA = p1;
                        pointB = p2;
                    }
                }
            }
            
            if (pointA && pointB) {
                lines.push({
                    start: pointA,
                    end: pointB,
                    selected: true
                });
            }
        }
        
        return { points, lines };
    }
    
    /**
     * Generate overlapping polygons with points and lines
     * More general than Olympic logo - creates various polygons in random positions
     */
    generateOverlappingPolygons(minPoints = 5, maxPoints = 35) {
        const points = [];
        const lines = [];
        
        // Create 3-6 overlapping polygons in random positions
        const numShapes = this.p.floor(this.p.random(3, 7));
        console.log(`Overlapping polygons method: ${numShapes} shapes`);
        
        // Generate random centers across the canvas
        const centers = [];
        for (let i = 0; i < numShapes; i++) {
            centers.push({
                x: this.p.random(this.margin * 3, this.canvasWidth - this.margin * 3),
                y: this.p.random(this.margin * 3, this.canvasHeight - this.margin * 3),
                sides: this.p.floor(this.p.random(3, 8)) // Between triangles and heptagons
            });
        }
        
        // Number of points per polygon depends on sides and available point budget
        const pointsPerShape = Math.max(3, Math.floor(maxPoints / numShapes));
        
        // Create polygons
        for (let r = 0; r < centers.length; r++) {
            const shapePoints = [];
            const center = centers[r];
            const radius = this.p.random(40, 120); // Random size
            const rotation = this.p.random(Math.PI * 2); // Random rotation
            
            // Create points for this polygon
            for (let i = 0; i < center.sides; i++) {
                const angle = rotation + (Math.PI * 2 * i) / center.sides;
                const point = {
                    x: center.x + radius * Math.cos(angle),
                    y: center.y + radius * Math.sin(angle),
                    id: points.length,
                    shapeId: r
                };
                points.push(point);
                shapePoints.push(point);
            }
            
            // Connect points to form polygon
            for (let i = 0; i < shapePoints.length; i++) {
                lines.push({
                    start: shapePoints[i],
                    end: shapePoints[(i + 1) % shapePoints.length],
                    selected: true
                });
            }
            
            // Sometimes add diagonals (for polygons with more than 3 sides)
            if (center.sides > 3 && Math.random() > 0.5) {
                const numDiagonals = this.p.floor(this.p.random(1, center.sides - 1));
                
                for (let d = 0; d < numDiagonals; d++) {
                    const pt1 = this.p.floor(this.p.random(shapePoints.length));
                    let pt2;
                    do {
                        pt2 = this.p.floor(this.p.random(shapePoints.length));
                    } while (
                        pt1 === pt2 || 
                        Math.abs(pt1 - pt2) === 1 || 
                        (pt1 === 0 && pt2 === shapePoints.length - 1) ||
                        (pt2 === 0 && pt1 === shapePoints.length - 1)
                    );
                    
                    lines.push({
                        start: shapePoints[pt1],
                        end: shapePoints[pt2],
                        selected: true
                    });
                }
            }
        }
        
        // Add connections between nearby shapes
        const connectionsToAdd = Math.min(numShapes * 2, 10);
        for (let i = 0; i < connectionsToAdd; i++) {
            // Select two different shapes
            const shape1 = this.p.floor(this.p.random(numShapes));
            let shape2;
            do {
                shape2 = this.p.floor(this.p.random(numShapes));
            } while (shape1 === shape2);
            
            // Find closest points between the two shapes
            let minDist = Infinity;
            let point1 = null;
            let point2 = null;
            
            for (const p1 of points.filter(p => p.shapeId === shape1)) {
                for (const p2 of points.filter(p => p.shapeId === shape2)) {
                    const dist = this.p.dist(p1.x, p1.y, p2.x, p2.y);
                    if (dist < minDist) {
                        minDist = dist;
                        point1 = p1;
                        point2 = p2;
                    }
                }
            }
            
            if (point1 && point2) {
                lines.push({
                    start: point1,
                    end: point2,
                    selected: true
                });
            }
        }
        
        // Add a few random points outside of shapes
        const remainingPoints = maxPoints - points.length;
        if (remainingPoints > 0) {
            const extraPoints = this.p.floor(this.p.random(1, Math.min(remainingPoints, 8)));
            
            for (let i = 0; i < extraPoints; i++) {
                const newPoint = {
                    x: this.p.random(this.margin, this.canvasWidth - this.margin),
                    y: this.p.random(this.margin, this.canvasHeight - this.margin),
                    id: points.length
                };
                points.push(newPoint);
                
                // Connect to closest point
                const nearestIndex = this.findNearestPoint(points, points.length - 1);
                lines.push({
                    start: newPoint,
                    end: points[nearestIndex],
                    selected: true
                });
            }
        }
        
        return { points, lines };
    }
    
    /**
     * Generate points in a recursive pattern (fractal-like)
     */
    generateRecursivePattern(minPoints = 5, maxPoints = 35) {
        console.log(`Recursive pattern method: generating fractal-like structure`);
        const points = [];
        const lines = [];
        
        // Center of the canvas
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        
        // Choose a recursive pattern type
        const patternTypes = ["tree", "sierpinski", "koch", "recursive-squares"];
        const patternType = patternTypes[Math.floor(this.p.random(patternTypes.length))];
        console.log(`Recursive pattern type: ${patternType}`);
        
        switch (patternType) {
            case "tree":
                // Create a recursive tree (binary tree)
                const rootPoint = {
                    x: centerX,
                    y: this.canvasHeight - this.margin * 2,
                    id: 0
                };
                points.push(rootPoint);
                
                // Parameters
                const treeDepth = this.p.floor(this.p.random(3, 6)); // Recursive depth
                const initialLength = Math.min(this.canvasWidth, this.canvasHeight) * 0.25;
                const initialAngle = -Math.PI / 2; // Upward direction
                
                // Generate the recursive tree pattern
                this.generateTreeBranch(
                    rootPoint, initialAngle, initialLength, 
                    treeDepth, points, lines
                );
                break;
                
            case "sierpinski":
                // Create a Sierpinski triangle pattern
                const size = Math.min(this.canvasWidth, this.canvasHeight) * 0.8;
                const depth = this.p.floor(this.p.random(2, 4)); // Recursive depth
                
                // Create the initial triangle
                const topPoint = {
                    x: centerX,
                    y: this.margin,
                    id: 0
                };
                const leftPoint = {
                    x: centerX - size / 2,
                    y: this.margin + size * 0.866, // sin(60°) = 0.866
                    id: 1
                };
                const rightPoint = {
                    x: centerX + size / 2,
                    y: this.margin + size * 0.866,
                    id: 2
                };
                
                points.push(topPoint, leftPoint, rightPoint);
                
                // Connect the initial triangle
                lines.push(
                    { start: topPoint, end: leftPoint, selected: true },
                    { start: leftPoint, end: rightPoint, selected: true },
                    { start: rightPoint, end: topPoint, selected: true }
                );
                
                // Generate the Sierpinski pattern
                this.generateSierpinski(
                    topPoint, leftPoint, rightPoint, 
                    depth, points, lines
                );
                break;
                
            case "koch":
                // Create a Koch snowflake-inspired pattern
                const kochSize = Math.min(this.canvasWidth, this.canvasHeight) * 0.6;
                const kochDepth = this.p.floor(this.p.random(1, 3)); // Keep depth small to avoid too many points
                
                // Create the initial triangle
                const kochTop = {
                    x: centerX,
                    y: centerY - kochSize * 0.5,
                    id: 0
                };
                const kochLeft = {
                    x: centerX - kochSize * 0.433, // cos(30°) = 0.866/2 = 0.433
                    y: centerY + kochSize * 0.25,  // sin(30°) = 0.5/2 = 0.25
                    id: 1
                };
                const kochRight = {
                    x: centerX + kochSize * 0.433,
                    y: centerY + kochSize * 0.25,
                    id: 2
                };
                
                points.push(kochTop, kochLeft, kochRight);
                
                // Generate the Koch snowflake pattern
                this.generateKochLine(kochTop, kochRight, kochDepth, points, lines);
                this.generateKochLine(kochRight, kochLeft, kochDepth, points, lines);
                this.generateKochLine(kochLeft, kochTop, kochDepth, points, lines);
                break;
                
            case "recursive-squares":
                // Create nested squares with connections
                const maxSquareSize = Math.min(this.canvasWidth, this.canvasHeight) * 0.7;
                const squareDepth = this.p.floor(this.p.random(2, 4)); // Recursive depth
                
                // Generate the recursive squares
                this.generateSquare(
                    centerX, centerY, maxSquareSize, 
                    squareDepth, points, lines
                );
                break;
        }
        
        // If we have too many points, reduce to maxPoints
        if (points.length > maxPoints) {
            // Select a subset of points
            const selectedPoints = [];
            const selectedIndices = new Set();
            
            // Keep the most important points (early ones from the recursive structures)
            const numImportantPoints = Math.floor(maxPoints * 0.7);
            for (let i = 0; i < Math.min(numImportantPoints, points.length); i++) {
                selectedPoints.push(points[i]);
                selectedIndices.add(i);
            }
            
            // Fill the rest with random selections from the remaining points
            const remainingPoints = maxPoints - selectedPoints.length;
            if (remainingPoints > 0) {
                const candidates = [];
                for (let i = numImportantPoints; i < points.length; i++) {
                    candidates.push(i);
                }
                
                // Shuffle and select
                this.shuffleArray(candidates);
                for (let i = 0; i < Math.min(remainingPoints, candidates.length); i++) {
                    selectedPoints.push(points[candidates[i]]);
                    selectedIndices.add(candidates[i]);
                }
            }
            
            // Update IDs to be sequential
            const idMap = new Map();
            selectedPoints.forEach((point, index) => {
                idMap.set(point.id, index);
                point.id = index;
            });
            
            // Filter lines to only include selected points
            const selectedLines = lines.filter(line => 
                selectedIndices.has(line.start.id) && selectedIndices.has(line.end.id)
            );
            
            // Update line IDs
            selectedLines.forEach(line => {
                line.start = selectedPoints[idMap.get(line.start.id)];
                line.end = selectedPoints[idMap.get(line.end.id)];
            });
            
            return { points: selectedPoints, lines: selectedLines };
        }
        
        // If we have too few points, add some random ones
        if (points.length < minPoints) {
            const additionalPoints = minPoints - points.length;
            for (let i = 0; i < additionalPoints; i++) {
                const newPoint = {
                    x: this.p.random(this.margin, this.canvasWidth - this.margin),
                    y: this.p.random(this.margin, this.canvasHeight - this.margin),
                    id: points.length
                };
                points.push(newPoint);
                
                // Connect to nearest point
                const nearestIndex = this.findNearestPoint(points, points.length - 1);
                lines.push({
                    start: newPoint,
                    end: points[nearestIndex],
                    selected: true
                });
            }
        }
        
        return { points, lines };
    }

    // Helper methods for recursive pattern generation

    // Generate a recursive tree branch
    generateTreeBranch(startPoint, angle, length, depth, points, lines) {
        if (depth <= 0 || length < 5) return;
        
        // Create the endpoint of this branch
        const endPoint = {
            x: startPoint.x + Math.cos(angle) * length,
            y: startPoint.y + Math.sin(angle) * length,
            id: points.length
        };
        points.push(endPoint);
        
        // Connect the points
        lines.push({
            start: startPoint,
            end: endPoint,
            selected: true
        });
        
        // Create left and right branches (with randomness)
        const leftAngle = angle - this.p.random(Math.PI/6, Math.PI/4);
        const rightAngle = angle + this.p.random(Math.PI/6, Math.PI/4);
        
        // Reduce length for branches
        const newLength = length * this.p.random(0.65, 0.75);
        
        // Recursive calls for branches
        this.generateTreeBranch(endPoint, leftAngle, newLength, depth - 1, points, lines);
        this.generateTreeBranch(endPoint, rightAngle, newLength, depth - 1, points, lines);
    }

    // Generate a Sierpinski triangle pattern
    generateSierpinski(top, left, right, depth, points, lines) {
        if (depth <= 0) return;
        
        // Calculate midpoints
        const midTop = {
            x: (top.x + right.x) / 2,
            y: (top.y + right.y) / 2,
            id: points.length
        };
        const midLeft = {
            x: (top.x + left.x) / 2,
            y: (top.y + left.y) / 2,
            id: points.length + 1
        };
        const midRight = {
            x: (left.x + right.x) / 2,
            y: (left.y + right.y) / 2,
            id: points.length + 2
        };
        
        // Add new points
        points.push(midTop, midLeft, midRight);
        
        // Connect the center triangle
        lines.push(
            { start: midTop, end: midLeft, selected: true },
            { start: midLeft, end: midRight, selected: true },
            { start: midRight, end: midTop, selected: true }
        );
        
        // Recursive calls for the three smaller triangles
        this.generateSierpinski(top, midLeft, midTop, depth - 1, points, lines);
        this.generateSierpinski(midLeft, left, midRight, depth - 1, points, lines);
        this.generateSierpinski(midTop, midRight, right, depth - 1, points, lines);
    }

    // Generate a Koch snowflake line
    generateKochLine(start, end, depth, points, lines) {
        if (depth <= 0) {
            // Base case: just connect the points
            lines.push({ start: start, end: end, selected: true });
            return;
        }
        
        // Calculate the 4 points that make up the Koch line
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        
        const p1 = {
            x: start.x + dx / 3,
            y: start.y + dy / 3,
            id: points.length
        };
        
        // Calculate the equilateral triangle point
        const angle = Math.atan2(dy, dx) - Math.PI / 3;
        const dist = Math.sqrt(dx * dx + dy * dy) / 3;
        const p2 = {
            x: p1.x + dist * Math.cos(angle),
            y: p1.y + dist * Math.sin(angle),
            id: points.length + 1
        };
        
        const p3 = {
            x: start.x + 2 * dx / 3,
            y: start.y + 2 * dy / 3,
            id: points.length + 2
        };
        
        // Add new points
        points.push(p1, p2, p3);
        
        // Recursive calls for each of the 4 segments
        this.generateKochLine(start, p1, depth - 1, points, lines);
        this.generateKochLine(p1, p2, depth - 1, points, lines);
        this.generateKochLine(p2, p3, depth - 1, points, lines);
        this.generateKochLine(p3, end, depth - 1, points, lines);
    }

    // Generate a recursive square pattern
    generateSquare(centerX, centerY, size, depth, points, lines) {
        if (depth <= 0 || size < 10) return;
        
        // Calculate corner points
        const halfSize = size / 2;
        const topLeft = {
            x: centerX - halfSize,
            y: centerY - halfSize,
            id: points.length
        };
        const topRight = {
            x: centerX + halfSize,
            y: centerY - halfSize,
            id: points.length + 1
        };
        const bottomRight = {
            x: centerX + halfSize,
            y: centerY + halfSize,
            id: points.length + 2
        };
        const bottomLeft = {
            x: centerX - halfSize,
            y: centerY + halfSize,
            id: points.length + 3
        };
        
        // Add points
        points.push(topLeft, topRight, bottomRight, bottomLeft);
        
        // Connect square
        lines.push(
            { start: topLeft, end: topRight, selected: true },
            { start: topRight, end: bottomRight, selected: true },
            { start: bottomRight, end: bottomLeft, selected: true },
            { start: bottomLeft, end: topLeft, selected: true }
        );
        
        // Add diagonal connections
        if (this.p.random() > 0.5) {
            lines.push({ start: topLeft, end: bottomRight, selected: true });
        } else {
            lines.push({ start: topRight, end: bottomLeft, selected: true });
        }
        
        // Recursive calls for nested squares
        const newSize = size * 0.5;
        
        // Add some randomness to the recursion
        const numRecursions = this.p.floor(this.p.random(1, 5));
        const positions = [
            [centerX - newSize / 2, centerY - newSize / 2], // top-left
            [centerX + newSize / 2, centerY - newSize / 2], // top-right
            [centerX + newSize / 2, centerY + newSize / 2], // bottom-right
            [centerX - newSize / 2, centerY + newSize / 2]  // bottom-left
        ];
        
        // Shuffle to get random recursion order
        this.shuffleArray(positions);
        
        // Recurse on selected positions
        for (let i = 0; i < Math.min(numRecursions, positions.length); i++) {
            this.generateSquare(positions[i][0], positions[i][1], newSize, depth - 1, points, lines);
        }
    }

    // Fisher-Yates shuffle algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(this.p.random(i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Helper methods
    
    /**
     * Create an array of random points
     */
    createRandomPoints(numPoints) {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: this.p.random(this.margin, this.canvasWidth - this.margin),
                y: this.p.random(this.margin, this.canvasHeight - this.margin),
                id: i
            });
        }
        return points;
    }
    
    /**
     * Check if two line segments intersect
     */
    doLinesIntersect(line1, line2) {
        // Don't count intersection if the lines share an endpoint
        if (line1.start.id === line2.start.id || 
            line1.start.id === line2.end.id || 
            line1.end.id === line2.start.id || 
            line1.end.id === line2.end.id) {
            return false;
        }
        
        const x1 = line1.start.x, y1 = line1.start.y;
        const x2 = line1.end.x, y2 = line1.end.y;
        const x3 = line2.start.x, y3 = line2.start.y;
        const x4 = line2.end.x, y4 = line2.end.y;
        
        // Calculate denominators
        const den = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (den === 0) {
            return false; // Lines are parallel
        }
        
        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / den;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / den;
        
        // Check if intersection is within both line segments
        return ua > 0 && ua < 1 && ub > 0 && ub < 1;
    }
    
    /**
     * Find index of nearest point to the given point
     */
    findNearestPoint(points, pointIndex) {
        let nearestIndex = -1;
        let minDist = Infinity;
        
        for (let i = 0; i < points.length; i++) {
            if (i === pointIndex) continue;
            
            const dist = this.p.dist(
                points[pointIndex].x, points[pointIndex].y,
                points[i].x, points[i].y
            );
            
            if (dist < minDist) {
                minDist = dist;
                nearestIndex = i;
            }
        }
        
        return nearestIndex;
    }
    
    /**
     * Find index of second nearest point to the given point
     */
    findSecondNearestPoint(points, pointIndex, excludeIndex) {
        let nearestIndex = -1;
        let minDist = Infinity;
        
        for (let i = 0; i < points.length; i++) {
            if (i === pointIndex || i === excludeIndex) continue;
            
            const dist = this.p.dist(
                points[pointIndex].x, points[pointIndex].y,
                points[i].x, points[i].y
            );
            
            if (dist < minDist) {
                minDist = dist;
                nearestIndex = i;
            }
        }
        
        return nearestIndex;
    }

    /**
     * Generate a spider web-like structure
     * Points are connected to nearby points creating a network pattern
     */
    generateSpiderWeb(minPoints = 5, maxPoints = 35) {
        console.log("Spider web method: generating web-like structure");
        
        const points = [];
        const lines = [];
        const minDistance = 30; // Minimum distance between points
        
        // Center of the web
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        
        // Add center point
        const centerPoint = {
            x: centerX,
            y: centerY,
            id: 0
        };
        points.push(centerPoint);
        
        // Decide on the web structure - concentric rings with radial connections
        const numRings = this.p.floor(this.p.random(2, 5));
        const numRadials = this.p.floor(this.p.random(6, 12)); // Number of "spokes"
        
        // Maximum radius based on canvas size
        const maxRadius = Math.min(this.canvasWidth, this.canvasHeight) * 0.45 - this.margin;
        
        // Generate points on concentric rings
        const ringPoints = []; // Store points by ring for easier connection
        
        // Create points along radial lines and concentric rings
        for (let ring = 1; ring <= numRings; ring++) {
            const currentRing = [];
            const radius = (maxRadius * ring) / numRings;
            
            for (let i = 0; i < numRadials; i++) {
                const angle = (Math.PI * 2 * i) / numRadials;
                
                // Add a bit of randomness to the exact position except for the outermost ring
                const radiusJitter = ring < numRings ? this.p.random(0.85, 1.15) : 1;
                const angleJitter = ring < numRings ? this.p.random(-0.1, 0.1) : 0;
                
                const x = centerX + radius * radiusJitter * Math.cos(angle + angleJitter);
                const y = centerY + radius * radiusJitter * Math.sin(angle + angleJitter);
                
                const point = {
                    x: x,
                    y: y,
                    id: points.length,
                    ring: ring,
                    radial: i
                };
                
                points.push(point);
                currentRing.push(point);
            }
            
            ringPoints.push(currentRing);
        }
        
        // Add a few random points in between the structured web pattern
        const remainingPointsBudget = maxPoints - points.length;
        if (remainingPointsBudget > 0) {
            const randomPoints = Math.min(remainingPointsBudget, this.p.floor(this.p.random(3, 8)));
            
            for (let i = 0; i < randomPoints; i++) {
                // Try to place a point with minimum distance constraint
                let attempts = 0;
                let valid = false;
                let x, y;
                
                while (!valid && attempts < 30) {
                    attempts++;
                    // Random position within the web area
                    const angle = this.p.random(Math.PI * 2);
                    const radius = this.p.random(0.2, 0.9) * maxRadius; // Avoid the exact center and edge
                    
                    x = centerX + radius * Math.cos(angle);
                    y = centerY + radius * Math.sin(angle);
                    
                    // Check minimum distance
                    valid = true;
                    for (const existingPoint of points) {
                        const dist = this.p.dist(x, y, existingPoint.x, existingPoint.y);
                        if (dist < minDistance) {
                            valid = false;
                            break;
                        }
                    }
                }
                
                // If we found a valid position, add the point
                if (valid) {
                    points.push({
                        x: x,
                        y: y,
                        id: points.length,
                        random: true
                    });
                }
            }
        }
        
        // Now create the web connections
        
        // 1. Connect center to first ring
        for (const point of ringPoints[0]) {
            lines.push({
                start: centerPoint,
                end: point,
                selected: true
            });
        }
        
        // 2. Connect points along each concentric ring
        for (let r = 0; r < ringPoints.length; r++) {
            const ring = ringPoints[r];
            for (let i = 0; i < ring.length; i++) {
                lines.push({
                    start: ring[i],
                    end: ring[(i + 1) % ring.length], // Connect to next point, wrapping around
                    selected: true
                });
            }
        }
        
        // 3. Connect points along radial lines (between adjacent rings)
        for (let r = 0; r < ringPoints.length - 1; r++) {
            const innerRing = ringPoints[r];
            const outerRing = ringPoints[r + 1];
            
            for (let i = 0; i < innerRing.length; i++) {
                // Connect to corresponding point on outer ring
                // For stability, we ensure each inner ring point has fewer radials than the outer
                const outerIndex = i % outerRing.length;
                
                lines.push({
                    start: innerRing[i],
                    end: outerRing[outerIndex],
                    selected: true
                });
            }
        }
        
        // 4. Connect random points to their nearest neighbors
        for (let i = numRings * numRadials + 1; i < points.length; i++) {
            const randomPoint = points[i];
            
            // Find the nearest points and connect
            const neighbours = [];
            
            // Sort all points by distance to this random point
            const sortedByDistance = [...points]
                .filter(p => p.id !== randomPoint.id)
                .sort((a, b) => {
                    const distA = this.p.dist(randomPoint.x, randomPoint.y, a.x, a.y);
                    const distB = this.p.dist(randomPoint.x, randomPoint.y, b.x, b.y);
                    return distA - distB;
                });
            
            // Connect to 2-3 nearest points
            const connectionsToMake = this.p.floor(this.p.random(2, 4));
            for (let j = 0; j < Math.min(connectionsToMake, sortedByDistance.length); j++) {
                lines.push({
                    start: randomPoint,
                    end: sortedByDistance[j],
                    selected: true
                });
            }
        }
        
        // 5. Add some cross-connections for a more interesting web
        const extraConnections = this.p.floor(this.p.random(numRings, numRings * 2));
        let attempts = 0;
        let connections = 0;
        
        while (connections < extraConnections && attempts < 100) {
            attempts++;
            
            // Select two random points, but prioritize points on the same ring or adjacent rings
            let randomRing = this.p.floor(this.p.random(ringPoints.length));
            let otherRing;
            
            if (this.p.random() < 0.7) {
                // 70% chance to connect within same ring or adjacent ring
                otherRing = Math.min(
                    ringPoints.length - 1, 
                    Math.max(0, randomRing + this.p.floor(this.p.random(3)) - 1)
                );
            } else {
                // 30% chance to connect to any ring
                otherRing = this.p.floor(this.p.random(ringPoints.length));
            }
            
            if (ringPoints[randomRing].length === 0 || ringPoints[otherRing].length === 0) {
                continue;
            }
            
            const point1 = ringPoints[randomRing][this.p.floor(this.p.random(ringPoints[randomRing].length))];
            const point2 = ringPoints[otherRing][this.p.floor(this.p.random(ringPoints[otherRing].length))];
            
            // Skip if it's the same point or if they're already connected
            if (point1.id === point2.id) continue;
            if (lines.some(line => 
                (line.start.id === point1.id && line.end.id === point2.id) ||
                (line.start.id === point2.id && line.end.id === point1.id)
            )) continue;
            
            // Only add if they're reasonably close but not too close
            const dist = this.p.dist(point1.x, point1.y, point2.x, point2.y);
            const maxConnectDist = maxRadius * 0.6;  // Don't connect points that are too far apart
            
            if (dist > minDistance && dist < maxConnectDist) {
                lines.push({
                    start: point1,
                    end: point2,
                    selected: true
                });
                connections++;
            }
        }
        
        // Add some aesthetically pleasing curvature to the web
        // We don't actually modify the positions here, but in a real implementation
        // you could add some subtle curves to the line rendering
        
        return { points, lines };
    }
}

export default RandomPointGenerator;