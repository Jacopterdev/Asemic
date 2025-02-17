import React, { useEffect, useRef, useState } from "react";
import * as Tweakpane from "tweakpane";
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';


const TweakpaneComponent = () => {
    const paneRef = useRef(null);
    const [params, setParams] = useState({ interval: { min: 16, max: 48 } });

    useEffect(() => {
        const pane = new Tweakpane.Pane();
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
        };
    }, []);

    return (
        <div className="relative p-4 bg-gray-800 rounded-lg" />
    );
};

export default TweakpaneComponent;
