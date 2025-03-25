import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Header from "./components/Header";
import { useState, useEffect } from "react";
import TweakpaneComponent from "./components/TweakpaneComponent.jsx";
import P5Wrapper from "./components/P5Wrapper"; // Import the wrapper
import defaultSketch from "./sketches/defaultSketch";
import TabsWithPanes from "./components/TabsWithPanes.jsx";
import ButtonGroup from "./components/ButtonGroup.jsx";
import TabGroup from "./components/TabGroup.jsx"; // Import your sketch
import SaveButton from "./components/SaveButton"; // Import SaveButton
import LoadButton from "./components/LoadButton"; // Import LoadButton
import ShareButton from "./components/ShareButton"; // Import the ShareButton
import GalleryPage from "./components/GalleryPage"; // Import the GalleryPage

function MainApp() {
    // Your existing App code here
    const [params, setParams] = useState({
        missArea: 10,
        numberOfLines: {min: 4, max: 8},
        smoothAmount: 10,
        lineWidth: {min: 8, max: 24},
        lineType: 'straight',
        lineComposition: 'Branched',
    });

    const [subShapeParams, setSubShapeParams] = useState({});
    const [lastUpdatedParam, setLastUpdatedParam] = useState(null); // Track last updated param
    const location = useLocation();

    // Check URL for shape data when the page loads
    useEffect(() => {
        const checkURLForShapeLanguage = () => {
            try {
                const url = new URL(window.location.href);
                const shapeParam = url.searchParams.get('shape');
                
                if (shapeParam && window.p5Instance) {
                    setTimeout(() => {
                        if (window.p5Instance && window.p5Instance.checkURLForShapeLanguage) {
                            window.p5Instance.checkURLForShapeLanguage();
                        }
                    }, 500);
                }
            } catch (error) {
                console.error("Failed to load shape language from URL:", error);
            }
        };

        checkURLForShapeLanguage();
    }, [location]);

    const handleSetParams = (tabId, updatedParam) => {
        // Track the last updated tab and parameter
        setLastUpdatedParam({ tabId, ...updatedParam });
    };

    // Handle updates from TweakpaneComponent
    const handleTweakpaneUpdates = (key, value) => {
        setParams((prev) => ({ ...prev, [key]: value }));
        setLastUpdatedParam({ key, value }); // Update last changed param
    };

    // Add this useEffect to listen for the tweakpane-update event
    useEffect(() => {
        const handleTweakpaneUpdate = (event) => {
            if (event.detail) {
                console.log("App received tweakpane-update event with data:", event.detail);
                
                // Split the parameters into main params and subshape params
                const mainParams = {};
                const subParams = {};
                
                // Known main parameters
                const mainParamsList = ['missArea', 'numberOfLines', 'smoothAmount', 'lineWidth', 'lineType', 'lineComposition'];
                
                // Distribute parameters to the right state update
                Object.entries(event.detail).forEach(([key, value]) => {
                    if (mainParamsList.includes(key)) {
                        mainParams[key] = value;
                    } else if (key === 'subShapes') {
                        // Special handling for the subShapes object if needed
                        subParams.subShapes = value;
                    } else {
                        // All other parameters go to subParams
                        subParams[key] = value;
                    }
                });
                
                // Update both states
                if (Object.keys(mainParams).length > 0) {
                    setParams(prev => ({
                        ...prev,
                        ...mainParams
                    }));
                }
                
                if (Object.keys(subParams).length > 0) {
                    setSubShapeParams(prev => ({
                        ...prev,
                        ...subParams
                    }));
                }
            }
        };

        window.addEventListener('tweakpane-update', handleTweakpaneUpdate);
        
        return () => {
            window.removeEventListener('tweakpane-update', handleTweakpaneUpdate);
        };
    }, []);

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

    const handleSave = () => {
        // Call p5 sketch's saveShapeLanguage method or any other save logic
        if (window.p5Instance && window.p5Instance.saveShapeLanguage) {
            window.p5Instance.saveShapeLanguage();
        } else {
            console.error("p5 instance or saveShapeLanguage method not available");
        }
    };

    const handleLoad = () => {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const jsonString = e.target.result;
                        if (window.p5Instance && window.p5Instance.loadShapeLanguageFromJSON) {
                            window.p5Instance.loadShapeLanguageFromJSON(jsonString);
                        } else {
                            console.error("p5 instance or loadShapeLanguageFromJSON method not available");
                        }
                    } catch (error) {
                        console.error("Error loading file:", error);
                    }
                };
                reader.readAsText(file);
            }
            document.body.removeChild(fileInput); // Clean up
        });

        fileInput.click();
    };

    const handleShare = () => {
        if (window.p5Instance && typeof window.p5Instance.saveShapeLanguageToURL === 'function') {
            window.p5Instance.saveShapeLanguageToURL();
        } else {
            console.error("p5 instance or saveShapeLanguageToURL method not available");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <header>
                <Header />

            </header>

            {/* Main Content Section */}
            <main className="container mx-auto">
                <div className="flex justify-between gap-4">
                    <div className="basis-1/3 bg-gray-100 shadow p-4 rounded w-full">
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

                            <div className="flex items-center space-x-2">
                                {isSecondGroupVisible && (
                                    <ButtonGroup 
                                        buttons={secondGroupButtons} 
                                        onButtonSelect={handleSecondGroupSelection}
                                    />
                                )}
                                
                                {/* Action buttons in the top bar - using components now */}
                                {/* Increased margin from ml-4 to ml-8 for more space */}
                                <div className="flex items-center space-x-2 ml-24">
                                    <LoadButton onClick={handleLoad} />
                                    <SaveButton onClick={handleSave} />
                                    <ShareButton onClick={handleShare} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex space-y-2 bg-white">
                            {/* Render the p5.js sketch */}
                            <P5Wrapper 
                                sketch={defaultSketch}
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

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainApp />} />
                <Route path="/gallery" element={<GalleryPage />} />
            </Routes>
        </Router>
    );
}

export default App;