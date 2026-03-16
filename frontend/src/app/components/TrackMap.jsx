"use client";

import React, { useMemo } from "react";

const TrackMap = ({ telemetry }) => {
  const { polylinePoints, maxSpeed, minSpeed, pointsData } = useMemo(() => {
    if (!telemetry || telemetry.length === 0) return { polylinePoints: "", maxSpeed: 0, minSpeed: 0, pointsData: [] };

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let maxSpeedVal = -Infinity;
    let minSpeedVal = Infinity;

    // Find min and max for X, Y and Speed
    for (let i = 0; i < telemetry.length; i++) {
        const p = telemetry[i];
        if (p.X < minX) minX = p.X;
        if (p.X > maxX) maxX = p.X;
        if (p.Y < minY) minY = p.Y;
        if (p.Y > maxY) maxY = p.Y;
        
        if (p.speed > maxSpeedVal) maxSpeedVal = p.speed;
        if (p.speed < minSpeedVal) minSpeedVal = p.speed;
    }

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    
    // Ensure we don't divide by zero
    const maxRange = Math.max(rangeX, rangeY) || 1;

    const CANVAS_SIZE = 800;
    const PADDING = 40;
    const drawableSize = CANVAS_SIZE - PADDING * 2;

    // Scale to fit within the drawing area, preserving proportions
    const scale = drawableSize / maxRange;

    const points = [];
    const pointsDataArr = [];

    for (let i = 0; i < telemetry.length; i++) {
        const p = telemetry[i];
        
        // F1 Telemetry Y-axis often needs to be inverted to match standard map orientations (where Y goes up)
        // Screen Y goes down, so we invert Y.
        const scaledX = CANVAS_SIZE / 2 + (p.X - midX) * scale;
        const scaledY = CANVAS_SIZE / 2 - (p.Y - midY) * scale;
        
        points.push(`${scaledX.toFixed(2)},${scaledY.toFixed(2)}`);
        
        pointsDataArr.push({
            x: scaledX,
            y: scaledY,
            speed: p.speed,
            gear: p.gear,
            brake: p.brake > 0
        });
    }

    return { 
        polylinePoints: points.join(" "), 
        maxSpeed: maxSpeedVal, 
        minSpeed: minSpeedVal,
        pointsData: pointsDataArr
    };
  }, [telemetry]);

  if (!telemetry || telemetry.length === 0) return null;

  // Helper to get color based on speed
  const getSpeedColor = (speed) => {
    // Normalize speed between 0 and 1
    const t = (speed - minSpeed) / (maxSpeed - minSpeed || 1);
    
    // Gradient from Red (slow) to Yellow (medium) to Green (fast)
    if (t < 0.5) {
        // Red to Yellow
        const r = 255;
        const g = Math.floor(t * 2 * 255);
        return `rgb(${r}, ${g}, 0)`;
    } else {
        // Yellow to Green
        const r = Math.floor((1 - (t - 0.5) * 2) * 255);
        const g = 255;
        return `rgb(${r}, ${g}, 0)`;
    }
  };

  // Create segments for multi-colored line (optional, falling back to simple polyline if performance is critical)
  // For F1, drawing thousands of small SVG lines might be a bit heavy but usually okay for <2000 points.
  const segments = [];
  if (pointsData.length > 1) {
    for (let i = 0; i < pointsData.length - 1; i++) {
      const p1 = pointsData[i];
      const p2 = pointsData[i + 1];
      
      // We skip distance anomalies 
      const distSq = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
      if (distSq > 10000) continue; // Skip huge jumps

      segments.push(
        <line
          key={i}
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke={getSpeedColor(p1.speed)}
          strokeWidth="6"
          strokeLinecap="round"
        />
      );
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[800px] aspect-square relative bg-zinc-950/50 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden backdrop-blur-sm">
        
        {/* SVG Canvas */}
        <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 800 800" 
            className="drop-shadow-2xl"
        >
            {/* Soft background glow based on the track shape */}
             <polyline
                points={polylinePoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="24"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="blur-md"
            />
            <polyline
                points={polylinePoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="12"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="blur-sm"
            />
            
            {/* The colored track segments */}
            {segments.length > 0 ? (
                segments
            ) : (
                <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            )}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-mono font-semibold uppercase bg-zinc-900/80 px-4 py-3 rounded-xl border border-zinc-800 backdrop-blur-md">
            <div className="flex items-center gap-2 text-red-500">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                Slow ({Math.round(minSpeed)} km/h)
            </div>
            
            {/* Speed Gradient Bar */}
            <div className="flex-1 max-w-[200px] mx-4 h-1.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>

            <div className="flex items-center gap-2 text-green-500">
                Fast ({Math.round(maxSpeed)} km/h)
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TrackMap;
