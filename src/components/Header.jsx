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
            <header className="flex justify-between items-center px-5 py-3 bg-gray-800 text-white">
                {/* Left-aligned group */}
                <div className="flex items-center gap-3">
                    {/* Burger Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="text-2xl text-white focus:outline-none"
                    >
                        &#9776;
                    </button>

                    {/* Small SVG Logo */}
                    <div className="w-10 h-10">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 100 100"
                            fill="currentColor"
                        >
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                className="text-secondary"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="text-lg font-medium">
                        Autotelic Mixed Initiative CST
                    </h1>
                </div>

                {/* Placeholder for right-aligned group */}
                <div className="flex items-center gap-3"></div>
            </header>

            {/* Off-Canvas Sliding Menu */}
            {isMenuOpen && (
                <div
                    className={`fixed top-0 left-0 w-64 h-full bg-gray-700 text-white shadow-lg transform transition-transform duration-300 ${
                        isMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="p-4">
                        <h2 className="text-lg font-bold mb-4">Menu</h2>
                        <ul className="space-y-2">
                            <li>
                                <a href="#home" className="block px-4 py-2 hover:bg-gray-600">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#about" className="block px-4 py-2 hover:bg-gray-600">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#contact" className="block px-4 py-2 hover:bg-gray-600">
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