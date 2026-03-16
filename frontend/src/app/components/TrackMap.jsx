
"use client";

import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";

const CANVAS_SIZE = 800;
const PADDING = 40;

const SPEED_MULTIPLIERS = [1, 2, 4];

// Given speed (0–1 normalized), interpolate Red → Yellow → Green
function speedToColor(t) {
  if (t < 0.5) {
    const g = Math.floor(t * 2 * 255);
    return `rgb(255, ${g}, 0)`;
  } else {
    const r = Math.floor((1 - (t - 0.5) * 2) * 255);
    return `rgb(${r}, 255, 0)`;
  }
}

const TrackMap = ({ telemetry }) => {
  const canvasRef = useRef(null);

  // Animation state stored in refs to avoid re-render overhead inside rAF loop
  const rafRef = useRef(null);
  const frameIndexRef = useRef(0);
  const lastTimestampRef = useRef(null);
  const isPlayingRef = useRef(false);

  // React-driven UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [speedMult, setSpeedMult] = useState(1);
  const speedMultRef = useRef(1);

  // Keep ref in sync with state
  useEffect(() => { speedMultRef.current = speedMult; }, [speedMult]);

  // ─── 1. Normalize telemetry into canvas space ────────────────────────────
  const { pointsData, maxSpeed, minSpeed } = useMemo(() => {
    if (!telemetry || telemetry.length === 0)
      return { pointsData: [], maxSpeed: 0, minSpeed: 0 };

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let maxSpeedVal = -Infinity, minSpeedVal = Infinity;

    for (const p of telemetry) {
      if (p.X < minX) minX = p.X;
      if (p.X > maxX) maxX = p.X;
      if (p.Y < minY) minY = p.Y;
      if (p.Y > maxY) maxY = p.Y;
      if (p.speed > maxSpeedVal) maxSpeedVal = p.speed;
      if (p.speed < minSpeedVal) minSpeedVal = p.speed;
    }

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const maxRange = Math.max(maxX - minX, maxY - minY) || 1;
    const scale = (CANVAS_SIZE - PADDING * 2) / maxRange;

    return {
      maxSpeed: maxSpeedVal,
      minSpeed: minSpeedVal,
      pointsData: telemetry.map((p) => ({
        x: CANVAS_SIZE / 2 + (p.X - midX) * scale,
        y: CANVAS_SIZE / 2 - (p.Y - midY) * scale,
        speed: p.speed,
        throttle: p.throttle ?? 0,
        brake: p.brake ?? 0,
        gear: p.gear ?? 0,
        time: p.time,
      })),
    };
  }, [telemetry]);

  // ─── 2. Draw static track (backdrop) ────────────────────────────────────
  const drawTrack = useCallback((ctx) => {
    if (pointsData.length === 0) return;
    const speedRange = maxSpeed - minSpeed || 1;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // ── Layer 1: Dark tarmac base (gives the racing line something to sit on)
    ctx.beginPath();
    ctx.moveTo(pointsData[0].x, pointsData[0].y);
    for (let i = 1; i < pointsData.length; i++) ctx.lineTo(pointsData[i].x, pointsData[i].y);
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 28;
    ctx.shadowBlur = 0;
    ctx.stroke();

    // ── Layer 2: Wide diffuse outer glow
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 18;
    ctx.shadowBlur = 24;
    ctx.shadowColor = "rgba(200,200,255,0.3)";
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ── Layer 3: Tight inner glow
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 10;
    ctx.stroke();

    // ── Layer 4: Speed-gradient racing line
    // Use createLinearGradient between each pair of adjacent points
    // so colour transitions are perfectly smooth rather than hard-edged.
    for (let i = 0; i < pointsData.length - 1; i++) {
      const p1 = pointsData[i];
      const p2 = pointsData[i + 1];

      // Skip teleport gaps (start/finish line wrap-around artefacts)
      const d2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
      if (d2 > 10000) continue;

      const t1 = (p1.speed - minSpeed) / speedRange;
      const t2 = (p2.speed - minSpeed) / speedRange;

      const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      grad.addColorStop(0, speedToColor(t1));
      grad.addColorStop(1, speedToColor(t2));

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 6;

      // Subtle per-segment glow matching the speed colour for extra pop
      ctx.shadowBlur = 6;
      ctx.shadowColor = speedToColor(t1);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }, [pointsData, maxSpeed, minSpeed]);


  // ─── 3. Draw car marker at a given frame index ──────────────────────────
  const drawCar = useCallback((ctx, idx) => {
    if (pointsData.length === 0) return;
    const p = pointsData[idx];
    const prev = pointsData[Math.max(idx - 1, 0)];

    const angle = Math.atan2(p.y - prev.y, p.x - prev.x);

    // Halo
    ctx.beginPath();
    ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(220, 0, 0, 0.25)";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#DC0000";
    ctx.fill();

    // Car dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#DC0000";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ff4444";
    ctx.fill();

    // Direction triangle
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-6, -5);
    ctx.lineTo(-6, 5);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.restore();

    ctx.shadowBlur = 0;
  }, [pointsData]);

  // ─── 4. Full redraw (track + car) ────────────────────────────────────────
  const redraw = useCallback((idx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawTrack(ctx);
    drawCar(ctx, idx);
  }, [drawTrack, drawCar]);

  // ─── 5. requestAnimationFrame loop ──────────────────────────────────────
  const animate = useCallback((timestamp) => {
    if (!isPlayingRef.current) return;

    if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
    const elapsed = (timestamp - lastTimestampRef.current) * speedMultRef.current;
    lastTimestampRef.current = timestamp;

    // pointsData is sampled at ~50ms intervals typically (FastF1 telemetry ~18Hz)
    // elapsed is real ms → advance proportionally
    const step = Math.max(1, Math.round(elapsed / 20));
    let nextIdx = frameIndexRef.current + step;

    if (nextIdx >= pointsData.length - 1) {
      nextIdx = pointsData.length - 1;
      isPlayingRef.current = false;
      setIsPlaying(false);
    }

    frameIndexRef.current = nextIdx;
    setFrameIndex(nextIdx);
    redraw(nextIdx);

    if (isPlayingRef.current) {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [pointsData.length, redraw]);

  // ─── Controls ────────────────────────────────────────────────────────────
  const play = useCallback(() => {
    if (frameIndexRef.current >= pointsData.length - 1) {
      frameIndexRef.current = 0;
      setFrameIndex(0);
    }
    isPlayingRef.current = true;
    lastTimestampRef.current = null;
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate, pointsData.length]);

  const pause = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const restart = useCallback(() => {
    pause();
    frameIndexRef.current = 0;
    setFrameIndex(0);
    redraw(0);
    // Brief delay then auto play
    setTimeout(() => play(), 50);
  }, [pause, play, redraw]);

  // ─── Draw static track immediately on data load ──────────────────────────
  useEffect(() => {
    if (pointsData.length === 0) return;
    // Stop any running animation when telemetry changes
    isPlayingRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    frameIndexRef.current = 0;
    setFrameIndex(0);
    setIsPlaying(false);
    redraw(0);
  }, [pointsData, redraw]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!telemetry || telemetry.length === 0) return null;

  const progress = pointsData.length > 0 ? Math.round((frameIndex / (pointsData.length - 1)) * 100) : 0;
  const currentSpeed = pointsData[frameIndex]?.speed ?? 0;

  return (
    <div className="w-full flex flex-col items-center gap-6 p-4">
      {/* Canvas */}
      <div className="w-full max-w-[800px] aspect-square relative bg-zinc-950/50 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden backdrop-blur-sm">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-full object-contain"
        />

        {/* Live speed badge */}
        <div className="absolute top-4 right-4 bg-zinc-900/90 border border-zinc-700 rounded-xl px-4 py-2 font-mono text-sm backdrop-blur-md">
          <span className="text-zinc-400 text-xs uppercase tracking-wider block mb-0.5">Speed</span>
          <span className="text-white text-lg font-bold">{Math.round(currentSpeed)}</span>
          <span className="text-zinc-500 text-xs ml-1">km/h</span>
        </div>

        {/* Progress badge */}
        <div className="absolute top-4 left-4 bg-zinc-900/90 border border-zinc-700 rounded-xl px-4 py-2 font-mono text-sm backdrop-blur-md">
          <span className="text-zinc-400 text-xs uppercase tracking-wider block mb-0.5">Progress</span>
          <span className="text-white text-lg font-bold">{progress}</span>
          <span className="text-zinc-500 text-xs ml-1">%</span>
        </div>

        {/* Speed legend */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-mono font-semibold uppercase bg-zinc-900/80 px-4 py-3 rounded-xl border border-zinc-800 backdrop-blur-md">
          <div className="flex items-center gap-2 text-red-500">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            {Math.round(minSpeed)} km/h
          </div>
          <div className="flex-1 max-w-[180px] mx-4 h-1.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
          <div className="flex items-center gap-2 text-green-500">
            {Math.round(maxSpeed)} km/h
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[800px] h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="w-full max-w-[800px] flex items-center justify-between gap-4 flex-wrap">
        {/* Play / Pause / Restart */}
        <div className="flex items-center gap-3">
          <button
            onClick={isPlaying ? pause : play}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-red-600/30 uppercase tracking-wider text-sm"
          >
            {isPlaying ? (
              /* Pause icon */
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              /* Play icon */
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={restart}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-bold py-2.5 px-5 rounded-xl transition-all border border-zinc-700 text-sm"
          >
            {/* Restart icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5" />
            </svg>
            Restart
          </button>
        </div>

        {/* Speed multiplier */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider mr-1">Speed</span>
          {SPEED_MULTIPLIERS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeedMult(s)}
              className={`w-12 h-9 rounded-lg font-mono font-bold text-sm transition-all border ${
                speedMult === s
                  ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* ── Live Telemetry Panel ─────────────────────────────────────── */}
      {(() => {
        const frame = pointsData[frameIndex] ?? {};
        const spd     = Math.round(frame.speed    ?? 0);
        const thr     = Math.round(frame.throttle ?? 0);
        const brk     = frame.brake > 0;
        const gear    = frame.gear ?? 0;
        const speedPct = maxSpeed > 0 ? (spd / maxSpeed) * 100 : 0;

        const gearColors = ["", "#6ee7b7","#34d399","#10b981","#059669","#047857","#065f46","#064e3b","#022c22"];
        const gearColor  = gearColors[Math.min(gear, gearColors.length - 1)] || "#34d399";

        return (
          <div className="w-full max-w-[800px] grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* Speed Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Speed</span>
                <span className="text-[10px] font-mono text-zinc-600">km/h</span>
              </div>
              <span className="text-3xl font-black text-white font-mono tabular-nums leading-none">{spd}</span>
              {/* Speed bar */}
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-none"
                  style={{
                    width: `${speedPct}%`,
                    background: `linear-gradient(to right, #ef4444, #eab308, #22c55e)`,
                  }}
                />
              </div>
            </div>

            {/* Throttle Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Throttle</span>
                <span className="text-[10px] font-mono text-zinc-600">%</span>
              </div>
              <span className="text-3xl font-black font-mono tabular-nums leading-none" style={{ color: thr > 50 ? "#22c55e" : "#facc15" }}>
                {thr}
              </span>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-none"
                  style={{ width: `${thr}%`, background: "#22c55e" }}
                />
              </div>
            </div>

            {/* Brake Card */}
            <div className={`border rounded-2xl p-4 flex flex-col gap-3 transition-colors duration-100 ${
              brk ? "bg-red-950/60 border-red-700" : "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Brake</span>
                {brk && (
                  <span className="text-[10px] font-mono bg-red-600 text-white px-1.5 py-0.5 rounded-md uppercase">ON</span>
                )}
              </div>
              <span className={`text-3xl font-black font-mono tabular-nums leading-none ${brk ? "text-red-400" : "text-zinc-600"}`}>
                {brk ? "100" : "0"}
              </span>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-none"
                  style={{ width: brk ? "100%" : "0%", background: "#ef4444" }}
                />
              </div>
            </div>

            {/* Gear Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 items-center justify-center">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Gear</span>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl font-black font-mono transition-colors duration-100"
                style={{
                  background: `${gearColor}22`,
                  border: `2px solid ${gearColor}66`,
                  color: gearColor,
                  boxShadow: `0 0 20px ${gearColor}33`,
                }}
              >
                {gear}
              </div>
            </div>

          </div>
        );
      })()}
    </div>
  );
};

export default TrackMap;
