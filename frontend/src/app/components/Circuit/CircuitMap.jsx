"use client";

import React, { useEffect, useRef, useState } from "react";
import { CircuitWrapper, SvgWrapper } from "./Circuit.styles";

const ABU_DHABI_PATH = `
M160 320
C180 220 260 160 360 160
C460 160 540 220 560 280
C580 340 620 380 700 400
C820 430 860 500 820 540
C780 580 700 560 660 520
C620 480 560 480 520 520
C480 560 400 560 340 520
C260 460 260 380 300 340
C340 300 360 260 340 220
C300 160 220 200 160 260
C120 300 120 340 160 320
`;

const CircuitMap = () => {
  const pathRef = useRef(null);
  const rafRef = useRef(null);

  const [lec, setLec] = useState(null);
  const [ham, setHam] = useState(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const PLAYBACK_SPEED = 0.2; // slower = more realistic

  /* ---------------- FETCH TELEMETRY ---------------- */
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/api/ferrari/lap-telemetry?year=2025&circuit=Abu%20Dhabi%20Grand%20Prix&driver=LEC").then(r => r.json()),
      fetch("http://localhost:8000/api/ferrari/lap-telemetry?year=2025&circuit=Abu%20Dhabi%20Grand%20Prix&driver=HAM").then(r => r.json())
    ]).then(([lecData, hamData]) => {
      setLec(lecData);
      setHam(hamData);
      setIndex(0);
    });
  }, []);

  /* ---------------- ANIMATION LOOP ---------------- */
  useEffect(() => {
    if (!playing || !lec || !ham) return;

    const maxLen = Math.min(lec.samples.length, ham.samples.length);
    let last = performance.now();

    const animate = (now) => {
      const delta = now - last;
      last = now;

      const advance = (delta / 1000) * 60 * PLAYBACK_SPEED;

      setIndex(i => Math.min(i + advance, maxLen - 1));
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, lec, ham]);

  /* ---------------- PATH SAMPLING ---------------- */
  const getPoint = (p) => {
    if (!pathRef.current) return { x: 0, y: 0 };
    const len = pathRef.current.getTotalLength();
    return pathRef.current.getPointAtLength(p * len);
  };

  /* ---------------- CAR + LABEL ---------------- */
  const renderCar = (sample, color, label, side) => {
    if (!sample) return null;

    const pt = getPoint(sample.progress);
    const ahead = getPoint(Math.min(1, sample.progress + 0.002));

    const dx = ahead.x - pt.x;
    const dy = ahead.y - pt.y;
    const mag = Math.hypot(dx, dy) || 1;

    const nx = (-dy / mag) * side;
    const ny = (dx / mag) * side;

    const lx = pt.x + nx * 36;
    const ly = pt.y + ny * 36;

    return (
      <g>
        <circle cx={pt.x} cy={pt.y} r={8} fill={color} />
        <rect x={lx - 22} y={ly - 14} width="44" height="22" rx="6" fill="#111" stroke={color} />
        <text x={lx} y={ly + 1} fill={color} fontSize="12" fontWeight="700" textAnchor="middle">
          {label}
        </text>
      </g>
    );
  };

  /* ---------------- RENDER ---------------- */
  return (
    <CircuitWrapper>
      <SvgWrapper>
        <svg viewBox="0 0 1000 600">
          <path
            ref={pathRef}
            d={ABU_DHABI_PATH}
            fill="none"
            stroke="#555"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {lec && renderCar(lec.samples[Math.floor(index)], "#E10600", "LEC", 1)}
          {ham && renderCar(ham.samples[Math.floor(index)], "#FFD700", "HAM", -1)}
        </svg>
      </SvgWrapper>

      <input
        type="range"
        min="0"
        max={lec ? lec.samples.length - 1 : 0}
        value={index}
        onChange={(e) => {
          setPlaying(false);
          setIndex(Number(e.target.value));
        }}
        style={{ width: "100%", marginTop: "1rem" }}
      />

      <button onClick={() => setPlaying(p => !p)} style={{ marginTop: "0.75rem" }}>
        {playing ? "Pause" : "Play"}
      </button>
    </CircuitWrapper>
  );
};

export default CircuitMap;
