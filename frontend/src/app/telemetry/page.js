"use client";

import React, { useState } from "react";
import { FiChevronDown, FiZap, FiAlertCircle, FiActivity } from "react-icons/fi";
import TrackMap from "../components/TrackMap";

/* ─── Static data ─────────────────────────────────────────────────────────── */
const SEASONS = [2024, 2023, 2022];
const RACES = [
  "Monza","Bahrain","Saudi Arabia","Australia","Japan","China","Miami",
  "Emilia Romagna","Monaco","Canada","Spain","Austria","Great Britain",
  "Hungary","Belgium","Netherlands","Azerbaijan","Singapore","United States",
  "Mexico","Brazil","Las Vegas","Qatar","Abu Dhabi",
];
const DRIVERS = {
  LEC: { name: "Charles Leclerc", abbr: "LEC", number: "16", nationality: "MON" },
  SAI: { name: "Carlos Sainz",    abbr: "SAI", number: "55", nationality: "ESP" },
  HAM: { name: "Lewis Hamilton",  abbr: "HAM", number: "44", nationality: "GBR" },
  BEA: { name: "Oliver Bearman",  abbr: "BEA", number: "87", nationality: "GBR" },
};

/* ─── Reusable Select ─────────────────────────────────────────────────────── */
function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none bg-zinc-800/80 border border-zinc-700 hover:border-red-600/60 focus:border-red-600 focus:ring-1 focus:ring-red-600/40 text-white text-sm py-2.5 pl-3 pr-8 rounded-xl font-medium outline-none transition-all cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-xs" />
      </div>
    </div>
  );
}

/* ─── Driver Card ─────────────────────────────────────────────────────────── */
function DriverCard({ driver }) {
  const d = DRIVERS[driver];
  if (!d) return null;
  return (
    <div className="relative mt-1 rounded-2xl border border-red-900/40 bg-gradient-to-br from-red-950/40 to-zinc-900/80 p-4 overflow-hidden">
      {/* Decorative number watermark */}
      <span className="absolute -right-4 -bottom-6 text-[90px] font-black text-red-900/20 leading-none select-none pointer-events-none">
        {d.number}
      </span>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-0.5">Active Driver</p>
            <p className="text-xl font-black text-white leading-tight">{d.name}</p>
          </div>
          {/* Big abbr badge */}
          <div className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg tracking-widest">
            {d.abbr}
          </div>
        </div>

        <div className="flex gap-4 text-xs font-mono">
          <div>
            <p className="text-zinc-600 uppercase tracking-widest text-[9px]">Number</p>
            <p className="text-white font-bold text-base">#{d.number}</p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div>
            <p className="text-zinc-600 uppercase tracking-widest text-[9px]">Nationality</p>
            <p className="text-white font-bold text-base">{d.nationality}</p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div>
            <p className="text-zinc-600 uppercase tracking-widest text-[9px]">Team</p>
            <p className="text-red-400 font-bold text-base">Ferrari</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Empty State ─────────────────────────────────────────────────────────── */
function EmptyTrack() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      {/* Animated pulse ring */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-red-600/30 animate-ping" />
        <div className="absolute inset-3 rounded-full border-2 border-red-600/50 animate-ping [animation-delay:300ms]" />
        <div className="absolute inset-6 rounded-full bg-red-600/20 flex items-center justify-center">
          <FiActivity className="text-red-500 text-2xl" />
        </div>
      </div>
      <p className="text-zinc-500 text-sm font-semibold uppercase tracking-widest">No session loaded</p>
      <p className="text-zinc-700 text-xs mt-1">Select a season, race & driver, then click Load</p>
    </div>
  );
}

/* ─── Loading skeleton ────────────────────────────────────────────────────── */
function LoadingTrack() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-zinc-800 border-t-red-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-white font-bold text-sm">Loading Telemetry</p>
        <p className="text-zinc-500 text-xs mt-0.5">Parsing fastest lap data…</p>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function TelemetryPage() {
  const [season, setSeason] = useState(2024);
  const [race,   setRace]   = useState("Monza");
  const [driver, setDriver] = useState("LEC");

  const [telemetry, setTelemetry] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [loaded, setLoaded]       = useState(null); // snapshot of loaded {season,race,driver}

  const handleLoad = async () => {
    setLoading(true);
    setError(null);
    setTelemetry(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(
        `${apiUrl}/api/telemetry?year=${season}&race=${encodeURIComponent(race)}&driver=${encodeURIComponent(driver)}`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setTelemetry(data);
      setLoaded({ season, race, driver });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const lapTime = telemetry
    ? (telemetry[telemetry.length - 1]?.time ?? 0).toFixed(3)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-x-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/40">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none tracking-wide">FERRARI</p>
              <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5">Telemetry Analyzer</p>
            </div>
          </div>

          {/* Lap info pill (visible after load) */}
          {loaded && (
            <div className="hidden md:flex items-center gap-3 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
              <span className="text-zinc-500">{loaded.season}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-white font-semibold">{loaded.race}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-red-400 font-bold">{loaded.driver}</span>
              {lapTime && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span className="text-yellow-400">{lapTime}s</span>
                </>
              )}
            </div>
          )}

          {/* Data points badge */}
          {telemetry && (
            <div className="bg-red-600/10 border border-red-600/20 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
              {telemetry.length.toLocaleString()} points
            </div>
          )}
        </div>
      </header>

      {/* ── Main layout ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col xl:flex-row max-w-[1600px] w-full mx-auto px-4 md:px-6 py-6 gap-6">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
        <aside className="w-full xl:w-[280px] shrink-0 flex flex-col gap-4">

          {/* Session selector panel */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
            {/* Decorative top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent" />

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              Session Setup
            </p>

            <div className="flex flex-col gap-4">
              <Select
                label="Season"
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
                options={SEASONS.map((s) => ({ value: s, label: s }))}
              />
              <Select
                label="Race"
                value={race}
                onChange={(e) => setRace(e.target.value)}
                options={RACES.map((r) => ({ value: r, label: r }))}
              />
              <Select
                label="Driver"
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                options={Object.entries(DRIVERS).map(([k, v]) => ({ value: k, label: `${v.abbr} — ${v.name}` }))}
              />

              {/* Load button */}
              <button
                onClick={handleLoad}
                disabled={loading}
                className="relative mt-2 w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-red-600/30 hover:shadow-red-500/40 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                {/* Shine sweep on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FiZap />
                    Load Session
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Driver info card */}
          <DriverCard driver={driver} />

          {/* Stats card — appears after data loads */}
          {telemetry && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Lap Stats</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Samples",  value: telemetry.length.toLocaleString(), unit: "pts" },
                  { label: "Lap Time", value: lapTime, unit: "s" },
                  { label: "Max Speed",value: Math.round(Math.max(...telemetry.map(p => p.speed))), unit: "km/h" },
                  { label: "Top Gear", value: Math.max(...telemetry.map(p => p.gear)), unit: "" },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="bg-zinc-800/50 rounded-xl p-3">
                    <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">{label}</p>
                    <p className="text-white font-black text-lg font-mono leading-tight mt-0.5">
                      {value}<span className="text-zinc-600 text-xs font-normal ml-0.5">{unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── RIGHT MAIN AREA ──────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">

          {/* Track canvas area */}
          <div className="relative bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden backdrop-blur-sm"
               style={{ minHeight: "520px" }}>
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent z-10" />

            {/* Section header */}
            <div className="absolute top-4 left-5 z-20 flex items-center gap-2">
              <div className="w-1 h-5 bg-red-600 rounded-full" />
              <span className="text-white font-bold text-sm uppercase tracking-widest">
                {loading ? "Loading…" : telemetry ? "Fastest Lap Trace" : "Track Visualization"}
              </span>
            </div>

            {/* Body */}
            <div className="pt-14 pb-4 flex items-center justify-center" style={{ minHeight: "520px" }}>
              {loading  && <LoadingTrack />}
              {!loading && !telemetry && !error && <EmptyTrack />}
              {error    && (
                <div className="flex flex-col items-center gap-3 text-center px-8">
                  <div className="w-16 h-16 bg-red-950 border border-red-800 rounded-2xl flex items-center justify-center">
                    <FiAlertCircle className="text-red-500 text-3xl" />
                  </div>
                  <p className="text-red-400 font-bold">Failed to load session</p>
                  <p className="text-zinc-500 text-sm max-w-sm">{error}</p>
                  <button
                    onClick={handleLoad}
                    className="mt-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 text-sm font-semibold px-5 py-2 rounded-xl transition-all"
                  >
                    Retry
                  </button>
                </div>
              )}
              {telemetry && !loading && !error && (
                <div className="w-full">
                  <TrackMap telemetry={telemetry} />
                </div>
              )}
            </div>
          </div>

          {/* Raw data mini-table */}
          {telemetry && (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-red-600 rounded-full" />
                  <span className="text-white font-bold text-sm uppercase tracking-widest">Raw Samples</span>
                </div>
                <span className="bg-zinc-800 text-zinc-400 text-[10px] font-mono px-3 py-1 rounded-full">
                  Showing first 8 of {telemetry.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap text-zinc-300">
                  <thead>
                    <tr className="border-b border-zinc-800/60 text-zinc-600 uppercase tracking-wider text-[10px] font-bold">
                      {["Time (s)","Speed","Throttle","Brake","Gear","Distance","X, Y"].map(h => (
                        <th key={h} className="px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono divide-y divide-zinc-800/30">
                    {telemetry.slice(0, 8).map((p, i) => (
                      <tr key={i} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-3 text-zinc-400">{(p.time||0).toFixed(3)}</td>
                        <td className="px-5 py-3 font-bold text-yellow-400">{Math.round(p.speed||0)}</td>
                        <td className="px-5 py-3 text-green-400">{Math.round(p.throttle||0)}%</td>
                        <td className="px-5 py-3">{p.brake > 0 ? <span className="text-red-500 font-bold">▮ ON</span> : <span className="text-zinc-700">OFF</span>}</td>
                        <td className="px-5 py-3 text-red-400 font-black text-sm">{p.gear}</td>
                        <td className="px-5 py-3 text-zinc-400">{Math.round(p.distance||0)} m</td>
                        <td className="px-5 py-3 text-zinc-600 text-[10px]">
                          {(p.X||0).toFixed(0)}, {(p.Y||0).toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
