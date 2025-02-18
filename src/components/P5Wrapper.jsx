import React, { useEffect, useRef } from "react";
import p5 from "p5";

const P5Wrapper = ({ sketch, smoothAmount }) => {
    const p5Ref = useRef();
    const smoothAmountRef = useRef(smoothAmount); // Keep track of smoothAmount changes

    useEffect(() => {
        // Initialize p5 sketch ONCE
        const p5Instance = new p5((p) => {
            // Pass a setup function and dynamically update smoothAmount during runtime
            sketch(p, smoothAmountRef);
        }, p5Ref.current);

        // Cleanup on component unmount
        return () => {
            p5Instance.remove();
        };
    }, [sketch]); // Initialize only once when the sketch is provided

    useEffect(() => {
        // Keep the smoothAmountRef up to date
        smoothAmountRef.current = smoothAmount;
    }, [smoothAmount]); // Update smoothAmountRef whenever smoothAmount changes

    return <div ref={p5Ref}></div>; // The p5 canvas will attach here
};

export default P5Wrapper;