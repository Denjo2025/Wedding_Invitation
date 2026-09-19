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

  if (design === 4) {
    // Scroll — a ribboned scroll closed with a wax seal
    return (
      <svg viewBox="0 0 200 64" className="w-full max-w-[170px] h-16 mx-auto block" aria-hidden="true">
        <path d="M30 40 H170" stroke="currentColor" strokeWidth="1" />
        <path d="M30 40 C 22 40, 18 34, 22 27 C 25 22, 32 22, 35 27" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <path d="M170 40 C 178 40, 182 34, 178 27 C 175 22, 168 22, 165 27" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <path d="M92 52 C 96 58, 104 58, 108 52" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M100 20 L112 32 L100 44 L88 32 Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="100" cy="32" r="3.4" fill="currentColor" />
      </svg>
    );
  }

  if (design === 5) {
    // Garden — a hand-drawn sprig with leaves and two blossoms
    return (
      <svg viewBox="0 0 200 64" className="w-full max-w-[190px] h-16 mx-auto block" aria-hidden="true">
        <path d="M20 52 C 60 46, 105 38, 150 14" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M52 46 C 44 32, 52 22, 66 18 C 66 32, 60 42, 52 46 Z" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M88 37 C 84 23, 94 14, 108 12 C 106 26, 99 34, 88 37 Z" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M45 50 C 37 46, 33 40, 34 33 C 43 35, 48 41, 45 50 Z" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
        <g transform="translate(152,14)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx="0" cy="-7" rx="4" ry="7" fill="none" stroke="currentColor" strokeWidth="0.8"
              transform={`rotate(${deg})`} />
          ))}
          <circle cx="0" cy="0" r="2.4" fill="currentColor" />
        </g>
        <g transform="translate(120,24)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx="0" cy="-5.5" rx="3.2" ry="5.5" fill="none" stroke="currentColor" strokeWidth="0.7"
              transform={`rotate(${deg})`} />
          ))}
          <circle cx="0" cy="0" r="1.8" fill="currentColor" />
        </g>
      </svg>
    );
  }

  if (design === 6) {
    // Kolam — dot grid threaded by loops (drawn corner to corner)
    const dots = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        dots.push(<circle key={`${r}-${c}`} cx={30 + c * 20} cy={14 + r * 14} r="1.7" fill="currentColor" />);
      }
    }
    return (
      <svg viewBox="0 0 180 60" className="w-full max-w-[180px] h-14 mx-auto block" aria-hidden="true">
        <path d="M30 14 C 60 2, 120 2, 150 14 C 162 30, 150 46, 120 46 C 90 46, 60 46, 30 46 C 12 36, 12 24, 30 14 Z"
          fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M50 28 C 70 18, 110 18, 130 28" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M50 34 C 70 44, 110 44, 130 34" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
        {dots}
      </svg>
    );
  }

  if (design === 7) {
    // Rustic boho — a hand-drawn frond under a stitched arc
    return (
      <svg viewBox="0 0 200 64" className="w-full max-w-[190px] h-16 mx-auto block" aria-hidden="true">
        <path d="M20 54 C 40 30, 40 16, 34 6" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((n) => (
          <path key={`l${n}`} d={`M${30 - n} ${44 - n * 8} C ${18 - n * 2} ${40 - n * 8}, ${10 - n} ${32 - n * 8}, ${8 - n} ${22 - n * 8}`}
            fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
        ))}
        {[0, 1, 2, 3, 4].map((n) => (
          <path key={`r${n}`} d={`M${38 + n} ${44 - n * 8} C ${50 + n * 2} ${40 - n * 8}, ${58 + n} ${32 - n * 8}, ${60 + n} ${22 - n * 8}`}
            fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
        ))}
        <path d="M96 46 C 122 46, 148 46, 172 46" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="5 5" strokeLinecap="round" />
        <path d="M104 46 C 116 26, 152 26, 164 46" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="134" cy="30" r="2.2" fill="currentColor" />
      </svg>
    );
  }

  if (design === 8) {
    // Indian ornate — a temple arch with lotus petals and a bead garland
    return (
      <svg viewBox="0 0 200 72" className="w-full max-w-[190px] h-16 mx-auto block" aria-hidden="true">
        <path d="M30 62 V34 C 30 14, 70 8, 100 8 C 130 8, 170 14, 170 34 V62"
          fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M40 62 V36 C 40 22, 70 18, 100 18 C 130 18, 160 22, 160 36 V62"
          fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M100 30 C 108 42, 108 52, 100 60 C 92 52, 92 42, 100 30 Z" fill="currentColor" fillOpacity="0.25" />
        <path d="M100 60 C 88 52, 78 46, 72 36 C 86 38, 96 46, 100 60 Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
        <path d="M100 60 C 112 52, 122 46, 128 36 C 114 38, 104 46, 100 60 Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
        {[46, 62, 78, 94, 110, 126, 142, 158].map((x, n) => (
          <circle key={x} cx={x} cy={n % 2 === 0 ? 70 : 66} r="1.6" fill="currentColor" fillOpacity="0.55" />
        ))}
      </svg>
    );
  }

  if (design === 9) {
    // Letterpress — engraved double rule with a centred diamond
    return (
      <svg viewBox="0 0 240 24" className="w-full max-w-[250px] h-6 mx-auto block" aria-hidden="true">
        <line x1="0" y1="8" x2="240" y2="8" stroke="currentColor" strokeWidth="1.2" />
        <line x1="0" y1="16" x2="240" y2="16" stroke="currentColor" strokeWidth="0.6" />
        <g transform="translate(120 12)">
          <rect x="-9" y="-9" width="18" height="18" fill="var(--color-card-bg, #fff)" stroke="currentColor" strokeWidth="1.2" transform="rotate(45)" />
          <circle cx="0" cy="0" r="2.4" fill="currentColor" />
        </g>
      </svg>
    );
  }

  if (design === 10) {
    // Indigo tile — a diamond lattice with a central lozenge
    return (
      <svg viewBox="0 0 220 44" className="w-full max-w-[220px] h-11 mx-auto block" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((n) => (
          <g key={n} transform={`translate(${30 + n * 40} 22)`}>
            <rect x="-11" y="-11" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="0.9" transform="rotate(45)" />
            <rect x="-6" y="-6" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="0.7" transform="rotate(45)" strokeOpacity="0.7" />
            <circle cx="0" cy="0" r="1.8" fill="currentColor" />
          </g>
        ))}
      </svg>
    );
  }

  if (design === 11) {
    // Kerala mural — a folk lotus medallion between banded rules
    return (
      <svg viewBox="0 0 200 64" className="w-full max-w-[190px] h-16 mx-auto block" aria-hidden="true">
        <path d="M8 14 H192 M8 50 H192" stroke="currentColor" strokeWidth="2.4" />
        <path d="M8 20 H192 M8 44 H192" stroke="currentColor" strokeWidth="0.8" />
        <g transform="translate(100 32)">
          <path d="M0 -16 C 8 -6, 8 6, 0 16 C -8 6, -8 -6, 0 -16 Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" />
          <path d="M0 16 C -12 6, -20 -2, -26 -12 C -12 -10, -3 2, 0 16 Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M0 16 C 12 6, 20 -2, 26 -12 C 12 -10, 3 2, 0 16 Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M0 16 C -20 12, -30 6, -38 0 C -22 2, -8 8, 0 16 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M0 16 C 20 12, 30 6, 38 0 C 22 2, 8 8, 0 16 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        </g>
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
