import React from "react";

const about = () => {
  return (
    <div className="py-10 sm:py-16 md:py-20 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#DC0000] mb-4 sm:mb-6 font-bold text-center sm:text-left">
          About Ferrari
        </h2>
        <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed text-center sm:text-left">
          Ferrari S.p.A. is an Italian luxury sports car manufacturer based in
          Maranello, Italy. Founded by Enzo Ferrari in 1947, the company built
          its first car bearing the Ferrari name in 1947. Ferrari is known for
          its participation in racing, especially in Formula One, where it is
          the oldest and most successful racing team.
        </p>
      </div>
    </div>
  );
};

export default about;
