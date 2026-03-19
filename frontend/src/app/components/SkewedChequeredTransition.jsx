"use client";

/**
 * SkewedChequeredTransition — charlesleclerc.com style
 *
 * Architecture:
 *  • Pins the #hero section via GSAP ScrollTrigger so it stays in view
 *    during the full 1 200 px scrub window (no need for a manual spacer —
 *    GSAP's pinSpacing inserts one automatically).
 *  • A fixed overlay grid (110 vw × 110 vh, offset -5 vw/-5 vh) bleeds
 *    past all viewport edges so the skew never reveals a raw edge.
 *  • Two-phase timeline:
 *      Phase 1 (0 → ~55 %): 12 white tiles slide UP from below, staggered
 *                            randomly — covering the dark hero.
 *      Phase 2 (~60 % → 100 %): grid fades to invisible (white-on-white
 *                            = seamless), hero unpins, #next scrolls in.
 */

import React, { useEffect, useRef, useMemo } from "react";

const COLS  = 4;
const ROWS  = 3;
const PIN_EXTRA_SCROLL = 1200; // extra px hero stays pinned while grid plays

function buildTiles() {
  const out = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      out.push({ r, c, index: r * COLS + c });
  return out;
}

export default function SkewedChequeredTransition() {
  const gridRef   = useRef(null);
  const innerRefs = useRef([]);
  const ctxRef    = useRef(null);

  const tiles = useMemo(buildTiles, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // ── lazy-load GSAP (SSR safe) ─────────────────────────────────────────
      const gsapMod = await import("gsap");
      const gsap    = gsapMod.default ?? gsapMod;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (cancelled) return;

      const hero   = document.querySelector("#hero");
      const next   = document.querySelector("#next");
      const grid   = gridRef.current;
      const inners = innerRefs.current.filter(Boolean);

      if (!hero || !grid || inners.length === 0) return;

      ctxRef.current = gsap.context(() => {

        // ── 1. Initial states ─────────────────────────────────────────────
        gsap.set(grid, {
          position      : "fixed",
          top           : "-5vh",
          left          : "-5vw",
          width         : "110vw",
          height        : "110vh",
          zIndex        : 80,
          pointerEvents : "none",
          skewX         : -9,
          transformOrigin: "50% 50%",
          autoAlpha     : 0,          // invisible until scroll starts
          willChange    : "transform, opacity",
        });

        // Each tile inner starts below its clip with random jitter
        inners.forEach((el) => {
          gsap.set(el, {
            yPercent : gsap.utils.random(108, 162),
            x        : gsap.utils.random(-14, 14),
            scale    : 1,
            opacity  : 0.9,
            filter   : "blur(0.8px)",
          });
        });

        // ── 2. Master timeline — triggered from #hero with hero pinned ────
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger      : hero,
            start        : "top top",         // fires the instant page begins scrolling
            end          : `+=${PIN_EXTRA_SCROLL}`,  // hero stays pinned for 1 200 px
            scrub        : 1,                 // smooth 1 s lag
            pin          : true,              // hero stays in viewport
            pinSpacing   : true,              // GSAP inserts spacer automatically
            anticipatePin: 1,
          },
        });

        // Grid fades in at the very start of scroll
        tl.to(grid, { autoAlpha: 1, duration: 0.04 }, 0);

        // ── Phase 1 (0 → 1.1): tiles slide IN ────────────────────────────
        tl.to(
          inners,
          {
            yPercent : 0,
            x        : 0,
            scale    : 1.02,
            opacity  : 1,
            filter   : "blur(0px)",
            ease     : "power4.out",
            duration : 1.1,
            stagger  : { each: 0.055, from: "random" },
          },
          0
        );

        // Skew eases toward vertical as tiles settle
        tl.to(grid, { skewX: -2, ease: "power4.out", duration: 1.1 }, 0);

        // Subtle hero parallax (moves behind the incoming tiles)
        tl.to(hero, { y: -55, ease: "power4.out", duration: 1.1 }, 0);

        // ── Phase 2 (1.25 → 1.65): grid fades out — white on white = seamless
        // The next section (also light/white) is now revealed as the overlay vanishes.
        tl.to(
          grid,
          { autoAlpha: 0, ease: "power2.inOut", duration: 0.4 },
          1.25
        );

        // Reset hero y so it doesn't shift layout after unpin
        tl.to(hero, { y: 0, duration: 0.01 }, 1.65);

        // Subtle next-section parallax as it comes into view
        if (next) {
          tl.to(next, { y: -20, ease: "power2.out", duration: 0.4 }, 1.25);
        }

      }); // end gsap.context
    })();

    return () => {
      cancelled = true;
      if (ctxRef.current) ctxRef.current.revert();
    };
  }, []);

  /*
   * This component renders ONLY the fixed overlay grid — no spacer DOM node.
   * GSAP's pinSpacing (applied to #hero) inserts the required blank scrolling
   * space automatically.
   */
  return (
    <div
      ref={gridRef}
      style={{ position: "fixed", zIndex: 80, pointerEvents: "none" }}
    >
      <div
        style={{
          display             : "grid",
          gridTemplateColumns : `repeat(${COLS}, 1fr)`,
          gridTemplateRows    : `repeat(${ROWS}, 1fr)`,
          width               : "100%",
          height              : "100%",
        }}
      >
        {tiles.map((t, i) => (
          <div
            key={t.index}
            style={{
              position : "relative",
              overflow : "hidden",
              margin   : "-1px",   // kills sub-pixel seams between tiles
            }}
          >
            <div
              ref={(el) => (innerRefs.current[i] = el)}
              style={{
                position  : "absolute",
                inset     : 0,
                background: "#ffffff",
                willChange: "transform, filter, opacity",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
