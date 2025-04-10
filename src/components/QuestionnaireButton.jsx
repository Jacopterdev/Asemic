import React, { useState, useEffect, useRef } from 'react';
import LZString from 'lz-string'; // Import LZString for compression

const QuestionnaireButton = ({ surveyUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSeUxaou3uODsiHrIgCtEcSY-HPhAPNJ0CA8mYmOfTa83gO-Vw/viewform?usp=pp_url&entry.1428287968=33' }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const animationTimerRef = useRef(null);
  const expandTimerRef = useRef(null);
  
  // Animation settings
  const animationInterval = 120000; // 2 minutes
  const autoExpandTime = 600000; // 10 minutes
  
  useEffect(() => {
    // Set up animation timer - animate every 2 minutes
    const animationTimer = setTimeout(() => {
      if (!hasAnimated && !isExpanded) {
        setIsAnimating(true);
        setHasAnimated(true);
        
        // Reset animation after 2 seconds
        setTimeout(() => {
          setIsAnimating(false);
        }, 2000);
        
        // Reset hasAnimated flag after the full animation interval
        setTimeout(() => {
          setHasAnimated(false);
        }, animationInterval);
      }
    }, animationInterval);
    
    // Set up auto-expand timer - expand after 10 minutes
    const expandTimer = setTimeout(() => {
      if (!isExpanded) {
        setIsExpanded(true);
      }
    }, autoExpandTime);
    
    // Save refs for cleanup
    animationTimerRef.current = animationTimer;
    expandTimerRef.current = expandTimer;
    
    // Clean up timers on unmount
    return () => {
      clearTimeout(animationTimerRef.current);
      clearTimeout(expandTimerRef.current);
    };
  }, [hasAnimated, isExpanded, animationInterval, autoExpandTime]);
  
  // Handle button click
  const handleButtonClick = () => {
    setIsExpanded(true);
  };
  
  // Handle close click
  const handleCloseClick = (e) => {
    e.stopPropagation();
    setIsExpanded(false);
  };
  
  // Handle CTA click with URL length check
  const handleCTAClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the shape data URL directly from p5Instance
    let shapeURL = '';
    try {
      if (window.p5Instance && typeof window.p5Instance.getShapeLanguageURL === 'function') {
        shapeURL = window.p5Instance.getShapeLanguageURL();
        
        // Extract just the shape parameter
        const url = new URL(shapeURL);
        
        // Build the complete form URL with the shape data
        const formUrlBase = 'https://docs.google.com/forms/d/e/1FAIpQLSeUxaou3uODsiHrIgCtEcSY-HPhAPNJ0CA8mYmOfTa83gO-Vw/viewform?usp=pp_url&entry.1428287968=';
        
        // Check if the URL would be too long (7500 characters limit)
        const fullFormUrl = formUrlBase + url;
        
        if (fullFormUrl.length > 7500) {
          console.warn("URL too long for Google Forms, using fallback message");
          // Use a fallback message instead of the full URL
          const shortenedFormUrl = formUrlBase + encodeURIComponent("Please copy your design URL and paste it in your response");
          window.open(shortenedFormUrl, '_blank', 'noopener,noreferrer');
          
          // Also copy the current URL to clipboard for convenience
          navigator.clipboard.writeText(shapeURL).then(() => {
            console.log("Design URL copied to clipboard");
            alert("Your design URL is too complex for direct submission. It has been copied to your clipboard - please paste it into the form.");
          }).catch(err => {
            console.error("Failed to copy URL to clipboard:", err);
          });
        } else {
          // URL is within acceptable length, proceed normally
          console.log("Full form URL:", fullFormUrl);
          window.open(fullFormUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        console.warn("p5Instance or getShapeLanguageURL method not available");
        // Fallback to basic form URL
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSeUxaou3uODsiHrIgCtEcSY-HPhAPNJ0CA8mYmOfTa83gO-Vw/viewform', '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error("Error getting shape data URL:", error);
      // Fallback to basic form URL on error
      window.open('https://docs.google.com/forms/d/e/1FAIpQLSeUxaou3uODsiHrIgCtEcSY-HPhAPNJ0CA8mYmOfTa83gO-Vw/viewform', '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <>
      {/* Button - shown when not expanded */}
      {!isExpanded && (
        <button 
          className={`fixed bottom-5 right-5 hover:bg-blue-200 bg-blue-300 text-gray-600 font-mono text-xs py-2 px-4 rounded shadow-md transition duration-100 ease-in-out z-50`}
          onClick={handleButtonClick}
        >
          Answer Questionnaire
        </button>
      )}
      
      {/* Expanded form */}
      {isExpanded && (
        <div className="fixed bottom-10 right-10 w-full max-w-2xl bg-gray-100 text-gray-600 p-12 rounded shadow-lg z-50">
          <button 
            className="absolute top-4 right-4 hover:bg-gray-200 bg-gray-300 text-gray-600 font-mono text-xs p-1 rounded h-8 w-8 flex items-center justify-center"
            onClick={handleCloseClick}
          >
            ×
          </button>
          
          {/* Added extra margin at the top */}
          <div className="mt-8">
            <h3 className="text-xl font-mono mb-12 text-center">
              This is a student project
            </h3>
            
            <div className="px-16 mb-12">
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                We would greatly appreciate if you could spare a few minutes to answer our questionnaire.
                <br/><br/>
                Your feedback will help us improve the application and is valuable for our research.
              </p>
            </div>
            
            <div className="flex justify-center mt-16 mb-8">
              <button 
                className="hover:bg-orange-400 bg-orange-500 text-white text-xs font-mono py-3 px-8 rounded transition duration-100 ease-in-out"
                onClick={handleCTAClick}
              >
                Go to Questionnaire
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionnaireButton;