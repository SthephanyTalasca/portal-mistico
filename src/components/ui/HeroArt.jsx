import { SPARKLE_PATH } from './Icons'

// Composição artística original: três cartas em leque, lua crescente e estrelas.
function Card({ x, y, rotate, num, title, floatClass, children }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <g className={`hero-card ${floatClass}`}>
        <rect x="-78" y="-120" width="156" height="240" rx="12" fill="url(#cardFace)" stroke="#D8B4FE" strokeOpacity=".55" />
        <rect x="-68" y="-110" width="136" height="220" rx="7" fill="none" stroke="#A855F7" strokeOpacity=".45" strokeDasharray="2 3" />
        <text x="0" y="-86" textAnchor="middle" className="hero-card-num">{num}</text>
        <path d="M-40 -74 H40" stroke="#D8B4FE" strokeOpacity=".35" />
        <g transform="translate(0 -6)">{children}</g>
        <path d="M-40 66 H40" stroke="#D8B4FE" strokeOpacity=".35" />
        <text x="0" y="90" textAnchor="middle" className="hero-card-title">{title}</text>
        {[[-60, -102], [60, -102], [-60, 102], [60, 102]].map(([cx, cy], i) => (
          <path key={i} d={SPARKLE_PATH} transform={`translate(${cx} ${cy}) scale(4)`} fill="#D8B4FE" opacity=".7" />
        ))}
      </g>
    </g>
  )
}

export default function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 480 520" role="img" aria-label="Cartas do Baralho Cigano sob a lua crescente">
      <defs>
        <radialGradient id="heroGlow" cx="50%" cy="48%" r="50%">
          <stop offset="0" stopColor="#A855F7" stopOpacity=".42" />
          <stop offset=".55" stopColor="#7B2CBF" stopOpacity=".14" />
          <stop offset="1" stopColor="#09060F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cardFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2A1640" />
          <stop offset="1" stopColor="#140B20" />
        </linearGradient>
        <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5EDFF" />
          <stop offset="1" stopColor="#C084FC" />
        </linearGradient>
        <mask id="heroMoonMask">
          <rect width="480" height="520" fill="#fff" />
          <circle cx="404" cy="84" r="44" fill="#000" />
        </mask>
        <mask id="cardMoonMask">
          <rect x="-40" y="-40" width="80" height="80" fill="#fff" />
          <circle cx="12" cy="-8" r="24" fill="#000" />
        </mask>
      </defs>

      <circle cx="240" cy="260" r="250" fill="url(#heroGlow)" />
      <g fill="none" stroke="#4C286A" strokeOpacity=".8">
        <circle cx="240" cy="270" r="200" />
        <circle cx="240" cy="270" r="168" strokeDasharray="2 6" />
      </g>

      <g className="hero-moon">
        <circle cx="380" cy="100" r="50" fill="url(#moonGrad)" mask="url(#heroMoonMask)" />
      </g>

      {[[70, 70, 7], [120, 470, 5], [430, 300, 6], [40, 320, 4], [300, 30, 4], [450, 470, 5]].map(([x, y, s], i) => (
        <path key={i} className={`twinkle tw-${i % 3}`} d={SPARKLE_PATH} transform={`translate(${x} ${y}) scale(${s})`} fill="#D8B4FE" />
      ))}

      <Card x={140} y={300} rotate={-14} num="16" title="As Estrelas" floatClass="float-a">
        <path d={SPARKLE_PATH} transform="scale(30)" fill="#D8B4FE" />
        <path d={SPARKLE_PATH} transform="translate(-30 -28) scale(8)" fill="#A855F7" />
        <path d={SPARKLE_PATH} transform="translate(30 30) scale(7)" fill="#A855F7" />
      </Card>
      <Card x={340} y={300} rotate={14} num="33" title="A Chave" floatClass="float-c">
        <g fill="none" stroke="#D8B4FE" strokeWidth="4" strokeLinecap="round">
          <circle cx="0" cy="-26" r="14" />
          <path d="M0 -12 V38 M0 22 H14 M0 32 H10" />
        </g>
      </Card>
      <Card x={240} y={270} rotate={0} num="32" title="A Lua" floatClass="float-b">
        <circle r="30" fill="url(#moonGrad)" mask="url(#cardMoonMask)" />
        <circle r="40" fill="none" stroke="#A855F7" strokeOpacity=".5" />
      </Card>
    </svg>
  )
}
