// components/Footer.jsx
import {useEffect, useState, useRef} from 'react';

function Footer() {
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const modalRef = useRef(null);

    const toggleAbout = () => {
        setIsAboutOpen(!isAboutOpen);
    };

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setIsAboutOpen(false);
        }
    };

    useEffect(() => {
        if (isAboutOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAboutOpen]);


    return (
        <>
            <footer className="flex justify-between items-center h-12 bg-gray-50 text-gray-800">
                {/* Left-aligned placeholder (for symmetry with header) */}
                <div className="flex items-center gap-3 pl-4"></div>

                {/* Center-aligned content using container */}
                <div className="container mx-auto flex items-center justify-between gap-3 px-6">
                    {/* About button on the left side of container, matching header's logo positioning */}
                    <div className="flex items-center gap-3">
                        <span
                            onClick={toggleAbout}
                            className="about-link"
                        >
                            About
                        </span>
                    </div>

                    {/* Copyright in center */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 font-light select-none">
                            © 2025 | Asemic Form Language Generator
                        </span>
                    </div>

                    {/* Empty space on right for balance */}
                    <div className="flex items-center gap-3">
                        <span
                            onClick={toggleAbout}
                            className="about-link"
                        >
                            Contact
                        </span>
                    </div>
                </div>

                {/* Right-aligned placeholder (for symmetry with header) */}
                <div className="flex items-center gap-3 pr-6"></div>
            </footer>

            {/* About Modal */}
            {isAboutOpen && (
                <div className="about-container">
                    <div
                        ref={modalRef}
                        className="about-container-inner bg-gray-100 rounded-lg shadow-md p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto p-4"
                    >
                        <div className="flex justify-between items-center p-1">
                            <h2 className="text-light text-lg font-mono mb-1 text-gray-600">About</h2>
                        </div>

                        <div className="space-y-4 text-gray-600">

                            <p>
                                <i> Asemic </i> creates visual form languages,
                                allowing you to generate and customize unique symbolic systems.
                            </p>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="about-title">Contact</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* First column */}
                                    <div className="space-y-1">
                                        <p className="font-medium">Jakob H. Pedersen</p>
                                        <p>
                                            <a href="mailto:jakobhp@live.dk"
                                               className="text-blue-500 hover:underline text-sm">
                                                jakobhp@live.dk
                                            </a>
                                        </p>
                                        <p>
                                            <a href="https://instagram.com/jakobhpedersen/" target="_blank"
                                               rel="noopener noreferrer"
                                               className="text-blue-500 hover:underline text-sm">
                                                Instagram
                                            </a>
                                        </p>
                                    </div>

                                    {/* Second column */}
                                    <div className="space-y-1">
                                        <p className="font-medium">Anton H. Mortensen</p>
                                        <p>
                                            <a href="mailto:john@example.com"
                                               className="text-blue-500 hover:underline text-sm">
                                                john@example.com
                                            </a>
                                        </p>
                                        <p>
                                            <a href="https://instagram.com/johnsmith" target="_blank"
                                               rel="noopener noreferrer"
                                               className="text-blue-500 hover:underline text-sm">
                                                @johnsmith
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="about-title">About the Project</h4>
                                <p>
                                    The project explores procedural generation for 2D <i>form languages</i>: The
                                    stylistic expression and coherence of shapes.
                                    The tool examines how to deepen and enrich human agency in a generative, artistic
                                    context, balancing between human and computer initiative.
                                    The tool allows you to create your own visual language systems that can be
                                    used for artistic, design, or conceptual purposes.
                                </p>
                                <p className="mt-4">
                                    Created by Anton H. Mortensen & Jakob H. Pedersen for our Master Thesis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Footer;