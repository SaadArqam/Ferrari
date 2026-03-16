# 🏎️ Ferrari Telemetry Analyzer

A full-stack web application designed for visualizing and analyzing Scuderia Ferrari's F1 telemetry data. 

Built with **Next.js** and **Tailwind CSS** on the frontend, and a **Python FastAPI** backend powered by the [FastF1](https://docs.fastf1.dev/) library, this project provides a high-performance, real-time replay of telemetry data straight from the official F1 timing systems.

![Ferrari Telemetry Demo](https://i.imgur.com/712WfL9.png) *(Preview of the telemetry dashboard)*

---

## ✨ Features

- **🏎️ Telemetry Replay**: Pixel-perfect replay of a driver's fastest lap using 60fps HTML Canvas animations.
- **📍 Track Reconstruction**: Mathematically reconstructs the circuit layout dynamically using raw X/Y telemetry coordinates.
- **🌈 Live Speed Gradients**: Visualizes the racing line painted with a continuous gradient translating velocity directly into colour (slow=red, fast=green).
- **📊 Live Data Dash**: Real-time numerical display panel for Speed, Throttle, Brake intensity, and active Gear synchronized perfectly with the playback marker.
- **⚙️ Complete Session Selector**: Access data from 25+ Grand Prix events spanning the 2022 to 2024 seasons for Charles Leclerc, Carlos Sainz, Lewis Hamilton, and Oliver Bearman.
- **⚡ Supercharged Caching**: Utilises dual-layer caching—in-memory `@lru_cache` and FastF1's disk-based SQLite cache—ensuring massive gigabyte data payloads are sliced and delivered to the UI in milliseconds after the first load.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Directory)
- **UI & Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Visuals**: Native HTML `<canvas>`, `react-icons`
- **Architecture**: Decoupled component design

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Data Engine**: `pandas` & [FastF1](https://docs.fastf1.dev/)
- **Server**: `uvicorn`

---

## 🚀 Quick Start

### 1. Start the Backend (FastAPI)
The backend requires Python 3.10+ and provisions the FastF1 session data pipelines.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the API server
uvicorn app.main:app --reload --port 8000
```

### 2. Start the Frontend (Next.js)
```bash
cd frontend
npm install

# Run the UI server
npm run dev
```

The application will be available at [**`http://localhost:3000`**](http://localhost:3000).
*Note: Navigate to the `/telemetry` route for the dedicated dashboard workspace.*

---

## 📁 Project Structure

```text
Ferrari/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entry point & CORS
│   │   ├── routes/
│   │   │   └── telemetry.py            # Next.js endpoint definition
│   │   └── services/
│   │       └── fastf1_service.py       # Core pandas logic & FastF1 integration
│   └── requirements.txt
│
└── frontend/
    ├── src/app/
    │   ├── page.js                     # Main landing page
    │   ├── telemetry/
    │   │   └── page.js                 # 🏎️ Dashboard Route Layout
    │   └── components/
    │       └── TrackMap.jsx            # 🧠 HTML Canvas rendering engine
    ├── tailwind.config.ts
    └── package.json
```

---

## 🏁 How it Works (The Math!)
The track is never loaded from an image or a preset shape. Instead, when a driver is selected:
1. FastF1 fetches thousands of `[X, Y, Speed]` vectors from the FIA server.
2. The `useMemo` hook normalises the coordinates around a geometric centre-point `(midX, midY)`.
3. It scales the track recursively to fit within an `800x800` canvas whilst preserving the X:Y aspect ratio perfectly.
4. The canvas context draws linear gradients between every single adjacent point acting as tangent lines, naturally reconstructing a smooth, continuous track map.

---

## ⚠️ Notes
- First-time loading of a specific Grand Prix can take 5–15 seconds while FastF1 downloads the multi-gigabyte `.erg` archive from the FIA. Ensuing requests for the same race are cached on disk and resolve near-instantly.
- Due to the high payload caching strategy, it's recommended to add `backend/app/cache/` to your `.gitignore` to avoid pushing gigabytes of SQLite data to GitHub.
