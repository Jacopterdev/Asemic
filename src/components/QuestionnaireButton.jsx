import React, { useState, useEffect, useRef } from 'react';

const QuestionnaireButton = ({ surveyUrl = 'https://forms.gle/your-questionnaire-url-here' }) => {
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
  
  // Handle CTA click
  const handleCTAClick = (e) => {
    e.stopPropagation();
    window.open(surveyUrl, '_blank');
  };
  
  return (
    <>
      {/* Button - shown when not expanded, using app's button style */}
      {!isExpanded && (
        <button 
          className={`fixed bottom-5 right-5 hover:bg-gray-200 bg-gray-300 text-gray-600 font-mono text-xs py-2 px-4 rounded shadow-md transition duration-100 ease-in-out z-50 ${
            isAnimating ? 'animate-wiggle' : ''
          }`}
          onClick={handleButtonClick}
          style={{ 
            transform: isAnimating ? `rotate(${Math.sin(Date.now() / 200) * 5}deg)` : 'none' 
          }}
        >
          Questionnaire
        </button>
      )}
      
      {/* Expanded form - now with much more vertical and horizontal margins */}
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
            
            <div className="px-16 mb-12"> {/* Added extra padding around the text and bottom margin */}
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                We would greatly appreciate if you could spare a few minutes to answer our questionnaire.
                <br/><br/>
                Your feedback will help us improve the application and is valuable for our research.
              </p>
            </div>
            
            <div className="flex justify-center mt-16 mb-8"> {/* Increased margin above and added margin below the button */}
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