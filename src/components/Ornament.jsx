/*
 * Hand-built SVG ornaments — a distinct motif per design.
 * Inherits the current theme accent colour via currentColor.
 */
const Ornament = ({ design = 0 }) => {
  if (design === 0) {
    // Minimal — a thin rule broken by a single dot
    return (
      <svg viewBox="0 0 220 24" className="w-full max-w-[230px] h-6 mx-auto block" aria-hidden="true">
        <line x1="0" y1="12" x2="92" y2="12" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="110" cy="12" r="3" fill="currentColor" />
        <line x1="128" y1="12" x2="220" y2="12" stroke="currentColor" strokeWidth="0.8" />
      </svg>
    );
  }

  // Traditional — a lotus / lamp bloom
  return (
    <svg viewBox="0 0 160 72" className="w-full max-w-[160px] h-16 mx-auto block" aria-hidden="true">
      <path d="M80 8 C 92 30, 92 52, 80 64 C 68 52, 68 30, 80 8 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M80 64 C 62 52, 44 42, 34 25 C 57 27, 73 42, 80 64 Z" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M80 64 C 98 52, 116 42, 126 25 C 103 27, 87 42, 80 64 Z" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="80" cy="66" r="2" fill="currentColor" />
    </svg>
  );
};

export default Ornament;
