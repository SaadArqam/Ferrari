"use client";

import { useState } from "react";
import LoadingAnimation from "./components/LoadingAnimation";

export default function HomePage() {
  const [showLoading, setShowLoading] = useState(true);

  return (
    <div>
      {showLoading && (
        <LoadingAnimation onComplete={() => setShowLoading(false)} />
      )}

      {!showLoading && <main className="min-h-screen bg-white"></main>}
    </div>
  );
}
