import React, { useState, useEffect, useRef } from "react";
import * as Tweakpane from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

// Map subShapes to the corresponding SVG file paths in the `public` directory
const svgMapping = {
    Triangle: "/shapes/triangle.svg",
    Circle: "/shapes/circle.svg",
    Square: "/shapes/square.svg",
};

const TabsWithPanes = ({subShapeParams, setParams, onParamChange}) => {
    const [activeTabData, updateParams] = useState(subShapeParams);
    // Updates the active tab's state and notifies the parent
    const updateParam = (key, value) => {
        updateParams((prev) => ({
            ...prev,
            [key]: value,
        }));

        // Update the specific tab in `tabs`
        setTabs((prevTabs) =>
            prevTabs.map((tab) =>
                tab.id === activeTab
                    ? { ...tab, params: { ...tab.params, [key]: value } }
                    : tab
            )
        );


        // Update the parent state to reflect changes
        setParams((prevParentParams) => ({
            ...prevParentParams,
            [activeTab]: {
                ...prevParentParams[activeTab],
                [key]: value,
            },
        }));

        if (onParamChange) {
            onParamChange(activeTab, { key, value }); // Provide the active tab ID and updated value
        }

    };
    const [tabs, setTabs] = useState([
        {
            id: 1,
            params: {
                subShape: "Triangle",
                connection: "Along", // Default value
                rotationType: "relative", // Default value
                angle: {min: 0, max: 360},
                amount: {min: 1, max: 3}, // Default interval
                size: {min: 20, max: 160}, // Default interval
                distort: {min: 0, max: 0}, // Default interval
            },
            pane: null,
        },
    ]); // Initial tabs with parameters

    const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].id : null);
    const paneContainerRefs = useRef({}); // Track container refs for each tab
    const panes = useRef({}); // Track Tweakpane instances for each tab
    const nextTabId = useRef(2); // Start with 2 because tabs 1 already exist

    useEffect(() => {
        const initialParams = {};
        tabs.forEach((tab) => {
            initialParams[tab.id] = tab.params;
        });
        //setParams(initialParams);
    }, []);


    const addTab = () => {
        const newTabId = nextTabId.current;
        const newTab = {
            id: newTabId,
            params: {
                subShape: "Square",
                connection: "Along", // Default value
                rotationType: "relative", // Default value
                angle: {min: 0, max: 360},
                amount: {min: 1, max: 3}, // Default interval
                size: {min: 20, max: 160}, // Default interval
                distort: {min: 0, max: 0}, // Default interval
            },
            pane: null,
        };

        // Update tabs state
        setTabs((prevTabs) => [...prevTabs, newTab]);


        // Update parent's state with the new tab's params
        setParams((prevParentParams) => ({
            ...prevParentParams,
            [newTabId]: newTab.params,
        }));

        // Set the newly added tab as active
        setActiveTab(newTabId);

        nextTabId.current += 1; // Increment ID for next tab
    };

    // Handle deleting a tab
    const deleteTab = (tabId) => {
        // Destroy Tweakpane instance
        if (panes.current[tabId]) {
            panes.current[tabId].dispose();
            delete panes.current[tabId];
        }

        // Clean up the pane container ref
        delete paneContainerRefs.current[tabId];

        // Remove the tab from `tabs`
        const updatedTabs = tabs.filter((tab) => tab.id !== tabId);
        setTabs(updatedTabs);


        // Remove the tab's parameters from the parent's state
        setParams((prevParentParams) => {
            const { [tabId]: _, ...remainingParams } = prevParentParams;
            return remainingParams;
        });

        // Update the active tab
        if (tabId === activeTab && updatedTabs.length > 0) {
            setActiveTab(updatedTabs[0].id);
        } else if (updatedTabs.length === 0) {
            setActiveTab(null);
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
            }).on('change', (event) => {
                updateParam('subShape', event.value);
            });

            // Add `connection`
            pane.addInput(activeTabData.params, "connection", {
                label: "Connection", // Optional: Add a label
                options: {
                    "At End": "atEnd",  // Displayed: "At End", Value: "atEnd"
                    "Along": "Along",   // Displayed: "Along", Value: "Along"
                },
            }).on("change", (event) => {
                updateParam("connection", event.value); // Update the state
            });


            // Add `rotationType`
            pane.addInput(activeTabData.params, "rotationType", {
                label: "Rotation Type", // Optional: Add a label
                options: {
                    Relative: "relative",  // Displayed: "Relative", Value: "relative"
                    Absolute: "absolute",  // Displayed: "Absolute", Value: "absolute"
                },
            }).on("change", (event) => {
                updateParam("rotationType", event.value); // Update the state
            });



            // Add a point2D input to the pane
            pane.addInput(activeTabData.params, "angle", {
                view: "slider", // Use slider for a single value or interval for ranges
                min: 0,         // Minimum slider value (e.g., 0 degrees)
                max: 360,       // Maximum slider value (e.g., 360 degrees)
                step: 1,        // Slider step increment (e.g., 1 degree per step)
                label: "Angle", // Label to display next to the slider
            }).on("change", (event) => {
                updateParam("angle", event.value); // Update the angle value in state
            });


            pane.addInput(activeTabData.params, "amount", {
                view: "interval",
                min: 0,
                max: 100,
                step: 1,
                label: "Amount",
            }).on('change', (event) => {
                updateParam('amount', event.value);
            });

            pane.addInput(activeTabData.params, "size", {
                view: "interval",
                min: 0,
                max: 300,
                step: 1,
                label: "Size",
            }).on('change', (event) => {
                updateParam('size', event.value);
            });

            pane.addInput(activeTabData.params, "distort", {
                view: "interval",
                min: 0,
                max: 200,
                step: 1,
                label: "Distort",
            }).on('change', (event) => {
                updateParam('distort', event.value);
            });

            // Save the pane instance
            panes.current[activeTab] = pane;
        }

        return () => {
        };
    }, [activeTab, tabs]);

    useEffect(() => {
        if (!activeTab) return;

        // Update the parent state with the active tab's data
        const activeTabData = tabs.find((tab) => tab.id === activeTab);
        if (activeTabData) {

            setParams((prevParentParams) => ({
                ...prevParentParams,
                [activeTab]: activeTabData.params,
            }));
        }
    }, [activeTab, tabs]);

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
                            {/* Render the SVG for the subShape */}
                            {svgMapping[tab.params.subShape] ? (
                                <img
                                    src={svgMapping[tab.params.subShape]}
                                    alt={tab.params.subShape}
                                    className="h-6 w-6"
                                />
                            ) : (
                                "?"
                            )}

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
                        Add Sub-Shapes
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