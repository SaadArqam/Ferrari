"use client";

import React, { useEffect, useRef, useState } from "react";
import { CircuitWrapper, SvgWrapper } from "./Circuit.styles";

const CircuitMap = () => {
  const pathRef = useRef(null);
  const rafRef = useRef(null);

  const [lec, setLec] = useState(null);
  const [ham, setHam] = useState(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const PLAYBACK_SPEED = 0.25; // 0.25x real speed (good default)


  /* ----------------------------------
     FETCH TELEMETRY (REAL DATA)
  ---------------------------------- */
  useEffect(() => {
    Promise.all([
      fetch(
        "http://localhost:8000/api/ferrari/lap-telemetry?year=2025&circuit=Abu%20Dhabi%20Grand%20Prix&driver=LEC"
      ).then((r) => r.json()),
      fetch(
        "http://localhost:8000/api/ferrari/lap-telemetry?year=2025&circuit=Abu%20Dhabi%20Grand%20Prix&driver=HAM"
      ).then((r) => r.json())
    ]).then(([lecData, hamData]) => {
      setLec(lecData);
      setHam(hamData);
      setIndex(0);
    });
  }, []);

  /* ----------------------------------
     ANIMATION LOOP
  ---------------------------------- */
useEffect(() => {
  if (!playing || !lec || !ham) return;

  const maxLen = Math.min(
    lec.samples.length,
    ham.samples.length
  );

  let lastTime = performance.now();

  const animate = (now) => {
    const delta = now - lastTime;
    lastTime = now;

    // How many samples to advance based on time
    const samplesPerSecond = 60 * PLAYBACK_SPEED;
    const advance = (delta / 1000) * samplesPerSecond;

    setIndex((i) => {
      const next = i + advance;
      return next >= maxLen - 1 ? maxLen - 1 : next;
    });

    rafRef.current = requestAnimationFrame(animate);
  };

  rafRef.current = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(rafRef.current);
}, [playing, lec, ham]);


  /* ----------------------------------
     PATH SAMPLING
  ---------------------------------- */
  const getPoint = (progress) => {
    if (!pathRef.current) return { x: 0, y: 0 };
    const total = pathRef.current.getTotalLength();
    return pathRef.current.getPointAtLength(
      Math.max(0, Math.min(1, progress)) * total
    );
  };

  /* ----------------------------------
     RENDER CAR + LABEL (NO OVERLAP)
  ---------------------------------- */
  const renderCar = (sample, color, label, side) => {
    if (!sample || !pathRef.current) return null;

    const p = sample.progress;
    const pt = getPoint(p);
    const ptAhead = getPoint(Math.min(1, p + 0.002));

    const dx = ptAhead.x - pt.x;
    const dy = ptAhead.y - pt.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    // Perpendicular normal
    const nx = (-dy / len) * side;
    const ny = (dx / len) * side;

    const LABEL_DISTANCE = 42;

    const lx = pt.x + nx * LABEL_DISTANCE;
    const ly = pt.y + ny * LABEL_DISTANCE;

    const speedNorm = Math.min(sample.speed / 330, 1);
    const r = 7 + speedNorm * 6;

    return (
      <g>
        {/* CAR DOT */}
        <circle
          cx={pt.x}
          cy={pt.y}
          r={r}
          fill={color}
          filter={`drop-shadow(0 0 14px ${color})`}
        />

        {/* LABEL BACKGROUND */}
        <rect
          x={lx - 22}
          y={ly - 14}
          width="44"
          height="22"
          rx="8"
          fill="#0c0c0c"
          stroke={color}
          strokeWidth="1.2"
        />

        {/* LABEL TEXT */}
        <text
          x={lx}
          y={ly + 2}
          fill={color}
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      </g>
    );
  };

  /* ----------------------------------
     RENDER
  ---------------------------------- */
  return (
    <CircuitWrapper>
      <SvgWrapper>
        <svg viewBox="0 0 1000 600">
          {/* CIRCUIT PATH (TEMP) */}
          <path
            ref={pathRef}
            d="
              M100 300
              C200 100, 400 100, 500 300
              S800 500, 900 300
              C800 100, 600 100, 500 300
              S200 500, 100 300
            "
            fill="none"
            stroke="#444"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* CARS */}
          {lec && renderCar(lec.samples[Math.floor(index)], "#E10600", "LEC", 1)}
          {ham && renderCar(ham.samples[Math.floor(index)], "#FFD700", "HAM", -1)}
        </svg>
      </SvgWrapper>

      {/* CONTROLS */}
      <div style={{ marginTop: "1.5rem", width: "100%" }}>
        <input
          type="range"
          min="0"
          max={lec ? lec.samples.length - 1 : 0}
          value={index}
          onChange={(e) => {
            setPlaying(false);
            setIndex(Number(e.target.value));
          }}
          style={{ width: "100%" }}
        />

        <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
          <button
            onClick={() => setPlaying((p) => !p)}
            style={{
              background: "#111",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: 8,
              padding: "0.5rem 1.2rem",
              cursor: "pointer"
            }}
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>
    </CircuitWrapper>
  );
};

export default CircuitMap;
