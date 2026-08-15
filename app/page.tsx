export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.35em] text-cyan-300/80">
        J.A.R.V.I.S. UI SANDBOX
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide">
        Design lives here
      </h1>
      <p className="max-w-md text-sm text-[var(--color-muted)]">
        This folder is only for UI experiments. The live assistant stays in
        Desktop/JARVIS until a design is finalized and moved over.
      </p>
      <p className="font-mono text-xs text-white/40">
        npm run dev → http://127.0.0.1:3001
      </p>
    </main>
  );
}
