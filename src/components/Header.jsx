import { useState } from "react";

function Header() {
    // State to manage menu visibility
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Function to toggle menu visibility
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            {/* Header */}
            <header className="flex justify-between items-center h-8 bg-gray-100 text-gray-800 drop-shadow-xs">
                {/* Left-aligned burger menu */}
                <div className="flex items-center gap-3 pl-4">
                    <div
                        onClick={toggleMenu}
                        className="focus:outline-none bg-gray-100 cursor-pointer text-sm text-gray-500"
                    >
                        &#9776;
                    </div>
                </div>

                {/* Center-aligned content using container */}
                <div className="container mx-auto flex items-center gap-3 px-6">
                    {/* Small SVG Logo */}
                    <div>
                        <img src="/S.svg" alt="S icon" className="h-5 w-5" />
                    </div>

                    {/* Title */}
                    <h1 className="text-lg font-medium text-gray-600 font-mono font-bold select-none">
                        ShapeLangGen
                    </h1>
                </div>

                {/* Placeholder for right-aligned group */}
                <div className="flex items-center gap-3 pr-6"></div>
            </header>

            {/* Off-Canvas Sliding Menu */}
            {isMenuOpen && (
                <div
                    className={` z-20 fixed w-1/13 top-0 left-0 h-full bg-gray-100 text-gray-800 shadow-lg transform transition-transform duration-300 ${
                        isMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className=" h-8 flex justify-end gap-3 pl-4">
                        <div
                            onClick={toggleMenu}
                            className="flex items-center bg-gray-100 cursor-pointer text-sm text-gray-500"
                        >
                            &#9776;
                        </div>
                    </div>

                    <div className="p-4">
                        <ul className="space-y-2">

                        </ul>
                        {/* Close Button */}

                    </div>
                </div>
            )}
        </>
    );
}

export default Header;