# Jarvis UI test

Light desktop **Consciousness Interface** sandbox. The live assistant stays in `Desktop/JARVIS` until this design is signed off.

## Run

```bash
cd "C:\Users\saivenkat\Desktop\jarvis UI test"
npm run dev
```

Open **http://127.0.0.1:3001** (port **3001** so it does not clash with live Jarvis on 3000).

This sandbox is **UI only**. Chat, mic, and orb states are local previews. No Python backend is required.

## What this is

- Light chrome around the **ice orb** from [Jarvis-chat](https://github.com/saivenkat280506/Jarvis-chat.git)
- Left rail: orb + Router / Mode / Voice / Latency
- Right: chat, streamed reply preview, voice demo, mute, refresh
- **Focus** collapses to the orb window; **Console** is the split desktop
- **Preview** chips cycle Standby / Listen / Think / Speak

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Three.js + `@react-three/fiber` + `@react-three/drei` (orb)
- `motion`, `lucide-react`

## Later: move into live Jarvis

See [INTEGRATE.md](./INTEGRATE.md).
