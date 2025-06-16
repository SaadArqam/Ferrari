"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const fontStyle = `
  @font-face {
    font-family: 'CoignText';
    src: url('/fonts/CoignPro-47Bold.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;

const ScrollPinnedTextAnimation = ({
  backgroundImage = "/img/ferrari.jpg",
  text = "FERRARI EXCELLENCE",
  textColor = "#ffffff",
  overlayOpacity = 0.4,
}) => {
  const containerRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(0);

  // Set up scroll-linked animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Transform the text position based on scroll progress
  // Text enters from right and exits to left during the first 50% of scroll
  const textX = useTransform(
    scrollYProgress,
    [0, 0.5, 1], // Spread text animation over entire scroll progress
    [windowWidth * 1.5, 0, -windowWidth * 1.5] // Start from extreme right, move to center, then to extreme left
  );

  // Control the pinning effect - 1 means pinned, 0 means unpinned
  // We want to keep the section pinned during the text animation (first 50% of scroll)
  const pinProgress = useTransform(
    scrollYProgress,
    [0, 0.9, 1], // Pin for most of the scroll, then unpin at the very end
    [1, 1, 0]
  );

  // Measure window width on mount and resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize(); // Initial measurement
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[200vh]" // Double height to allow for scrolling
    >
      {/* Sticky container that will be pinned/unpinned based on scroll */}
      <motion.div
        className="sticky top-0 w-full h-screen overflow-hidden"
        style={{
          opacity: pinProgress, // Fade out as we unpin
          zIndex: 10, // Ensure this is above other content when pinned
        }}
      >
        {/* Background image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={backgroundImage}
            alt="Background"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          ></div>
        </div>

        {/* Text that moves horizontally */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ x: textX }}
        >
          <style>{fontStyle}</style>
          <h2
            className="text-[clamp(150px,_25vw,_600px)] font-black uppercase tracking-normal whitespace-nowrap"
            style={{
              color: textColor,
              fontFamily: "CoignText",
              wordSpacing: "0.1em",
            }}
          >
            {text}
          </h2>
        </motion.div>
      </motion.div>

      {/* This empty space allows scrolling to continue after the pinned section */}
      <div className="h-screen"></div>
    </div>
  );
};

export default ScrollPinnedTextAnimation;
