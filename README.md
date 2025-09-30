
# TensorFlow.js Monorepo (Web + React Native)

This monorepo contains **two** minimal apps that demonstrate **TensorFlow.js**:
- **`web/`** — Vite + React (runs **@tensorflow-models/mobilenet** in browser)
- **`mobile/`** — Expo React Native (runs **@tensorflow/tfjs-react-native** + mobilenet on-device)

The goal is to show breadth: **same ML concept** (image classification) implemented in **both web and mobile** with shared UI ideas.

## Folder Structure
```
tfjs-monorepo/
├─ web/           # Vite + React web app
└─ mobile/        # Expo React Native app
```

---

## Web App (`web/`)

**Features**
- Upload an image, run **mobilenet** inference in browser (WebGL/CPU)
- Display top-3 predictions

**Run**
```bash
cd web
npm i
npm run dev
```
Then open the printed localhost URL.

---

## Mobile App (`mobile/`)

**Features**
- Pick image from camera roll
- Load **mobilenet** via **@tensorflow/tfjs** + **@tensorflow/tfjs-react-native**
- Run on-device inference and show top-3 predictions

**Run (Expo)**
```bash
cd mobile
npm i
# Prebuild native code (ensures GL + deps are installed)
npx expo prebuild
# Start the app
npx expo start
```
Open on iOS/Android via the Expo app or simulator.

> Notes:
> - `tfjs-react-native` uses a custom backend; first load may take a few seconds.
> - Ensure you accept camera roll permissions when picking an image.

---

## Next Steps
- Swap mobilenet with a custom TFJS graph model
- Add live camera preview classification
- Share preprocessing utils between web and mobile (e.g., as a small local package)
- Add e2e tests (Cypress for web, Detox for mobile)

MIT © 2025
