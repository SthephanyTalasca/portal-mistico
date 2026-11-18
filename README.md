# Portal Místico — Consultas Oraculares

Site completo para consultas de Baralho Cigano (Petit Lenormand), com catálogo dinâmico, integração com WhatsApp e **painel administrativo privado** (`/admin`) para gerenciar tudo sem mexer em código.

**Stack:** React 18 + Vite · React Router · Supabase (Auth, PostgreSQL com RLS, Storage) · CSS puro mobile-first · deploy na Vercel ou Netlify.

---

## 1. Arquitetura

```
Navegador (React SPA)
 ├─ Site público  ──► lê só conteúdo publicado ─┐
 └─ /admin (lazy) ──► login Supabase Auth ──────┤
                                                ▼
                         Supabase
                         ├─ Auth (e-mail + senha, sem cadastro público)
                         ├─ PostgreSQL + Row Level Security
                         │   decks · categories · spreads · services · faqs
                         │   site_settings · homepage_content · media · admins
                         └─ Storage: bucket "media" (leitura pública, escrita só admin)
```

- **Não existe backend próprio**: o navegador fala direto com o Supabase usando a chave **pública** (anon). Quem protege os dados é o banco: as políticas RLS liberam leitura só do que está publicado e escrita só para usuários da tabela `admins`. Esconder botões não é o que protege o sistema.
- O painel é carregado sob demanda: visitantes não baixam o código do admin.
- Preços ficam em **centavos** (inteiros) para evitar erro de arredondamento.
- O botão de WhatsApp de cada tiragem monta a mensagem **na hora**, com o nome e o preço atuais do banco. Mudou o preço no painel, a mensagem muda junto.

### Estrutura de pastas

```
portal-mistico/
├─ index.html                 # fontes, metadados padrão de SEO
├─ vercel.json / netlify.toml # rotas da SPA
├─ .env.example               # variáveis de ambiente (modelo)
├─ public/                    # favicon, robots.txt (bloqueia /admin)
│  └─ tiragens/               # imagens do modelo de cada tiragem (.webp)
├─ supabase/
│  ├─ migrations/
│  │  ├─ 20261117000001_schema.sql  # tabelas, RLS, storage, funções
│  │  ├─ 20261117000002_seed.sql    # baralho, categorias, 3 tiragens, FAQ
│  │  └─ 20261118000001_novas_tiragens.sql # 11 tiragens (rascunho) + exemplos da Pergunta Objetiva
│  └─ create_admin.sql        # transforma seu usuário em administradora
└─ src/
   ├─ App.jsx                 # rotas
   ├─ lib/                    # supabase, api, whatsapp, formatação, upload, markdown
   ├─ context/                # SiteContext (configurações) e AuthContext
   ├─ hooks/                  # useAsync, useSeo
   ├─ components/
   │  ├─ layout/              # Header, Footer, WhatsApp flutuante, céu estrelado
   │  ├─ cards/               # SpreadCard, DeckCard
   │  └─ ui/                  # ícones, arte do hero, estados, Markdown, Reveal
   ├─ pages/                  # Home, Baralhos, Tiragens, Detalhe, Serviços, Sobre, Contato, FAQ, Legais
   ├─ admin/                  # login, layout, guarda de acesso e telas do painel
   └─ styles/                 # global.css e admin.css
```

### Rotas

| Público | | Painel (login obrigatório) |
|---|---|---|
| `/` Início | `/servicos` Rituais | `/admin` Visão geral |
| `/baralhos` | `/sobre` | `/admin/baralhos` |
| `/baralhos/:slug` (tiragens do baralho) | `/contato` | `/admin/tiragens` (+ `/nova`, `/:id`) |
| `/tiragens` (busca, filtros, ordenação) | `/perguntas-frequentes` | `/admin/categorias` · `/admin/servicos` · `/admin/faq` |
| `/tiragens/:slug` (detalhes) | `/privacidade` · `/termos` | `/admin/identidade` · `/admin/configuracoes` |

O catálogo aceita links filtrados, ex.: `/tiragens?baralho=baralho-cigano&categoria=amor-e-relacionamentos&ordem=preco-asc`.

---

## 2. Proposta visual

**Conceito: templo oracular digital.** Um grimório lido à luz da lua, com navegação de site moderno.

- **Paleta:** fundo `#09060F`, secundário `#140B20`, cards `#1D102C`, roxo `#7B2CBF`, roxo luminoso `#A855F7`, lilás `#D8B4FE`, branco gelo `#F5EDFF`, texto secundário `#B9A8C9`, bordas `#4C286A`.
- **Tipografia:** *Cinzel Decorative* nos títulos de seção, *Cormorant Garamond* no título do hero e nos nomes das tiragens (elegância de livro antigo), *Cinzel* em etiquetas e subtítulos (inscrições), *Manrope* nos textos e botões (legível no celular).
- **Atmosfera:** textura sutil de pergaminho escuro (ruído SVG), céu estrelado em CSS, brilho violeta difuso, ornamentos de lua e estrelas entre títulos, moldura em arco gótico na foto do "Sobre mim".
- **Hero:** composição original em SVG com três cartas em leque (*16 · As Estrelas*, *32 · A Lua*, *33 · A Chave*), lua crescente e estrelas. As cartas flutuam devagar. Pode ser trocada por uma imagem sua no painel.
- **Cards:** fundo `#1D102C`, borda lilás translúcida, sombra roxa. No hover: elevação, borda iluminada e um reflexo que atravessa o card (250ms). Sem imagem, aparece uma arte mística (lua, estrela ou sol) em vez de espaço vazio.
- **Movimento:** aparição gradual no scroll, transição suave entre páginas, botões com glow. Tudo é desligado com `prefers-reduced-motion`.
- **Mobile-first:** menu hambúrguer animado, botões de no mínimo 46px, campos com 16px (sem zoom no iPhone), botão de WhatsApp que some com o menu aberto e não cobre o rodapé, tabelas do painel viram cards.

---

## 3. Configurar o Supabase (cerca de 10 min)

1. Crie uma conta em [supabase.com](https://supabase.com) → **New project** (o plano gratuito atende). Guarde a senha do banco.
2. **Banco:** abra **SQL Editor → New query**, cole e rode, nesta ordem:
   1. `supabase/migrations/20261117000001_schema.sql`
   2. `supabase/migrations/20261117000002_seed.sql`
3. **Sua conta de administradora:**
   - **Authentication → Users → Add user → Create new user**: seu e-mail, uma senha forte, marque *Auto Confirm User*.
   - Edite o e-mail em `supabase/create_admin.sql` e rode no SQL Editor.
4. **Feche o cadastro público:** **Authentication → Sign In / Providers** → desative *Allow new users to sign up*. (Mesmo aberto, ninguém fora da tabela `admins` consegue editar nada; fechar evita contas desnecessárias.)
5. **Chaves:** **Project Settings → API** (ou *API Keys*). Copie a **Project URL** e a chave **anon / publishable**.

> ⚠️ **Nunca** use a chave `service_role` / *secret* no site. Ela ignora todas as regras de segurança.

### Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   (chave pública anon)
```

O `.env` já está no `.gitignore`. Sem essas variáveis, o site mostra uma tela explicando o que configurar, em vez de dados falsos.

---

## 4. Rodar no computador

Requisitos: [Node.js 18+](https://nodejs.org).

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. O painel fica em `http://localhost:5173/admin`.

Para gerar a versão de produção: `npm run build` (sai na pasta `dist/`).

---

## 5. Publicar de graça

### Vercel (recomendado)
1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com) → **Add New → Project** → importe o repositório. A Vercel reconhece o Vite sozinha.
3. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. **Deploy.** O `vercel.json` já faz as rotas (`/tiragens/...`, `/admin`) funcionarem ao recarregar a página.

### Netlify
1. Em [netlify.com](https://netlify.com) → **Add new site → Import an existing project** → escolha o repositório.
2. Build: `npm run build` · Publish: `dist` (já definidos no `netlify.toml`).
3. **Site configuration → Environment variables**: adicione as duas variáveis e faça um novo deploy.

**Domínio próprio:** as duas plataformas permitem conectar um domínio em *Domains*.

---

## 6. Usando o painel

- **Gerenciar tiragens:** tabela com imagem, nome, baralho, preço, status e ações (editar, duplicar, excluir, reordenar). O formulário tem upload de capa e galeria com prévia, editor com formatação básica, perguntas contempladas, formato, prazo, status, etiqueta (Novo, Popular, Em breve) e destaque na homepage, com **pré-visualização do card ao vivo**.
  - **Rascunho:** oculto do público. Use *Pré-visualizar página* para ver como fica (só você enxerga).
  - **Indisponível:** aparece no site, mas sem botão de agendamento.
  - **Publicada:** visível e agendável.
- **Baralhos:** sem limite. Criar, editar, capa, ordem, ocultar ou publicar. Para associar uma tiragem a um baralho, escolha o baralho no formulário da tiragem. Um baralho com etiqueta "Em breve" aparece sem link.
- **Categorias:** criar, renomear, ordenar, ocultar, excluir. Para excluir uma categoria com tiragens, o painel pede para escolher para onde transferi-las (tudo numa única operação no banco).
- **Serviços (Rituais & Trabalhos Espirituais):** a estrutura está pronta, mas nada foi cadastrado. Enquanto nenhum serviço estiver publicado, o site mostra apenas *"Em breve — Novos caminhos e serviços estão sendo preparados."*
- **Imagens e identidade:** nome do oráculo, logotipo, frase do rodapé, textos e imagem do hero, títulos das seções, "Sobre mim" (nome profissional, frase, biografia, foto).
- **Configurações:** número do WhatsApp (com botão de teste), redes sociais, informações de atendimento, SEO e imagem de compartilhamento, política de privacidade e termos.

Imagens aceitas: JPG, PNG ou WebP até 5 MB. Ao substituir ou remover uma imagem, o arquivo antigo é apagado do Storage quando não é mais usado em nenhum lugar.

---

## 7. O que você ainda precisa preencher

Nada disso foi inventado. Ajuste pelo painel:

- **Nome do oráculo:** o padrão é *"Oráculo Lunar"*, só para ocupar o lugar.
- **Perguntas frequentes:** as respostas sobre **pagamento, entrega e prazos** estão neutras ("combinado pelo WhatsApp"). Troque pelas suas regras.
- **Sobre mim:** nome profissional, foto, biografia e redes.
- **Formato de atendimento e prazo** de cada tiragem (só aparecem no site quando preenchidos).
- **Política de privacidade e termos de atendimento.**
- **Imagem de compartilhamento** (1200×630) e descrição de SEO.

---

## 8. Segurança, em resumo

| Regra | Onde é garantida |
|---|---|
| Visitantes leem só baralhos publicados, tiragens publicadas ou indisponíveis, serviços publicados e FAQs visíveis | Políticas RLS de `select` |
| Só administradoras criam, editam ou excluem | `public.is_admin()` em todas as políticas de escrita |
| Ninguém se torna administradora pelo site | `admins` não tem política de escrita: só via SQL Editor |
| Upload e remoção de imagens só por administradoras | Políticas em `storage.objects` + limite de 5 MB e tipos no bucket |
| Exclusão de categoria com tiragens exige transferência | Função `delete_category_transfer` (verifica admin) + `on delete restrict` |
| Texto formatado não executa scripts | O Markdown escapa o HTML antes de formatar |

---

## 9. Limitações e próximos passos

- **Prévia em redes sociais:** por ser uma SPA, WhatsApp, Instagram etc. leem só os metadados padrão do `index.html` (o Google lê os de cada página). Para prévias por tiragem, o próximo passo é pré-renderizar ou migrar para um framework com SSR.
- **Recuperar senha:** faça pelo painel do Supabase (*Authentication → Users → Send password recovery*).
- **Preparado, mas não implementado** (como pedido): agendamento online, pagamentos e depoimentos. O banco aceita novas tabelas no mesmo padrão (`id`, timestamps, `sort_order`, status e RLS).
