-- =====================================================================
-- DADOS INICIAIS (todos editáveis pelo painel /admin)
-- Seguro para rodar mais de uma vez.
-- =====================================================================

insert into public.site_settings (id, oracle_name, footer_phrase, whatsapp_number, seo_title, seo_description)
values (
  1,
  'Oráculo Lunar',
  'Entre cartas, mistérios e caminhos.',
  '5547991678074',
  'Oráculo Lunar · Consultas de Baralho Cigano',
  'Consultas personalizadas de Baralho Cigano (Petit Lenormand). Escolha sua tiragem e agende pelo WhatsApp.'
)
on conflict (id) do nothing;

insert into public.homepage_content (
  id, hero_eyebrow, hero_title, hero_subtitle, decks_title, decks_subtitle,
  featured_title, featured_subtitle, about_title, about_bio, contact_title, contact_text
)
values (
  1,
  '✦ BEM-VINDA AO ORÁCULO ✦',
  'Entre cartas, mistérios e caminhos.',
  'Descubra novas perspectivas através da sabedoria simbólica dos oráculos. Consultas personalizadas com Baralho Cigano.',
  'Os Oráculos',
  'Cada baralho revela uma maneira diferente de compreender seus caminhos.',
  'Tiragens em destaque',
  'Escolha a consulta que melhor corresponde ao seu momento.',
  'Por trás das cartas',
  'Meu trabalho com o Baralho Cigano é um convite à reflexão, à intuição e à descoberta de novas perspectivas sobre os caminhos da vida.',
  'Vamos conversar?',
  'Escolha sua tiragem ou me chame no WhatsApp para tirar dúvidas.'
)
on conflict (id) do nothing;

insert into public.decks (name, slug, description, is_published, sort_order)
values ('Baralho Cigano', 'baralho-cigano', 'Consultas através das 36 cartas do Petit Lenormand.', true, 10)
on conflict (slug) do nothing;

insert into public.categories (name, slug, sort_order) values
  ('Amor e relacionamentos', 'amor-e-relacionamentos', 10),
  ('Caminhos e decisões',    'caminhos-e-decisoes',    20),
  ('Autoconhecimento',       'autoconhecimento',       30),
  ('Perguntas objetivas',    'perguntas-objetivas',    40),
  ('Consultas completas',    'consultas-completas',    50)
on conflict (slug) do nothing;

insert into public.spreads (name, slug, deck_id, category_id, price_cents, short_description, full_description, questions, status, featured, sort_order)
select
  'Pergunta Objetiva', 'pergunta-objetiva',
  (select id from public.decks where slug = 'baralho-cigano'),
  (select id from public.categories where slug = 'perguntas-objetivas'),
  500,
  'Consulta direcionada a uma pergunta específica.',
  'Consulta direcionada a uma pergunta específica.',
  '{}', 'published', true, 10
on conflict (slug) do nothing;

insert into public.spreads (name, slug, deck_id, category_id, price_cents, short_description, full_description, questions, status, featured, sort_order)
select
  'Templo de Afrodite', 'templo-de-afrodite',
  (select id from public.decks where slug = 'baralho-cigano'),
  (select id from public.categories where slug = 'amor-e-relacionamentos'),
  2000,
  'Tiragem dedicada às energias e dinâmicas dos relacionamentos amorosos.',
  'Tiragem dedicada às energias e dinâmicas dos relacionamentos amorosos.',
  '{}', 'published', true, 20
on conflict (slug) do nothing;

insert into public.spreads (name, slug, deck_id, category_id, price_cents, short_description, full_description, questions, status, featured, sort_order)
select
  'Espelho Amoroso', 'espelho-amoroso',
  (select id from public.decks where slug = 'baralho-cigano'),
  (select id from public.categories where slug = 'amor-e-relacionamentos'),
  4000,
  'Consulta amorosa aprofundada sobre sentimentos, intenções e possibilidades.',
  'Consulta amorosa aprofundada que contempla:',
  array[
    'Quais são os sentimentos da pessoa?',
    'Quais são suas intenções?',
    'Ela pensa em mim?',
    'Existe possibilidade de contato?',
    'Qual é a energia para uma reconciliação?'
  ],
  'published', true, 30
on conflict (slug) do nothing;

-- Perguntas frequentes: respostas neutras, sem presumir pagamento ou prazos.
-- Edite em /admin → Perguntas frequentes.
insert into public.faqs (question, answer, sort_order)
select q, a, o from (values
  ('Como funciona uma consulta?',
   'Você escolhe a tiragem que mais combina com o seu momento e entra em contato pelo WhatsApp. Os detalhes do atendimento são combinados diretamente comigo.', 10),
  ('Como faço para agendar?',
   'Na página de cada tiragem há o botão **Agendar pelo WhatsApp**. Ele abre uma conversa com a mensagem já preenchida com o nome e o valor da tiragem escolhida.', 20),
  ('Quais formas de pagamento são aceitas?',
   'As formas de pagamento são informadas no atendimento pelo WhatsApp.', 30),
  ('Como receberei minha tiragem?',
   'O formato de entrega é combinado no atendimento pelo WhatsApp.', 40),
  ('Quanto tempo leva para receber a consulta?',
   'Quando houver um prazo definido para a tiragem, ele aparece na página de detalhes. Em caso de dúvida, pergunte no WhatsApp.', 50),
  ('Posso escolher o tipo de tiragem?',
   'Sim. No catálogo de **Tiragens** você pode buscar e filtrar por baralho e categoria para escolher a consulta ideal.', 60)
) as t(q, a, o)
where not exists (select 1 from public.faqs);
