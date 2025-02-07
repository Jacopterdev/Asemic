import Header from "./components/Header";
import Button from "./components/Button";
import {IntervalSlider} from "./components/IntervalSlider.jsx";
import PriceRangeSlider from "./components/PriceRangeSlider.jsx";
import { useState } from "react";



function App() {
    const [rangeValues, setRangeValues] = useState({ min: 0, max: 100 });

    const handleRangeChange = (values) => {
        setRangeValues(values);
    };
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <header className="bg-gray-50 text-gray-800 p-4 text-center">
                <Header/>
            </header>

            {/* Main Content Section */}
            <main className="p-6">
                <div className="flex justify-between gap-4">
                    <div className="flex-1 bg-gray-200 shadow p-4 rounded">
                        <h2 className="text-lg font-bold mb-4 text-gray-600">Buttons</h2>
                        <div className="space-y-2">
                            <Button onClick={() => alert("Button 1 clicked!")}>Button 1</Button>
                            <Button onClick={() => alert("Button 2 clicked!")}>Button 2</Button>
                            <Button onClick={() => alert("Button 3 clicked!")}>Button 3</Button>
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-200 shadow p-4 rounded">
                        <h2 className="text-lg font-bold mb-4 text-gray-600">Second Column</h2>
                        <p>This is the second column. Add your content here.</p>
                        <PriceRangeSlider
                            min={1}
                            max={10}
                            onChange={handleRangeChange}
                        />
                    </div>

                    <div className="flex-1 bg-gray-200 shadow p-4 rounded">
                        <h2 className="text-lg font-bold mb-4 text-gray-600">Third Column</h2>
                        <p>This is the third column. Add your content here.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
export default App;