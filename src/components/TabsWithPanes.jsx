import React, { useState, useEffect, useRef } from "react";
import * as Tweakpane from "tweakpane";

const TabsWithPanes = () => {
    const [tabs, setTabs] = useState([
        { id: 1, params: { size: 50 }, pane: null },
        { id: 2, params: { size: 30 }, pane: null },
    ]); // Initial tabs with parameters
    const [activeTab, setActiveTab] = useState(tabs[0].id); // Track the currently active tab
    const paneContainerRefs = useRef({}); // Track container refs for each tab
    const panes = useRef({}); // Track Tweakpane instances for each tab

    // Handle Tweakpane initialization for the active tab
    useEffect(() => {
        // Find the data for the active tab
        const activeTabData = tabs.find((tab) => tab.id === activeTab);

        if (!activeTabData) return;

        // Get the container ref
        const container = paneContainerRefs.current[activeTab];

        // Ensure the container exists
        if (!container) {
            console.warn(`No container for tab ${activeTab}`);
            return;
        }

        // Create a new Tweakpane instance if it doesn't already exist
        if (!panes.current[activeTab]) {
            const pane = new Tweakpane.Pane({ container });
            pane.addInput(activeTabData.params, "size", {
                min: 0,
                max: 100,
                step: 1,
                label: "Size",
            });

            // Save the pane instance
            panes.current[activeTab] = pane;
        }

        return () => {
            // IMPORTANT: Do not dispose of the pane on tab switch, only when a tab is permanently removed
        };
    }, [activeTab, tabs]);

    // Add a new tab dynamically
    const addTab = () => {
        const newTabId = tabs.length + 1;
        const newTab = {
            id: newTabId,
            params: { size: 50 },
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