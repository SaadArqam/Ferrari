"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

const imagesData = [
  "/img/1.jpg",
  "/img/2.jpg",
  "/img/3.jpg",
  "/img/4.jpg",
  "/img/5.jpg",
  "/img/6.jpg",
  "/img/7.jpg",
  "/img/8.jpg",
  "/img/9.jpg",
  "/img/10.jpg",
];

const PhotoGallery = () => {
  const imagesRef = useRef([]);
  const globalIndex = useRef(0);
  const last = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const distanceFromLast = (x, y) => Math.hypot(x - last.current.x, y - last.current.y);

    const activate = (image, x, y) => {
      if (!image) return;
      image.style.left = `${x}px`;
      image.style.top = `${y}px`;
      image.style.zIndex = globalIndex.current;
      image.dataset.status = "active";
      image.style.display = "block";
      last.current = { x, y };
    };

    const handleOnMove = (e) => {
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      if (!x || !y) return;
      if (distanceFromLast(x, y) > window.innerWidth / 20) {
        const lead = imagesRef.current[globalIndex.current % imagesData.length];
        const tail = imagesRef.current[(globalIndex.current - 5 + imagesData.length) % imagesData.length];
        activate(lead, x, y);
        if (tail) {
          tail.dataset.status = "inactive";
          tail.style.display = "none";
        }
        globalIndex.current++;
      }
    };

    window.addEventListener("mousemove", handleOnMove);
    window.addEventListener("touchmove", handleOnMove);
    return () => {
      window.removeEventListener("mousemove", handleOnMove);
      window.removeEventListener("touchmove", handleOnMove);
    };
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 0.1, 0.12, 0.98] } }}
      className="relative w-full h-screen bg-[#090707] overflow-hidden"
    >
      {/* Left vertical collection title */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
        <div className="text-red-400 uppercase tracking-widest text-sm">Collection</div>
        <div className="mt-2 text-2xl md:text-3xl lg:text-4xl font-extrabold" style={{ fontFamily: "FerroRosso, serif" }}>
          Gallery
        </div>
      </div>

      {/* Quote */}
      <div className="absolute right-10 top-10 z-40 max-w-lg text-right text-gray-300 italic">
        "Built from passion. Driven by speed." — A curated selection of impulses that define Ferrari.
      </div>

  {/* Floating mouse-following train (pointer-events-none so it doesn't block clicks) */}
  <div className="pointer-events-none absolute inset-0 z-20">
        {imagesData.map((src, idx) => (
          <img
            key={idx}
            ref={(el) => (imagesRef.current[idx] = el)}
            className="image"
            data-index={idx}
            data-status="inactive"
            src={src}
            alt={`gallery-img-${idx}`}
            style={{
              width: "34vmin",
              position: "absolute",
              top: 0,
              left: 0,
              transform: "translate(-50%, -50%)",
              display: "none",
              borderRadius: 12,
              boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
              transition: "transform 180ms ease, opacity 220ms ease",
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>
    </motion.section>
  );
};

export default PhotoGallery;
