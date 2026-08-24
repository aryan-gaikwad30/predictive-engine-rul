export default function Footer() {
  return (
    <footer className="bg-[var(--color-graphite)] text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-bold tracking-tighter text-xl">
              <span className="text-[var(--color-industrial)]">PREDICTIVE</span> ENGINE
            </div>
            <p className="text-sm font-medium text-[var(--color-muted)]">
              Machine Learning for Predictive Maintenance.
            </p>
          </div>
          
          <div className="flex items-center gap-8 text-sm font-bold tracking-widest uppercase text-gray-400">
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-[#0077b5] transition-colors">LinkedIn</a>
          </div>
          
          <div className="text-sm font-medium text-[var(--color-muted)]">
            © 2026 Aryan
          </div>
          
        </div>
      </div>
    </footer>
  );
}
