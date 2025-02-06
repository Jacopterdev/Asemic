function Header() {
    return (
        <header className="flex justify-between items-center px-5 py-3 bg-gray-800 text-white">
            {/* Left-aligned group */}
            <div className="flex items-center gap-3">
                {/* Burger Menu Button */}
                <button className="text-2xl text-white focus:outline-none">
                    &#9776;
                </button>

                {/* Small SVG Logo */}
                <div className="w-10 h-10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="50" r="40" className="text-secondary" />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-lg font-medium">Autotelic Mixed Initiative CST</h1>
            </div>

            {/* Placeholder for future right-aligned group */}
            <div className="flex items-center gap-3"></div>
        </header>
    );
}

export default Header;