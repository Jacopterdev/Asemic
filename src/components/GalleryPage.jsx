import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import LZString from 'lz-string';
import p5 from 'p5';
// Import ShapeGeneratorV2 to render actual shapes
import ShapeGeneratorV2 from '../sketches/ShapeGenerator/ShapeGeneratorV2';
// Import Effects class
import Effects from '../sketches/Effects';

const GalleryPage = () => {
  const [shapes, setShapes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const thumbnailRefs = React.useRef({});

  // Make Effects available globally for p5 instances
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.Effects = Effects;
    }
    
    // Clean up when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        delete window.Effects;
      }
    };
  }, []);

  // Load predefined shape configurations
  useEffect(() => {
    const loadGalleryShapes = async () => {
      try {
        // These would come from your API or local storage in a real app
        const galleryShapes = getPredefinedShapes();
        setShapes(galleryShapes);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading gallery shapes:', error);
        setIsLoading(false);
      }
    };

    loadGalleryShapes();
  }, []);

  // Generate thumbnails for each shape using p5.js and ShapeGeneratorV2
  useEffect(() => {
    if (!isLoading) {
      shapes.forEach(shape => {
        if (thumbnailRefs.current[shape.id]) {
          const container = thumbnailRefs.current[shape.id];
          
          // Clear any previous sketch
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
          
          // Create a new p5 instance for this thumbnail
          new p5(sketch => {
            const thumbnailSize = 200;
            
            sketch.setup = () => {
              sketch.createCanvas(thumbnailSize, thumbnailSize);
              // Make sure we have all needed p5 methods
              sketch.createVector = (x, y, z) => new p5.Vector(x, y, z);
              sketch.noLoop(); // We only need to draw once
            };
            
            sketch.draw = () => {
              sketch.background(240);
              
              try {
                // Only proceed if we have points
                if (!shape.data.points || shape.data.points.length < 3) {
                  // Draw a placeholder for shapes with insufficient points
                  //drawPlaceholder(sketch, shape);
                  return;
                }
                
                // Draw the thumbnail with proper effects
                drawShapeThumbnail(sketch, shape);
                
                // Draw a border
                sketch.stroke(200);
                sketch.strokeWeight(1);
                sketch.noFill();
                sketch.rect(2, 2, thumbnailSize-4, thumbnailSize-4);
              } catch (error) {
                console.error("Error rendering thumbnail:", error);
                //drawPlaceholder(sketch, shape);
              }
            };
            
            // Helper function to draw simplified shape 
            function drawSimplifiedShape(s, shapeData) {
              const data = shapeData.data;
              const points = data.points;
              const isCurved = data.lineType === 'curved';
              
              // Get color from subshape if available
              let strokeColor, fillColor;
              
              if (data.subShapes && data.subShapes['1']) {
                const subShape = data.subShapes['1'];
                if (subShape.strokeColor) {
                  const sc = subShape.strokeColor;
                  strokeColor = s.color(sc.r, sc.g, sc.b, sc.a * 255);
                }
                if (subShape.fillColor && subShape.shapeFill) {
                  const fc = subShape.fillColor;
                  fillColor = s.color(fc.r, fc.g, fc.b, fc.a * 255);
                }
              }
              
              // Use default colors if not specified
              if (!strokeColor) strokeColor = s.color(0, 0, 0);
              if (!fillColor) fillColor = s.color(200, 200, 200, 100);
              
              // Draw the shape
              s.push();
              s.strokeWeight(data.lineWidth?.min || 5);
              s.stroke(strokeColor);
              s.fill(fillColor);
              
              if (isCurved) {
                s.beginShape();
                for (let i = 0; i < points.length; i++) {
                  const point = points[i];
                  const nextPoint = points[(i + 1) % points.length];
                  
                  // Calculate midpoint for curves
                  const midX = (point.x + nextPoint.x) / 2;
                  const midY = (point.y + nextPoint.y) / 2;
                  
                  if (i === 0) {
                    s.vertex(point.x, point.y);
                  } else {
                    s.quadraticVertex(point.x, point.y, midX, midY);
                  }
                }
                s.endShape(s.CLOSE);
              } else {
                s.beginShape();
                points.forEach(point => {
                  s.vertex(point.x, point.y);
                });
                s.endShape(s.CLOSE);
              }
              s.pop();
            }
            
            // Helper function to draw placeholder when shape can't be rendered
          
            
          }, container);
        }
      });
    }
  }, [shapes, isLoading]);

  const handleShapeClick = (shape) => {
    try {
      // Compress the shape data
      const jsonString = JSON.stringify(shape.data);
      const compressedData = LZString.compressToEncodedURIComponent(jsonString);
      
      // Navigate back to the main app with the shape data in the URL
      navigate(`/?shape=${compressedData}`);
    } catch (error) {
      console.error('Error loading shape:', error);
    }
  };

  // Define preset shapes for the gallery
  const getPredefinedShapes = () => {
    return [
      {
        id: 1,
        name: "Organic Circle",
        description: "A smooth circular shape with organic variations",
        data: {
          missArea: 8,
          numberOfLines: {min: 8, max: 12},
          smoothAmount: 15,
          lineWidth: {min: 6, max: 10},
          lineType: 'curved',
          lineComposition: 'Branched',
          points: Array(12).fill().map((_, i) => ({
            id: i,
            x: 400 + Math.cos(i/12 * Math.PI * 2) * 150,
            y: 300 + Math.sin(i/12 * Math.PI * 2) * 150,
            fixed: false
          })),
          lines: Array(12).fill().map((_, i) => ({
            start: { id: i },
            end: { id: (i+1) % 12 },
            selected: true
          })),
          // Add subshape parameters for full rendering
          subShapes: {
            1: { // First tab
              shapeFill: true,
              strokeColor: { r: 50, g: 100, b: 200, a: 0.8 },
              fillColor: { r: 220, g: 240, b: 255, a: 0.4 },
              fillOverlap: true
            }
          }
        }
      },
      {
        id: 2,
        name: "Geometric Star",
        description: "A star-like pattern with sharp geometric styling",
        data: {
          missArea: 5,
          numberOfLines: {min: 5, max: 8},
          smoothAmount: 5,
          lineWidth: {min: 4, max: 12},
          lineType: 'straight',
          lineComposition: 'Segmented',
          points: Array(10).fill().map((_, i) => {
            const radius = i % 2 === 0 ? 150 : 75;
            return {
              id: i,
              x: 400 + Math.cos(i/10 * Math.PI * 2) * radius,
              y: 300 + Math.sin(i/10 * Math.PI * 2) * radius,
              fixed: false
            };
          }),
          lines: Array(10).fill().map((_, i) => ({
            start: { id: i },
            end: { id: (i+1) % 10 },
            selected: true
          })),
          // Add subshape parameters for full rendering
          subShapes: {
            1: { // First tab
              shapeFill: true,
              strokeColor: { r: 180, g: 50, b: 50, a: 0.9 },
              fillColor: { r: 255, g: 220, b: 220, a: 0.6 },
              fillOverlap: false
            }
          }
        }
      },
      {
        id: 3,
        name: "Wavy Square",
        description: "A square with wavy, flowing lines",
        data: {
          missArea: 12,
          numberOfLines: {min: 4, max: 8},
          smoothAmount: 20,
          lineWidth: {min: 8, max: 14},
          lineType: 'curved',
          lineComposition: 'Random',
          points: [
            {id: 0, x: 250, y: 200, fixed: false},
            {id: 1, x: 550, y: 200, fixed: false},
            {id: 2, x: 550, y: 400, fixed: false},
            {id: 3, x: 250, y: 400, fixed: false}
          ],
          lines: [
            {start: {id: 0}, end: {id: 1}, selected: true},
            {start: {id: 1}, end: {id: 2}, selected: true},
            {start: {id: 2}, end: {id: 3}, selected: true},
            {start: {id: 3}, end: {id: 0}, selected: true}
          ],
          // Add subshape parameters for full rendering
          subShapes: {
            1: { // First tab
              shapeFill: true,
              strokeColor: { r: 70, g: 130, b: 70, a: 1.0 },
              fillColor: { r: 220, g: 255, b: 220, a: 0.5 },
              fillOverlap: true
            }
          }
        }
      },
      {
        id: 4,
        name: "Bold Triangle",
        description: "A triangular shape with bold lines",
        data: {
          missArea: 15,
          numberOfLines: {min: 3, max: 6},
          smoothAmount: 8,
          lineWidth: {min: 15, max: 25},
          lineType: 'straight',
          lineComposition: 'Branched',
          points: [
            {id: 0, x: 400, y: 150, fixed: false},
            {id: 1, x: 250, y: 450, fixed: false},
            {id: 2, x: 550, y: 450, fixed: false}
          ],
          lines: [
            {start: {id: 0}, end: {id: 1}, selected: true},
            {start: {id: 1}, end: {id: 2}, selected: true},
            {start: {id: 2}, end: {id: 0}, selected: true}
          ],
          // Add subshape parameters for full rendering
          subShapes: {
            1: { // First tab
              shapeFill: true,
              strokeColor: { r: 50, g: 50, b: 120, a: 0.9 },
              fillColor: { r: 220, g: 220, b: 255, a: 0.3 },
              fillOverlap: false
            }
          }
        }
      },
      {
        id: 5,
        name: "Flowing Abstract",
        description: "An irregular organic shape with fluid curves",
        data: {
          missArea: 20,
          numberOfLines: {min: 6, max: 12},
          smoothAmount: 25,
          lineWidth: {min: 5, max: 15},
          lineType: 'curved',
          lineComposition: 'Random',
          points: [
            {id: 0, x: 300, y: 200, fixed: false},
            {id: 1, x: 500, y: 180, fixed: false},
            {id: 2, x: 550, y: 300, fixed: false},
            {id: 3, x: 480, y: 420, fixed: false},
            {id: 4, x: 320, y: 450, fixed: false},
            {id: 5, x: 250, y: 320, fixed: false}
          ],
          lines: [
            {start: {id: 0}, end: {id: 1}, selected: true},
            {start: {id: 1}, end: {id: 2}, selected: true},
            {start: {id: 2}, end: {id: 3}, selected: true},
            {start: {id: 3}, end: {id: 4}, selected: true},
            {start: {id: 4}, end: {id: 5}, selected: true},
            {start: {id: 5}, end: {id: 0}, selected: true}
          ],
          // Add subshape parameters for full rendering
          subShapes: {
            1: { // First tab
              shapeFill: true,
              strokeColor: { r: 255, g: 140, b: 0, a: 0.8 },
              fillColor: { r: 255, g: 245, b: 215, a: 0.5 },
              fillOverlap: true
            },
            2: { // Second tab with a different style
              shapeFill: true,
              strokeColor: { r: 150, g: 80, b: 0, a: 0.6 },
              fillColor: { r: 245, g: 225, b: 195, a: 0.3 },
              fillOverlap: true
            }
          }
        }
      },
      {
        id: 6,
        name: "Crystalline Hexagon",
        description: "A structured hexagonal shape with crystalline patterns",
        data: {
          missArea: 7,
          numberOfLines: {min: 6, max: 12},
          smoothAmount: 12,
          lineWidth: {min: 7, max: 18},
          lineType: 'straight',
          lineComposition: 'Segmented',
          points: Array(6).fill().map((_, i) => ({
            id: i,
            x: 400 + Math.cos(i/6 * Math.PI * 2) * 150,
            y: 300 + Math.sin(i/6 * Math.PI * 2) * 150,
            fixed: true
          })),
          lines: Array(6).fill().map((_, i) => ({
            start: { id: i },
            end: { id: (i+1) % 6 },
            selected: true
          })),
          // Add subshape parameters for full rendering
          subShapes: {
            1: { // First tab
              shapeFill: true,
              strokeColor: { r: 100, g: 200, b: 255, a: 0.9 },
              fillColor: { r: 220, g: 240, b: 255, a: 0.3 },
              fillOverlap: false
            }
          }
        }
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header>
        <Header />
      </header>

      <main className="container mx-auto p-6">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Shape Gallery</h1>
          
          <div className="flex mb-6">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Back to Editor
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shapes.map(shape => (
                <div 
                  key={shape.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => handleShapeClick(shape)}
                >
                  <div className="p-2 bg-gray-100">
                    <div 
                      ref={el => thumbnailRefs.current[shape.id] = el}
                      className="h-48 w-full"
                    ></div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800">{shape.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {shape.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {shape.data.lineType} lines, {shape.data.lineComposition} composition
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Updated drawShapeThumbnail function with better scaling and positioning

function drawPlaceholder(s, shapeData) {
  const thumbnailSize = 200;
  const center = thumbnailSize / 2;
  const size = thumbnailSize * 0.6;
  
  s.push();
  s.strokeWeight(2);
  s.stroke(120);
  s.fill(220);
  
  if (shapeData.data.lineType === 'curved') {
    s.ellipse(center, center, size, size);
  } else {
    s.rect(center - size/2, center - size/2, size, size);
  }
  
  s.fill(100);
  s.noStroke();
  s.textAlign(s.CENTER, s.CENTER);
  s.textSize(12);
  s.text(shapeData.name, center, center);
  s.pop();
}

function drawShapeThumbnail(s, shapeData) {
  const thumbnailSize = 200;
  
  // Create a buffer for the shape rendering
  const buffer = s.createGraphics(thumbnailSize, thumbnailSize);
  buffer.background(255);
  
  try {
    const data = shapeData.data;
    
    if (!data || !data.points || data.points.length < 3) {
      drawPlaceholder(s, shapeData);
      return;
    }
    
    // Find bounds of original points to calculate scaling
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    data.points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    
    const width = maxX - minX || 200;
    const height = maxY - minY || 200;
    
    // Calculate scale to fit the canvas with more padding for safety
    const padding = 40; // Increased padding
    const drawableArea = thumbnailSize - (padding * 2);
    const scale = Math.min(drawableArea / width, drawableArea / height) * 0.9; // Add 10% safety margin
    
    // Ensure buffer has createVector method
    if (!buffer.createVector) {
      buffer.createVector = function(x, y, z) {
        return s.createVector(x, y, z);
      };
    }
    
    // Use a more centered approach for translation
    const centerX = thumbnailSize / 2;
    const centerY = thumbnailSize / 2;
    const shapeCenter = {
      x: minX + width / 2,
      y: minY + height / 2
    };
    
    // Center and scale the shape in the buffer
    buffer.push();
    buffer.translate(
      centerX - shapeCenter.x * scale,
      centerY - shapeCenter.y * scale
    );
    buffer.scale(scale);
    
    // Create a modified copy of data with smaller line widths for thumbnails
    const thumbnailData = {...data};
    if (thumbnailData.lineWidth) {
      // Reduce line width for better thumbnail appearance
      thumbnailData.lineWidth = {
        min: Math.min(5, thumbnailData.lineWidth.min),
        max: Math.min(8, thumbnailData.lineWidth.max)
      };
    }
    
    // Create a new ShapeGeneratorV2 instance
    const shapeGen = new ShapeGeneratorV2(buffer, thumbnailData);
    
    // Set noise position for consistent thumbnails
    shapeGen.setNoisePosition(0.5, 0.5);
    
    // Generate and draw the shape
    shapeGen.generate();
    shapeGen.draw();
    
    buffer.pop();
    
    // Draw the buffer to the main canvas
    s.image(buffer, 0, 0);
  } catch (error) {
    console.error("Error rendering thumbnail:", error);
    console.error(error.stack);
    drawPlaceholder(s, shapeData);
  } finally {
    if (buffer) {
      buffer.remove();
    }
  }
}

export default GalleryPage;