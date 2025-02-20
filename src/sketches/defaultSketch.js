import ConstructionGrid from "../sketches/ConstructionGrid";

const defaultSketch = (p, mergedParamsRef) => {
    let x = 3;
    //console.log("Params:", mergedParamsRef.current);
    let cGrid;
    let points = [];
    p.setup = () => {
        // Create the canvas (adjust dimensions as needed)
        p.createCanvas(900, 800);
        p.angleMode(p.DEGREES);
        cGrid = new ConstructionGrid(p, 3, 3);

    };

    p.mousePressed = () => {
        if(cGrid){
            // Get the snap position from the grid
            const snapPosition = cGrid.getSnapPosition(p.mouseX, p.mouseY);

            if (snapPosition) {
                // If snapping occurs, place an ellipse at the snap position
                points.push({ x: snapPosition.x, y: snapPosition.y });
            } else {
                // If no snapping, place an ellipse at the mouse position
                points.push({ x: p.mouseX, y: p.mouseY });
            }
        }

    };

    p.draw = () => {
        const mergedParams = mergedParamsRef.current;
        const angle = mergedParams[1].angle;
        const smoothAmount = mergedParams.smoothAmount;

        p.background(255); // Reset background each frame
        p.noStroke();
        p.fill(0); // Color: black
        p.ellipse(x, p.height / 2, angle); // Draw a circle

        cGrid.draw();
        //x += 1;
        cGrid.setGridSize(x,x);

        p.fill(0); // Set fill color to black
        points.forEach((ellipse) => {
            p.ellipse(ellipse.x, ellipse.y, 5, 5);
        });


        // Apply filter dynamically based on smoothAmount
        if (smoothAmount > 0) {
            //p.filter(p.BLUR, smoothAmount); // Apply smoothAmount as blur
        }
        //p.filter(p.THRESHOLD, 0.5);
    };
};

export default defaultSketch;