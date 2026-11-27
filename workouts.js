'use strict';
/* =====================================================================
   GymSync — ficha padrão, tutoriais e ilustrações (SVG offline)
   Carregado ANTES do app.js. Para mudar a ficha: edite aqui e
   incremente ROUTINE_VERSION (a migração roda sozinha ao abrir o app).
   ===================================================================== */

const ROUTINE_VERSION = 3;
const FAIL = '6-8 (Falha)';
const FAIL_B = '8-10 (Falha)';

// key = id estável (usado para achar tutorial/SVG); group = grupo muscular
const mk = (key, group, name, sets, reps, restSeconds, alternatives) =>
  ({ id: key, key, group, name, sets, reps, restSeconds, alternatives });

function defaultRoutine() {
  return {
    A: { label: 'A', title: 'Peito e Tríceps', exercises: [
      mk('a1', 'peito', 'Supino Inclinado com Halteres', 2, FAIL, 120, ['Supino Inclinado na Máquina', 'Supino Reto com Halteres']),
      mk('a2', 'peito', 'Peck Deck (Voador)', 2, FAIL, 90, ['Crucifixo Reto com Halteres', 'Cross Over Bilateral Polia Média']),
      mk('a3', 'triceps', 'Tríceps na Polia Alta (Barra Reta ou V)', 2, FAIL, 90, ['Tríceps Máquina (Mergulho)', 'Tríceps Corda na Polia Alta']),
      mk('a4', 'triceps', 'Tríceps Francês na Polia (Corda)', 2, FAIL, 90, ['Tríceps Testa com Halteres', 'Tríceps Francês com Halter'])] },
    B: { label: 'B', title: 'Costas e Bíceps', exercises: [
      mk('b1', 'costas', 'Puxada Alta Pegada Neutra', 2, FAIL, 120, ['Puxada Frontal Aberta', 'Barra Fixa (Livre ou Graviton)']),
      mk('b2', 'costas', 'Remada Baixa na Polia (Triângulo)', 2, FAIL, 90, ['Remada Curvada com Halteres', 'Remada Máquina (Apoio no Peito)']),
      mk('b3', 'biceps', 'Rosca Direta com Halteres (Simultânea)', 2, FAIL, 90, ['Rosca Direta na Polia Baixa', 'Rosca Direta Barra W']),
      mk('b4', 'biceps', 'Rosca Martelo com Halteres (Simultânea)', 2, FAIL, 90, ['Rosca Martelo na Polia (Corda)', 'Rosca Scott na Máquina'])] },
    C: { label: 'C', title: 'Pernas Completo e Abdômen', exercises: [
      mk('c1', 'pernas', 'Leg Press 45 ou Horizontal', 2, FAIL, 150, ['Hack Machine', 'Agachamento Goblet/Sumô com Halter']),
      mk('c2', 'pernas', 'Cadeira Flexora', 2, FAIL, 90, ['Stiff com Halteres', 'Mesa Flexora']),
      mk('c3', 'pernas', 'Cadeira Extensora Bilateral', 2, FAIL, 90, ['Agachamento no Smith', 'Leg Press Pés Baixos']),
      mk('c4', 'panturrilha', 'Panturrilha na Máquina', 3, FAIL_B, 75, ['Panturrilha no Leg Press', 'Panturrilha em Pé com Halteres']),
      mk('c5', 'abdomen', 'Abdominal na Polia Alta (Corda)', 3, FAIL_B, 75, ['Abdominal Máquina', 'Abdominal Infra na Paralela'])] },
    D: { label: 'D', title: 'Ombros e Antebraço', exercises: [
      mk('d1', 'ombros', 'Desenvolvimento com Halteres Sentado', 2, FAIL, 120, ['Desenvolvimento na Máquina', 'Desenvolvimento no Smith']),
      mk('d2', 'ombros', 'Elevação Lateral com Halteres', 3, FAIL, 75, ['Elevação Lateral na Máquina', 'Elevação Lateral Bilateral no Cross Over']),
      mk('d3', 'ombros', 'Crucifixo Inverso na Máquina', 2, FAIL_B, 90, ['Crucifixo Inverso com Halteres (Banco Inclinado)', 'Face Pull na Polia Alta']),
      mk('d4', 'antebraco', 'Rosca Inversa na Polia Baixa', 2, FAIL_B, 90, ['Rosca Inversa com Barra W', 'Flexão de Punho com Halteres'])] }
  };
}

/* ===================== ILUSTRAÇÕES (SVG vetorial) ===================== */
const GS_SVG = (() => {
  const BODY = 'stroke="#e4e4e7" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  const EQ = 'stroke="#52525b" stroke-width="5" stroke-linecap="round" fill="none"';
  const EQT = 'stroke="#3f3f46" stroke-width="2.5" stroke-linecap="round" fill="none"';
  const CABLE = 'stroke="#a1a1aa" stroke-width="1.6" fill="none"';
  const GHOST = 'stroke="#71717a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 4" fill="none"';

  const poly = (pts, a = BODY) => `<polyline points="${pts.map(p => p.join(',')).join(' ')}" ${a}/>`;
  const head = p => `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="#09090b" stroke="#e4e4e7" stroke-width="3.5"/>`;
  const muscle = (cx, cy, rx, ry, rot = 0) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#a3e635" fill-opacity=".75" transform="rotate(${rot} ${cx} ${cy})"/>`;
  const arrow = d => `<path d="${d}" stroke="#fbbf24" stroke-width="3" fill="none" stroke-linecap="round" marker-end="url(#ah)"/>`;
  const line = (x1, y1, x2, y2) => arrow(`M${x1} ${y1}L${x2} ${y2}`);
  const bell = p => `<circle cx="${p[0]}" cy="${p[1]}" r="5.5" fill="#a1a1aa" stroke="#18181b" stroke-width="1.5"/>`;
  const pulley = (x, y) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#09090b" stroke="#a1a1aa" stroke-width="2"/>`;
  const dbV = (x, y) => `<rect x="${x - 3}" y="${y - 8}" width="6" height="16" rx="2" fill="#a1a1aa"/>` +
    `<rect x="${x - 6.5}" y="${y - 9}" width="13" height="4" rx="1.5" fill="#d4d4d8"/>` +
    `<rect x="${x - 6.5}" y="${y + 5}" width="13" height="4" rx="1.5" fill="#d4d4d8"/>`;

  // figura lateral: sh=ombro, hip=quadril; cabeça calculada na direção do tronco
  const person = o => {
    const [sx, sy] = o.sh, [hx, hy] = o.hip;
    let dx = sx - hx, dy = sy - hy; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const h = o.head || [sx + dx * 12, sy + dy * 12];
    return head(h) + poly([o.sh, o.hip]) +
      (o.knee ? poly([o.hip, o.knee, o.foot, ...(o.toe ? [o.toe] : [])]) : '') +
      (o.elbow ? poly([o.sh, o.elbow, o.hand]) : '');
  };
  // figura frontal (em pé) — arms: string svg dos braços
  const front = arms => head([100, 24]) + poly([[84, 40], [116, 40]]) + poly([[100, 40], [100, 86]]) +
    poly([[100, 86], [92, 124]]) + poly([[100, 86], [108, 124]]) + arms;

  const wrap = (inner, cap, floor = true) =>
    `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${cap || 'Ilustração do exercício'}" style="width:100%;height:auto;background:#09090b;border-radius:12px;border:1px solid #27272a">` +
    `<defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#fbbf24"/></marker></defs>` +
    (floor ? '<line x1="8" y1="125" x2="192" y2="125" stroke="#27272a" stroke-width="2"/>' : '') +
    inner +
    (cap ? `<text x="8" y="136" fill="#a1a1aa" font-size="9" font-family="sans-serif">${cap}</text>` : '') +
    '</svg>';

  const S = {};

  // A1 — Supino inclinado com halteres (banco 30–45°)
  S.a1 = () => wrap(
    poly([[66, 114], [122, 86]], EQ) + poly([[74, 112], [74, 125]], EQT) + poly([[116, 91], [116, 125]], EQT) +
    muscle(108, 83, 11, 5, -35) +
    person({ sh: [115, 80], hip: [76, 108], knee: [52, 98], foot: [46, 123], elbow: [115, 58], hand: [114, 36] }) +
    bell([114, 36]) + line(142, 72, 142, 38), 'Banco 30–45° · empurrar para cima');

  // A2 — Peck deck (vista de cima)
  S.a2 = () => wrap(
    poly([[76, 102], [44, 84], [50, 56]], GHOST) + poly([[124, 102], [156, 84], [150, 56]], GHOST) +
    muscle(100, 99, 22, 6) +
    `<rect x="76" y="96" width="48" height="32" rx="10" ${BODY}/>` + head([100, 110]) +
    poly([[76, 102], [82, 76], [96, 58]]) + poly([[124, 102], [118, 76], [104, 58]]) +
    arrow('M52 50Q72 40 90 52') + arrow('M148 50Q128 40 110 52'),
    'Vista de cima · fechar os braços', false);

  // A3 — Tríceps na polia alta
  S.a3 = () => wrap(
    poly([[50, 12], [50, 125]], EQ) + poly([[50, 14], [62, 14]], EQ) + pulley(62, 18) + poly([[62, 22], [90, 92]], CABLE) +
    muscle(102, 57, 4, 11, 5) +
    person({ sh: [96, 44], hip: [100, 82], knee: [101, 104], foot: [100, 124], toe: [112, 124], elbow: [98, 68], hand: [90, 92] }) +
    bell([90, 92]) + line(122, 58, 122, 92), 'Cotovelos colados · estender para baixo');

  // A4 — Tríceps francês na polia (corda), de costas para a polia
  S.a4 = () => wrap(
    poly([[40, 60], [40, 125]], EQ) + pulley(46, 104) + poly([[46, 100], [92, 34]], CABLE) +
    muscle(104, 36, 4.5, 12, 22) +
    person({ sh: [100, 46], hip: [92, 84], knee: [95, 106], foot: [96, 124], toe: [108, 124], head: [114, 40], elbow: [108, 26], hand: [92, 34] }) +
    arrow('M88 30Q96 6 116 10'), 'Cotovelos para cima · estender à frente');

  // B1 — Puxada alta pegada neutra
  S.b1 = () => wrap(
    poly([[80, 12], [126, 12]], EQ) + pulley(112, 15) + poly([[112, 20], [100, 64]], CABLE) +
    poly([[70, 106], [116, 106]], EQ) + poly([[92, 108], [92, 125]], EQT) + poly([[96, 88], [124, 90]], EQ) +
    muscle(83, 80, 6, 14, 8) +
    person({ sh: [82, 60], hip: [90, 100], knee: [118, 98], foot: [118, 124], toe: [130, 124], elbow: [84, 86], hand: [100, 66] }) +
    bell([100, 66]) + line(140, 28, 140, 66), 'Pegada neutra · cotovelos às costelas');

  // B2 — Remada baixa na polia (triângulo)
  S.b2 = () => wrap(
    poly([[176, 70], [176, 125]], EQ) + pulley(176, 84) + poly([[171, 84], [88, 82]], CABLE) +
    poly([[126, 92], [126, 112]], EQ) + poly([[52, 106], [88, 106]], EQ) +
    muscle(66, 74, 5, 14) +
    person({ sh: [70, 58], hip: [70, 100], knee: [100, 96], foot: [124, 102], elbow: [58, 80], hand: [86, 82] }) +
    bell([86, 82]) + line(142, 68, 108, 68), 'Peito aberto · puxar ao umbigo');

  // B3 — Rosca direta com halteres (simultânea)
  S.b3 = () => wrap(
    poly([[101, 68], [108, 92]], GHOST) + muscle(105, 56, 4.5, 10, 5) +
    person({ sh: [100, 42], hip: [100, 82], knee: [102, 104], foot: [100, 124], toe: [112, 124], elbow: [101, 68], hand: [120, 52] }) +
    bell([120, 52]) + arrow('M116 90Q138 78 132 60'), 'Cotovelos fixos · subir os dois juntos');

  // B4 — Rosca martelo (vista frontal, pegada neutra)
  S.b4 = () => wrap(
    muscle(80, 57, 4, 11, 22) + muscle(120, 57, 4, 11, -22) +
    front(poly([[84, 40], [76, 68], [86, 44]]) + poly([[116, 40], [124, 68], [114, 44]])) +
    dbV(86, 44) + dbV(114, 44) + line(58, 88, 58, 54) + line(142, 88, 142, 54),
    'Vista frontal · pegada neutra (palmas frente a frente)');

  // C1 — Leg press 45°
  S.c1 = () => wrap(
    poly([[64, 124], [164, 24]], EQ) + poly([[42, 111], [64, 91]], EQ) + poly([[104, 38], [126, 60]], EQ) +
    muscle(71, 71, 14, 5, -40) +
    person({ sh: [38, 106], hip: [60, 86], knee: [88, 62], foot: [114, 48] }) +
    line(136, 46, 154, 28), 'Costas coladas · empurrar a plataforma');

  // C2 — Cadeira flexora
  S.c2 = () => wrap(
    poly([[56, 46], [58, 104]], EQ) + poly([[58, 104], [108, 104]], EQ) + poly([[82, 106], [82, 125]], EQT) + poly([[84, 80], [112, 82]], EQ) +
    poly([[102, 96], [134, 102]], GHOST) + muscle(86, 99, 14, 4) +
    person({ sh: [66, 54], hip: [70, 96], knee: [102, 96], foot: [88, 120], elbow: [84, 74], hand: [96, 84] }) +
    `<circle cx="91" cy="113" r="5" fill="#71717a"/>` + arrow('M134 108Q136 128 104 124'),
    'Flexionar os joelhos · pausa de 1s no pico');

  // C3 — Cadeira extensora
  S.c3 = () => wrap(
    poly([[56, 46], [58, 104]], EQ) + poly([[58, 104], [108, 104]], EQ) + poly([[82, 106], [82, 125]], EQT) +
    poly([[100, 94], [106, 122]], GHOST) + muscle(85, 91, 14, 5, -4) +
    person({ sh: [66, 54], hip: [70, 96], knee: [100, 94], foot: [130, 76], elbow: [84, 74], hand: [94, 86] }) +
    `<circle cx="126" cy="79" r="5" fill="#71717a"/>` + arrow('M112 122Q146 114 136 84'),
    'Estender as duas pernas · pausa no topo');

  // C4 — Panturrilha na máquina (em pé)
  S.c4 = () => wrap(
    `<rect x="100" y="118" width="46" height="7" rx="2" fill="#3f3f46"/>` +
    poly([[118, 26], [118, 125]], EQ) + poly([[106, 26], [118, 26]], EQ) + `<rect x="86" y="22" width="22" height="8" rx="3" fill="#52525b"/>` +
    muscle(92, 96, 4.5, 9) +
    person({ sh: [96, 30], hip: [96, 64], knee: [97, 88], foot: [96, 108], toe: [111, 118], elbow: [107, 44], hand: [104, 31] }) +
    line(138, 108, 138, 78), 'Pausa de 1s embaixo · subir na ponta dos pés');

  // C5 — Abdominal na polia alta (ajoelhado)
  S.c5 = () => wrap(
    poly([[44, 10], [44, 125]], EQ) + poly([[44, 12], [54, 12]], EQ) + pulley(52, 17) + poly([[52, 21], [72, 62]], CABLE) +
    muscle(99, 76, 5, 11, 10) +
    head([73, 64]) + poly([[106, 88], [102, 66], [84, 54]]) + poly([[106, 88], [104, 118], [132, 121]]) +
    poly([[84, 54], [80, 76], [72, 62]]) + arrow('M110 56Q106 38 88 42'),
    'Enrolar a coluna · costelas em direção à pelve');

  // D1 — Desenvolvimento com halteres sentado (banco ~80°)
  S.d1 = () => wrap(
    poly([[70, 104], [64, 54]], EQ) + poly([[62, 106], [108, 106]], EQ) + poly([[84, 108], [84, 125]], EQT) +
    muscle(79, 56, 7, 7) +
    person({ sh: [76, 60], hip: [82, 100], knee: [112, 100], foot: [112, 124], toe: [124, 124], elbow: [84, 42], hand: [88, 22] }) +
    bell([88, 22]) + line(122, 60, 122, 24), 'Banco ~80° · empurrar acima da cabeça');

  // D2 — Elevação lateral (vista frontal)
  S.d2 = () => wrap(
    poly([[84, 40], [78, 66], [76, 88]], GHOST) + poly([[116, 40], [122, 66], [124, 88]], GHOST) +
    muscle(82, 40, 6, 7) + muscle(118, 40, 6, 7) +
    front(poly([[84, 40], [64, 41], [46, 45]]) + poly([[116, 40], [136, 41], [154, 45]])) +
    bell([46, 45]) + bell([154, 45]) + arrow('M62 90Q40 80 38 58') + arrow('M138 90Q160 80 162 58'),
    'Vista frontal · subir até a altura dos ombros');

  // D3 — Crucifixo inverso na máquina (vista de cima)
  S.d3 = () => wrap(
    poly([[74, 92], [80, 64], [88, 42]], GHOST) + poly([[126, 92], [120, 64], [112, 42]], GHOST) +
    poly([[80, 84], [120, 84]], EQ) +
    muscle(72, 94, 7, 7) + muscle(128, 94, 7, 7) + muscle(100, 106, 18, 8) +
    `<rect x="76" y="90" width="48" height="36" rx="10" ${BODY}/>` + head([100, 104]) +
    poly([[74, 92], [56, 78], [38, 72]]) + poly([[126, 92], [144, 78], [162, 72]]) +
    bell([38, 72]) + bell([162, 72]) + arrow('M86 40Q50 38 40 64') + arrow('M114 40Q150 38 160 64'),
    'Vista de cima · abrir os braços para trás', false);

  // D4 — Rosca inversa na polia baixa (pegada pronada)
  S.d4 = () => wrap(
    poly([[170, 60], [170, 125]], EQ) + pulley(164, 119) + poly([[160, 117], [116, 56]], CABLE) +
    poly([[92, 68], [100, 94]], GHOST) + muscle(102, 60, 11, 4.5, -38) +
    person({ sh: [90, 42], hip: [90, 82], knee: [92, 104], foot: [90, 124], toe: [102, 124], elbow: [92, 68], hand: [112, 52] }) +
    bell([112, 52]) + arrow('M108 96Q124 86 120 70'), 'Pegada pronada · foco no antebraço');

  return S;
})();

/* ===================== TUTORIAIS ===================== */
const EXERCISE_INFO = {
  a1: {
    pos: 'Banco a 30–45°. Sente com os halteres sobre as coxas, leve-os ao peito e retraia as escápulas (peito aberto, ombros para trás e para baixo). Pés firmes no chão.',
    exec: 'Empurre os halteres em leve arco até quase estender os cotovelos. Mantenha os cotovelos a ~45° do tronco e desça em 2 segundos até alongar o peito.',
    tip: 'Na falha, não rebata os halteres no peito nem tire o quadril do banco. Termine a série descendo os halteres de forma controlada.'
  },
  a2: {
    pos: 'Ajuste o banco para que as manoplas fiquem na linha do peito. Costas coladas no encosto, escápulas retraídas e cotovelos semiflexionados, fixos nesse ângulo.',
    exec: 'Feche os braços em arco até as manoplas se encontrarem à frente do peito, esmagando o peitoral por 1s. Volte em 2–3s até sentir o alongamento.',
    tip: 'É um movimento de abraço, não de supino. Não deixe os ombros irem à frente na volta. Na falha, solte as manoplas com controle.'
  },
  a3: {
    pos: 'De frente para a polia alta, pegada na barra reta ou V na largura dos ombros. Cotovelos colados às costelas, tronco ereto com leve inclinação à frente.',
    exec: 'Estenda totalmente os cotovelos levando a barra para baixo e apertando o tríceps. Retorne devagar até a barra chegar perto do peito, sem subir os cotovelos.',
    tip: 'Não jogue o tronco por cima da barra nem use o peso do corpo. Se os cotovelos abrirem ou subirem, a carga está alta demais.'
  },
  a4: {
    pos: 'De costas para a polia baixa, corda atrás da cabeça. Um passo à frente para estabilidade, tronco levemente inclinado e cotovelos apontados para frente/cima.',
    exec: 'Estenda os cotovelos levando a corda para frente e para cima, abrindo as pontas no final. Volte atrás da cabeça até o alongamento máximo da cabeça longa do tríceps.',
    tip: 'Mantenha os cotovelos fixos e fechados. Não arqueie a lombar; contraia o abdômen. Na falha, pare quando os cotovelos não ficarem mais no lugar.'
  },
  b1: {
    pos: 'Trave as coxas na almofada, pernas bem firmes. Pegador neutro (palmas frente a frente), braços estendidos, peito aberto e leve inclinação do tronco para trás.',
    exec: 'Comece levando as escápulas para baixo e puxe os cotovelos em direção às costelas até o pegador chegar ao peito. Segure 1s e retorne até alongar os dorsais.',
    tip: 'Sem balançar a lombar nem usar impulso. Pense em "cotovelos no bolso de trás". Na falha, não deixe a carga puxar seus ombros de uma vez.'
  },
  b2: {
    pos: 'Sentado com os pés apoiados e joelhos levemente flexionados. Tronco ereto, peito aberto, ombros para baixo e braços estendidos segurando o triângulo.',
    exec: 'Puxe o triângulo em direção ao umbigo, fechando as escápulas e levando os cotovelos para trás rente ao corpo. Segure 1s e retorne controlado.',
    tip: 'Não balance o tronco para trás para ganhar impulso e não arredonde a coluna na volta. Na falha, reduza a carga em vez de roubar.'
  },
  b3: {
    pos: 'Em pé ou sentado, halteres ao lado do corpo com as palmas para frente. Cotovelos fixos junto às costelas, peito aberto e abdômen firme.',
    exec: 'Suba os dois halteres juntos, girando o punho (supinação) até o pico, e aperte o bíceps. Desça em ~2s até quase estender o cotovelo.',
    tip: 'Sem balançar o tronco nem roubar com a lombar. Os cotovelos não avançam. Na falha, só ajuda mínima na subida, nunca na descida.'
  },
  b4: {
    pos: 'Em pé ou sentado, halteres ao lado do corpo com pegada neutra (palmas voltadas uma para a outra) e cotovelos fixos junto ao tronco.',
    exec: 'Suba os dois halteres juntos mantendo o punho neutro, até a altura dos ombros, focando braquial e antebraço. Desça controlado em 2s.',
    tip: 'Não deixe os cotovelos irem à frente nem gire os punhos. Na falha, mantenha a postura sem impulso do quadril.'
  },
  c1: {
    pos: 'Costas e quadril totalmente apoiados, pés na largura dos ombros no meio da plataforma. Destrave as travas de segurança.',
    exec: 'Desça com controle (2–3s) até ~90° de joelho sem a lombar descolar do banco. Empurre até quase estender, sem travar os joelhos.',
    tip: 'Nunca trave os joelhos no topo nem deixe a lombar arredondar embaixo. Na falha, não apoie as mãos nas coxas — use as travas de segurança.'
  },
  c2: {
    pos: 'Alinhe o joelho ao eixo da máquina. Rolo travado sobre as coxas/tornozelo, bem firme, e mãos nos pegadores.',
    exec: 'Puxe o rolo para baixo e para trás, flexionando os joelhos ao máximo e segurando 1s no pico de contração dos posteriores. Retorne em 2–3s.',
    tip: 'Mantenha quadril e lombar colados ao assento. Se o quadril levantar, a carga está alta. Na falha, não solte o peso de uma vez.'
  },
  c3: {
    pos: 'Costas firmes no encosto, joelhos alinhados ao eixo da máquina e o rolo na parte baixa da canela. Mãos nos pegadores.',
    exec: 'Estenda as duas pernas juntas até o topo, pausa breve de 1s contraindo o quadríceps, e desça em 2–3s sem apoiar o peso na pilha.',
    tip: 'Não balance o corpo para subir o peso nem trave o joelho com força. Na falha, desça controlado, nunca largue.'
  },
  c4: {
    pos: 'Ombros sob as almofadas, ponta dos pés na plataforma e calcanhares livres. Joelhos quase estendidos e tronco ereto.',
    exec: 'Desça os calcanhares ao máximo e faça uma pausa obrigatória de 1s no alongamento para zerar o impulso elástico. Suba o máximo possível e segure o pico.',
    tip: 'Não flexione os joelhos para ajudar nem faça repetições curtas e rápidas. Amplitude total em toda repetição.'
  },
  c5: {
    pos: 'Ajoelhado de frente para a polia alta, corda segura ao lado da cabeça, quadril acima dos joelhos e coluna neutra.',
    exec: 'Enrole a coluna levando as costelas em direção à pelve, expirando forte no final. Mantenha o quadril parado e retorne controlado.',
    tip: 'O movimento é enrolar a coluna, não apenas dobrar o quadril, e não puxe com os braços. Se o quadril sobe e desce, reduza a carga.'
  },
  d1: {
    pos: 'Banco a ~80° (levemente inclinado), costas apoiadas, pés firmes. Halteres na altura dos ombros, cotovelos um pouco à frente do tronco (plano escapular).',
    exec: 'Empurre os halteres para cima, firme, até quase estender os cotovelos. Desça controlado em 2s até a altura das orelhas.',
    tip: 'Sem arquear a lombar. Na falha, desça com controle e não deixe os halteres baterem. Peça ajuda para posicionar cargas altas.'
  },
  d2: {
    pos: 'Em pé, pés na largura do quadril, tronco levemente inclinado à frente, halteres ao lado do corpo e cotovelos levemente flexionados.',
    exec: 'Eleve os dois braços juntos pelos lados até a altura dos ombros, guiando pelos cotovelos. Segure 1s e desça em 2–3s.',
    tip: 'Sem balançar o corpo para subir. Se o trapézio assumir, reduza a carga. Não suba os halteres acima da linha dos ombros.'
  },
  d3: {
    pos: 'Peito apoiado no encosto, assento ajustado para os braços ficarem na altura dos ombros. Braços quase estendidos, cotovelos levemente flexionados.',
    exec: 'Abra os braços em arco levando os cotovelos para trás e para os lados, focando no deltoide posterior e juntando as escápulas no final. Volte controlado.',
    tip: 'Não encolha o trapézio nem empurre o peito contra o apoio. Na falha, mantenha o ritmo constante e o peito apoiado.'
  },
  d4: {
    pos: 'De frente para a polia baixa, barra reta com pegada pronada (palmas para baixo), cotovelos fixos ao lado do corpo e punhos neutros.',
    exec: 'Flexione os cotovelos levando a barra até a altura do peito, sentindo antebraço e braquiorradial. Desça em 2s até quase estender.',
    tip: 'Sem balançar o corpo nem dobrar os punhos. Use cargas moderadas: o antebraço fadiga rápido. Na falha, pare quando os punhos cederem.'
  }
};

// Tutorial genérico por grupo muscular (usado em substituições / exercícios digitados)
const GROUP_INFO = {
  peito: { label: 'Peito', rep: 'a1',
    pos: 'Escápulas retraídas e ombros para baixo, peito aberto, pés firmes e posição estável no banco ou na máquina.',
    exec: 'Empurre ou feche os braços até contrair o peitoral, com cotovelos a ~45° do tronco. Volte em 2–3s até alongar.',
    tip: 'Não deixe os ombros irem à frente nem a lombar sair do apoio. Na falha, termine a repetição com controle.' },
  triceps: { label: 'Tríceps', rep: 'a3',
    pos: 'Cotovelos fixos (junto às costelas ou apontados para cima), tronco estável e pegada firme.',
    exec: 'Estenda totalmente os cotovelos contraindo o tríceps e volte devagar até alongar, sem mexer os cotovelos.',
    tip: 'Não use o tronco para empurrar. Se os cotovelos se mexem, reduza a carga.' },
  costas: { label: 'Costas', rep: 'b1',
    pos: 'Peito aberto, ombros para baixo, tronco firme e braços estendidos no início.',
    exec: 'Inicie pelas escápulas e leve os cotovelos em direção às costelas. Segure 1s e retorne alongando as costas.',
    tip: 'Sem balançar o tronco nem arredondar a coluna. Reduza a carga se precisar de impulso.' },
  biceps: { label: 'Bíceps', rep: 'b3',
    pos: 'Postura firme, cotovelos fixos junto ao corpo e abdômen contraído.',
    exec: 'Flexione os cotovelos até o pico apertando o bíceps e desça em ~2s até quase estender.',
    tip: 'Nada de balanço do tronco. Os cotovelos não avançam.' },
  pernas: { label: 'Pernas', rep: 'c1',
    pos: 'Costas e quadril apoiados, pés ou joelhos alinhados e coluna neutra.',
    exec: 'Desça ou flexione com controle (2–3s), empurre ou estenda até quase o topo sem travar os joelhos.',
    tip: 'Não trave os joelhos nem deixe a lombar descolar. Use as travas de segurança na falha.' },
  panturrilha: { label: 'Panturrilha', rep: 'c4',
    pos: 'Ponta dos pés apoiada, calcanhares livres, joelhos quase estendidos e tronco ereto.',
    exec: 'Desça ao máximo com pausa de 1s no alongamento e suba o mais alto possível, segurando o pico.',
    tip: 'Amplitude total sempre; sem rebote e sem dobrar os joelhos para ajudar.' },
  abdomen: { label: 'Abdômen', rep: 'c5',
    pos: 'Coluna neutra, abdômen contraído e quadril estável.',
    exec: 'Aproxime as costelas da pelve enrolando a coluna, expire no final e volte controlado.',
    tip: 'Não puxe com os braços nem use impulso. Reduza a carga se o quadril balançar.' },
  ombros: { label: 'Ombros', rep: 'd1',
    pos: 'Tronco estável, abdômen firme e cotovelos levemente à frente da linha dos ombros.',
    exec: 'Mova os braços com controle até a altura indicada (cabeça no desenvolvimento, ombros nas elevações) e desça em 2–3s.',
    tip: 'Não arqueie a lombar nem encolha o trapézio. Reduza a carga se precisar de balanço.' },
  antebraco: { label: 'Antebraço', rep: 'd4',
    pos: 'Cotovelos fixos ao lado do corpo, punhos neutros e postura firme.',
    exec: 'Movimente punhos ou cotovelos com amplitude completa e retorne em ~2s, focando antebraço e braquiorradial.',
    tip: 'Cargas moderadas e sem balançar o corpo. Pare quando os punhos cederem.' }
};

// Palavras-chave para adivinhar o grupo de exercícios digitados / alternativas (ordem importa)
const GROUP_RULES = [
  [/rosca inversa|flexão de punho|flexao de punho|antebra/i, 'antebraco'],
  [/crucifixo inverso|face pull|desenvolvimento|eleva[cç][aã]o (lateral|frontal)|ombro/i, 'ombros'],
  [/tr[ií]ceps/i, 'triceps'],
  [/rosca|b[ií]ceps/i, 'biceps'],
  [/puxada|remada|barra fixa|pulldown|serrote|costas/i, 'costas'],
  [/supino|crucifixo|peck|voador|cross|peitoral|flex[aã]o de bra/i, 'peito'],
  [/panturrilha/i, 'panturrilha'],
  [/abdominal|prancha|abd[oô]men/i, 'abdomen'],
  [/leg press|agachamento|extensora|flexora|stiff|hack|smith|goblet|sum[oô]|afundo|perna/i, 'pernas']
];

/**
 * Resolve tutorial + SVG para o exercício exibido no card.
 * @param {string} name   nome atual (pode ser substituto)
 * @param {object} base   exercício base do slot na ficha (pode ser undefined)
 */
function resolveExerciseInfo(name, base) {
  const direct = Object.values(defaultRoutine()).flatMap(d => d.exercises).find(e => e.name === name);
  if (direct && EXERCISE_INFO[direct.key]) {
    const t = EXERCISE_INFO[direct.key];
    return { title: name, svg: GS_SVG[direct.key](), pos: t.pos, exec: t.exec, tip: t.tip, note: '' };
  }
  let group = null;
  for (const [re, g] of GROUP_RULES) if (re.test(name)) { group = g; break; }
  if (!group && base && GROUP_INFO[base.group]) group = base.group;
  if (!group) group = 'peito';
  const g = GROUP_INFO[group];
  // mesmo grupo do slot base -> usa a ilustração do exercício base; senão, a representativa do grupo
  const sameSlot = !!(base && base.group === group && GS_SVG[base.key]);
  return {
    title: name,
    svg: GS_SVG[sameSlot ? base.key : g.rep](),
    pos: g.pos, exec: g.exec, tip: g.tip,
    note: `Guia geral de ${g.label}. A ilustração é uma referência${sameSlot ? ` do exercício base (${base.name})` : ' do grupo muscular'} — ajuste a execução ao equipamento escolhido.`
  };
}
