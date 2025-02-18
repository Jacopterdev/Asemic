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
                rotation: { min: 0, max: 360 }, // Default interval
                amount: { min: 0, max: 50 }, // Default interval
                size: { min: 0, max: 100 }, // Default interval
                distort: { min: 0, max: 100 }, // Default interval
            },
            pane: null,
        },
        {
            id: 2,
            params: {
                subShape: "Triangle",
                connection: "Along",
                rotationType: "absolute",
                rotation: { min: 30, max: 120 },
                amount: { min: 10, max: 30 },
                size: { min: 20, max: 80 },
                distort: { min: 5, max: 50 },
            },
            pane: null,
        },
    ]); // Initial tabs with parameters

    const [activeTab, setActiveTab] = useState(tabs[0].id); // Track the currently active tab
    const paneContainerRefs = useRef({}); // Track container refs for each tab
    const panes = useRef({}); // Track Tweakpane instances for each tab

    // Handle Tweakpane initialization for the active tab
    useEffect(() => {
        const activeTabData = tabs.find((tab) => tab.id === activeTab);
        if (!activeTabData) return;

        const container = paneContainerRefs.current[activeTab];
        if (!container) {
            console.warn(`No container for tab ${activeTab}`);
            return;
        }

        // Create the Tweakpane instance if it does not exist
        if (!panes.current[activeTab]) {
            const pane = new Tweakpane.Pane({ container });
            pane.registerPlugin(EssentialsPlugin); // Register Essentials Plugin

            pane.addInput(activeTabData.params, "subShape", {
                options: {
                    square: "Square",
                    triangle: "Triangle",
                    circle: "Circle",
                },
            });

            // Add inputs for the active tab
            pane.addInput(activeTabData.params, "connection", {
                options: {
                    atEnd: "atEnd",
                    Along: "Along",
                },
            });

            pane.addInput(activeTabData.params, "rotationType", {
                options: {
                    relative: "relative",
                    absolute: "absolute",
                },
            });

            pane.addInput(activeTabData.params, "rotation", {
                view: "interval",
                min: 0,
                max: 360,
                step: 1,
                label: "Rotation",
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

        return () => {};
    }, [activeTab, tabs]);

    // Add a new tab dynamically
    const addTab = () => {
        const newTabId = tabs.length + 1;
        const newTab = {
            id: newTabId,
            params: {
                subShape: "Triangle",
                connection: "atEnd",
                rotationType: "relative",
                rotation: { min: 0, max: 360 },
                amount: { min: 0, max: 50 },
                size: { min: 0, max: 100 },
                distort: { min: 0, max: 100 },
            },
            pane: null,
        };
        setTabs([...tabs, newTab]);
        setActiveTab(newTabId); // Switch to the new tab
    };

    return (
        <div className="tabs-with-panes w-full">
            {/* Tabs List */}
            <div className="tabs-list flex space-x-2 h-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab flex-grow text-center px-4 py-2 ${
                            activeTab === tab.id ? "button-active" : "button"
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ flex: 1 }} // To evenly stretch the tabs
                    >
                        {tab.id}
                    </button>
                ))}
                <button
                    className="tab flex-none text-center px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition duration-200"
                    onClick={addTab}
                >
                    +
                </button>
            </div>

            {/* Active Tab's Pane */}
            <div className="pane-container p-4 bg-gray-100 rounded theme-translucent">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        ref={(ref) => (paneContainerRefs.current[tab.id] = ref)} // Attach refs for each tab
                        style={{ display: tab.id === activeTab ? "block" : "none" }} // Only render the active tab's container
                        className="w-full"
                    />
                ))}
            </div>
        </div>
    );
};

export default TabsWithPanes;
