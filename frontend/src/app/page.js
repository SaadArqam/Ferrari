"use client";

const fontStyle = `
  @font-face {
    font-family: 'FerroRosso';
    src: url('/fonts/FerroRosso.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;

import { useState } from "react";
import LoadingAnimation from "./components/LoadingAnimation";
import ScrollPinnedTextAnimation from "./components/ScrollPinnedTextAnimation";
import About from "./components/about";
import Card from "./components/card";
import PhotoGallery from "./components/photoGallery";
import Analytics from "./components/Analytics";

export default function HomePage() {
  // DEBUG: Show home content by default
  const [showLoading, setShowLoading] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [showHome, setShowHome] = useState(false);

  // Handle loading complete
  const handleLoadingComplete = () => {
    setShowLoading(false);
    setShowTransition(true);
    setTimeout(() => {
      setShowTransition(false);
      setShowHome(true);
    }, 900); // Duration of the F1 transition
  };

  return (
    <div>
      {showLoading && <LoadingAnimation onComplete={handleLoadingComplete} />}

      {/* F1 Transition Animation */}
      {showTransition && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black">
          <div className="relative w-full h-32 overflow-hidden">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center animate-f1-slide">
              <div className="bg-[#DC0000] h-20 w-[120vw] rounded-r-full shadow-2xl shadow-black flex items-center transition-all duration-500 blur-[2px] drop-shadow-2xl animate-f1-fade">
                <img
                  src="/img/racing-car.png"
                  alt="F1 Car"
                  className="w-16 h-16 ml-4 drop-shadow-lg blur-0"
                />
              </div>
            </div>
          </div>
          <style>{`
            @keyframes f1-slide {
              0% { transform: translateX(-100vw) translateY(-50%); opacity: 1; }
              70% { transform: translateX(5vw) translateY(-50%); opacity: 1; }
              100% { transform: translateX(120vw) translateY(-50%); opacity: 0; }
            }
            .animate-f1-slide {
              animation: f1-slide 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            @keyframes f1-fade {
              0% { opacity: 1; }
              85% { opacity: 1; }
              100% { opacity: 0; }
            }
            .animate-f1-fade {
              animation: f1-fade 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
          `}</style>
        </div>
      )}

      {/* Home Page */}
      {showHome && (
        <main className="min-h-screen bg-white">
          <style>{fontStyle}</style>
          {/* Hero Section with Video */}
          <div className="relative min-h-[60vh] h-screen">
            <div className="absolute inset-0 w-full h-full">
              <video
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/video/home.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="relative z-10 flex items-center justify-center h-full">
              <h1
                className="text-center max-w-full mx-auto text-3xl sm:text-5xl md:text-7xl lg:text-[120px] xl:text-[200px] 2xl:text-[448px] px-2"
                style={{
                  fontFamily: "FerroRosso",
                  fontSize: "clamp(2.5rem, 15vw, 448px)",
                  color: "#F1F1F1",
                  lineHeight: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Ferrari
              </h1>
            </div>
            {/* Scroll Indicator */}
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-16 flex flex-col items-center z-20">
              <span
                className="text-white text-lg tracking-widest font-semibold mb-2 drop-shadow-lg font-mono uppercase"
                style={{ letterSpacing: "0.3em" }}
              >
                SCROLL TO EXPLORE
              </span>
              <span className="block w-0.5 h-10 bg-white animate-light-move rounded-full"></span>
            </div>
            <style>{`
              @keyframes light-move {
                0% { transform: translateY(0); opacity: 0.3; }
                10% { opacity: 1; }
                50% { transform: translateY(30px); opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(0); opacity: 0.3; }
              }
              .animate-light-move {
                animation: light-move 1.6s cubic-bezier(0.4,0,0.2,1) infinite;
              }
            `}</style>
          </div>

          {/* Scroll-Driven Text Animation with Pinned Background */}
          <ScrollPinnedTextAnimation
            text="Only those who dare truly live"
            backgroundImage="/img/ferrari.jpg"
            overlayOpacity={0.5}
          />

          {/* About Section */}
          {/* <About /> */}
          <div className="">{/* Other content can go here if needed */}</div>
          <div className="relative w-full h-screen">
            <img
              src="/img/ferrari.jpg"
              alt="Ferrari"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Add Card at the end of the site */}
          <div className="flex justify-center items-center py-16">
            <Card />
          </div>
          <PhotoGallery />
          <Analytics />
          
          {/* Telemetry Race Selector */}
          <div className="bg-zinc-950 py-20">
            <div className="container mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 text-red-500 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live Telemetry
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                Race <span className="text-red-600">Analyzer</span>
              </h2>
              <p className="text-zinc-500 max-w-xl mx-auto text-sm mb-10">
                Explore Ferrari&apos;s fastest laps. Visualize the racing line, live telemetry, speed gradients, and replay any session corner-by-corner.
              </p>
              <a
                href="/telemetry"
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-10 rounded-2xl shadow-2xl shadow-red-600/40 hover:shadow-red-500/50 transition-all text-sm uppercase tracking-widest group"
              >
                Open Telemetry Dashboard
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
