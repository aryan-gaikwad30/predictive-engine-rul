export default function Footer() {
  return (
    <footer className="bg-transparent py-12 md:py-16 border-t border-[var(--color-border)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--color-primary)] opacity-[0.01] pointer-events-none"></div>
      <div className="container mx-auto px-6 md:px-8 max-w-[1440px] relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          <div className="flex flex-col gap-2">
            <div className="font-bold tracking-tighter text-2xl md:text-3xl text-[var(--color-text)] uppercase">
              Predictive<span className="text-[var(--color-primary)] text-glow-primary">Engine</span>
            </div>
            <p className="text-sm font-bold tracking-widest uppercase text-[var(--color-muted)]">
              Machine Learning for Predictive Maintenance.
            </p>
          </div>
          
          <div className="flex items-center gap-8 text-xs font-bold tracking-widest uppercase text-[var(--color-text)]">
            <a href="https://github.com/aryan-gaikwad30/predictive-engine-rul" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] hover:text-glow-primary transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/aryan-gaikwad-671501258/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)] hover:text-glow-primary transition-colors">LinkedIn</a>
          </div>
          
          <div className="text-xs font-bold tracking-widest uppercase text-[var(--color-muted)] font-mono">
            © 2026 Aryan
          </div>
          
        </div>
      </div>
    </footer>
  );
}
