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
                        SLG
                    </h1>
                </div>

                {/* Placeholder for right-aligned group */}
                <div className="flex items-center gap-3 pr-6"></div>
            </header>

            {/* Off-Canvas Sliding Menu */}
            {isMenuOpen && (
                <div
                    className={`fixed top-0 left-0 w-64 h-full bg-gray-100 text-gray-800 shadow-lg transform transition-transform duration-300 ${
                        isMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="p-4">
                        <h2 className="text-lg font-bold mb-4">Menu</h2>
                        <ul className="space-y-2">
                            <li>
                                <a href="#home" className="block px-4 py-2 hover:bg-gray-200">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#about" className="block px-4 py-2 hover:bg-gray-200">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#contact" className="block px-4 py-2 hover:bg-gray-200">
                                    Contact
                                </a>
                            </li>
                        </ul>
                        {/* Close Button */}
                        <button
                            onClick={toggleMenu}
                            className="absolute top-3 right-3 text-2xl focus:outline-none"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Header;