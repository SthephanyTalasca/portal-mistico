// Especificações de layout de cada tiragem (canvas 1600x1200)
const C = (n, x, y, label, o = {}) => ({ n, x, y, label, ...o })

const HOUSES = ['Cavaleiro','Trevo','Navio','Casa','Árvore','Nuvens','Serpente','Caixão','Buquê','Foice','Chicote','Pássaros','Criança','Raposa','Urso','Estrela','Cegonha','Cão','Torre','Jardim','Montanha','Caminhos','Rato','Coração','Anel','Livro','Carta','Cigano','Cigana','Lírios','Sol','Lua','Chave','Peixes','Âncora','Cruz']

function mesaReal() {
  const cards = []
  const w = 108, gx = 132, gy = 178
  const x0 = 800 - (gx * 7) / 2
  const y0 = 330
  for (let i = 0; i < 32; i++) {
    const r = Math.floor(i / 8), c = i % 8
    cards.push(C(i + 1, x0 + c * gx, y0 + r * gy, HOUSES[i]))
  }
  for (let i = 0; i < 4; i++) cards.push(C(33 + i, x0 + (2 + i) * gx, y0 + 4 * gy, HOUSES[32 + i]))
  return { cw: w, ch: 158, cards, small: true }
}

function mandala() {
  const names = ['Eu','Finanças','Comunicação','Lar e família','Amor','Trabalho e saúde','Relações','Mudanças','Espiritual','Carreira','Amizades','Inconsciente']
  const cx = 800, cy = 700, r = 370
  const cards = names.map((label, k) => {
    const t = ((180 + k * 30) * Math.PI) / 180
    return C(k + 1, cx + r * Math.cos(t), cy - r * Math.sin(t), label, { pre: 'Casa' })
  })
  cards.push(C(13, cx, cy, 'Síntese do ano', { opt: true, w: 132, h: 192 }))
  return { cw: 112, ch: 162, cards, small: true, tight: true, circle: { cx, cy, r } }
}

module.exports = [
  {
    slug: 'triangulo-amoroso', title: 'Triângulo Amoroso', count: '3 cartas',
    cw: 190, ch: 276,
    lines: [[800, 450, 500, 850], [800, 450, 1100, 850], [500, 850, 1100, 850]],
    cards: [
      C(1, 500, 850, 'Consulente', { sub: 'Você e o que sente' }),
      C(2, 1100, 850, 'Parceiro(a)', { sub: 'Sentimentos e interesses' }),
      C(3, 800, 450, 'Terceira pessoa', { sub: 'Intenção e papel na relação', subSide: 'right' }),
    ],
  },
  {
    slug: 'pensamentos-sentimentos-e-atitudes', title: 'Pensamentos, Sentimentos e Atitudes', count: '5 ou 6 cartas',
    cw: 170, ch: 248,
    cards: [
      C(1, 400, 470, 'Pensamentos'),
      C(2, 800, 470, 'Sentimentos'),
      C(3, 1200, 470, 'Intenções'),
      C(4, 400, 880, 'Atitudes'),
      C(5, 800, 880, 'Obstáculos'),
      C(6, 1200, 880, 'Tendência', { opt: true, sub: 'carta opcional' }),
    ],
  },
  {
    slug: 'tiragem-para-ex', title: 'Tiragem para Ex', count: '5 cartas',
    cw: 170, ch: 248,
    lines: [[290, 880, 800, 440], [630, 880, 800, 440], [970, 880, 800, 440], [1310, 880, 800, 440]],
    cards: [
      C(1, 290, 880, 'Pensamentos'),
      C(2, 630, 880, 'Sentimentos'),
      C(3, 970, 880, 'Saudade e afastamento'),
      C(4, 1310, 880, 'Contato'),
      C(5, 800, 440, 'Reconciliação', { sub: 'Tendência entre vocês', subSide: 'right' }),
    ],
  },
  {
    slug: 'caminhos-do-amor', title: 'Caminhos do Amor', count: '6 cartas',
    cw: 170, ch: 248,
    lines: [[800, 900, 420, 470], [800, 900, 1180, 470], [800, 900, 800, 470]],
    cards: [
      C(1, 800, 900, 'Momento atual'),
      C(2, 420, 470, 'Se permanecer'),
      C(3, 1180, 470, 'Se partir'),
      C(4, 1180, 900, 'Nova oportunidade'),
      C(5, 420, 900, 'Bloqueios'),
      C(6, 800, 470, 'Caminho favorável'),
    ],
  },
  {
    slug: 'metodo-peladan', title: 'Método Peladan', count: '5 cartas',
    cw: 160, ch: 234,
    cards: [
      C(1, 470, 690, 'A favor'),
      C(2, 1130, 690, 'Contra'),
      C(3, 800, 415, 'Caminho'),
      C(4, 800, 965, 'Resultado'),
      C(5, 800, 690, 'Síntese'),
    ],
  },
  {
    slug: 'ferradura', title: 'Ferradura', count: '7 cartas',
    cw: 150, ch: 220,
    cards: [
      C(1, 200, 450, 'Passado'),
      C(2, 400, 640, 'Presente'),
      C(3, 600, 830, 'Futuro próximo'),
      C(4, 800, 970, 'Conselho'),
      C(5, 1000, 830, 'Influências externas'),
      C(6, 1200, 640, 'Obstáculos'),
      C(7, 1400, 450, 'Resultado'),
    ],
  },
  { slug: 'mandala-astrologica', title: 'Mandala Astrológica', count: '12 ou 13 cartas', ...mandala() },
  {
    slug: 'cruz-celta', title: 'Cruz Celta', count: '10 cartas',
    cw: 124, ch: 180, numOnly: true,
    cards: [
      C(1, 450, 690, 'Situação atual', { numTop: true }),
      C(2, 450, 725, 'Desafio', { rot: true }),
      C(3, 450, 915, 'Base da questão'),
      C(4, 245, 690, 'Passado recente'),
      C(5, 450, 465, 'Expectativas'),
      C(6, 655, 690, 'Futuro próximo'),
      C(7, 900, 1010, 'Você'),
      C(8, 900, 800, 'Influências externas'),
      C(9, 900, 590, 'Esperanças e medos'),
      C(10, 900, 380, 'Resultado'),
    ],
    legend: { x: 1050, y: 330 },
  },
  {
    slug: 'tiragem-das-9-cartas', title: 'Tiragem das 9 Cartas', count: '9 cartas',
    cw: 150, ch: 214,
    cards: [
      C(1, 720, 440, 'Pensamentos'), C(2, 940, 440, 'Expectativas'), C(3, 1160, 440, 'O que se aproxima'),
      C(4, 720, 690, 'Origem'), C(5, 940, 690, 'Tema central', { hi: true }), C(6, 1160, 690, 'Tendência'),
      C(7, 720, 940, 'Bastidores'), C(8, 940, 940, 'Obstáculos'), C(9, 1160, 940, 'Desfecho'),
    ],
    colTags: [[720, 'Passado'], [940, 'Presente'], [1160, 'Futuro']],
    rowTagsLeft: [[440, 'Consciente'], [690, 'Situação'], [940, 'Oculto']],
  },
  { slug: 'mesa-real', title: 'Mesa Real', count: '36 cartas', ...mesaReal() },
  {
    slug: 'escolha-de-caminhos', title: 'Escolha de Caminhos', count: '6 cartas',
    cw: 160, ch: 234,
    lines: [[800, 960, 520, 700], [520, 700, 330, 430], [800, 960, 1080, 700], [1080, 700, 1270, 430]],
    cards: [
      C(1, 800, 960, 'Momento atual'),
      C(2, 520, 700, 'Desenvolvimento'),
      C(3, 330, 430, 'Resultado'),
      C(4, 1080, 700, 'Desenvolvimento'),
      C(5, 1270, 430, 'Resultado'),
      C(6, 800, 560, 'Conselho', { hi: true }),
    ],
    pathTags: [[330, 270, 'Caminho A'], [1270, 270, 'Caminho B']],
  },
]
