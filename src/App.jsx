import Header from "./components/Header";
import { useState } from "react";
import TweakpaneComponent from "./components/TweakpaneComponent.jsx";
import P5Wrapper from "./components/P5Wrapper"; // Import the wrapper
import defaultSketch from "./sketches/defaultSketch";
import TabsWithPanes from "./components/TabsWithPanes.jsx";
import ButtonGroup from "./components/ButtonGroup.jsx";
import TabGroup from "./components/TabGroup.jsx"; // Import your sketch


function App() {

    const [params, setParams] = useState({
        missArea: 10,
        numberOfLines: {min: 5, max: 5},
        smoothAmount: 5,
        lineWidth: {min: 2, max: 30},
        lineType: 'straight',
        lineComposition: 'Branched',
    });

    const [subShapeParams, setSubShapeParams] = useState({});
    const [lastUpdatedParam, setLastUpdatedParam] = useState(null); // Track last updated param


    const handleSetParams = (tabId, updatedParam) => {
        // Track the last updated tab and parameter
        setLastUpdatedParam({ tabId, ...updatedParam });
    };


    // Handle updates from TweakpaneComponent
    const handleTweakpaneUpdates = (key, value) => {
        setParams((prev) => ({ ...prev, [key]: value }));
        setLastUpdatedParam({ key, value }); // Update last changed param
    };




    const mergedParams = { ...params, ...subShapeParams };
    console.log("lastupdated param",lastUpdatedParam);


    // NEW: State for managing selected buttons for each group
    const [toolConfig, setToolConfig] = useState({
        state: "Edit Skeleton", // Default selection for the first group
        grid: "radial", // Default selection for the second group
    });


    const firstGroupButtons = [
        {
            label: "Edit Skeleton",
            onClick: () => setIsSecondGroupVisible(true), // Ensure the second group is visible
        },
        {
            label: "Anatomy",
            onClick: () => setIsSecondGroupVisible(false), // Hide the second group

        },
        {
            label: "Composition",
            onClick: () => setIsSecondGroupVisible(false), // Hide the second group

        },
    ];

    const secondGroupButtons = [
        {
            label: "./radial.svg",
            type: "radial",
            onClick: () => console.log("Secondary Button 1 clicked"),
        },
        {
            label: "./rect.svg",
            type: "rect",
            onClick: () => console.log("Secondary Button 2 clicked"),
        },
        {
            label: "./noGrid.svg",
            type: "none",
            onClick: () => console.log("Secondary Button 2 clicked"),
        },
    ];

    // Callback for handling button selection in the first group
    const handleFirstGroupSelection = (index) => {
        setToolConfig((prevState) => ({
            ...prevState,
            state: firstGroupButtons[index].label, // Update `state` with the selected label
        }));

        console.log(`First group selected index: ${index}`);
    };
    const handleSecondGroupSelection = (index) => {
        setToolConfig((prevState) => ({
            ...prevState,
            grid: secondGroupButtons[index].type, // Update `grid` with the selected label
        }));

        console.log(`Second group selected index: ${index}`);
    };





    const [isSecondGroupVisible, setIsSecondGroupVisible] = useState(true); // Track visibility of the second ButtonGroup



    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <header className="bg-gray-50 text-gray-800 p-4 text-center mx-auto">
                <Header />
            </header>

            {/* Main Content Section */}
            <main className="container mx-auto p-6">
                <div className="flex justify-between gap-4">
                    <div className="basis-1/4 bg-gray-100 shadow p-4 rounded w-full overflow-hidden">
                        <div className="space-y-2">
                            <TweakpaneComponent
                                defaultParams={params}
                                onParamChange={handleTweakpaneUpdates}
                            />
                            <TabsWithPanes
                                subShapeParams={subShapeParams}
                                setParams={setSubShapeParams}
                                onParamChange={handleSetParams}
                            />
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-100 shadow p-4 rounded">
                        <div className="flex justify-between items-center h-6">
                            <TabGroup buttons={firstGroupButtons} onButtonSelect={handleFirstGroupSelection} />

                            {isSecondGroupVisible && (
                                <div>
                                    <ButtonGroup buttons={secondGroupButtons} onButtonSelect={handleSecondGroupSelection}
                                    />
                                </div>
                            )}

                            <div className="flex items-center space-x-4">

                            </div>
                        </div>
                        <div className="flex space-y-2 bg-white">
                            {/* Render the p5.js sketch */}
                            <P5Wrapper sketch={defaultSketch}
                                       mergedParams={mergedParams}
                                       toolConfig={toolConfig}
                                       lastUpdatedParam={lastUpdatedParam}
                            />
                            <div className="bg-gray-50 flex-1 rounded m-4"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;