const defaultSketch = (p, smoothAmountRef) => {
    let x = 300;

    p.setup = () => {
        // Create the canvas (adjust dimensions as needed)
        p.createCanvas(900, 600);
        p.background(220); // Light gray background
    };

    p.draw = () => {
        const smoothAmount = smoothAmountRef.current; // Dynamically fetch the current smoothAmount value
        p.background(255); // Reset background each frame
        p.noStroke();
        p.fill(0); // Color: black
        p.ellipse(x, p.height / 2, 200); // Draw a circle
        p.ellipse(x+40, p.height / 2 - 100, 100); // Draw a circle

        // Apply filter dynamically based on smoothAmount
        if (smoothAmount > 0) {
            p.filter(p.BLUR, smoothAmount); // Apply smoothAmount as blur
        }
        p.filter(p.THRESHOLD, 0.5);
    };
};

export default defaultSketch;