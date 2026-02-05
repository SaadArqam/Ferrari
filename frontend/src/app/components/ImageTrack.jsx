import { useEffect, useRef } from "react";
import "./ImageTrack.css";

export default function ImageTrack() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;

    const handleOnDown = (e) => {
      track.dataset.mouseDownAt = e.clientX;
    };

    const handleOnUp = () => {
      track.dataset.mouseDownAt = "0";
      track.dataset.prevPercentage = track.dataset.percentage || "0";
    };

    const handleOnMove = (e) => {
      if (track.dataset.mouseDownAt === "0") return;

      const mouseDelta =
        parseFloat(track.dataset.mouseDownAt) - e.clientX;
      const maxDelta = window.innerWidth / 2;

      const percentage = (mouseDelta / maxDelta) * -100;
      const nextPercentageUnconstrained =
        parseFloat(track.dataset.prevPercentage || "0") + percentage;
      const nextPercentage = Math.max(
        Math.min(nextPercentageUnconstrained, 0),
        -100
      );

      track.dataset.percentage = nextPercentage;

      track.animate(
        {
          transform: `translate(${nextPercentage}%, -50%)`,
        },
        { duration: 1200, fill: "forwards" }
      );

      for (const image of track.getElementsByClassName("image")) {
        image.animate(
          {
            objectPosition: `${100 + nextPercentage}% center`,
          },
          { duration: 1200, fill: "forwards" }
        );
      }
    };

    window.addEventListener("mousedown", handleOnDown);
    window.addEventListener("mouseup", handleOnUp);
    window.addEventListener("mousemove", handleOnMove);

    window.addEventListener("touchstart", (e) =>
      handleOnDown(e.touches[0])
    );
    window.addEventListener("touchend", handleOnUp);
    window.addEventListener("touchmove", (e) =>
      handleOnMove(e.touches[0])
    );

    return () => {
      window.removeEventListener("mousedown", handleOnDown);
      window.removeEventListener("mouseup", handleOnUp);
      window.removeEventListener("mousemove", handleOnMove);
      window.removeEventListener("touchstart", handleOnDown);
      window.removeEventListener("touchend", handleOnUp);
      window.removeEventListener("touchmove", handleOnMove);
    };
  }, []);

  return (
    <>
      <div
        id="image-track"
        ref={trackRef}
        data-mouse-down-at="0"
        data-prev-percentage="0"
      >
        {images.map((src, i) => (
          <img
            key={i}
            className="image"
            src={src}
            draggable="false"
            alt=""
          />
        ))}
      </div>

      <a
        id="source-link"
        className="meta-link"
        href="https://camillemormal.com"
        target="_blank"
        rel="noreferrer"
      >
        <span>Source</span>
      </a>

      <a
        id="yt-link"
        className="meta-link"
        href="https://youtu.be/PkADl0HubMY"
        target="_blank"
        rel="noreferrer"
      >
        <span>7 min tutorial</span>
      </a>
    </>
  );
}

const images = [
  "https://images.unsplash.com/photo-1524781289445-ddf8f5695861",
  "https://images.unsplash.com/photo-1610194352361-4c81a6a8967e",
  "https://images.unsplash.com/photo-1618202133208-2907bebba9e1",
  "https://images.unsplash.com/photo-1495805442109-bf1cf975750b",
  "https://images.unsplash.com/photo-1548021682-1720ed403a5b",
  "https://images.unsplash.com/photo-1496753480864-3e588e0269b3",
  "https://images.unsplash.com/photo-1613346945084-35cccc812dd5",
  "https://images.unsplash.com/photo-1516681100942-77d8e7f9dd97",
].map(
  (url) => `${url}?auto=format&fit=crop&w=1770&q=80`
);
