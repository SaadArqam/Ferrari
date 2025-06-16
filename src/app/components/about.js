import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const About = () => {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    // Animation starts when element enters from bottom, ends when it's well past the top
    offset: ["start end", "200% start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["200vw", "-200vw"]); // Text starts off-screen right and moves to off-screen left

  return (
    <div className="py-10 sm:py-16 md:py-20 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#DC0000] mb-4 sm:mb-6 font-bold text-center sm:text-left">
          About Ferrari
        </h2>
        <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed text-center sm:text-left">
          Ferrari S.p.A. is an Italian luxury sports car manufacturer based in
          Maranello, Italy. Founded by Enzo Ferrari in 1947, the company built
          its first car bearing the Ferrari name in 1947. Ferrari is known for
          its participation in racing, especially in Formula One, where it is
          the oldest and most successful racing team.
        </p>
      </div>

      {/* Animated Quote Section */}
      <div
        ref={scrollRef}
        className="relative w-full h-[400px] mt-16 overflow-hidden flex items-center justify-center"
      >
        <motion.h3
          style={{ x, fontFamily: "FerroRosso" }}
          className="font-coign text-[clamp(50px,_9vw,_180px)] font-bold uppercase text-black px-4 text-center whitespace-nowrap"
        >
          It&apos;s more about hard work than talent
        </motion.h3>
      </div>
    </div>
  );
};

export default About;
