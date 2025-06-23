import React, { useEffect, useRef, useState } from "react";
import "./card.css";
import PhotoGallery from "./photoGallery";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function Card() {
  const scuderiaRef = useRef(null);
  const ferrariRef = useRef(null);
  const screenRef = useRef(null);
  const audioRef = useRef(null);
  let interval = useRef(null);

  // State to hold the animated text for each line
  const [scuderiaText, setScuderiaText] = useState("Scuderia");
  const [ferrariText, setFerrariText] = useState("Ferrari");

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;

    const handleMouseEnter = () => {
      // Play audio
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      let iteration = 0;
      clearInterval(interval.current);
      interval.current = setInterval(() => {
        setScuderiaText((prev) =>
          "Scuderia"
            .split("")
            .map((letter, index) => {
              if (index < iteration) {
                return "Scuderia"[index];
              }
              return letters[Math.floor(Math.random() * 26)];
            })
            .join("")
        );
        setFerrariText((prev) =>
          "Ferrari"
            .split("")
            .map((letter, index) => {
              if (index < iteration) {
                return "Ferrari"[index];
              }
              return letters[Math.floor(Math.random() * 26)];
            })
            .join("")
        );
        if (iteration >= 8 && iteration >= 7) {
          clearInterval(interval.current);
        }
        iteration += 1 / 3;
      }, 30);
    };

    const handleMouseLeave = () => {
      clearInterval(interval.current);
      setScuderiaText("Scuderia");
      setFerrariText("Ferrari");
      // Stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };

    screen.addEventListener("mouseenter", handleMouseEnter);
    screen.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      screen.removeEventListener("mouseenter", handleMouseEnter);
      screen.removeEventListener("mouseleave", handleMouseLeave);
      clearInterval(interval.current);
    };
  }, []);

  return (
    <>
      <div className="screen" ref={screenRef}>
        <div className="screen-image"></div>
        <div className="screen-overlay"></div>
        <div className="screen-content">
          <i className="screen-icon fa-brands fa-codepen"></i>
          <div className="screen-user">
            <span
              className="name card-anim-line"
              data-value="Scuderia"
              ref={scuderiaRef}
              style={{ display: "block", lineHeight: 1.1, minHeight: "1em" }}
            >
              {scuderiaText}
            </span>
            <span
              className="name card-anim-line"
              data-value="Ferrari"
              ref={ferrariRef}
              style={{ display: "block", lineHeight: 1.1, minHeight: "1em" }}
            >
              {ferrariText}
            </span>
          </div>
        </div>
        <audio
          ref={audioRef}
          src="/audio/FX_text_animation_loop.mp3"
          preload="auto"
          style={{ display: "none" }}
        />
      </div>
      <div id="blur"></div>
    </>
  );
}
