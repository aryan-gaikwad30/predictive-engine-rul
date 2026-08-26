export default function Footer() {
  return (
    <footer className="bg-[var(--color-surface)] py-12 md:py-16 border-t border-[var(--color-border)]">
      <div className="container mx-auto px-6 md:px-8 max-w-[1440px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          <div className="flex flex-col gap-2">
            <div className="font-bold tracking-tighter text-2xl md:text-3xl text-[var(--color-graphite)]">
              <span className="text-[var(--color-industrial)]">PREDICTIVE</span> ENGINE
            </div>
            <p className="text-sm font-bold tracking-widest uppercase text-[var(--color-muted)]">
              Machine Learning for Predictive Maintenance.
            </p>
          </div>
          
          <div className="flex items-center gap-8 text-xs font-bold tracking-widest uppercase text-[var(--color-graphite)]">
            <a href="https://github.com/aryan-gaikwad30/predictive-engine-rul" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-industrial)] transition-colors">GitHub</a>
            <a href="YOUR_LINKEDIN_URL_HERE" target="_blank" rel="noopener noreferrer" className="hover:text-[#0077b5] transition-colors">LinkedIn</a>
          </div>
          
          <div className="text-xs font-bold tracking-widest uppercase text-[var(--color-muted)] font-mono">
            © 2026 Aryan
          </div>
          
        </div>
      </div>
    </footer>
  );
}
