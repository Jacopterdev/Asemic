import Header from "./components/Header";
import Button from "./components/Button";
import {IntervalSlider} from "./components/IntervalSlider.jsx";
import PriceRangeSlider from "./components/PriceRangeSlider.jsx";
import { useState } from "react";
import TweakpaneComponent from "./components/TweakpaneComponent.jsx";
import P5Wrapper from "./components/P5Wrapper"; // Import the wrapper
import defaultSketch from "./sketches/defaultSketch";
import TabsWithPanes from "./components/TabsWithPanes.jsx"; // Import your sketch




function App() {
    const [rangeValues, setRangeValues] = useState({ min: 0, max: 100 });

    /*const handleRangeChange = (values) => {
        setRangeValues(values);
    };*/
    const [smoothAmount, setSmoothAmount] = useState(4);

    const handleRangeChange = (values) => {
        console.log(values); // For debugging purposes
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
                    <div className="basis-1/4 bg-gray-200 shadow p-4 rounded">
                        <div className="space-y-2">
                            <TweakpaneComponent
                                smoothAmount={smoothAmount}
                                setSmoothAmount={setSmoothAmount}
                            />
                            <TabsWithPanes />
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-200 shadow p-4 rounded">
                        <div className="flex space-y-2">
                            <div className="button">grid</div>
                            <div className="button">xray</div>
                            <div className="button">xport</div>
                            <div className="button">seed</div>
                        </div>
                        <div className="flex space-y-2 bg-white">
                            {/* Render the p5.js sketch */}
                            <P5Wrapper sketch={defaultSketch} smoothAmount={smoothAmount} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;