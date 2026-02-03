# Ferrari F1 Interactive Gallery

This is a visually rich, interactive web experience built with [Next.js](https://nextjs.org), inspired by the legacy and excitement of Ferrari F1. The project features custom animations, scroll-driven effects, and immersive media to showcase Ferrari's spirit.

## Features

- **Hero Section with Video:** Fullscreen looping video background with Ferrari branding.
- **Animated Navbar:** Minimal, animated navigation with audio feedback and text decryption effect.
- **Scroll-Driven Text Animation:** Pinned, animated text overlays with background imagery and smooth transitions.
- **Photo Gallery:** Interactive gallery that follows mouse/touch movement, displaying Ferrari images in a dynamic, trailing effect.
- **Custom Card Animation:** Animated "Scuderia Ferrari" card with text scrambling and audio on hover.
- **Smooth Scrolling:** Powered by Lenis for buttery-smooth scroll experience.
- **Responsive Design:** Works across devices and screen sizes.
- **Custom Fonts & Styling:** Uses FerroRosso and CoignPro fonts for authentic Ferrari feel.

## Project Structure

```
Ferrari/
├── public/
│   ├── audio/           # Audio effects for UI
│   ├── fonts/           # Custom Ferrari and CoignPro fonts
│   ├── img/             # Ferrari images for gallery and backgrounds
│   ├── video/           # Hero section video
│   └── ...              # SVGs and other assets
├── src/
│   └── app/
│       ├── components/  # All React components (navbar, gallery, card, etc.)
│       ├── globals.css  # Global and Tailwind styles
│       ├── layout.js    # App layout and providers
│       └── page.js      # Main page with all sections
├── package.json         # Dependencies and scripts
├── postcss.config.mjs   # PostCSS/Tailwind config
├── next.config.mjs      # Next.js config
└── README.md            # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd Ferrari
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

- `dev` – Start the development server with Turbopack
- `build` – Build for production
- `start` – Start the production server
- `lint` – Run ESLint

## Main Components

- **KprMinimalNavbar:** Animated navigation bar with audio and text effects.
- **ScrollPinnedTextAnimation:** Scroll-driven, pinned text with background image.
- **Card:** Animated card with text scrambling and audio on hover.
- **PhotoGallery:** Mouse/touch-following image gallery.
- **LenisScrollProvider:** Smooth scrolling provider.
- **LoadingAnimation:** Custom loading animation.
- **About:** (Optional) About section for project context.

## Assets

- **Images:** Located in `public/img/` (10+ Ferrari images)
- **Fonts:** `FerroRosso.ttf` and `CoignPro-47Bold.ttf` in `public/fonts/`
- **Audio:** UI sound effects in `public/audio/`
- **Video:** Hero video in `public/video/`

## Customization

- To add/remove images, update the `public/img/` folder and the `imagesData` array in `photoGallery.jsx`.
- To change hero video, replace `public/video/home.mp4`.
- To update text or sections, edit `src/app/page.js` and relevant components.

## Dependencies

- `next`, `react`, `react-dom`
- `@react-three/fiber`, `@react-three/drei` (for 3D/animation, if used)
- `framer-motion` (animations)
- `gsap` (animations)
- `lenis` and `@studio-freight/lenis` (smooth scrolling)
- `react-icons` (iconography)
- `three` (3D, if used)
- `tailwindcss` (styling)

## License

This project is for educational and demonstration purposes. Please check individual asset licenses before commercial use.
