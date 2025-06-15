// components/LoadingAnimation.js
"use client";

import { useState, useEffect } from "react";

// Add font-face declaration
const fontStyle = `
  @font-face {
    font-family: 'FerroRosso';
    src: url('/fonts/FerroRosso.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;

const LoadingAnimation = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2500);

    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#DC0000] flex flex-col items-center justify-center overflow-hidden">
      <style>{fontStyle}</style>
      {/* Loading line container */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 transform -translate-y-1/2">
        <div
          className="h-full bg-white shadow-lg shadow-white/50 transition-all duration-100 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {/* F1 Car Icon */}
          <div
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center"
            style={{ marginRight: "-8px" }}
          >
            {/* Loading Image Icon */}
            <img
              src="/img/racing-car.png"
              alt="Loading Icon"
              className="w-full h-full object-contain transform translate-y-[2px]"
            />
          </div>
        </div>
      </div>

      {/* Progress text */}
      <div
        className="absolute bottom-1/3 text-white text-5xl font-bold tracking-wider"
        style={{ fontFamily: "FerroRosso" }}
      >
        {progress}%
      </div>

      {/* Ferrari branding text (optional) */}
      {/* <div className="absolute top-1/3 text-white text-4xl font-bold tracking-widest opacity-20">
        FERRARI
      </div> */}
    </div>
  );
};

export default LoadingAnimation;
