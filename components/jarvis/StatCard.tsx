import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  active?: boolean;
};

export default function StatCard({ icon, label, value, active }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3.5 transition-all",
        active
          ? "border-cyan-300/70 bg-cyan-50/90 shadow-[0_0_24px_rgba(8,145,178,0.12)]"
          : "border-white/80 bg-white/70",
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        {icon}
        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.25em]">
          {label}
        </span>
      </div>
      <div className="text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}
