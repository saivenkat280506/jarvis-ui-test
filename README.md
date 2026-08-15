# Jarvis UI test

Design sandbox on the Desktop. **Do not edit the live UI in `Desktop/JARVIS` until a design is chosen.**

## Run

```bash
cd "C:\Users\saivenkat\Desktop\jarvis UI test"
npm run dev
```

Open **http://127.0.0.1:3001** (port **3001** so it does not clash with live Jarvis on 3000).

The live backend can stay at **http://127.0.0.1:8000**. This app does not start Python.

## Stack (matches live Jarvis)

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- `lucide-react`, `motion`, `clsx`, `tailwind-merge`, `class-variance-authority`
- Path alias `@/*`

## Later: move into live Jarvis

See [INTEGRATE.md](./INTEGRATE.md).
