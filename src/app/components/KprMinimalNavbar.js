"use client";

import React, { useState } from "react";

const navLinks = [
  { name: "PROJECT", href: "#project" },
  { name: "THE KEEP", href: "#keep" },
  { name: "FACTIONS", href: "#factions" },
  { name: "THE WORLD", href: "#world" },
];

// DecryptedText animation component
function DecryptedText({ text, onHover, onUnhover }) {
  const [display, setDisplay] = useState(text);
  const [hovered, setHovered] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let interval = null;

  const handleMouseEnter = () => {
    setHovered(true);
    let frame = 0;
    interval = setInterval(() => {
      setDisplay((prev) => {
        return text
          .split("")
          .map((char, i) => {
            if (i < frame) return text[i];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");
      });
      frame++;
      if (frame > text.length) {
        clearInterval(interval);
        setDisplay(text);
      }
    }, 60);
    if (onHover) onHover();
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setDisplay(text);
    if (interval) clearInterval(interval);
    if (onUnhover) onUnhover();
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: "pointer", transition: "opacity 0.15s" }}
    >
      {display}
    </span>
  );
}

export default function KprMinimalNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Shared audio ref
  const audioRef = React.useRef(null);

  // Pass play handler to DecryptedText
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 h-12 flex items-center justify-center"
      style={{ fontFamily: "monospace", letterSpacing: "1.5px" }}
    >
      {/* Top and bottom lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-white opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-white opacity-30 pointer-events-none" />

      {/* Hamburger */}
      {/* <button
        className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col justify-center items-center w-8 h-8 p-0 m-0 bg-transparent border-none outline-none"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Open Menu"
      >
        <span className="block w-6 h-0.5 bg-white mb-1" />
        <span className="block w-6 h-0.5 bg-white mb-1" />
        <span className="block w-6 h-0.5 bg-white" />
      </button> */}

      {/* Centered nav links */}
      <div className="flex space-x-10">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="text-white text-sm tracking-widest uppercase hover:opacity-80 transition-opacity duration-150"
            style={{ fontFamily: "monospace" }}
          >
            <DecryptedText
              text={link.name}
              onHover={playAudio}
              onUnhover={stopAudio}
            />
          </a>
        ))}
      </div>

      {/* Shared audio element */}
      <audio
        ref={audioRef}
        src="/audio/FX_text_animation_loop.mp3"
        preload="auto"
        style={{ display: "none" }}
      />
      {/* (Optional) Mobile menu overlay - not shown in screenshot, but can be added if needed */}
    </nav>
  );
}
