import React, { useEffect, useRef, useState } from 'react';
import * as Tweakpane from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import '../index.css';

const TweakpaneComponent = ({ defaultParams, onParamChange }) => {
    const paneRef = useRef(null);
    const paneContainerRef = useRef(null); // The actual DOM container for Tweakpane
    let skeletonLinesCount = 10; // Default value for the number of lines
    // Using React state to manage all tweakpane parameters
    const [params, updateParams] = useState(defaultParams);

    // Utility for safely updating React state
    const updateParam = (key, value) => {
        updateParams((prev) => ({
            ...prev,
            [key]: value,
        }));

        // Notify parent about the parameter change
        if (onParamChange) {
            onParamChange(key, value); // Send the updated key and value only
        }
        console.log("Updated", key, "to", value);
    };

    // Add event listener for tweakpane-update
    // Add event listener for tweakpane-update
    useEffect(() => {
        const handleTweakpaneUpdate = (event) => {
            if (event.detail) {
                console.log("TweakpaneComponent received update event:", event.detail);
                
                // Update React state with new values
                updateParams(prev => ({
                    ...prev,
                    ...event.detail
                }));
                
                // Update Tweakpane UI
                if (paneRef.current) {
                    paneRef.current.importPreset(event.detail);
                }
            }
        };
        
        window.addEventListener('tweakpane-update', handleTweakpaneUpdate);
        
        return () => {
            window.removeEventListener('tweakpane-update', handleTweakpaneUpdate);
        };
    }, []);

    let NofLinesFolder;

    useEffect(() => {
        if (!paneContainerRef.current || paneRef.current) return;

        // Initialize Tweakpane
        const pane = new Tweakpane.Pane({ container: paneContainerRef.current }); // Attach to the DOM container
        pane.registerPlugin(EssentialsPlugin);
        paneRef.current = pane;

        // Add folders and inputs to Tweakpane
        const skeletonFolder = pane.addFolder({ title: 'Skeleton' });
        skeletonFolder.addInput(params, 'missArea', {
            label: 'Miss Area',
            min: 0,
            max: 100,
            step: 1,
        }).on('change', (event) => {
            updateParam('missArea', event.value); // Update React state and parent state
        });

        const anatomyFolder = pane.addFolder({ title: 'Anatomy' });
        //const linesCount = window.skeletonLinesCount || 10; // Default to 10 if not available
        NofLinesFolder = anatomyFolder.addInput(params, 'numberOfLines', {
            label: 'Number of Lines',
            view: "interval",
            min: 1,
            max: skeletonLinesCount,
            step: 1,
        }).on('change', (event) => {
            updateParam('numberOfLines', event.value);
        });

        anatomyFolder.addInput(params, 'lineWidth', {
            label: 'Line Width',
            view: "interval",
            min: 0,
            max: 100,
            step: 1,
        }).on('change', (event) => {
            updateParam('lineWidth', event.value);
        });

        anatomyFolder.addInput(params, 'lineType', {
            label: 'Line Type',
            options: {
                Straight: 'straight',
                Curved: 'curved',
                Both: 'both',
            },
        }).on('change', (event) => {
            updateParam('lineType', event.value);
            if (event.value === 'straight') {
                curvinessInput.hidden = true; // Hide curviness
                curveOffsetInput.hidden = true; // Hide curveOffset
                curveRatio.hidden = true;
            } else if (event.value === 'curved'){
                curvinessInput.hidden = false; // Show curviness
                curveOffsetInput.hidden = false; // Show curveOffset
                curveRatio.hidden = true;
            } else {
                curvinessInput.hidden = false; // Show curviness
                curveOffsetInput.hidden = false; // Show curveOffset
                curveRatio.hidden = false;
            }
            // Refresh the pane to apply the changes
            pane.refresh();


        });

        const curvinessInput = anatomyFolder.addInput(params, 'curviness', {
            label: 'Curviness',
            view: "interval",
            min: 0,
            max: 125,
            step: 1,
        }).on('change', (event) => {
            updateParam('curviness', event.value);
        })

        const curveOffsetInput = anatomyFolder.addInput(params, 'curveOffset', {
            label: 'Curve Offset',
            view: "interval",
            min: 0,
            max: 125,
            step: 1,
        }).on('change', (event) => {
            updateParam('curveOffset', event.value);
        })

        const curveRatio = anatomyFolder.addInput(params, 'curveRatio', {
            label: 'Curve Ratio',
            step: 1,
            min: 0,
            max: 100,
        }).on('change', (event) => {
            updateParam('curveRatio', event.value);
        })

        // Initial check for the visibility of inputs based on default lineType
        if (params.lineType === 'straight') {
            curvinessInput.hidden = true; // Hide curviness
            curveOffsetInput.hidden = true; // Hide curveOffset
            curveRatio.hidden = true;
        } else if (params.lineType === 'curved'){
            curvinessInput.hidden = false; // Show curviness
            curveOffsetInput.hidden = false; // Show curveOffset
            curveRatio.hidden = true;
        } else {
            curvinessInput.hidden = false; // Show curviness
            curveOffsetInput.hidden = false; // Show curveOffset
            curveRatio.hidden = false;
        }
        // Refresh the pane to apply the changes
        pane.refresh();


        anatomyFolder.addInput(params, 'lineComposition', {
            label: 'Line Composition',
            options: {
                Branched: 'Branched',
                Sequential: 'Segmented',
                Random: 'Random',
            },
        }).on('change', (event) => {
            updateParam('lineComposition', event.value);
        });

        // Add `smoothAmount` input
        anatomyFolder.addSeparator();
        anatomyFolder.addInput(params, 'smoothAmount', {
            label: 'Smooth Amount',
            step: 1,
            min: 0,
            max: 40,
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

    useEffect(() => {
        // Listen for skeleton-update events that contain information about line count
        const handleSkeletonUpdate = (event) => {
            
            if (!event.detail || event.detail.skeletonLinesCount === undefined) {
                console.log("No valid skeletonLinesCount in event");
                return;
            }

            const linesCount = event.detail.skeletonLinesCount;
            
            // Update the global variable for future reference
                                           
                                // Calculate how many lines were added by comparing with the previous count
                                // skeletonLinesCount was updated above, so it now has the new value
                                // We need to calculate what the old value was
                                const oldLinesCount = skeletonLinesCount

            skeletonLinesCount = linesCount;
            const linesAdded = Math.max(linesCount - oldLinesCount, 0); // Ensure non-negative
      
            
            // Update the Tweakpane UI for numberOfLines max value
            if (paneRef.current) {
                try {
                    
                    // Get the new max value (at least 1)
                    const newMax = Math.max(linesCount, 1);

                    // Don't update the React state unless necessary
                    // Keep the current value unless it exceeds the new maximum
                    const currentValue = params.numberOfLines;
                    const newValue = currentValue > newMax ? newMax : currentValue;

                    if (newValue !== currentValue) {
                        updateParam('numberOfLines', newValue);
                    } else {
                    }

                    try {
                        // Access the slider properties using plain JavaScript
                        const controller = NofLinesFolder.controller_;
                        if (controller && controller.valueController) {
                            const valueController = controller.valueController;
                            if (valueController.sc_ && valueController.sc_.sliderProps) {
                                const sliderProps = valueController.sc_.sliderProps;
                                
                                // Set the min and max values
                                sliderProps.set('minValue', 1);
                                sliderProps.set('maxValue', newMax);
                                
                                // This is the key part - manually set the current value to maintain it
                                if (valueController.value !== undefined) {
                                    // Get the latest values from the React state first (which should be kept in sync with UI interactions)
                                    // This ensures we're using the most up-to-date values the user has set
                                    let currentMinMax = params.numberOfLines;
                                    
                                    // Ensure we have proper min/max values
                                    if (typeof currentMinMax !== 'object' || currentMinMax.min === undefined || currentMinMax.max === undefined) {
                                        // Fallback to a default interval if needed
                                        currentMinMax = { min: 1, max: Math.min(2, newMax) };
                                    }
                                    
                                    // If it's an interval with min and max properties
                                    const newMin = currentMinMax.min; // Keep min the same
                                    const newMax2 = Math.min(currentMinMax.max + linesAdded, newMax); // Increment max by 1, but don't exceed the new maximum

                                    
                                    // Update the interval
                                    valueController.value = {
                                        min: newMin,
                                        max: newMax2
                                    };
                                    
                                    // Also update the React state to keep everything in sync
                                    updateParam('numberOfLines', {
                                        min: newMin,
                                        max: newMax2
                                    });
                                    
                                    console.log(`Updated interval to {min: ${newMin}, max: ${newMax2}}`);
                                }
                                
                                console.log("Successfully updated slider min/max values");
                            } else {
                                console.log("Could not find sc_.sliderProps on valueController:", valueController);
                            }
                        } else {
                            console.log("Could not find controller or valueController:", controller);
                        }
                        
                        // Force refresh of the UI to reflect the changes
                        paneRef.current.refresh();
                    } catch (error) {
                        console.error("Error updating slider properties:", error);
                    }

                    // Force refresh of the UI to reflect the changes
                    paneRef.current.refresh();

                    console.log("Updated Number of Lines max value to", newMax);
                } catch (error) {
                    console.error("Error updating Tweakpane:", error);
                }
            }
        };

        window.addEventListener('skeleton-update', handleSkeletonUpdate);
        
        return () => {
            window.removeEventListener('skeleton-update', handleSkeletonUpdate);
        };
    }, []); // Remove the dependency to avoid re-creating the listener

    return <div ref={paneContainerRef} className="relative p-4 theme-translucent" />;
};

export default TweakpaneComponent;