# How this UI will replace the live Jarvis UI

Live app: `C:\Users\saivenkat\Desktop\JARVIS`  
This sandbox: `C:\Users\saivenkat\Desktop\jarvis UI test`

Do **not** copy files until a design is signed off.

## What stays in live Jarvis (never replace)

- `backend/`
- `scripts/` (launcher + watchdog)
- `electron-main.js`
- `JARVIS.bat`
- contacts, memory DB, voices, music

## What this sandbox will replace

| Sandbox | Goes into live Jarvis |
|---|---|
| `app/` | `app/` |
| `components/` | `components/` |
| `hooks/` | `hooks/` |
| `lib/` (except keep backend URL) | `lib/` |
| `public/` | `public/` |
| `app/globals.css` | `app/globals.css` |

## Backend contract

Talk to the existing API only:

- Health: `GET http://127.0.0.1:8000/health`
- Chat / voice: same routes the current UI already uses

Use `lib/backend.ts` (`NEXT_PUBLIC_JARVIS_BACKEND`).

## Merge steps (when ready)

1. Stop the live UI (`Run JARVIS` is UI-only; backend can stay up).
2. Copy finalized `app`, `components`, `hooks`, `lib`, `public` into `Desktop/JARVIS`.
3. Keep live `package.json` scripts (`desktop`, `jarvis`). Add any new UI packages if needed.
4. Electron still loads `http://127.0.0.1:3000` — after merge, run live `npm run dev` as today.

## Next Grok session

Open this folder as the workspace:

`C:\Users\saivenkat\Desktop\jarvis UI test`

Design screens here. Do not modify `Desktop/JARVIS` UI files.
