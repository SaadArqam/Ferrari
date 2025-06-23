import React, { useRef, useEffect } from "react";

const imagesData = [
  "/img/1.jpg",
  "/img/2.jpg",
  "/img/3.jpg",
  "/img/4.jpg",
  "/img/5.jpg",
  "/img/6.jpg",
  "/img/7.jpg",
  "/img/8.jpg",
  "/img/9.jpg",
  "/img/10.jpg",
];

const PhotoGallery = () => {
  const imagesRef = useRef([]);
  const globalIndex = useRef(0);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const distanceFromLast = (x, y) => {
      return Math.hypot(x - last.current.x, y - last.current.y);
    };
    const activate = (image, x, y) => {
      if (!image) return;
      image.style.left = `${x}px`;
      image.style.top = `${y}px`;
      image.style.zIndex = globalIndex.current;
      image.dataset.status = "active";
      image.style.display = "block";
      last.current = { x, y };
    };
    const handleOnMove = (e) => {
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      if (distanceFromLast(x, y) > window.innerWidth / 20) {
        const lead = imagesRef.current[globalIndex.current % imagesData.length];
        const tail =
          imagesRef.current[
            (globalIndex.current - 5 + imagesData.length) % imagesData.length
          ];
        activate(lead, x, y);
        if (tail) {
          tail.dataset.status = "inactive";
          tail.style.display = "none";
        }
        globalIndex.current++;
      }
    };
    window.addEventListener("mousemove", handleOnMove);
    window.addEventListener("touchmove", handleOnMove);
    return () => {
      window.removeEventListener("mousemove", handleOnMove);
      window.removeEventListener("touchmove", handleOnMove);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "rgb(15, 15, 15)",
        overflow: "hidden",
      }}
    >
      {imagesData.map((src, idx) => (
        <img
          key={idx}
          ref={(el) => (imagesRef.current[idx] = el)}
          className="image"
          data-index={idx}
          data-status="inactive"
          src={src}
          alt={`gallery-img-${idx}`}
          style={{
            width: "40vmin",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            display: "none",
          }}
        />
      ))}
    </div>
  );
};

export default PhotoGallery;
