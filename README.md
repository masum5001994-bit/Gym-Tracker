# 🏋️ BWS Higher Volume Gym Tracker

A production-ready, full-stack workout performance and progressive overload tracking application optimized for the **Built With Science (BWS) Higher Volume Routine** (~14 sets/week target split).

The primary objective of the application is to track weight progression in **Kilograms (KG)**, compute estimated **1RM values (Epley formula)**, trigger real-time synthesized **rest timers**, highlight **PR records**, and provide actionable progressive overload recommendations with a 7-day **Weekly Volume Matrix**.

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (Dark Glassmorphism Token Palette), Lucide Icons, Recharts, Canvas-Confetti, Web Audio API Synthesizer.
- **Backend**: Node.js (TypeScript), Express.js, Prisma ORM.
- **Database**: SQLite / PostgreSQL compatible schema with auto-seeding.
- **Testing**: Vitest for unit tests on calculations & components.

---

## 📁 Repository Structure

```
Gym Tracker/
├── .antigravity/
│   └── rules.md
├── backend/
│   ├── src/
│   │   ├── controllers/          # Express API controllers
│   │   ├── routes/               # API endpoint router definitions
│   │   ├── services/             # Progressive overload & Epley 1RM engine
│   │   └── app.ts                # Express app entry
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma schema
│   │   └── seed.ts               # BWS 5-routine & 25-exercise database seeder
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, RestTimerWidget, DeltaBadge, ExerciseSwapModal, VolumeMatrixCard
│   │   ├── hooks/                # Rest timer hook, Web Audio Synth hook
│   │   ├── pages/                # Dashboard, LiveWorkout, Analytics, FormGuide, History
│   │   ├── services/             # Axios API client
│   │   ├── types/                # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## ⚡ Core Features

1. **Preset BWS Routines Ingestion**: Automatically seeds the 5 BWS Higher Volume routines in Kilograms (KG):
   - Upper Body Workout
   - Lower Body 1 (Quad-Focused)
   - Push Workout
   - Pull Workout
   - Lower Body 2 (Glute-Focused)
2. **Live Session & Pre-Population Logic**:
   - Pre-populates set inputs from previous workout performance.
   - Inline delta badges (`🔥 +2.5 kg`, `📈 +2 reps`, `🏆 PR!`).
   - Real-time exercise substitution with BWS PDF recommended alternatives.
3. **Integrated Web Audio Rest Timer**:
   - Synthesized countdown bleeps and completion chime without external audio files.
   - Floating widget with +30s, -10s, pause/resume, and skip controls.
4. **Progressive Overload & Analytics Engine**:
   - Epley Formula 1RM curve calculations: \(1RM = weightKg \times (1 + \frac{reps}{30})\).
   - 7-Day Weekly Volume Matrix benchmarked against the ~14 sets/week target.
5. **BWS Form & Technique Library**:
   - Detailed execution cues, elbow angles, stance tips, and YouTube tutorial links.

---

## 🚀 Quick Start Instructions

### 1. Start Backend API Server
```bash
cd backend
npm install
npx prisma db push
npm run db:seed
npm run dev
```
Backend API will start at: `http://localhost:5001`

### 2. Start Frontend App
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Application will start at: `http://localhost:3000`

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```
