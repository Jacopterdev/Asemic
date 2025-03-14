import React, { useEffect, useRef } from "react";
import p5 from "p5";

const P5Wrapper = ({ sketch, mergedParams, toolConfig, lastUpdatedParam }) => {
    const p5Ref = useRef();
    const mergedParamsRef = useRef(mergedParams);
    const toolConfigRef = useRef(toolConfig); // Reference to track toolConfig
    const lastUpdatedParamRef = useRef(lastUpdatedParam);

    useEffect(() => {
        // Initialize p5 sketch ONCE
        const p5Instance = new p5((p) => {
            // Pass a setup function and dynamically update smoothAmount during runtime
            sketch(p, mergedParamsRef, toolConfigRef, lastUpdatedParamRef);
        }, p5Ref.current);
        
        // Add this one line to expose p5 instance to window object
        window.p5Instance = p5Instance;
        console.log("P5 instance exposed to window.p5Instance");

        // Cleanup on component unmount
        return () => {
            p5Instance.remove();
            window.p5Instance = null; // Clean up reference when component unmounts
        };
    }, [sketch]); // Initialize only once when the sketch is provided

    useEffect(() => {
        mergedParamsRef.current = mergedParams;
    }, [mergedParams]); // Update when mergedParams changes

    useEffect(() => {
        // Update toolConfigRef whenever toolConfig changes
        toolConfigRef.current = toolConfig;
    }, [toolConfig]);

    useEffect(() => {
        lastUpdatedParamRef.current = lastUpdatedParam;
    }, [lastUpdatedParam]);

    return <div ref={p5Ref}></div>; // The p5 canvas will attach here
};

export default P5Wrapper;