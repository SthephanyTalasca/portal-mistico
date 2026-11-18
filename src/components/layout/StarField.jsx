import { useMemo } from 'react'

// Céu estrelado leve: poucas estrelas em CSS, sem canvas.
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function StarField({ count = 46 }) {
  const stars = useMemo(() => {
    const rnd = seeded(7)
    return Array.from({ length: count }, () => ({
      left: `${(rnd() * 100).toFixed(2)}%`,
      top: `${(rnd() * 100).toFixed(2)}%`,
      size: rnd() < 0.85 ? 1 + rnd() * 1.2 : 2.2 + rnd(),
      delay: `${(rnd() * 6).toFixed(2)}s`,
      duration: `${(3 + rnd() * 4).toFixed(2)}s`,
    }))
  }, [count])

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.duration }}
        />
      ))}
    </div>
  )
}
