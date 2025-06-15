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
import About from "./components/about";

export default function HomePage() {
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
              80% { transform: translateX(10vw) translateY(-50%); opacity: 1; }
              100% { transform: translateX(120vw) translateY(-50%); opacity: 0; }
            }
            .animate-f1-slide {
              animation: f1-slide 1.3s cubic-bezier(0.77,0,0.18,1) forwards;
            }
            @keyframes f1-fade {
              0% { opacity: 1; }
              90% { opacity: 1; }
              100% { opacity: 0; }
            }
            .animate-f1-fade {
              animation: f1-fade 1.3s linear forwards;
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
          </div>

          {/* About Section */}
          <div className="bg-white">
            <About />
          </div>
        </main>
      )}
    </div>
  );
}
