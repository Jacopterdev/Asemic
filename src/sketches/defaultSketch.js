const defaultSketch = (p, mergedParamsRef) => {
    let x = 300;
    //console.log("Params:", mergedParamsRef.current);

    p.setup = () => {
        // Create the canvas (adjust dimensions as needed)
        p.createCanvas(900, 800);
        p.angleMode(p.DEGREES);
    };

    p.draw = () => {
        const mergedParams = mergedParamsRef.current;
        const angle = mergedParams[1].angle;
        const smoothAmount = mergedParams.smoothAmount;

        p.background(255); // Reset background each frame
        p.noStroke();
        p.fill(0); // Color: black
        p.ellipse(x, p.height / 2, angle); // Draw a circle



        // Apply filter dynamically based on smoothAmount
        if (smoothAmount > 0) {
            p.filter(p.BLUR, smoothAmount); // Apply smoothAmount as blur
        }
        p.filter(p.THRESHOLD, 0.5);
    };
};

export default defaultSketch;