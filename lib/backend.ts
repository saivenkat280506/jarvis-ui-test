/**
 * Talks to the existing Jarvis backend.
 * Default: http://127.0.0.1:8000 (the live Desktop/JARVIS process).
 * Do not start a second backend from this UI sandbox.
 */
export const JARVIS_BACKEND =
  process.env.NEXT_PUBLIC_JARVIS_BACKEND ?? "http://127.0.0.1:8000";

export async function backendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${JARVIS_BACKEND}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
