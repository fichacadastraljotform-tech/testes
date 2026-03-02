const STORAGE_KEY = 'zelo-captacao-v1';
const SOURCES = ['Imoview', 'Fisgar', 'Eemovel', 'Concorrentes'];

const bairros = {
  'Centro': { lat: -22.9056, lng: -47.0608, priority: 'Alta', group: 'mais-locados' },
  'Botafogo': { lat: -22.8926, lng: -47.0527, priority: 'Alta', group: 'mais-locados' },
  'Jardim Nova Europa': { lat: -22.9418, lng: -47.0865, priority: 'Alta', group: 'mais-locados' },
  'Bosque': { lat: -22.9137, lng: -47.0574, priority: 'Alta', group: 'mais-locados' },
  'Ponte Preta': { lat: -22.9193, lng: -47.067, priority: 'Alta', group: 'mais-locados' },
  'Cidade Satélite Íris': { lat: -22.8675, lng: -47.1573, priority: 'Alta', group: 'mais-locados' },
  'Jardim Eulina': { lat: -22.8725, lng: -47.0912, priority: 'Alta', group: 'mais-locados' },
  'Jardim Santa Lúcia': { lat: -22.9478, lng: -47.1095, priority: 'Alta', group: 'mais-locados' },
  'Bonfim': { lat: -22.892, lng: -47.0734, priority: 'Alta', group: 'mais-locados' },
  'Vila Marieta': { lat: -22.9383, lng: -47.0727, priority: 'Alta', group: 'mais-locados' },
  'Cambuí': { lat: -22.8958, lng: -47.0475, priority: 'Média', group: 'estrategicos' },
  'Taquaral': { lat: -22.8872, lng: -47.0512, priority: 'Média', group: 'estrategicos' },
  'Barão Geraldo': { lat: -22.8156, lng: -47.0756, priority: 'Média', group: 'estrategicos' },
  'Mansões Santo Antônio': { lat: -22.8678, lng: -47.0518, priority: 'Média', group: 'estrategicos' },
  'Parque Prado': { lat: -22.9388, lng: -47.0944, priority: 'Média', group: 'estrategicos' },
  'Swift': { lat: -22.9277, lng: -47.0782, priority: 'Média', group: 'estrategicos' },
  'Guanabara': { lat: -22.8961, lng: -47.0564, priority: 'Média', group: 'estrategicos' },
  'Castelo': { lat: -22.8801, lng: -47.0769, priority: 'Média', group: 'estrategicos' },
  'Jardim Chapadão': { lat: -22.8795, lng: -47.0653, priority: 'Média', group: 'estrategicos' },
  'Sousas/Joaquim Egídio': { lat: -22.8818, lng: -46.9725, priority: 'Baixa', group: 'estrategicos' },
  'Ouro Verde': { lat: -22.9986, lng: -47.1218, priority: 'Média', group: 'estrategicos' },
  'Padre Anchieta': { lat: -22.8508, lng: -47.1237, priority: 'Média', group: 'estrategicos' },
};

const scripts = {
  abordagem: 'Olá, [Nome]! Sou da Zelo Imóveis. Vi seu imóvel anunciado em [bairro] e temos procura ativa por locação nessa faixa. Posso te mostrar como reduzir vacância com uma avaliação gratuita?',
  objecoes: '“Já tenho imobiliária” → Entendo. Posso compartilhar um comparativo rápido de tempo de locação e demanda atual para você decidir com mais segurança.',
  checklist: 'Dados mínimos: aluguel, condomínio, IPTU, vagas, pets, garantia aceita, estado do imóvel e fotos atualizadas.',
  etica: 'LGPD: use apenas dados públicos/fornecidos, registre consentimento no contato e evite abordagens em massa (spam).'
};

function mkTasks(base) {
  return [
    { slot: '08:30–09:30', source: 'Eemovel', title: base.e1, estimate: 60, instruction: 'Pesquisar e registrar oportunidades com link + bairro + valor.' },
    { slot: '09:30–10:20', source: 'Eemovel', title: base.e2, estimate: 50, instruction: 'Salvar oportunidades secundárias e classificar prioridade.' },
    { slot: '10:20–11:00', source: 'Fisgar', title: base.fisgar, estimate: 40, instruction: 'Filtrar particular/sem imobiliária quando disponível.' },
    { slot: '11:00–12:00', source: 'Imoview', title: base.imoview, estimate: 60, instruction: 'Reativar contatos 60–180 dias sem retorno e registrar resultado.' },
    { slot: '13:30–14:30', source: 'Concorrentes', title: base.conc, estimate: 60, instruction: 'Obrigatório link do anúncio + print ou observação detalhada.' },
    { slot: '14:30–15:30', source: 'Interno', title: base.extra || 'Checklist qualidade: garantir bairro, valor, contato e link em todos os registros.', estimate: 60, instruction: 'Revisão de qualidade e próximos passos para leads quentes.' },
    { slot: '15:30–17:30', source: 'Interno', title: 'Registrar resultados finais, criar leads do dia e preparar fechamento.', estimate: 120, instruction: 'Atualizar observações do dia e validar funil.' },
  ];
}

const baseDays = [
  { d: 1, theme: 'Centro (Alta)', b: ['Centro'], e1: 'Apto 1–2 dorm até R$ 2.500 no Centro (salvar 15)', e2: 'Kitnet/Studio até R$ 1.800 Centro (salvar 10)', fisgar: 'Imóveis particular no Centro R$ 1.500–3.000 (salvar 10)', imoview: 'Inativos Centro sem atualização 90–180 dias (reativar 20)', conc: 'Capturar 10 anúncios concorrentes no Centro' },
  { d: 2, theme: 'Botafogo (Alta)', b: ['Botafogo'], e1: 'Casas/apto até R$ 2.800 Botafogo (15)', e2: '2 dorm com vaga até R$ 3.200 Botafogo (10)', fisgar: 'Particular Botafogo (10)', imoview: 'Inativos Botafogo (20)', conc: '10 anúncios Botafogo', extra: 'Mapear ruas quentes e anotar observação do dia.' },
  { d: 3, theme: 'Jardim Nova Europa (Alta)', b: ['Jardim Nova Europa'], e1: 'Casas até R$ 3.000 Jd Nova Europa (15)', e2: 'Apto 2 dorm até R$ 2.700 (10)', fisgar: 'Particular 2 dorm (10)', imoview: 'Inativos Jd Nova Europa (20)', conc: '10 anúncios', extra: 'Registrar condomínios recorrentes.' },
  { d: 4, theme: 'Bosque (Alta)', b: ['Bosque'], e1: 'Aptos 1–2 dorm até R$ 3.500 (15)', e2: 'Kitnet até R$ 2.000 (10)', fisgar: 'Particular Bosque (10)', imoview: 'Inativos Bosque (20)', conc: '10 anúncios Bosque' },
  { d: 5, theme: 'Ponte Preta (Alta)', b: ['Ponte Preta'], e1: 'Casas até R$ 2.800 (15)', e2: 'Apto 2 dorm até R$ 3.200 (10)', fisgar: 'Particular Ponte Preta (10)', imoview: 'Inativos Ponte Preta (20)', conc: '10 anúncios Ponte Preta' },
  { d: 6, theme: 'Cidade Satélite Íris (Alta/Volume)', b: ['Cidade Satélite Íris'], e1: 'Casas até R$ 2.000 (15)', e2: 'Apto até R$ 1.800 (10)', fisgar: 'Particular até R$ 2.000 (10)', imoview: 'Inativos Satélite Íris (25)', conc: '10 anúncios', extra: 'Anotar garantia aceita quando aparecer.' },
  { d: 7, theme: 'Jardim Eulina (Alta)', b: ['Jardim Eulina'], e1: 'Casas/apto até R$ 2.800 (15)', e2: '2 dorm com vaga até R$ 3.200 (10)', fisgar: 'Particular (10)', imoview: 'Inativos Eulina (20)', conc: '10 anúncios Eulina' },
  { d: 8, theme: 'Jardim Santa Lúcia (Alta/Volume)', b: ['Jardim Santa Lúcia'], e1: 'Casas até R$ 2.200 (15)', e2: 'Apto até R$ 1.900 (10)', fisgar: 'Particular (10)', imoview: 'Inativos Santa Lúcia (25)', conc: '10 anúncios Santa Lúcia' },
  { d: 9, theme: 'Bonfim (Alta)', b: ['Bonfim'], e1: 'Aptos 1–2 dorm até R$ 3.200 (15)', e2: 'Kitnet até R$ 2.000 (10)', fisgar: 'Particular (10)', imoview: 'Inativos Bonfim (20)', conc: '10 anúncios Bonfim' },
  { d: 10, theme: 'Vila Marieta (Alta)', b: ['Vila Marieta'], e1: 'Casas até R$ 2.800 (15)', e2: 'Apto 2 dorm até R$ 3.000 (10)', fisgar: 'Particular (10)', imoview: 'Inativos Vila Marieta (20)', conc: '10 anúncios Vila Marieta' },
  { d: 11, theme: 'Dom Pedro / Mansões / Taquaral', b: ['Mansões Santo Antônio','Taquaral'], e1: 'Casas até R$ 2.000 região Shopping Dom Pedro (15)', e2: 'Apto 2 dorm até R$ 3.200 Taquaral/Mansões (10)', fisgar: 'Particular raio Dom Pedro (10)', imoview: 'Inativos Dom Pedro/Taquaral (20)', conc: '10 anúncios Dom Pedro/Taquaral' },
  { d: 12, theme: 'Cambuí (Ticket alto)', b: ['Cambuí'], e1: 'Aptos 1 dorm até R$ 4.500 (10)', e2: 'Aptos 2 dorm até R$ 6.000 (10)', fisgar: 'Particular Cambuí (8–10)', imoview: 'Inativos Cambuí (15)', conc: '10 anúncios, comparar preço por m²' },
  { d: 13, theme: 'Centro (Reforço Alta)', b: ['Centro'], e1: 'Repetir Dia 1 com meta +5 (Apto 1–2 dorm)', e2: 'Repetir Dia 1 com meta +5 (Kitnet/Studio)', fisgar: 'Particular Centro meta +5', imoview: 'Inativos Centro meta +5', conc: '10 anúncios Centro', extra: 'Identificar imóveis anunciados há muito tempo.' },
  { d: 14, theme: 'Barão Geraldo', b: ['Barão Geraldo'], e1: 'Kitnet/1 dorm até R$ 2.500 (15)', e2: '2 dorm até R$ 3.500 (10)', fisgar: 'Particular Barão (10)', imoview: 'Inativos Barão (20)', conc: '10 anúncios Barão' },
  { d: 15, theme: 'Parque Prado / Swift', b: ['Parque Prado','Swift'], e1: 'Aptos 2–3 dorm até R$ 4.000 (15)', e2: 'Casas até R$ 4.500 (10)', fisgar: 'Particular Prado/Swift (10)', imoview: 'Inativos Prado/Swift (20)', conc: '10 anúncios Prado/Swift' },
  { d: 16, theme: 'Botafogo (Reforço Alta)', b: ['Botafogo'], e1: 'Repetir Dia 2 foco 2 dorm e vaga (15)', e2: 'Repetir Dia 2 foco 2 dorm e vaga (10)', fisgar: 'Particular Botafogo (10)', imoview: 'Inativos Botafogo (20)', conc: '10 anúncios Botafogo', extra: 'Listar condomínios campeões.' },
  { d: 17, theme: 'Guanabara / Castelo', b: ['Guanabara','Castelo','Jardim Chapadão'], e1: 'Aptos 2 dorm até R$ 3.800 (15)', e2: 'Casas até R$ 4.500 (10)', fisgar: 'Particular Guanabara/Castelo (10)', imoview: 'Inativos Guanabara/Castelo (20)', conc: '10 anúncios Guanabara/Castelo' },
  { d: 18, theme: 'Ouro Verde (Volume)', b: ['Ouro Verde'], e1: 'Casas até R$ 1.900 (15)', e2: 'Apto até R$ 1.700 (10)', fisgar: 'Particular Ouro Verde (10)', imoview: 'Inativos Ouro Verde (25)', conc: '10 anúncios Ouro Verde' },
  { d: 19, theme: 'Ponte Preta (Reforço Alta)', b: ['Ponte Preta'], e1: 'Repetir Dia 5 meta padrão (15)', e2: 'Repetir Dia 5 meta padrão (10)', fisgar: 'Particular Ponte Preta (10)', imoview: 'Inativos Ponte Preta (+10 contatos)', conc: '10 anúncios Ponte Preta', extra: 'Mapear imóveis repetidos por anunciante.' },
  { d: 20, theme: 'Jardim Nova Europa (Reforço Alta)', b: ['Jardim Nova Europa'], e1: 'Repetir Dia 3 foco casas até R$ 3.000 (15)', e2: 'Apto 2 dorm até R$ 2.700 (10)', fisgar: 'Particular 2 dorm (10)', imoview: 'Inativos Jd Nova Europa (20)', conc: '10 anúncios' },
  { d: 21, theme: 'Bosque (Reforço Alta)', b: ['Bosque'], e1: 'Repetir Dia 4 aptos 1–2 dorm (15)', e2: 'Repetir Dia 4 kitnet (10)', fisgar: 'Particular Bosque (10)', imoview: 'Inativos Bosque (20)', conc: '10 anúncios', extra: 'Meta: 5 leads contatados no mesmo dia.' },
  { d: 22, theme: 'Jardim Eulina (Reforço Alta)', b: ['Jardim Eulina'], e1: 'Repetir Dia 7 casas/apto (15)', e2: 'Repetir Dia 7 2 dorm com vaga (10)', fisgar: 'Particular Eulina (10)', imoview: 'Inativos Eulina (20)', conc: '10 anúncios Eulina', extra: 'Revisar qualidade: sem lead capenga.' },
  { d: 23, theme: 'Padre Anchieta (Volume)', b: ['Padre Anchieta'], e1: 'Casas até R$ 2.000 (15)', e2: 'Apto até R$ 1.800 (10)', fisgar: 'Particular Anchieta (10)', imoview: 'Inativos Anchieta (25)', conc: '10 anúncios Anchieta' },
  { d: 24, theme: 'Bonfim (Reforço Alta)', b: ['Bonfim'], e1: 'Repetir Dia 9 aptos 1–2 dorm (15)', e2: 'Repetir Dia 9 kitnet/1 dorm (10)', fisgar: 'Particular Bonfim (10)', imoview: 'Inativos Bonfim (20)', conc: '10 anúncios Bonfim' },
  { d: 25, theme: 'Centro (Fechamento caça oportunidade)', b: ['Centro'], e1: 'Eemovel: anunciados há mais de X dias (15)', e2: 'Eemovel reforço kitnet/apto (10)', fisgar: 'Particular + urgente (10)', imoview: 'Recontato de quem não respondeu (20)', conc: '10 anúncios + argumento de diferenciação', extra: 'Registrar 5 teses do que está locando rápido.' },
  { d: 26, theme: 'Satélite Íris (Reforço Volume)', b: ['Cidade Satélite Íris'], e1: 'Repetir Dia 6 casas até R$ 2.000 (15)', e2: 'Repetir Dia 6 apto até R$ 1.800 (10)', fisgar: 'Particular Satélite Íris (10)', imoview: 'Inativos Satélite Íris (30)', conc: '10 anúncios Satélite Íris' },
  { d: 27, theme: 'Taquaral / Dom Pedro (Reforço)', b: ['Taquaral','Mansões Santo Antônio'], e1: 'Casas até R$ 2.000 Dom Pedro (15)', e2: 'Aptos 2 dorm até R$ 3.200 Taquaral (10)', fisgar: 'Particular raio Dom Pedro (10)', imoview: 'Inativos Dom Pedro/Taquaral (20)', conc: '10 anúncios região' },
  { d: 28, theme: 'Vila Marieta (Reforço Alta)', b: ['Vila Marieta'], e1: 'Repetir Dia 10 casas até R$ 2.800 (15)', e2: 'Repetir Dia 10 apto 2 dorm até R$ 3.000 (10)', fisgar: 'Particular Vila Marieta (10)', imoview: 'Inativos Vila Marieta (20)', conc: '10 anúncios Vila Marieta', extra: 'Revisar leads perdidos e motivos.' },
  { d: 29, theme: 'Santa Lúcia (Reforço Volume)', b: ['Jardim Santa Lúcia'], e1: 'Repetir Dia 8 casas até R$ 2.200 (15)', e2: 'Repetir Dia 8 apto até R$ 1.900 (10)', fisgar: 'Particular Santa Lúcia (10)', imoview: 'Inativos Santa Lúcia (25)', conc: '10 anúncios Santa Lúcia', extra: 'Criar top 10 proprietários para retorno.' },
  { d: 30, theme: 'Organização e Inteligência', b: ['Centro','Botafogo','Taquaral'], e1: 'Limpar e padronizar leads do mês sem bairro/link/origem (15 correções)', e2: 'Consolidar bairros com melhor resposta por origem (10 insights)', fisgar: 'Validar lista de oportunidades urgentes (10)', imoview: 'Revisar histórico e funil para próximo ciclo (20)', conc: 'Publicar benchmark concorrentes do mês (10)', extra: 'Montar Top 20 oportunidades e publicar notificação de resumo do mês.' },
];

const seed = {
  users: [
    { id: 'admin-1', name: 'Ana Gestora', username: 'admin', password: '123456', role: 'admin', team: 'Captação' },
    { id: 'user-1', name: 'Bruno Captação', username: 'bruno', password: '123456', role: 'user', team: 'Equipe A' }
  ],
  campaigns: [
    { id: crypto.randomUUID(), title: 'Casas até R$ 2.000 próximo ao Shopping Dom Pedro', description: 'Priorizar casas com garantia flexível e contato direto.', createdBy: 'admin-1', createdAt: new Date().toISOString() }
  ],
  notifications: [
    { id: crypto.randomUUID(), title: 'Roteiro oficial ativo', text: 'Use os scripts do botão “Ver script” e atualize evidências em cada tarefa.', date: new Date().toISOString().slice(0,10), pinnedDays: 5, targetUsers: [], createdBy: 'admin-1', createdAt: new Date().toISOString() }
  ],
  routines: baseDays.map((day) => ({ id: day.d, day: day.d, theme: day.theme, bairros: day.b, objectives: `Meta operacional Dia ${day.d}: execução integral no horário comercial e registro completo.`, tasks: mkTasks(day) })),
  taskResults: [],
  leads: [],
  dayNotes: [],
  dayFinalizations: [],
  auditLogs: []
};

let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || structuredClone(seed);
const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

let session = { userId: null, route: 'home', selectedDay: 1, mapFilter: 'all' };
let dayMap;

const app = document.getElementById('app');
const getUser = () => state.users.find((u) => u.id === session.userId);
const isAdmin = () => getUser()?.role === 'admin';

const logAction = (action, payload = {}) => {
  state.auditLogs.push({ id: crypto.randomUUID(), action, payload, by: session.userId, at: new Date().toISOString() });
  persist();
};

function render() {
  app.innerHTML = session.userId ? renderShell() : renderLogin();
  bindEvents();
}

function renderLogin() {
  return `<div class="login card"><h1>Zelo | Captação Interna</h1><p>Rotina diária de captação para locação em Campinas/SP.</p>
    <input id="username" placeholder="Usuário" value="bruno" />
    <input id="password" type="password" placeholder="Senha" value="123456" />
    <button class="btn" id="btnLogin">Entrar</button>
    <button class="btn secondary" id="forgot">Esqueci a senha</button>
    <p class="muted">Admin: admin/123456 | Usuário: bruno/123456</p>
  </div>`;
}

function renderShell() {
  const u = getUser();
  const links = [['home', 'Home'], ['routine', 'Rotina 30 dias'], ['day', 'Tela do Dia'], ['lead', 'Novo Lead'], ['notifications', 'Notificações'], ...(isAdmin() ? [['reports', 'Relatórios']] : [])];
  return `<div class="layout"><aside class="sidebar"><div class="brand">Zelo | Captação</div>${links.map(([id, label]) => `<button class="nav-btn ${session.route === id ? 'active' : ''}" data-route="${id}">${label}</button>`).join('')}<hr/><button class="nav-btn" id="logout">Sair</button></aside>
  <main class="main"><div class="topbar"><div><strong>${u.name}</strong><div class="muted">${u.role.toUpperCase()} • ${u.team}</div></div><div class="tag">Dia ${session.selectedDay}</div></div>${renderRoute()}</main></div>`;
}

function renderRoute() {
  if (session.route === 'home') return renderHome();
  if (session.route === 'routine') return renderRoutine();
  if (session.route === 'day') return renderDay();
  if (session.route === 'lead') return renderLeadForm();
  if (session.route === 'notifications') return renderNotifications();
  return renderReports();
}

function getResultsByDay(day) { return state.taskResults.filter((r) => r.day === day && r.userId === session.userId); }
function getLeadsByDay(day) { return state.leads.filter((l) => l.day === day && l.userId === session.userId); }

function calcProgress(day) {
  const routine = state.routines.find((d) => d.day === day);
  const done = getResultsByDay(day).filter((r) => ['feito', 'sem resultado', 'precisa ajuda'].includes(r.status)).length;
  return Math.round((done / routine.tasks.length) * 100) || 0;
}

function renderHome() {
  const today = state.routines.find((d) => d.day === session.selectedDay);
  const monthTasks = state.taskResults.filter((r) => r.userId === session.userId).length;
  const monthLeads = state.leads.filter((l) => l.userId === session.userId).length;
  const bySource = SOURCES.map((s) => {
    const leads = state.leads.filter((l) => l.userId === session.userId && l.origem === s).length;
    return `<li>${s}: ${leads} leads</li>`;
  }).join('');

  return `<section class="card"><h2>Resumo do Dia ${today.day}</h2><p><strong>${today.theme}</strong></p><p>${today.objectives}</p><button class="btn" data-go-day="${today.day}">Ir para Hoje</button></section>
  <section class="card"><h3>Notificações recentes</h3>${state.notifications.slice(-4).reverse().map((n) => `<div class="notice"><strong>${n.title}</strong><p>${n.text}</p></div>`).join('')}</section>
  <section class="card grid grid-3"><div><h3>Progresso do mês</h3><p>Tarefas registradas: <strong>${monthTasks}</strong></p></div><div><h3>Leads criados</h3><p><strong>${monthLeads}</strong></p></div><div><h3>Taxa por origem</h3><ul>${bySource}</ul></div></section>`;
}

function renderRoutine() {
  return `<section class="card"><h2>Rotina 30 dias</h2><div class="scroll-days">${state.routines.map((d) => `<article class="day-card"><h3>Dia ${d.day}</h3><p>${d.theme}</p><p>Bairros foco: ${d.bairros.join(', ')}</p><p>Progresso: ${calcProgress(d.day)}%</p><button class="btn" data-open-day="${d.day}">Abrir Dia</button></article>`).join('')}</div></section>`;
}

function taskResult(day, idx) {
  return state.taskResults.find((r) => r.day === day && r.taskIndex === idx && r.userId === session.userId) || {};
}

function renderDay() {
  const day = state.routines.find((d) => d.day === session.selectedDay);
  const leads = getLeadsByDay(day.day);
  const notes = state.dayNotes.find((n) => n.day === day.day && n.userId === session.userId)?.text || '';

  return `<section class="card"><h2>Dia ${day.day} – ${day.theme}</h2>
    <div class="filters"><button class="btn secondary" data-map-filter="all">Todos</button><button class="btn secondary" data-map-filter="mais-locados">Bairros mais locados</button><button class="btn secondary" data-map-filter="estrategicos">Outros estratégicos</button></div>
    <div id="map"></div>
    <div class="legend"><span class="high">Alta</span><span class="mid">Média</span><span class="low">Baixa</span></div></section>
    <section class="card"><h3>Checklist de tarefas (08:30–12:00 e 13:30–17:30)</h3>${day.tasks.map((t, i) => {
      const r = taskResult(day.day, i);
      return `<div class="task"><div><strong>${t.slot} | ${t.source}</strong><p>${t.title}</p><small>Tempo estimado: ${t.estimate} min</small></div>
      <details><summary>Abrir instruções</summary><p>${t.instruction}</p><button class="btn secondary" data-script="1">Ver script</button></details>
      <div class="grid grid-2"><select data-status="${i}"><option value="pendente">Pendente</option><option ${r.status === 'feito' ? 'selected' : ''} value="feito">Feito</option><option ${r.status === 'sem resultado' ? 'selected' : ''} value="sem resultado">Sem resultado</option><option ${r.status === 'precisa ajuda' ? 'selected' : ''} value="precisa ajuda">Precisa de ajuda</option></select>
      <input data-resultado="${i}" placeholder="Resultado (quantidade/retorno)" value="${r.resultado || ''}"/></div>
      <div class="grid grid-3"><input data-link="${i}" placeholder="Link/ID/Referência" value="${r.link || ''}"/><input data-print="${i}" placeholder="Print/Observação evidência" value="${r.printObs || ''}"/><button class="btn" data-save-task="${i}">Registrar resultado</button></div></div>`;
    }).join('')}</section>
    <section class="card"><h3>Leads gerados hoje</h3><ul>${leads.map((l) => `<li>${l.bairro} • ${l.origem} • ${l.faixaValor} • ${l.status}</li>`).join('') || '<li>Nenhum lead ainda.</li>'}</ul></section>
    <section class="card"><h3>Observações do dia</h3><textarea id="dayNotes" rows="4">${notes}</textarea><button class="btn secondary" id="saveNotes">Salvar observações</button><button class="btn" id="finalizeDay">Finalizar dia</button></section>`;
}

function renderLeadForm() {
  return `<section class="card"><h2>Novo Lead</h2>
  <div class="grid grid-2"><select id="leadOrigem"><option value="">Origem da Captação</option>${SOURCES.map((s) => `<option>${s}</option>`).join('')}</select><input id="leadBairro" placeholder="Bairro/Região"/></div>
  <div class="grid grid-2"><select id="leadTipo"><option>Casa</option><option>Apartamento</option><option>Kitnet</option><option>Sobrado</option></select><input id="leadFaixa" placeholder="Faixa de valor (obrigatório)"/></div>
  <div class="grid grid-2"><input id="leadNome" placeholder="Nome do proprietário"/><input id="leadContato" placeholder="Telefone / e-mail"/></div>
  <div class="grid grid-2"><input id="leadConds" placeholder="Condições (aluguel/cond/IPTU)"/><input id="leadLink" placeholder="Link/evidência (obrigatório)"/></div>
  <div class="grid grid-2"><select id="leadStatus"><option>novo</option><option>contatado</option><option>aguardando retorno</option><option>agendado</option><option>perdido</option></select><input id="leadNext" placeholder="Próximos passos"/></div>
  <button class="btn" id="saveLead">Salvar Lead</button></section>`;
}

function renderNotifications() {
  const list = state.notifications.slice().reverse().map((n) => `<div class="notice"><strong>${n.title}</strong><p>${n.text}</p><small>Fixado por ${n.pinnedDays} dias • ${n.date}</small></div>`).join('');
  if (!isAdmin()) return `<section class="card"><h2>Notificações</h2>${list}</section>`;
  return `<section class="card"><h2>Notificações (Admin)</h2><div class="grid grid-2"><input id="ntTitle" placeholder="Título"/><input id="ntDate" type="date"/></div><textarea id="ntText" placeholder="Texto"></textarea><div class="grid grid-3"><input id="ntPin" type="number" min="0" placeholder="Fixar topo por X dias"/><input id="ntTarget" placeholder="Segmentar por equipe/usuários (opcional)"/><button class="btn" id="saveNotification">Publicar</button></div></section>
  <section class="card"><h3>Campanhas</h3><div class="grid grid-2"><input id="cpTitle" placeholder="Nome da campanha"/><input id="cpDesc" placeholder="Descrição"/></div><button class="btn secondary" id="saveCampaign">Criar campanha</button><ul>${state.campaigns.map((c) => `<li>${c.title}</li>`).join('')}</ul></section>
  <section class="card"><h3>Feed</h3>${list}</section>`;
}

function renderReports() {
  if (!isAdmin()) return '<section class="card"><h2>Acesso negado</h2></section>';
  const leads = state.leads;
  const tasksDone = state.taskResults.filter((r) => r.status !== 'pendente').length;
  const contatados = leads.filter((l) => l.status === 'contatado').length;
  const agendados = leads.filter((l) => l.status === 'agendado').length;
  const bestSource = SOURCES.map((s) => ({ s, c: leads.filter((l) => l.origem === s).length })).sort((a, b) => b.c - a.c)[0];
  return `<section class="card"><h2>Relatórios (Admin)</h2><div class="grid grid-4"><input id="rpPeriod" placeholder="Período (YYYY-MM)"/><input id="rpUser" placeholder="Usuário"/><input id="rpSource" placeholder="Origem"/><input id="rpBairro" placeholder="Bairro"/></div><button class="btn secondary" id="exportCsv">Exportar CSV</button></section>
  <section class="card grid grid-3"><div><h3>Tarefas concluídas</h3><p>${tasksDone}</p></div><div><h3>Leads criados</h3><p>${leads.length}</p></div><div><h3>Leads contatados</h3><p>${contatados}</p></div><div><h3>Agendamentos</h3><p>${agendados}</p></div><div><h3>Melhor origem</h3><p>${bestSource?.s || '-'} (${bestSource?.c || 0})</p></div><div><h3>Auditoria</h3><p>${state.auditLogs.length} eventos</p></div></section>`;
}

function bindEvents() {
  const on = (id, ev, fn) => document.getElementById(id)?.addEventListener(ev, fn);

  on('btnLogin', 'click', () => {
    const user = state.users.find((u) => u.username === username.value && u.password === password.value);
    if (!user) return alert('Credenciais inválidas');
    session.userId = user.id;
    logAction('login');
    render();
  });

  on('forgot', 'click', () => alert('Fluxo simples: solicite reset ao admin gestor.'));
  on('logout', 'click', () => { logAction('logout'); session.userId = null; render(); });

  document.querySelectorAll('[data-route]').forEach((b) => b.addEventListener('click', () => { session.route = b.dataset.route; render(); }));
  document.querySelectorAll('[data-open-day],[data-go-day]').forEach((b) => b.addEventListener('click', () => { session.selectedDay = Number(b.dataset.openDay || b.dataset.goDay); session.route = 'day'; render(); }));
  document.querySelectorAll('[data-map-filter]').forEach((b) => b.addEventListener('click', () => { session.mapFilter = b.dataset.mapFilter; paintMap(); }));
  document.querySelectorAll('[data-script]').forEach((b) => b.addEventListener('click', () => alert(`Script\n\n${scripts.abordagem}\n\nObjeções: ${scripts.objecoes}\n\nChecklist: ${scripts.checklist}\n\n${scripts.etica}`)));

  document.querySelectorAll('[data-save-task]').forEach((b) => b.addEventListener('click', () => {
    const taskIndex = Number(b.dataset.saveTask);
    const day = session.selectedDay;
    const routineTask = state.routines.find((d) => d.day === day).tasks[taskIndex];
    const status = document.querySelector(`[data-status="${taskIndex}"]`).value;
    const resultado = document.querySelector(`[data-resultado="${taskIndex}"]`).value;
    const link = document.querySelector(`[data-link="${taskIndex}"]`).value;
    const printObs = document.querySelector(`[data-print="${taskIndex}"]`).value;
    if (routineTask.source === 'Concorrentes' && (!link || !printObs)) return alert('Para Concorrentes, informe link e print/observação.');
    const existing = state.taskResults.find((r) => r.day === day && r.taskIndex === taskIndex && r.userId === session.userId);
    const payload = { day, taskIndex, userId: session.userId, source: routineTask.source, status, resultado, link, printObs, updatedAt: new Date().toISOString() };
    if (existing) Object.assign(existing, payload); else state.taskResults.push(payload);
    logAction('task_result_saved', payload);
    persist();
    alert('Resultado registrado.');
  }));

  on('saveNotes', 'click', () => {
    const day = session.selectedDay;
    const text = dayNotes.value;
    const existing = state.dayNotes.find((n) => n.day === day && n.userId === session.userId);
    if (existing) existing.text = text; else state.dayNotes.push({ day, userId: session.userId, text });
    logAction('day_note_saved', { day });
    persist();
    alert('Observações salvas.');
  });

  on('finalizeDay', 'click', () => {
    const day = session.selectedDay;
    const routine = state.routines.find((d) => d.day === day);
    const results = getResultsByDay(day);
    const validStatusCount = results.filter((r) => ['feito', 'sem resultado', 'precisa ajuda'].includes(r.status)).length;
    const minRequired = Math.ceil(routine.tasks.length * 0.7);
    if (validStatusCount < minRequired) return alert(`Finalização bloqueada: mínimo ${minRequired} tarefas com status válido.`);

    const usedSources = [...new Set(routine.tasks.map((t) => t.source).filter((s) => SOURCES.includes(s)))];
    const missing = usedSources.filter((s) => !results.find((r) => r.source === s && r.resultado));
    if (missing.length) return alert(`Registre ao menos 1 resultado para cada origem usada: ${missing.join(', ')}`);

    state.dayFinalizations.push({ day, userId: session.userId, at: new Date().toISOString() });
    logAction('day_finalized', { day });
    persist();
    alert('Dia finalizado com sucesso.');
  });

  on('saveLead', 'click', () => {
    const lead = {
      id: crypto.randomUUID(), day: session.selectedDay, userId: session.userId,
      origem: leadOrigem.value, bairro: leadBairro.value, tipo: leadTipo.value, faixaValor: leadFaixa.value,
      proprietario: leadNome.value, contato: leadContato.value, condicoes: leadConds.value, link: leadLink.value,
      status: leadStatus.value, proximosPassos: leadNext.value, createdAt: new Date().toISOString()
    };
    if (!lead.bairro || !lead.origem || !lead.link || !lead.faixaValor) return alert('Lead obrigatório: bairro + origem + link/evidência + faixa de valor.');
    state.leads.push(lead);
    logAction('lead_created', { id: lead.id, origem: lead.origem });
    persist();
    alert('Lead salvo.');
    render();
  });

  on('saveNotification', 'click', () => {
    const n = { id: crypto.randomUUID(), title: ntTitle.value, text: ntText.value, date: ntDate.value || new Date().toISOString().slice(0,10), pinnedDays: Number(ntPin.value || 0), targetUsers: ntTarget.value ? ntTarget.value.split(',').map((x) => x.trim()) : [], createdBy: session.userId, createdAt: new Date().toISOString() };
    state.notifications.push(n);
    logAction('notification_created', { id: n.id });
    persist();
    render();
  });

  on('saveCampaign', 'click', () => {
    const c = { id: crypto.randomUUID(), title: cpTitle.value, description: cpDesc.value, createdBy: session.userId, createdAt: new Date().toISOString() };
    state.campaigns.push(c);
    logAction('campaign_created', { id: c.id });
    persist();
    render();
  });

  on('exportCsv', 'click', () => {
    const rows = ['id,dia,usuario,origem,bairro,status,link'];
    state.leads.forEach((l) => rows.push(`${l.id},${l.day},${l.userId},${l.origem},${l.bairro},${l.status},${l.link}`));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'relatorio-captacao.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    logAction('export_csv');
  });

  paintMap();
}

function paintMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl || !window.L || session.route !== 'day') return;
  const day = state.routines.find((d) => d.day === session.selectedDay);
  if (!dayMap) {
    dayMap = L.map('map').setView([-22.905, -47.06], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(dayMap);
  }

  dayMap.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Circle) dayMap.removeLayer(layer);
  });

  day.bairros.forEach((name) => {
    const info = bairros[name];
    if (!info) return;
    if (session.mapFilter !== 'all' && info.group !== session.mapFilter) return;
    const color = info.priority === 'Alta' ? '#dc2626' : info.priority === 'Média' ? '#f59e0b' : '#2563eb';
    L.circle([info.lat, info.lng], { radius: 700, color }).addTo(dayMap);
    L.marker([info.lat, info.lng]).addTo(dayMap).bindPopup(`<strong>${name}</strong><br>Prioridade: ${info.priority}`);
  });
}

render();
