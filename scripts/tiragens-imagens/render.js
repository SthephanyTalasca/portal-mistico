const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const specs = require('./specs')

const OUT = process.argv[2]
const only = process.argv[3]

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

function stars(seed) {
  let s = seed, out = ''
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < 140; i++) {
    const x = rnd() * 1600, y = rnd() * 1200, r = rnd() * 1.6 + 0.3, o = rnd() * 0.6 + 0.15
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#f5edff" opacity="${o.toFixed(2)}"/>`
  }
  return out
}

function card(spec, c) {
  const w = c.w || spec.cw, h = c.h || spec.ch
  const small = spec.small
  const numSize = Math.round(w * (small ? 0.36 : 0.34))
  const labSize = spec.tight ? 10.5 : small ? 13 : Math.max(15, Math.round(w * 0.105))
  const cls = ['card', c.opt && 'opt', c.hi && 'hi', c.rot && 'rot'].filter(Boolean).join(' ')
  const style = `left:${c.x - w / 2}px;top:${c.y - h / 2}px;width:${w}px;height:${h}px;`
  const showLabel = !spec.numOnly
  const num = `<div class="num" style="font-size:${c.numTop ? 30 : numSize}px">${c.n}</div>`
  const inner = c.rot
    ? `<div class="num rotnum" style="font-size:30px">${c.n}</div>`
    : `${c.pre ? `<div class="pre">${c.pre}</div>` : '<div class="star">✦</div>'}${num}${showLabel ? `<div class="lab" style="font-size:${labSize}px">${esc(c.label)}</div>` : ''}`
  let html = `<div class="${cls}${spec.tight ? ' tight' : ''}${c.numTop ? ' numtop' : ''}" style="${style}"><div class="frame">${inner}</div></div>`
  if (c.sub) {
    const side = c.subSide === 'right'
    const st = side
      ? `left:${c.x + w / 2 + 28}px;top:${c.y - 14}px;text-align:left;`
      : `left:${c.x - 160}px;top:${c.y + h / 2 + 18}px;width:320px;text-align:center;`
    html += `<div class="sub" style="${st}">${esc(c.sub)}</div>`
  }
  return html
}

function page(spec) {
  const lines = (spec.lines || []).map(([a, b, c, d]) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" />`).join('')
  const circle = spec.circle ? `<circle cx="${spec.circle.cx}" cy="${spec.circle.cy}" r="${spec.circle.r}" class="orbit"/><circle cx="${spec.circle.cx}" cy="${spec.circle.cy}" r="${spec.circle.r - 120}" class="orbit thin"/>` : ''
  const tags = [
    ...(spec.colTags || []).map(([x, t]) => `<div class="tag" style="left:${x - 120}px;top:${spec.cards[0].y - spec.ch / 2 - 52}px;width:240px">${t}</div>`),
    ...(spec.rowTagsLeft || []).map(([y, t]) => `<div class="tag vert" style="left:${spec.cards[0].x - spec.cw / 2 - 250}px;top:${y - 12}px;width:200px;text-align:right">${t}</div>`),
    ...(spec.rowTags || []).map(([y, t]) => `<div class="tag" style="left:20px;top:${y - 12}px;width:220px;text-align:left;opacity:.0">${t}</div>`),
    ...(spec.pathTags || []).map(([x, y, t]) => `<div class="tag big" style="left:${x - 140}px;top:${y}px;width:280px">${t}</div>`),
  ].join('')
  const legend = spec.legend
    ? `<div class="legend" style="left:${spec.legend.x}px;top:${spec.legend.y}px">${spec.cards
        .map((c) => `<div class="li"><span class="ln">${c.n}</span><span>${esc(c.label)}</span></div>`)
        .join('')}</div>`
    : ''
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:1600px;height:1200px;background:#09060f;overflow:hidden}
.stage{position:relative;width:1600px;height:1200px;
  background:radial-gradient(ellipse 60% 50% at 50% 55%,rgba(123,44,191,.28),transparent 70%),
             radial-gradient(ellipse 40% 30% at 15% 10%,rgba(168,85,247,.12),transparent 70%),
             linear-gradient(180deg,#0d0816,#09060f 60%,#120a1d)}
svg.bg{position:absolute;inset:0}
.border{position:absolute;inset:26px;border:1px solid rgba(216,180,254,.22);border-radius:22px}
.border::after{content:"";position:absolute;inset:8px;border:1px solid rgba(216,180,254,.08);border-radius:16px}
.title{position:absolute;top:58px;left:0;right:0;text-align:center;font-family:'Cinzel Decorative',serif;font-weight:700;color:#f5edff;font-size:56px;letter-spacing:.02em;text-shadow:0 0 28px rgba(168,85,247,.55)}
.title.long{font-size:44px;top:66px}
.subt{position:absolute;top:142px;left:0;right:0;text-align:center;font-family:'Cinzel',serif;color:#d8b4fe;font-size:22px;letter-spacing:.32em;text-transform:uppercase}
.subt b{color:#a855f7;font-weight:500;margin:0 14px}
svg.lines line{stroke:rgba(216,180,254,.35);stroke-width:2;stroke-dasharray:6 10}
.orbit{fill:none;stroke:rgba(216,180,254,.22);stroke-width:1.5;stroke-dasharray:4 8}
.orbit.thin{stroke:rgba(168,85,247,.18)}
.card{position:absolute;border-radius:14px;padding:7px;
  background:linear-gradient(160deg,#2a1640,#1d102c 55%,#160c23);
  border:1.5px solid rgba(216,180,254,.55);
  box-shadow:0 0 0 1px rgba(168,85,247,.25),0 18px 40px -18px rgba(123,44,191,.8),0 0 30px -8px rgba(168,85,247,.45)}
.card.hi{border-color:#d8b4fe;box-shadow:0 0 0 1px rgba(216,180,254,.6),0 0 46px -4px rgba(168,85,247,.85)}
.card.opt{background:rgba(29,16,44,.45);border:2px dashed rgba(216,180,254,.5);box-shadow:none}
.card.rot{transform:rotate(90deg);z-index:2;background:linear-gradient(160deg,#341a4f,#24123a)}
.frame{position:relative;width:100%;height:100%;border:1px solid rgba(216,180,254,.22);border-radius:9px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6px 6px}
.tight{padding:3px}.tight .frame{padding:2px}.tight .lab{letter-spacing:0;font-size:11.5px!important}
.card.opt .frame{border-color:transparent}
.num{font-family:'Cormorant Garamond',serif;font-weight:600;color:#f5edff;line-height:1;text-shadow:0 0 18px rgba(168,85,247,.8)}
.numtop .frame{justify-content:flex-start;padding-top:8px}
.numtop .star{display:none}
.rotnum{transform:rotate(-90deg);margin-left:0}
.star{color:#a855f7;font-size:14px;margin-bottom:4px;opacity:.9}
.pre{font-family:'Cinzel',serif;color:#b9a8c9;font-size:11px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:2px}
.lab{font-family:'Cinzel',serif;font-weight:500;color:#d8b4fe;letter-spacing:.06em;text-transform:uppercase;line-height:1.2;margin-top:8px;max-width:100%}
.sub{position:absolute;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:26px;color:#b9a8c9}
.tag{position:absolute;text-align:center;font-family:'Cinzel',serif;color:#a855f7;font-size:18px;letter-spacing:.28em;text-transform:uppercase}
.tag.big{font-size:22px;color:#d8b4fe}
.legend{position:absolute;width:460px;padding:28px 34px;border:1px solid rgba(216,180,254,.22);border-radius:16px;background:rgba(20,11,32,.6)}
.li{display:flex;align-items:center;gap:18px;padding:9px 0;border-bottom:1px solid rgba(216,180,254,.08);font-family:'Cinzel',serif;color:#f5edff;font-size:21px;letter-spacing:.04em}
.li:last-child{border-bottom:0}
.ln{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;border:1px solid #a855f7;color:#d8b4fe;font-family:'Cormorant Garamond',serif;font-weight:600;font-size:22px;flex:none}
.foot{position:absolute;bottom:46px;left:0;right:0;text-align:center;color:rgba(216,180,254,.4);font-family:'Cinzel',serif;font-size:16px;letter-spacing:.5em}
</style></head><body><div class="stage">
<svg class="bg" width="1600" height="1200">${stars(spec.slug.length * 97)}</svg>
<div class="border"></div>
<div class="title${spec.title.length > 24 ? ' long' : ''}">${esc(spec.title)}</div>
<div class="subt">Baralho Cigano<b>✦</b>${spec.count}</div>
<svg class="bg lines" width="1600" height="1200">${lines}${circle}</svg>
${tags}
${spec.cards.map((c) => card(spec, c)).join('')}
${legend}
${spec.small ? '' : '<div class="foot">☾ ✦ ☽</div>'}
</div></body></html>`
}

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const p = await browser.newPage({ viewport: { width: 1600, height: 1200 } })
  for (const spec of specs) {
    if (only && spec.slug !== only) continue
    await p.setContent(page(spec), { waitUntil: 'networkidle' })
    await p.evaluate(() => document.fonts.ready)
    await p.screenshot({ path: path.join(OUT, spec.slug + '.png') })
    console.log('ok', spec.slug)
  }
  await browser.close()
})()
