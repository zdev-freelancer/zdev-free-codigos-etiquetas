// Animated, transparent-background hero illustration: a floating label with a
// barcode and a scanning beam, in the logo colors (cyan → indigo). Decorative.
const BAR_WIDTHS = [3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 1, 1, 3, 2, 4, 1, 2, 1];

export function HeroGraphic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 360"
      className={className}
      role="img"
      aria-label="Etiqueta con código de barras escaneada"
    >
      <defs>
        <linearGradient id="hg-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b9fe0" />
          <stop offset="100%" stopColor="#2a2a8c" />
        </linearGradient>
        <filter id="hg-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="18"
            stdDeviation="22"
            floodColor="#0a0a0a"
            floodOpacity="0.12"
          />
        </filter>
      </defs>

      <g className="hg-float">
        {/* soft brand accent behind the tag */}
        <circle cx="300" cy="92" r="64" fill="url(#hg-grad)" opacity="0.1" />
        <circle cx="96" cy="280" r="40" fill="url(#hg-grad)" opacity="0.08" />

        {/* label card */}
        <g filter="url(#hg-shadow)">
          <rect
            x="112"
            y="48"
            width="176"
            height="250"
            rx="18"
            fill="#ffffff"
            stroke="#d2d2d7"
          />
        </g>

        {/* hang hole */}
        <circle cx="200" cy="76" r="9" fill="none" stroke="url(#hg-grad)" strokeWidth="3" />

        {/* sku line */}
        <text
          x="200"
          y="118"
          textAnchor="middle"
          fontFamily="ui-monospace, monospace"
          fontSize="11"
          letterSpacing="2"
          fill="#86868b"
        >
          SKU · 0042
        </text>

        {/* barcode + scan beam */}
        <g transform="translate(140,136)">
          {BAR_WIDTHS.map((w, i) => (
            <rect key={i} x={i * 7} y="0" width={w} height="92" fill="#0a0a0a" />
          ))}
          <g className="hg-scan">
            <rect x="-8" y="-4" width="136" height="3" rx="1.5" fill="#1b9fe0" />
            <rect x="-8" y="-4" width="136" height="10" rx="5" fill="#1b9fe0" opacity="0.18" />
          </g>
        </g>

        {/* footer */}
        <text
          x="200"
          y="256"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="600"
          fontSize="13"
          fill="#0a0a0a"
        >
          CÓDIGOS Y ETIQUETAS
        </text>
        <text
          x="200"
          y="276"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="11"
          fill="#86868b"
        >
          Identificación automática
        </text>
      </g>
    </svg>
  );
}
