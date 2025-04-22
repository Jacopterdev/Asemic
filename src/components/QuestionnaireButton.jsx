import React, { useState, useEffect, useRef } from 'react';
import LZString from 'lz-string'; // Import LZString for compression

const QuestionnaireButton = ({ surveyUrl = '' }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const animationTimerRef = useRef(null);
  const expandTimerRef = useRef(null);

  const [hasColorChanged, setHasColorChanged] = useState(false);
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);

  const colorChangeTimerRef = useRef(null);


  // Animation settings
  const animationInterval = 120000; // 2 minutes
  const autoExpandTime = 120000; // 2 minutes

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

    const colorChangeTimer = setTimeout(() => {
      setHasColorChanged(true);
    }, autoExpandTime);

    // Set up auto-expand timer
    const expandTimer = setTimeout(() => {
      if (!isExpanded && !hasAutoExpanded) {  // Only expand if it hasn't auto-expanded before
        setIsExpanded(true);
        setHasAutoExpanded(true);  // Mark that it has auto-expanded
      }
    }, autoExpandTime);

    // Save refs for cleanup
    animationTimerRef.current = animationTimer;
    expandTimerRef.current = expandTimer;
    colorChangeTimerRef.current = colorChangeTimer;

    // Clean up timers on unmount
    return () => {
      clearTimeout(animationTimerRef.current);
      clearTimeout(expandTimerRef.current);
      clearTimeout(colorChangeTimerRef.current);
    };
  }, [hasAnimated, isExpanded, hasAutoExpanded, animationInterval, autoExpandTime]);


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
    let surveyURL = 'https://forms.gle/tt1au8ianosCJJzM9';
    // Open survey in a new tab
    window.open(surveyURL);

  };
  
  return (
    <>
      {/* Button - shown when not expanded */}
      {!isExpanded && (
        <button
            className={`fixed bottom-5 right-5 font-mono text-xs py-2 px-4 rounded shadow-md transition duration-100 ease-in-out z-50 ${
                hasColorChanged ? 'questionaire-button' : 'questionaire-button-pre'
            }`}
            onClick={handleButtonClick}
        >
          Answer Questionnaire
        </button>
      )}
      
      {/* Expanded form */}
      {isExpanded && (
        <div className="select-none fixed bottom-10 right-10 w-full max-w-2xl bg-gray-100 text-gray-600 p-12 rounded shadow-lg z-50 p-8">
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
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                We would greatly appreciate if you could spare a few minutes to answer our questionnaire.
                <br/><br/>
                Your feedback is valuable for our research.
              </p>
            </div>
            
            <div className="flex justify-center mt-16 mb-8">
              <button 
                className="questionaire-button"
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