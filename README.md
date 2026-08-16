# Jarvis UI test

Light desktop **Consciousness Interface** sandbox. The live assistant stays in `Desktop/JARVIS` until this design is signed off.

## Run

```bash
cd "C:\Users\saivenkat\Desktop\jarvis UI test"
npm run dev
```

Open **http://127.0.0.1:3001** (port **3001** so it does not clash with live Jarvis on 3000).

The live backend can stay at **http://127.0.0.1:8000**. This app does not start Python.

## What this is

- Light chrome around the **exact ice orb** from [Jarvis-chat](https://github.com/saivenkat280506/Jarvis-chat.git)
- Left rail: orb + Router / Mode / Voice / Latency
- Right: chat, live stream, voice trigger, mute, refresh
- **Focus** collapses to the orb window; **Console** is the split desktop
- **Preview** chips cycle Standby / Listen / Think / Speak without waiting on the backend

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Three.js + `@react-three/fiber` + `@react-three/drei` (orb)
- `motion`, `lucide-react`

## Later: move into live Jarvis

See [INTEGRATE.md](./INTEGRATE.md).
