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
    <>
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

      {/* Additional Image Track section converted from reference (draggable horizontal track) */}
      <ImageTrackSection />
    </>
  );
};

export default PhotoGallery;

function ImageTrackSection() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // initialize dataset and smoothing state
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = "0";
    track.dataset.percentage = "0";

    let isDown = false;
    let raf = null;
    let currentTranslate = 0; // px
    let targetTranslate = 0; // px
    let maxTranslatePx = 0;

    const imgs = Array.from(track.getElementsByClassName("image"));

    const recalcMax = () => {
      const vw = window.innerWidth;
      const trackWidth = track.scrollWidth;
      maxTranslatePx = Math.max(trackWidth - vw, 0);
    };

    recalcMax();
    const ro = new ResizeObserver(recalcMax);
    ro.observe(track);

    const lerp = (a, b, n) => a + (b - a) * n;

    const tick = () => {
      // smooth current -> target
      currentTranslate = lerp(currentTranslate, targetTranslate, 0.14);
      // if very close, snap to avoid micro-jitter
      if (Math.abs(currentTranslate - targetTranslate) < 0.05) currentTranslate = targetTranslate;

      track.style.transform = `translate(${currentTranslate}px, -50%)`;

      // compute progress 0..1 based on pixels
      const progress = maxTranslatePx <= 0 ? 0 : Math.abs(currentTranslate) / maxTranslatePx;
      const centeredIndex = progress * (imgs.length - 1);

      imgs.forEach((img, i) => {
        const distance = i - centeredIndex;
        const y = distance * 12; // softer vertical parallax for smoother feel
        const scale = 1 - Math.min(Math.abs(distance) * 0.055, 0.2);
        img.style.transform = `translateY(${y}px) scale(${scale})`;
      });

      raf = requestAnimationFrame(tick);
    };

    // start RAF
    raf = requestAnimationFrame(tick);

    const handleOnDown = (e) => {
      isDown = true;
      track.dataset.mouseDownAt = e.clientX.toString();
    };

    const handleOnUp = () => {
      isDown = false;
      track.dataset.mouseDownAt = "0";
      track.dataset.prevPercentage = track.dataset.percentage;
    };

    const handleOnMove = (e) => {
      if (!isDown) return;

      const mouseDownAt = parseFloat(track.dataset.mouseDownAt || "0");
      const mouseDelta = mouseDownAt - e.clientX;
      const maxDelta = window.innerWidth / 2;

      const percentage = (mouseDelta / maxDelta) * -100;
      const nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage || "0") + percentage;
      const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

      track.dataset.percentage = nextPercentage.toString();

      // compute pixel translation so we move exactly track.scrollWidth - viewportWidth
      const translatePx = (nextPercentage / 100) * maxTranslatePx; // negative or zero
      targetTranslate = translatePx;
    };

    const handleTouchStart = (ev) => handleOnDown(ev.touches[0]);
    const handleTouchEnd = (ev) => handleOnUp(ev.changedTouches[0]);
    const handleTouchMove = (ev) => handleOnMove(ev.touches[0]);

    window.addEventListener("mousedown", handleOnDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("mouseup", handleOnUp);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("mousemove", handleOnMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousedown", handleOnDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("mouseup", handleOnUp);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousemove", handleOnMove);
      window.removeEventListener("touchmove", handleTouchMove);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="image-track-wrap relative w-full h-screen overflow-hidden bg-black">
      <div
        id="image-track"
        ref={trackRef}
        data-mouse-down-at={0}
        data-prev-percentage={0}
        style={{ display: "flex", gap: "4vmin", position: "absolute", left: "50%", top: "50%", transform: "translate(0%, -50%)", userSelect: "none" }}
      >
        {imagesData.map((src, i) => (
          <img key={i} className="image" src={src} draggable="false" alt={`track-${i}`} style={{ width: "40vmin", height: "56vmin", objectFit: "cover", objectPosition: "100% center" }} />
        ))}
      </div>

      <a id="source-link" className="meta-link" href="https://camillemormal.com" target="_blank" rel="noreferrer" style={{ left: 10, bottom: 60 }}>
        <span style={{ marginRight: 8 }}>🔗</span>
        <span>Source</span>
      </a>

      <a id="yt-link" className="meta-link" href="https://youtu.be/PkADl0HubMY" target="_blank" rel="noreferrer" style={{ left: 10, bottom: 10 }}>
        <span style={{ marginRight: 8 }}>▶</span>
        <span>7 min tutorial</span>
      </a>

      <style jsx>{`
        .image-track-wrap { background-color: black; }
        .image { width: 40vmin; height: 56vmin; object-fit: cover; object-position: 100% center; }
        .meta-link { align-items: center; backdrop-filter: blur(3px); background-color: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; bottom: 10px; box-shadow: 2px 2px 2px rgba(0,0,0,0.1); cursor: pointer; display: inline-flex; gap: 5px; left: 10px; padding: 10px 20px; position: fixed; text-decoration: none; transition: background-color 400ms, border-color 400ms; z-index: 10000; color: white }
        .meta-link:hover { background-color: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.16); }
      `}</style>
    </section>
  );
}
