-- =====================================================================
-- NOVAS TIRAGENS + PERGUNTAS DE EXEMPLO DA PERGUNTA OBJETIVA
-- Seguro para rodar mais de uma vez (não sobrescreve o que já existe).
--
-- As tiragens entram como RASCUNHO e com preço 0: defina o valor em
-- /admin → Tiragens e mude o status para "Publicada".
-- As imagens do modelo de tiragem ficam em /public/tiragens/<slug>.webp
-- e podem ser trocadas no painel a qualquer momento.
-- =====================================================================

insert into public.categories (name, slug, sort_order)
values ('Trabalho e dinheiro', 'trabalho-e-dinheiro', 25)
on conflict (slug) do nothing;

insert into public.spreads (
  name, slug, deck_id, category_id, price_cents,
  short_description, full_description, questions, gallery, service_format,
  status, featured, sort_order
)
select
  v.name, v.slug,
  (select id from public.decks where slug = 'baralho-cigano'),
  (select id from public.categories where slug = v.category),
  0,
  v.short_description,
  '**' || v.cards || '** · ' || v.short_description,
  v.questions,
  array['/tiragens/' || v.slug || '.webp'],
  'áudio pelo WhatsApp',
  'draft', false, v.sort_order
from (values
  -- ♥ Amor e relacionamentos
  ('Triângulo Amoroso', 'triangulo-amoroso', 'amor-e-relacionamentos', '3 cartas',
   'Investiga uma situação amorosa envolvendo o consulente, seu parceiro e uma possível terceira pessoa.',
   array[
     'Existe uma terceira pessoa nessa relação?',
     'O que essa pessoa representa na vida do meu parceiro?',
     'Existe envolvimento emocional ou apenas físico?',
     'Meu parceiro demonstra interesse por outra pessoa?',
     'Qual é a intenção dessa terceira pessoa?',
     'Como essa situação pode se desenvolver?'
   ], 40),

  ('Pensamentos, Sentimentos e Atitudes', 'pensamentos-sentimentos-e-atitudes', 'amor-e-relacionamentos', '5 ou 6 cartas',
   'Investiga a postura de uma pessoa em relação ao consulente, diferenciando o que ela demonstra daquilo que pode estar motivando suas atitudes.',
   array[
     'O que essa pessoa pensa sobre mim?',
     'O que sente por mim?',
     'Quais são suas intenções?',
     'Como pretende agir?',
     'O que impede uma aproximação?',
     'Qual é a tendência entre nós?'
   ], 50),

  ('Tiragem para Ex', 'tiragem-para-ex', 'amor-e-relacionamentos', '5 cartas',
   'Analisa a conexão com um antigo relacionamento, investigando sentimentos, afastamento, possibilidades de contato e tendências de reconciliação.',
   array[
     'Meu ex ainda pensa em mim?',
     'Ainda existem sentimentos?',
     'Ele sente saudade?',
     'Existe vontade de reaproximação?',
     'Ele pretende entrar em contato?',
     'Existe possibilidade de reconciliação?'
   ], 60),

  ('Caminhos do Amor', 'caminhos-do-amor', 'amor-e-relacionamentos', '6 cartas',
   'Analisa os caminhos afetivos do consulente, especialmente quando existe dúvida entre permanecer em uma relação ou seguir em frente.',
   array[
     'Devo continuar nesse relacionamento?',
     'O que acontece se eu permanecer?',
     'O que acontece se eu decidir partir?',
     'Existe uma nova oportunidade amorosa chegando?',
     'O que está bloqueando minha vida amorosa?',
     'Qual caminho tende a ser mais favorável?'
   ], 70),

  -- 💰 Trabalho e dinheiro
  ('Método Peladan', 'metodo-peladan', 'trabalho-e-dinheiro', '5 cartas',
   'Método de análise de uma situação, mostrando fatores favoráveis, desfavoráveis, caminhos e resultado.',
   array[
     'Devo aceitar essa proposta de emprego?',
     'Vale a pena mudar de empresa?',
     'Esse negócio tem potencial de crescimento?',
     'O que está impedindo minha evolução profissional?',
     'Essa decisão tende a trazer bons resultados?'
   ], 80),

  ('Ferradura', 'ferradura', 'trabalho-e-dinheiro', '7 cartas',
   'Uma leitura ampla para compreender uma situação, suas influências, obstáculos, possibilidades e tendências.',
   array[
     'Como está minha vida profissional atualmente?',
     'Quais oportunidades estão se aproximando?',
     'Existe algum obstáculo que não estou percebendo?',
     'Como minhas decisões podem afetar meu futuro financeiro?',
     'O que posso esperar dos próximos três meses?'
   ], 90),

  ('Mandala Astrológica', 'mandala-astrologica', 'trabalho-e-dinheiro', '12 ou 13 cartas',
   'Uma análise panorâmica de diferentes áreas da vida, com cada posição representando uma casa ou setor.',
   array[
     'O que esperar dos próximos 12 meses?',
     'Como estará minha vida amorosa?',
     'Como estarão minhas finanças?',
     'Quais mudanças podem acontecer na família?',
     'Como será meu desenvolvimento profissional?',
     'Quais áreas da minha vida precisam de atenção?'
   ], 100),

  -- 🔮 Gerais e espirituais
  ('Cruz Celta', 'cruz-celta', 'consultas-completas', '10 cartas',
   'Uma das aberturas mais completas para investigar uma situação. Analisa o momento atual, obstáculos, influências externas, expectativas e tendências futuras.',
   array[
     'O que está acontecendo na minha vida atualmente?',
     'O que está impedindo meu crescimento?',
     'Quais situações estão influenciando minhas decisões?',
     'O que preciso enxergar e ainda não percebi?',
     'O que tende a acontecer nos próximos meses?',
     'Qual é o melhor caminho diante dessa situação?'
   ], 110),

  ('Tiragem das 9 Cartas', 'tiragem-das-9-cartas', 'consultas-completas', '9 cartas',
   'Uma leitura em formato de quadrado, que permite investigar uma situação por diferentes ângulos, observando passado, presente, tendências e influências.',
   array[
     'O que está acontecendo nos bastidores dessa situação?',
     'Quais fatores estão influenciando meu momento atual?',
     'O que está por vir?',
     'Quais obstáculos preciso enfrentar?',
     'Qual é a tendência para essa situação?',
     'O que preciso compreender sobre esse assunto?'
   ], 120),

  ('Mesa Real', 'mesa-real', 'consultas-completas', '36 cartas',
   'Abertura completa do Baralho Cigano, utilizando todas as cartas. Permite analisar diferentes áreas da vida do consulente e suas conexões.',
   array[
     'Como está minha vida amorosa?',
     'Como estão minhas finanças?',
     'Quais mudanças estão previstas para minha vida?',
     'Como está minha vida profissional?',
     'Quais pessoas exercem influência sobre mim?',
     'Quais oportunidades e obstáculos estão se aproximando?',
     'O que esperar dos próximos meses?'
   ], 130),

  ('Escolha de Caminhos', 'escolha-de-caminhos', 'caminhos-e-decisoes', '6 cartas',
   'Compara duas possibilidades e permite observar as consequências e tendências de cada escolha.',
   array[
     'Devo permanecer ou terminar meu relacionamento?',
     'Devo aceitar ou recusar uma proposta?',
     'É melhor mudar de cidade ou permanecer onde estou?',
     'Devo investir nesse projeto ou esperar?',
     'Qual das duas oportunidades apresenta melhores perspectivas?'
   ], 140)
) as v(name, slug, category, cards, short_description, questions, sort_order)
on conflict (slug) do nothing;

-- Pergunta Objetiva (R$ 5): exemplos de perguntas específicas.
-- Só preenche se a lista ainda estiver vazia, para não apagar edições suas.
update public.spreads
set questions = array[
  'Essa pessoa está sendo sincera comigo?',
  'Existe algo que não estou conseguindo enxergar?',
  'Alguém está interferindo na minha relação?',
  'Essa pessoa sente ciúmes de mim?',
  'Existe arrependimento por parte dele?',
  'Essa pessoa acompanha minha vida pelas redes sociais?',
  'Existe possibilidade de contato nos próximos 30 dias?',
  'Qual é a verdadeira intenção dessa aproximação?',
  'Estou insistindo em algo que já deveria ter terminado?',
  'O que preciso saber antes de tomar essa decisão?'
],
full_description = case
  when full_description = 'Consulta direcionada a uma pergunta específica.'
  then 'Consulta direcionada a uma pergunta específica. Exemplos de perguntas:'
  else full_description
end
where slug = 'pergunta-objetiva' and questions = '{}';
