import React, { useState, useEffect, useRef } from "react";
import * as Tweakpane from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

const TabsWithPanes = () => {
    const [tabs, setTabs] = useState([
        {
            id: 1,
            params: {
                subShape: "Triangle",
                connection: "atEnd", // Default value
                rotationType: "relative", // Default value
                angle: {x: 0, y: 50},
                amount: {min: 0, max: 50}, // Default interval
                size: {min: 0, max: 100}, // Default interval
                distort: {min: 0, max: 100}, // Default interval
            },
            pane: null,
        },
        {
            id: 2,
            params: {
                subShape: "Triangle",
                connection: "Along",
                rotationType: "absolute",
                angle: {x: 0, y: 50},
                amount: {min: 10, max: 30},
                size: {min: 20, max: 80},
                distort: {min: 5, max: 50},
            },
            pane: null,
        },
    ]); // Initial tabs with parameters

    const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].id : null);
    const paneContainerRefs = useRef({}); // Track container refs for each tab
    const panes = useRef({}); // Track Tweakpane instances for each tab
    const nextTabId = useRef(3); // Start with 3 because tabs 1 and 2 already exist

    const addTab = () => {
        const newTabId = nextTabId.current; // Use the current unique ID
        const newTab = {
            id: newTabId,
            params: {
                subShape: "Triangle",
                connection: "atEnd",
                rotationType: "relative",
                angle: { x: 0, y: 50 },
                amount: { min: 0, max: 50 },
                size: { min: 0, max: 100 },
                distort: { min: 0, max: 100 },
            },
            pane: null,
        };

        setTabs([...tabs, newTab]);
        setActiveTab(newTabId); // Set the newly added tab as active

        nextTabId.current += 1; // Increment the counter for the next tab
    };

    // Handle deleting a tab
    const deleteTab = (tabId) => {
        // Destroy Tweakpane instance for the deleted tab, if it exists
        if (panes.current[tabId]) {
            panes.current[tabId].dispose(); // Dispose of the Tweakpane instance
            delete panes.current[tabId]; // Clean up the panes ref
        }

        // Clean up the DOM reference for the deleted tab container
        delete paneContainerRefs.current[tabId];

        // Remove the deleted tab from the `tabs` state
        const updatedTabs = tabs.filter((tab) => tab.id !== tabId);
        setTabs(updatedTabs);

        // Update the active tab if the deleted tab was active
        if (tabId === activeTab) {
            if (updatedTabs.length > 0) {
                // Set the active tab to the first remaining tab
                setActiveTab(updatedTabs[0].id);
            } else {
                // No tabs left, reset activeTab to null
                setActiveTab(null);
            }
        }
    };


    // Handle Tweakpane initialization for the active tab
    useEffect(() => {
        if (activeTab === null) return; // Skip if there is no active tab

        const activeTabData = tabs.find((tab) => tab.id === activeTab);
        if (!activeTabData) return;

        const container = paneContainerRefs.current[activeTab];
        if (!container) {
            console.warn(`No container for tab ${activeTab}`);
            return;
        }

        // Create the Tweakpane instance if it does not exist
        if (!panes.current[activeTab]) {
            const pane = new Tweakpane.Pane({container});
            pane.registerPlugin(EssentialsPlugin); // Register Essentials Plugin

            pane.addInput(activeTabData.params, "subShape", {
                options: {
                    square: "Square",
                    triangle: "Triangle",
                    circle: "Circle",
                },
            });

            // Add `connection` as a radiogrid
            pane.addInput(activeTabData.params, "connection", {
                view: "radiogrid",
                groupName: "Connection Type",
                size: [2, 1], // 2 columns, 1 row
                cells: (x, y) => {
                    const options = ["atEnd", "Along"];
                    return {
                        title: options[x],
                        value: options[x],
                    };
                },
            });

            // Add `rotationType` as a radiogrid
            pane.addInput(activeTabData.params, "rotationType", {
                view: "radiogrid",
                groupName: "Rotation Type",
                size: [2, 1], // 2 columns, 1 row
                cells: (x, y) => {
                    const options = ["relative", "absolute"];
                    return {
                        title: options[x],
                        value: options[x],
                    };
                },
            });


            // Add a point2D input to the pane
            pane.addInput(activeTabData.params, 'angle', {
                label: 'angle',
            });

            function calculateAngle(point) {
                const {x, y} = point;
                const angleRadians = Math.atan2(y, x); // Returns angle in radians
                const angleDegrees = angleRadians * (180 / Math.PI); // Convert to degrees
                return angleDegrees;
            }

            pane.on('change', (event) => {
                if (event.presetKey === 'angle') {
                    const angle = calculateAngle(event.value);
                    //console.log(`Angle relative to (0, 0): ${angle.toFixed(2)} degrees`);
                }
            });

            pane.addInput(activeTabData.params, "amount", {
                view: "interval",
                min: 0,
                max: 50,
                step: 1,
                label: "Amount",
            });

            pane.addInput(activeTabData.params, "size", {
                view: "interval",
                min: 0,
                max: 100,
                step: 1,
                label: "Size",
            });

            pane.addInput(activeTabData.params, "distort", {
                view: "interval",
                min: 0,
                max: 100,
                step: 1,
                label: "Distort",
            });

            // Save the pane instance
            panes.current[activeTab] = pane;
        }

        return () => {
        };
    }, [activeTab, tabs]);

    // Add a new tab dynamically


    return (
        <div className="tabs-with-panes w-full">
            {/* Tabs List */}
            <div className="tabs-list flex space-x-2 h-10">
                {tabs.length > 0 ? (
                    tabs.map((tab) => (
                        <div
                            key={tab.id}
                            ref={(ref) => (paneContainerRefs.current[tab.id] = ref)}
                            className={`tab group flex-grow text-center flex items-center justify-center px-4 py-2 relative ${
                                activeTab === tab.id ? "button-active" : "button"
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{flex: 1}} // To evenly stretch the tabs
                        >
                            {tab.id}
                            {/* Delete Button */}
                            <button
                                className="mini-delete absolute top-0 right-0 hidden group-hover:inline"
                                onClick={() => deleteTab(tab.id)}
                            >
                                -
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="flex-grow flex justify-center items-center text-gray-500 text-xs flex-grow text-center font-mono">
                        Sub-Shapes
                    </div>
                )}
                <button
                    className="tab flex-none text-center px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition duration-200"
                    onClick={addTab}
                >
                    +
                </button>
            </div>

            {/* Active Tab Pane */}
            <div className="pane-container p-4 bg-gray-100 rounded theme-translucent">
                {tabs.length > 0 && activeTab !== null ? (
                    tabs.map((tab) => (
                        <div
                            key={tab.id}
                            ref={(ref) => (paneContainerRefs.current[tab.id] = ref)} // Attach refs for each tab
                            style={{display: tab.id === activeTab ? "block" : "none"}} // Only render the active tab's container
                            className="w-full"
                        />
                    ))
                ) : (
                    <div className="text-gray-500 text-sm text-center">

                    </div>
                )}
            </div>
        </div>
    );
}

export default TabsWithPanes;
