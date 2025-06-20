import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const About = () => {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "200% start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["200vw", "-200vw"]);

  return (
    <div className="relative w-full min-h-screen bg-white text-black p-8 md:p-16 lg:p-24 flex flex-col items-center justify-center">
      
      </div>
  );
};

export default About;
