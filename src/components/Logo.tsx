export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={"flex items-center gap-2 " + className}>
      <div className="gradient-primary flex h-8 w-8 items-center justify-center rounded-xl shadow-elegant">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l9-7 9 7" />
          <path d="M5 10v10h14V10" />
        </svg>
      </div>
      <span className="font-display text-lg font-bold tracking-tight">
        Nyumba<span className="text-primary">Search</span>
      </span>
    </div>
  );
}
