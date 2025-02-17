import React, { useEffect, useRef, useState } from "react";
import * as Tweakpane from "tweakpane";
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';


const TweakpaneComponent = () => {
    const paneRef = useRef(null);
    const paneContainerRef = useRef(null); // The actual DOM container for Tweakpane
    const [params, setParams] = useState({ interval: { min: 16, max: 48 } });
    useEffect(() => {
        if (!paneContainerRef.current || paneRef.current) return;
        const pane = new Tweakpane.Pane({ container: paneContainerRef.current }); // Attach to container
        pane.registerPlugin(EssentialsPlugin);
        paneRef.current = pane;

        const params = {
            range: {min: 16, max: 48},
        };

        pane.addInput(params, 'range', {
            min: 0,
            max: 100,

            step: 1,
        });

        return () => {
            pane.dispose(); // Clean up on unmount
            paneRef.current = null;
        };
    }, []);

    return (
        <div ref={paneContainerRef} className="relative p-4 bg-gray-800 rounded-lg" />
    );
};

export default TweakpaneComponent;
