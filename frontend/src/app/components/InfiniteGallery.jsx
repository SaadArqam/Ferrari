"use client";

import React, { useRef, useEffect, useState } from "react";

const IMAGE_DATA = [
  // Column 0
  { src: null, w: 240, h: 320, era: "1950s", label: "Ferrari 125 F1 — First Race" },
  { src: null, w: 240, h: 200, era: "1960s", label: "Phil Hill — World Champion" },
  { src: null, w: 240, h: 280, era: "1970s", label: "Niki Lauda — Title Fight" },
  { src: null, w: 240, h: 240, era: "1980s", label: "Gilles Villeneuve" },
  { src: null, w: 240, h: 300, era: "1990s", label: "Michael Schumacher Era" },
  // Column 1
  { src: null, w: 240, h: 260, era: "2000s", label: "Schumacher — 5 Titles" },
  { src: null, w: 240, h: 320, era: "2010s", label: "Fernando Alonso" },
  { src: null, w: 240, h: 200, era: "2015s", label: "Sebastian Vettel" },
  { src: null, w: 240, h: 280, era: "2019s", label: "Leclerc — Monza Win" },
  { src: null, w: 240, h: 240, era: "2022s", label: "Leclerc — Bahrain GP" },
  // Column 2
  { src: null, w: 240, h: 300, era: "2023s", label: "Carlos Sainz" },
  { src: null, w: 240, h: 260, era: "2024s", label: "Leclerc — Monaco Win" },
  { src: null, w: 240, h: 320, era: "2024s", label: "Hamilton Joins Ferrari" },
  { src: null, w: 240, h: 200, era: "1950s", label: "Alberto Ascari" },
  { src: null, w: 240, h: 280, era: "1970s", label: "Clay Regazzoni" },
  // Column 3
  { src: null, w: 240, h: 240, era: "1980s", label: "Jody Scheckter" },
  { src: null, w: 240, h: 300, era: "2000s", label: "Italian GP — Tifosi" },
  { src: null, w: 240, h: 260, era: "2010s", label: "Ferrari SF90" },
  { src: null, w: 240, h: 320, era: "2023s", label: "Sainz — Singapore Win" },
  { src: null, w: 240, h: 200, era: "2024s", label: "Ferrari SF-24" },
  // Column 4
  { src: null, w: 240, h: 280, era: "1960s", label: "John Surtees" },
  { src: null, w: 240, h: 240, era: "1990s", label: "Ferrari F310" },
  { src: null, w: 240, h: 300, era: "2000s", label: "Michael — Farewell" },
  { src: null, w: 240, h: 260, era: "2019s", label: "Charles Leclerc" },
  { src: null, w: 240, h: 320, era: "2024s", label: "Monza 2024 — Victory" },
];

const COLORS = [
  "#1a0a0a", "#0d0d14", "#0a1a0a", "#14100a", "#0a1414", "#14080a"
];

const COLUMN_STAGGER = [0, 55, -30, 45, -15];
const GAP = 14;
const BASE_TILE_WIDTH = 240;
const COLUMNS = 5;
const ROWS_PER_COL = 5;

export default function InfiniteGallery() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Refs for animation and interaction (to avoid re-renders)
  const offsetX = useRef(0);
  const offsetY = useRef(0);
  const velX = useRef(0);
  const velY = useRef(0);
  const zoom = useRef(1.0);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);
  const imageCache = useRef({});
  const needsRedraw = useRef(true);

  // Pre-calculate column heights and tile offsets
  const columnData = useRef([]);
  useEffect(() => {
    const data = [];
    for (let c = 0; c < COLUMNS; c++) {
      let totalH = 0;
      const tilesInCol = [];
      for (let r = 0; r < ROWS_PER_COL; r++) {
        const idx = c * ROWS_PER_COL + r;
        const tile = IMAGE_DATA[idx];
        tilesInCol.push({
          ...tile,
          yOffset: totalH,
          idx
        });
        totalH += tile.h + GAP;
      }
      data.push({
        totalH,
        tiles: tilesInCol,
        stagger: COLUMN_STAGGER[c]
      });
    }
    columnData.current = data;
    needsRedraw.current = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.scale(dpr, dpr);
      needsRedraw.current = true;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const drawTile = (tile, x, y, w, h, zoomVal) => {
      // 1. Background rectangle
      ctx.save();
      const radius = 10 * zoomVal;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.clip();

      if (tile.src && imageCache.current[tile.src]?.complete) {
        ctx.drawImage(imageCache.current[tile.src], x, y, w, h);
      } else {
        ctx.fillStyle = COLORS[tile.idx % COLORS.length];
        ctx.fillRect(x, y, w, h);

        // 5. Placeholder grid pattern
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        const gridSize = 30 * zoomVal;
        for (let gx = x; gx < x + w; gx += gridSize) {
          ctx.beginPath();
          ctx.moveTo(gx, y);
          ctx.lineTo(gx, y + h);
          ctx.stroke();
        }
        for (let gy = y; gy < y + h; gy += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, gy);
          ctx.lineTo(x + w, gy);
          ctx.stroke();
        }

        // 6. Placeholder icon (camera)
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2 - 10 * zoomVal);
        const iconSize = 28 * zoomVal;
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 2 * zoomVal;
        ctx.beginPath();
        // Camera body
        ctx.roundRect(-iconSize/2, -iconSize/3, iconSize, iconSize*0.7, 4 * zoomVal);
        // Lens
        ctx.moveTo(iconSize/4, 0);
        ctx.arc(0, 0, iconSize/4, 0, Math.PI * 2);
        // Top flash part
        ctx.moveTo(-iconSize/6, -iconSize/3);
        ctx.lineTo(-iconSize/6, -iconSize/2);
        ctx.lineTo(iconSize/6, -iconSize/2);
        ctx.lineTo(iconSize/6, -iconSize/3);
        ctx.stroke();
        ctx.restore();
      }

      // 2. Bottom gradient overlay
      const gradH = 80 * zoomVal;
      const grad = ctx.createLinearGradient(x, y + h - gradH, x, y + h);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y + h - gradH, w, gradH);

      // 3. Era badge
      ctx.font = `bold ${11 * zoomVal}px 'Barlow Condensed', sans-serif`;
      const eraText = tile.era;
      const eraMetrics = ctx.measureText(eraText);
      const eraPadding = 8 * zoomVal;
      const eraW = eraMetrics.width + eraPadding * 2;
      const eraH = 20 * zoomVal;
      const eraX = x + 10 * zoomVal;
      const eraY = y + 10 * zoomVal;

      ctx.fillStyle = "rgba(220, 0, 0, 0.9)";
      ctx.beginPath();
      ctx.roundRect(eraX, eraY, eraW, eraH, 4 * zoomVal);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.textBaseline = "middle";
      ctx.fillText(eraText, eraX + eraPadding, eraY + eraH / 2 + 1);

      // 4. Label text
      ctx.font = `${Math.round(12 * zoomVal)}px 'Barlow Condensed', sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.textBaseline = "bottom";
      const labelX = x + 12 * zoomVal;
      const labelY = y + h - 14 * zoomVal;
      const maxLabelW = w - 24 * zoomVal;
      ctx.fillText(tile.label, labelX, labelY, maxLabelW);

      ctx.restore();
    };

    const loop = () => {
      if (!isDragging.current) {
        velX.current *= 0.91;
        velY.current *= 0.91;
        offsetX.current += velX.current;
        offsetY.current += velY.current;

        if (Math.abs(velX.current) < 0.05) velX.current = 0;
        if (Math.abs(velY.current) < 0.05) velY.current = 0;
      }

      const viewW = canvas.width / dpr;
      const viewH = canvas.height / dpr;
      
      ctx.clearRect(0, 0, viewW, viewH);
      ctx.fillStyle = "#060608";
      ctx.fillRect(0, 0, viewW, viewH);

      const z = zoom.current;
      const tileW = BASE_TILE_WIDTH * z;
      const colW = tileW + GAP * z;

      // Start/End column indices
      const startCol = Math.floor(-offsetX.current / colW);
      const endCol = Math.ceil((viewW - offsetX.current) / colW);

      for (let c = startCol; c <= endCol; c++) {
        const virtualCol = ((c % COLUMNS) + COLUMNS) % COLUMNS;
        const colData = columnData.current[virtualCol];
        if (!colData) continue;

        const totalColH = colData.totalH * z;
        const xPos = offsetX.current + c * colW;
        
        // Start/End row indices based on offset and column height
        const colYOffset = (offsetY.current + colData.stagger * z);
        const startRowSet = Math.floor(-colYOffset / totalColH);
        const endRowSet = Math.ceil((viewH - colYOffset) / totalColH);

        for (let rs = startRowSet; rs <= endRowSet; rs++) {
          const rowYBase = colYOffset + rs * totalColH;
          
          colData.tiles.forEach(tile => {
            const tileY = rowYBase + tile.yOffset * z;
            const tileH = tile.h * z;
            
            // Culling check
            if (tileY + tileH > 0 && tileY < viewH) {
              drawTile(tile, xPos, tileY, tileW, tileH, z);
            }
          });
        }
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    const onMouseDown = (e) => {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      velX.current = 0;
      velY.current = 0;
      container.style.cursor = "grabbing";
    };

    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      offsetX.current += dx;
      offsetY.current += dy;
      velX.current = dx;
      velY.current = dy;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
      container.style.cursor = "grab";
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.93;
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const newZoom = Math.max(0.4, Math.min(2.5, zoom.current * zoomFactor));
      const actualFactor = newZoom / zoom.current;

      offsetX.current = mx - (mx - offsetX.current) * actualFactor;
      offsetY.current = my - (my - offsetY.current) * actualFactor;
      zoom.current = newZoom;
    };

    const onTouchStart = (e) => {
      isDragging.current = true;
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      velX.current = 0;
      velY.current = 0;
    };

    const onTouchMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.touches[0].clientX - lastMousePos.current.x;
      const dy = e.touches[0].clientY - lastMousePos.current.y;
      offsetX.current += dx;
      offsetY.current += dy;
      velX.current = dx;
      velY.current = dy;
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onMouseUp);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId.current);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onMouseUp);
    };
  }, []);

  return (
    <section id="gallery" className="pt-24 pb-0 bg-[#060608] w-full overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-8 flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <span className="text-[#DC0000] font-display text-[10px] font-bold uppercase tracking-[0.3em] block mb-2">
            ARCHIVE
          </span>
          <h2 className="text-white font-display font-black text-4xl md:text-5xl uppercase leading-none">
            Ferrari Through The Years
          </h2>
        </div>
        <div className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest">
          Drag to explore · Scroll to zoom
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="relative w-full h-[600px] overflow-hidden bg-[#060608] cursor-grab select-none"
      >
        <canvas ref={canvasRef} />
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#060608] to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}
