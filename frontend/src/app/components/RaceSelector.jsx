"use client";

import React, { useState } from "react";
import { FiActivity, FiChevronDown, FiAlertCircle } from "react-icons/fi";
import TrackMap from "./TrackMap";

const SEASONS = [2024, 2023, 2022];
const DRIVERS = ["LEC", "SAI", "HAM", "BEA"];

// Common race names supported by FastF1
const RACES = [
  "Bahrain",
  "Saudi Arabia",
  "Australia",
  "Japan",
  "China",
  "Miami",
  "Emilia Romagna",
  "Monaco",
  "Canada",
  "Spain",
  "Austria",
  "Great Britain",
  "Hungary",
  "Belgium",
  "Netherlands",
  "Italy",
  "Azerbaijan",
  "Singapore",
  "United States",
  "Mexico",
  "Brazil",
  "Las Vegas",
  "Qatar",
  "Abu Dhabi"
];

const RaceSelector = () => {
  const [season, setSeason] = useState(2024);
  const [race, setRace] = useState("Monza"); // Or "Italy"
  const [driver, setDriver] = useState("LEC");
  
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchTelemetry = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTelemetry(null);

    try {
      // The backend needs "year" and "race" and "driver"
      // If the backend runs on 8000 by default in uvicorn:
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await fetch(
        `${apiUrl}/api/telemetry?year=${season}&race=${encodeURIComponent(race)}&driver=${encodeURIComponent(driver)}`,
        {
          headers: {
            "Accept": "application/json"
          }
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setTelemetry(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch telemetry data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative">
      {/* Background glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-32 bg-red-600/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        
        <div className="flex-1 w-full">
          <label className="block text-zinc-400 text-sm font-semibold mb-2 uppercase tracking-wider">
            Season
          </label>
          <div className="relative">
            <select
              value={season}
              onChange={(e) => setSeason(Number(e.target.value))}
              className="w-full appearance-none bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white p-3 rounded-lg font-medium outline-none transition-colors focus:ring-2 focus:ring-red-600 focus:border-transparent cursor-pointer"
            >
              {SEASONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-zinc-400 text-sm font-semibold mb-2 uppercase tracking-wider">
            Race
          </label>
          <div className="relative">
            <select
              value={race}
              onChange={(e) => setRace(e.target.value)}
              className="w-full appearance-none bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white p-3 rounded-lg font-medium outline-none transition-colors focus:ring-2 focus:ring-red-600 focus:border-transparent cursor-pointer"
            >
              <option value="Monza">Monza</option>
              {RACES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-zinc-400 text-sm font-semibold mb-2 uppercase tracking-wider">
            Driver (Ferrari)
          </label>
          <div className="relative">
            <select
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              className="w-full appearance-none bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white p-3 rounded-lg font-medium outline-none transition-colors focus:ring-2 focus:ring-red-600 focus:border-transparent cursor-pointer"
            >
              {DRIVERS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={handleFetchTelemetry}
          disabled={loading}
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider h-[46px]"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <FiActivity className="text-xl" />
              Load Telemetry
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-6 bg-red-950/50 border border-red-800 text-red-400 p-4 rounded-lg flex items-start justify-center gap-3">
          <FiAlertCircle className="text-xl mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold">Failed to fetch data</h4>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Track Reconstruction Map */}
      {telemetry && !loading && !error && (
        <div className="mt-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                <div className="w-2 h-6 bg-red-600 rounded-sm"></div>
                Telemetry Track Reconstruction
              </h3>
              <TrackMap telemetry={telemetry} />
           </div>
        </div>
      )}

      {/* Telemetry Debug View */}
      {telemetry && !loading && !error && (
        <div className="mt-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-2 h-6 bg-red-600 rounded-sm"></div>
              Session Telemetry Loaded
            </h3>
            <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs font-mono text-zinc-400">
              {telemetry.length} data points
            </span>
          </div>
          
          <div className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-800/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 uppercase tracking-wider text-xs font-semibold">
                    <th className="px-4 py-3">Time (s)</th>
                    <th className="px-4 py-3">Speed (km/h)</th>
                    <th className="px-4 py-3">Throttle (%)</th>
                    <th className="px-4 py-3">Brake (%)</th>
                    <th className="px-4 py-3">Gear</th>
                    <th className="px-4 py-3">Dist (m)</th>
                    <th className="px-4 py-3">X, Y</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {telemetry.slice(0, 8).map((point, i) => (
                    <tr key={i} className="hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/30 last:border-0">
                      <td className="px-4 py-3">{(point.time || 0).toFixed(3)}</td>
                      <td className="px-4 py-3">{Math.round(point.speed || 0)}</td>
                      <td className="px-4 py-3">{Math.round(point.throttle || 0)}</td>
                      <td className="px-4 py-3">{point.brake > 0 ? "100" : "0"}</td>
                      <td className="px-4 py-3 text-red-400 font-bold">{point.gear}</td>
                      <td className="px-4 py-3">{Math.round(point.distance || 0)}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{(point.X || 0).toFixed(0)}, {(point.Y || 0).toFixed(0)}</td>
                    </tr>
                  ))}
                  {telemetry.length > 8 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-4 text-center text-zinc-500 italic">
                        ... plus {telemetry.length - 8} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaceSelector;
