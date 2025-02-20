import Header from "./components/Header";
import Button from "./components/Button";
import {IntervalSlider} from "./components/IntervalSlider.jsx";
import PriceRangeSlider from "./components/PriceRangeSlider.jsx";
import { useState } from "react";
import TweakpaneComponent from "./components/TweakpaneComponent.jsx";
import P5Wrapper from "./components/P5Wrapper"; // Import the wrapper
import defaultSketch from "./sketches/defaultSketch";
import TabsWithPanes from "./components/TabsWithPanes.jsx";
import ButtonGroup from "./components/ButtonGroup.jsx"; // Import your sketch




function App() {

    const [params, setParams] = useState({
        missArea: 10,
        numberOfLines: 15,
        smoothAmount: 5,
        lineWidth: 2,
        lineType: 'straight',
        lineComposition: 'Branched',
    });
    console.log(params);

    const [subShapeParams, setSubShapeParams] = useState({});

    const handleSetParams = (updatedParams) => {
        setSubShapeParams(updatedParams);
        console.log(subShapeParams);
    };


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <header className="bg-gray-50 text-gray-800 p-4 text-center mx-auto">
                <Header />
            </header>

            {/* Main Content Section */}
            <main className="container mx-auto p-6">
                <div className="flex justify-between gap-4">
                    <div className="basis-1/4 bg-gray-200 shadow p-4 rounded w-full overflow-hidden">
                        <div className="space-y-2">
                            <TweakpaneComponent
                                defaultParams={params} setParams={setParams} />
                            <TabsWithPanes
                                subShapeParams={subShapeParams}
                                setParams={handleSetParams}
                            />
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-200 shadow p-4 rounded">
                        <div className="flex justify-between items-center">
                            <ButtonGroup />

                            <div className="flex items-center space-x-4">
                                <div className="button">Grid Type</div>
                                <div className="button">Export</div>
                            </div>
                        </div>
                        <div className="flex space-y-2 bg-white">
                            {/* Render the p5.js sketch */}
                            <P5Wrapper sketch={defaultSketch} smoothAmount={params.smoothAmount} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;