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
import PresetButtons from "./components/PresetButtons";
import QuestionnaireButton from './components/QuestionnaireButton';

function MainApp() {
    // Your existing App code here
    const [params, setParams] = useState({
        missArea: 10,
        numberOfLines: {min: 4, max: 8},
        smoothAmount: 10,
        lineWidth: {min: 8, max: 24},
        lineType: 'straight',
        curviness: {min: 0, max: 100},
        curveOffset: {min: 0, max: 100},
        curveRatio: 50,
        lineComposition: 'Branched',
    });

    const [subShapeParams, setSubShapeParams] = useState({});
    const [lastUpdatedParam, setLastUpdatedParam] = useState(null); // Track last updated param
    const [selectedButtonIndex, setSelectedButtonIndex] = useState(0); // Default to the first button
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


    // NEW: State for managing selected buttons for each group
    const [toolConfig, setToolConfig] = useState({
        state: "Edit Skeleton", // Default selection for the first group
        grid: "radial", // Default selection for the second group
    });

    useEffect(() => {
        const handleToolConfigEvent = (event) => {
            if (event && event.detail && typeof event.detail === 'string') {
                console.log("Received toolConfig update:", event.detail);

                setToolConfig((prev) => {
                    const updatedToolConfig = {
                        ...prev,
                        state: event.detail, // Update the state key
                    };

                    // Automatically update TabGroup selection based on button label
                    const tabIndex = firstGroupButtons.findIndex((button) => button.label === event.detail);
                    if (tabIndex !== -1) {
                        setSelectedButtonIndex(tabIndex); // Update state for TabGroup
                    }

                    return updatedToolConfig;
                });
            }
        };

        window.addEventListener('toolConfig', handleToolConfigEvent);

        return () => {
            window.removeEventListener('toolConfig', handleToolConfigEvent);
        };
    }, []);



    const firstGroupButtons = [
        {
            label: "Edit Skeleton",
        },
        {
            label: "Anatomy",
        },
        {
            label: "Composition",
        },
    ];

    // Callback for handling button selection in the first group
    const handleFirstGroupSelection = (index) => {
        setSelectedButtonIndex(index); // Update state in MainApp
        setToolConfig((prev) => ({
            ...prev,
            state: firstGroupButtons[index].label, // Update toolConfig.state as well
        }));
    };

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
                    <div className="basis-1/3 bg-gray-100 shadow p-4 rounded w-full" style={{ 
                      maxHeight: '830px', 
                      overflowY: 'auto',
                      scrollbarWidth: 'none', /* Firefox */
                      msOverflowStyle: 'none', /* IE and Edge */
                      '&::webkitScrollbar': { display: 'none' } /* Chrome, Safari, Opera */
                    }}>
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
                                <PresetButtons />
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-100 shadow p-4 rounded">
                        <div className="flex justify-between items-center h-6">
                            <TabGroup buttons={firstGroupButtons}
                                      selectedButton={selectedButtonIndex}
                                      onButtonSelect={handleFirstGroupSelection}
                            />

                            <div className="flex items-center space-x-2">
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
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Add the QuestionnaireButton component */}
            <QuestionnaireButton surveyUrl="https://forms.gle/your-questionnaire-url-here" />
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