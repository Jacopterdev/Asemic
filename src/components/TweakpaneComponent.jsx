import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import * as Tweakpane from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import '../index.css'; // Include your CSS file here


const TweakpaneComponent = () => {
    const paneRef = useRef(null);
    const paneContainerRef = useRef(null); // The actual DOM container for Tweakpane

    useEffect(() => {
        if (!paneContainerRef.current || paneRef.current) return;

        const pane = new Tweakpane.Pane({ container: paneContainerRef.current }); // Attach to container
        pane.registerPlugin(EssentialsPlugin);
        paneRef.current = pane;

        // Configuration for Skeleton
        const skeletonParams = {
            missArea: { min: 10, max: 50 }, // Interval (min-max range) for Miss Area
        };

        const anatomyParams = {
            numberOfLines: { min: 5, max: 15 }, // Interval for Number of Lines
            lineWidth: { min: 1, max: 10 },   // Interval for Line Width
            lineType: "straight",             // Dropdown for Line Type
            lineComposition: "Branched",      // Dropdown for Line Composition
            smoothAmount: 25,                 // Single slider for Smooth Amount
        };


        const skeletonFolder = pane.addFolder({ title: "Skeleton" });
        skeletonFolder.addInput(skeletonParams, "missArea", {
            min: 0,
            max: 100,
            step: 1,
        });

        const anatomyFolder = pane.addFolder({ title: "Anatomy" });
        anatomyFolder.addInput(anatomyParams, "numberOfLines", {
            min: 1,
            max: 50,
            step: 1,
        });
        anatomyFolder.addInput(anatomyParams, "lineWidth", {
            min: 1,
            max: 100,
            step: 1,
        });
        anatomyFolder.addInput(anatomyParams, "lineType", {
            // Dropdown menu for 'Line Type'
            options: {
                Straight: "straight",
                Curved: "curved",
            },
        });
        anatomyFolder.addInput(anatomyParams, "lineComposition", {
            // Dropdown menu for 'Line Composition'
            options: {
                Branched: "Branched",
                Segmented: "Segmented",
                "In Series": "In Series",
            },
        });

        // Add a separator
        anatomyFolder.addSeparator();

        // Add "Smooth Amount" Slider
        anatomyFolder.addInput(anatomyParams, "smoothAmount", {
            step: 1,
            min: 0,
            max: 100,
        });

        // Configuration for Composition (Future extensions)
        const compositionFolder = pane.addFolder({ title: "Composition" });
        // Add more inputs to Composition here if needed...

        return () => {
            pane.dispose(); // Clean up on unmount
            paneRef.current = null;
        };
    }, []);

    return (
        <div ref={paneContainerRef} className="relative p-4 theme-translucent" />
    );
};

export default TweakpaneComponent;