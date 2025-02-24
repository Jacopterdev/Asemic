import React, { useEffect, useRef } from "react";
import p5 from "p5";

const P5Wrapper = ({ sketch, mergedParams, toolConfig }) => {
    const p5Ref = useRef();
    //const smoothAmountRef = useRef(smoothAmount); // Keep track of smoothAmount changes
    const mergedParamsRef = useRef(mergedParams);
    const toolConfigRef = useRef(toolConfig); // Reference to track toolConfig


    useEffect(() => {
        // Initialize p5 sketch ONCE
        const p5Instance = new p5((p) => {
            // Pass a setup function and dynamically update smoothAmount during runtime
            sketch(p, mergedParamsRef, toolConfigRef);
        }, p5Ref.current);

        // Cleanup on component unmount
        return () => {
            p5Instance.remove();
        };
    }, [sketch]); // Initialize only once when the sketch is provided

    useEffect(() => {
        mergedParamsRef.current = mergedParams;
    }, [mergedParams]); // Update smoothAmountRef whenever smoothAmount changes

    useEffect(() => {
        // Update toolConfigRef whenever toolConfig changes
        toolConfigRef.current = toolConfig;
    }, [toolConfig]);

    return <div ref={p5Ref}></div>; // The p5 canvas will attach here
};

export default P5Wrapper;