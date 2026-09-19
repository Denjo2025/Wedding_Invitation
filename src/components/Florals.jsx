/*
 * Hand-drawn botanical sprays for the garden design.
 * Absolutely positioned inside a `relative` container; inherits accent via currentColor.
 */

const CornerSpray = ({ style }) => (
  <svg viewBox="0 0 120 120" style={style} className="absolute w-16 xs:w-20" aria-hidden="true">
    <path d="M6 6 C 34 20, 52 42, 62 78" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M28 26 C 16 20, 8 12, 8 4 C 20 6, 28 14, 28 26 Z" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    <path d="M44 44 C 34 34, 30 24, 32 14 C 44 20, 50 32, 44 44 Z" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    <path d="M30 30 C 44 26, 56 28, 64 38 C 52 44, 38 40, 30 30 Z" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    <g transform="translate(20,18)">
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="0" cy="-8" rx="4.4" ry="8" fill="none" stroke="currentColor" strokeWidth="0.8"
          transform={`rotate(${deg})`} />
      ))}
      <circle cx="0" cy="0" r="2.6" fill="currentColor" />
    </g>
    <g transform="translate(58,60)">
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="0" cy="-6" rx="3.4" ry="6" fill="none" stroke="currentColor" strokeWidth="0.7"
          transform={`rotate(${deg})`} />
      ))}
      <circle cx="0" cy="0" r="2" fill="currentColor" />
    </g>
    <circle cx="86" cy="92" r="2.4" fill="currentColor" />
    <circle cx="96" cy="104" r="1.6" fill="currentColor" />
  </svg>
);

const Vine = ({ style }) => (
  <svg viewBox="0 0 90 220" style={style} className="absolute w-20" aria-hidden="true">
    <path d="M70 4 C 34 40, 80 78, 44 116 C 14 148, 54 180, 34 216"
      fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    {[[56, 32], [46, 74], [58, 116], [40, 156], [46, 192]].map(([cx, cy], idx) => (
      <path key={idx} d={`M${cx} ${cy} C ${cx - 18} ${cy - 6}, ${cx - 26} ${cy - 18}, ${cx - 24} ${cy - 30} C ${cx - 8} ${cy - 26}, ${cx - 2} ${cy - 14}, ${cx} ${cy} Z`}
        fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    ))}
    {[[44, 116], [40, 156]].map(([cx, cy], idx) => (
      <g key={`b${idx}`} transform={`translate(${cx},${cy})`}>
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse key={deg} cx="0" cy="-6" rx="3.2" ry="6" fill="none" stroke="currentColor" strokeWidth="0.7"
            transform={`rotate(${deg})`} />
        ))}
        <circle cx="0" cy="0" r="1.8" fill="currentColor" />
      </g>
    ))}
  </svg>
);

const Florals = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden text-accent" aria-hidden="true">
    <CornerSpray style={{ top: 4, left: 4 }} />
    <CornerSpray style={{ top: 4, right: 4, transform: 'scaleX(-1)' }} />
    <CornerSpray style={{ bottom: 4, left: 4, transform: 'scaleY(-1)' }} />
    <CornerSpray style={{ bottom: 4, right: 4, transform: 'scale(-1, -1)' }} />
    <Vine style={{ top: 120, left: -30, opacity: 0.45 }} />
    <Vine style={{ top: 120, right: -30, opacity: 0.45, transform: 'scaleX(-1)' }} />
  </div>
);

export default Florals;
