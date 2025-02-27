import React, { useEffect, useRef, useState } from 'react';
import * as Tweakpane from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import '../index.css';

const TweakpaneComponent = ({ defaultParams, setParams }) => {
    const paneRef = useRef(null);
    const paneContainerRef = useRef(null); // The actual DOM container for Tweakpane

    // Using React state to manage all tweakpane parameters
    const [params, updateParams] = useState(defaultParams);

    // Utility for safely updating React state
    const updateParam = (key, value) => {
        updateParams((prev) => ({
            ...prev,
            [key]: value,
        }));

        // Only update the parent state when the parameter changes
        setParams((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    useEffect(() => {
        if (!paneContainerRef.current || paneRef.current) return;

        // Initialize Tweakpane
        const pane = new Tweakpane.Pane({ container: paneContainerRef.current }); // Attach to the DOM container
        pane.registerPlugin(EssentialsPlugin);
        paneRef.current = pane;

        // Add folders and inputs to Tweakpane
        const skeletonFolder = pane.addFolder({ title: 'Skeleton' });
        skeletonFolder.addInput(params, 'missArea', {
            min: 0,
            max: 100,
            step: 1,
        }).on('change', (event) => {
            updateParam('missArea', event.value); // Update React state and parent state
        });

        const anatomyFolder = pane.addFolder({ title: 'Anatomy' });
        anatomyFolder.addInput(params, 'numberOfLines', {
            view: "interval",
            min: 1,
            max: 50,
            step: 1,
        }).on('change', (event) => {
            updateParam('numberOfLines', event.value);
        });

        anatomyFolder.addInput(params, 'lineWidth', {
            view: "interval",
            min: 1,
            max: 30,
            step: 1,
        }).on('change', (event) => {
            updateParam('lineWidth', event.value);
        });

        anatomyFolder.addInput(params, 'lineType', {
            options: {
                Straight: 'straight',
                Curved: 'curved',
            },
        }).on('change', (event) => {
            updateParam('lineType', event.value);
        });

        anatomyFolder.addInput(params, 'lineComposition', {
            options: {
                Branched: 'Branched',
                Segmented: 'Segmented',
                'In Series': 'In Series',
            },
        }).on('change', (event) => {
            updateParam('lineComposition', event.value);
        });

        // Add `smoothAmount` input
        anatomyFolder.addSeparator();
        anatomyFolder.addInput(params, 'smoothAmount', {
            step: 1,
            min: 0,
            max: 10,
        }).on('change', (event) => {
            updateParam('smoothAmount', event.value);
        });

        return () => {
            pane.dispose(); // Clean up on unmount
            paneRef.current = null;
        };
    }, []); // Only run once on mount (empty dependency array)

    useEffect(() => {
        // If defaultParams change, update the Tweakpane values
        if (paneRef.current) {
            paneRef.current.importPreset(params);
        }
    }, [defaultParams]); // Sync React state only if defaultParams change

    return <div ref={paneContainerRef} className="relative p-4 theme-translucent" />;
};

export default TweakpaneComponent;