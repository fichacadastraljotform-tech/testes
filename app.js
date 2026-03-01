const STORAGE_KEY = 'escola-zelo-state-v1';

const seed = {
  users: [
    { id: 'u-admin', name: 'Ana Gestora', email: 'admin@zelo.com', password: '123456', role: 'admin', sector: 'RH', position: 'Gestora de Treinamento', admissionDate: '2022-01-10', firstAccess: false, lastLogin: null, active: true, privacyAccepted: true },
    { id: 'u-aluno', name: 'Bruno Corretor', email: 'aluno@zelo.com', password: '123456', role: 'aluno', sector: 'Comercial', position: 'Corretor', admissionDate: '2024-04-01', firstAccess: true, lastLogin: null, active: true, privacyAccepted: false }
  ],
  tracks: [{ id: 't1', title: 'Onboarding Zelo', description: 'Integração e padrões internos.', isMandatory: true }],
  courses: [
    { id: 'c1', trackId: 't1', title: 'Atendimento Zelo', description: 'Boas práticas de atendimento.', workloadHours: 4, passingScore: 70, maxAttempts: 3, order: 1 },
    { id: 'c2', trackId: 't1', title: 'Locação Express', description: 'Fluxo de locação com qualidade.', workloadHours: 3, passingScore: 70, maxAttempts: 3, order: 2 }
  ],
  lessons: [],
  materials: [],
  progress: [],
  quizzes: [],
  questions: [],
  attempts: [],
  certificates: [],
  notifications: [
    { id: crypto.randomUUID(), title: 'Bem-vindos à Escola Zelo', message: '<p>Nova plataforma no ar. Complete a trilha obrigatória.</p>', priority: 'importante', audience: 'todos', sector: null, scheduledAt: null, createdAt: new Date().toISOString(), createdBy: 'u-admin' }
  ],
  reads: [],
  logs: []
};

function bootstrapLessons() {
  if (seed.lessons.length) return;
  ['c1','c2'].forEach((courseId) => {
    for (let i=1;i<=3;i++) {
      const lid = `${courseId}-l${i}`;
      seed.lessons.push({ id: lid, courseId, title: `Aula ${i}`, contentHtml: `<h3>Conteúdo da aula ${i}</h3><p>Placeholder editável para regras, exemplos e procedimentos internos da Zelo Imóveis.</p><p>Este texto pode ser administrado pelo painel para reforçar políticas, padrões de qualidade e comunicação com clientes.</p><p>Role até o fim para desbloquear conclusão alternativa.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat convallis purus, nec mattis purus.</p><p>Checklist: estudar script, validar documentos e registrar no CRM.</p>`, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', minWatchPercent: 85, minTimeSeconds: 60, orderIndex: i });
      seed.materials.push({ id: crypto.randomUUID(), lessonId: lid, title: `Checklist aula ${i}`, type: 'link', url: 'https://example.com/checklist' });
    }
    const qid = `q-${courseId}`;
    seed.quizzes.push({ id: qid, courseId, title: `Avaliação ${courseId.toUpperCase()}` });
    seed.questions.push(
      { id: crypto.randomUUID(), quizId: qid, type: 'multiple', prompt: 'Qual é o foco da Escola Zelo?', options: ['Treinamento interno', 'Venda externa', 'Financeiro'], correct: 'Treinamento interno' },
      { id: crypto.randomUUID(), quizId: qid, type: 'boolean', prompt: 'A plataforma emite certificado após aprovação.', options: ['Verdadeiro','Falso'], correct: 'Verdadeiro' }
    );
  });
}
bootstrapLessons();

function loadState() { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : structuredClone(seed); }
let state = loadState();
const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const app = document.getElementById('app');
let session = { userId: null, route: 'dashboard', selectedTrack: null, selectedCourse: null, selectedLesson: null };
let lessonMetrics = { startedAt: null, watchPercent: 0, scrolledBottom: false };

function log(action, payload={}) { state.logs.push({ id: crypto.randomUUID(), action, payload, by: session.userId, at: new Date().toISOString() }); persist(); }
const user = () => state.users.find(u => u.id === session.userId);
const unreadCount = () => state.notifications.filter(n => isVisibleNotification(n,user()) && !state.reads.find(r => r.userId===user().id && r.notificationId===n.id)).length;
const isVisibleNotification = (n,u)=> n.audience==='todos' || (n.audience==='setor' && n.sector===u.sector);

function render() { app.innerHTML = user() ? renderShell() : renderLogin(); attachEvents(); }

function renderLogin() {
  return `<div class="login card"><h1>Escola Zelo</h1><p>Treinamento interno da Zelo Imóveis</p>
  <input id="email" placeholder="E-mail" value="aluno@zelo.com" /><input id="password" placeholder="Senha" type="password" value="123456" />
  <button class="btn" id="doLogin">Entrar</button>
  <button class="btn secondary" id="forgot">Esqueci minha senha</button>
  <p style="font-size:.9rem;color:#667085">Acesso admin: admin@zelo.com / 123456</p></div>`;
}

function renderShell() {
  const u = user();
  const items = [
    ['dashboard','Dashboard'],['track','Trilhas'],['course','Cursos'],['notifications','Notificações'],['about','Sobre a Zelo'],
    ...(u.role==='admin' ? [['admin','Admin Panel']] : [])
  ];
  return `<div class="layout"><aside class="sidebar"><div class="brand">Escola Zelo</div>${items.map(([r,l])=>`<button class="nav-btn ${session.route===r?'active':''}" data-route="${r}">${l}${r==='notifications'?`<span class="badge">${unreadCount()}</span>`:''}</button>`).join('')}<hr/><button class="nav-btn" id="logout">Sair</button></aside>
  <main class="main"><div class="topbar"><div><strong>${u.name}</strong><div style="font-size:.85rem;color:#667085">${u.role.toUpperCase()} • Último acesso: ${u.lastLogin?new Date(u.lastLogin).toLocaleString():'primeiro acesso'}</div></div><button class="btn secondary" id="exportData">Exportar meus dados (LGPD)</button></div>${renderRoute()}</main>
  <nav class="mobile-nav">${items.slice(0,5).map(([r,l])=>`<button data-route="${r}">${l.split(' ')[0]}</button>`).join('')}</nav></div>`;
}

function courseLessons(courseId){ return state.lessons.filter(l=>l.courseId===courseId).sort((a,b)=>a.orderIndex-b.orderIndex); }
function lessonProgress(uid,lid){ return state.progress.find(p=>p.userId===uid&&p.lessonId===lid) || {status:'nao iniciado',watchedPercent:0,timeSpent:0}; }
function isLessonDone(uid,lid){ return !!state.progress.find(p=>p.userId===uid&&p.lessonId===lid&&p.status==='concluido'); }
function courseCompletion(uid,cid){ const lessons=courseLessons(cid); const done=lessons.filter(l=>isLessonDone(uid,l.id)).length; return {done,total:lessons.length,pct:lessons.length?Math.round((done/lessons.length)*100):0}; }
function latestAttempt(uid,cid){ const q=state.quizzes.find(x=>x.courseId===cid); if(!q) return null; return state.attempts.filter(a=>a.quizId===q.id&&a.userId===uid).sort((a,b)=>new Date(b.finishedAt)-new Date(a.finishedAt))[0]; }
function passedCourse(uid,cid){ const a=latestAttempt(uid,cid); return !!(a&&a.passed); }

function renderRoute(){
  switch(session.route){
    case 'dashboard': return renderDashboard();
    case 'track': return renderTrackPage();
    case 'course': return renderCoursePage();
    case 'lesson': return renderLessonPage();
    case 'quiz': return renderQuizPage();
    case 'completion': return renderCompletionPage();
    case 'notifications': return renderNotifications();
    case 'about': return renderAbout();
    case 'admin': return renderAdmin();
    default: return renderDashboard();
  }
}

function renderDashboard(){
  const u=user(); const mandatory=state.tracks.filter(t=>t.isMandatory);
  const allCourses=state.courses.filter(c=>mandatory.some(t=>t.id===c.trackId));
  const totalLessons=allCourses.reduce((s,c)=>s+courseLessons(c.id).length,0);
  const doneLessons=allCourses.reduce((s,c)=>s+courseLessons(c.id).filter(l=>isLessonDone(u.id,l.id)).length,0);
  const lastCourse=allCourses.find(c=>courseCompletion(u.id,c.id).pct<100) || allCourses[0];
  return `<div class="grid grid-2"><section class="card"><h2>Progresso geral</h2><div class="progress"><div style="width:${totalLessons?Math.round(doneLessons/totalLessons*100):0}%"></div></div><p>${doneLessons}/${totalLessons} aulas concluídas</p><h3>Trilhas obrigatórias</h3>${mandatory.map(t=>`<p><strong>${t.title}</strong> - ${t.description}</p>`).join('')}</section>
  <section class="card"><h2>Continuar aprendizado</h2><p>Último curso acessado: <strong>${lastCourse.title}</strong></p><button class="btn" data-go-course="${lastCourse.id}">Continuar</button>
  <h3 style="margin-top:1rem">Notificações recentes</h3>${state.notifications.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,3).map(n=>`<div><span class="tag">${n.priority}</span> ${n.title}</div>`).join('')}</section></div>`;
}

function renderTrackPage(){
  const list=state.tracks;
  return `<div class="card"><h2>Trilhas</h2><input id="searchTrack" placeholder="Buscar trilhas/cursos" /><div id="trackList">${list.map(t=>`<div class="card"><h3>${t.title}</h3><p>${t.description}</p>${state.courses.filter(c=>c.trackId===t.id).map(c=>{const cp=courseCompletion(user().id,c.id);return `<p>${c.title} - ${cp.done}/${cp.total} aulas</p>`;}).join('')}<button class="btn" data-open-track="${t.id}">Ver cursos</button></div>`).join('')}</div></div>`;
}

function renderCoursePage(){
  const trackId=session.selectedTrack || state.tracks[0].id;
  const courses=state.courses.filter(c=>c.trackId===trackId).sort((a,b)=>a.order-b.order);
  return `<div class="card"><h2>Cursos da Trilha</h2>${courses.map(c=>{const cp=courseCompletion(user().id,c.id);return `<div class="card"><h3>${c.title}</h3><p>${c.description}</p><div class="progress"><div style="width:${cp.pct}%"></div></div><p>${cp.done}/${cp.total} aulas • nota mínima ${c.passingScore}%</p><button class="btn" data-open-course="${c.id}">Abrir curso</button></div>`;}).join('')}</div>`;
}

function renderLessonPage(){
  const cid=session.selectedCourse || state.courses[0].id;
  const lessons=courseLessons(cid);
  const current=session.selectedLesson ? state.lessons.find(l=>l.id===session.selectedLesson) : lessons[0];
  const cp=courseCompletion(user().id,cid);
  const mats=state.materials.filter(m=>m.lessonId===current.id);
  const canComplete = lessonMetrics.watchPercent >= current.minWatchPercent || ((Date.now()-lessonMetrics.startedAt)/1000 >= current.minTimeSeconds && lessonMetrics.scrolledBottom);
  return `<div class="progress-wrap"><strong>Progresso do curso ${cp.pct}%</strong><div class="progress"><div style="width:${cp.pct}%"></div></div><small>${cp.done}/${cp.total} aulas concluídas</small></div>
  <div class="grid grid-2"><section class="card"><h2>${current.title}</h2><iframe width="100%" height="240" src="${current.videoUrl}" title="video"></iframe><label>Percentual assistido (simulação): ${lessonMetrics.watchPercent}%</label><input id="watchRange" type="range" min="0" max="100" value="${lessonMetrics.watchPercent}" />
  <h3>Materiais</h3>${mats.map(m=>`<p><a href="${m.url}" target="_blank">${m.title}</a></p>`).join('')}
  <button class="btn ${canComplete?'success':''}" id="completeLesson" ${canComplete?'':'disabled'}>Concluir aula</button></section>
  <section class="card"><h3>Conteúdo com rolagem</h3><div id="lessonContent" class="lesson-content">${current.contentHtml}</div>
  <h4>Módulos</h4>${lessons.map(l=>`<div><button class="btn secondary" data-open-lesson="${l.id}">${l.title} ${isLessonDone(user().id,l.id)?'✅':''}</button></div>`).join('')}
  ${cp.done===cp.total?`<button class="btn" id="goQuiz">Ir para avaliação</button>`:''}
  </section></div>`;
}

function renderQuizPage(){
  const cid=session.selectedCourse; const course=state.courses.find(c=>c.id===cid); const quiz=state.quizzes.find(q=>q.courseId===cid);
  const questions=state.questions.filter(q=>q.quizId===quiz.id);
  const used=state.attempts.filter(a=>a.quizId===quiz.id&&a.userId===user().id).length;
  if(used>=course.maxAttempts && !passedCourse(user().id,cid)) return `<div class="card"><h2>Avaliação bloqueada</h2><p>Você atingiu o limite de tentativas (${course.maxAttempts}).</p></div>`;
  return `<div class="card"><h2>${quiz.title}</h2><p>Tentativa ${used+1} de ${course.maxAttempts}</p>
  ${questions.map((q,i)=>`<div class="card"><p><strong>${i+1}. ${q.prompt}</strong></p>${q.options.map(o=>`<label><input type="radio" name="q-${q.id}" value="${o}"/> ${o}</label><br/>`).join('')}</div>`).join('')}
  <button class="btn" id="submitQuiz">Finalizar avaliação</button></div>`;
}

function ensureCertificate(uid,cid){
  let cert=state.certificates.find(c=>c.userId===uid&&c.courseId===cid); if(cert) return cert;
  cert={id:crypto.randomUUID(),userId:uid,courseId:cid,code:crypto.randomUUID(),issuedAt:new Date().toISOString(),pdfPath:null}; state.certificates.push(cert); persist(); return cert;
}

function renderCompletionPage(){
  const course=state.courses.find(c=>c.id===session.selectedCourse); const cert=ensureCertificate(user().id,course.id);
  return `<div class="card"><h1>🎉 Parabéns, curso concluído!</h1><p>Você concluiu <strong>${course.title}</strong> e já pode baixar seu certificado.</p>
  <ul><li>Aluno: ${user().name}</li><li>Carga horária: ${course.workloadHours}h</li><li>Data: ${new Date(cert.issuedAt).toLocaleDateString()}</li><li>Código: ${cert.code}</li><li>Assinatura: Zelo Imóveis</li></ul>
  <button class="btn" id="viewCert">Visualizar certificado</button> <button class="btn success" id="downloadCert">Baixar PDF</button></div>`;
}

function renderNotifications(){
  const u=user();
  const list=state.notifications.filter(n=>isVisibleNotification(n,u)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  return `<div class="card"><h2>Novidades</h2>${list.map(n=>`<div class="card"><span class="tag">${n.priority}</span><h3>${n.title}</h3>${n.message}<small>${new Date(n.createdAt).toLocaleString()}</small><br/><button class="btn secondary" data-read="${n.id}">Marcar como lida</button></div>`).join('')}</div>`;
}

function renderAbout(){
  return `<div class="card"><h2>Sobre a Zelo Imóveis</h2><p>Texto institucional placeholder editável: a Zelo Imóveis investe em formação contínua para oferecer excelência em atendimento, locação e gestão de imóveis.</p>
  <h3>Nossa História</h3><div class="timeline"><p>2010 - Fundação da Zelo Imóveis.</p><p>2018 - Expansão regional e padronização comercial.</p><p>2026 - Lançamento da Escola Zelo para treinamento interno.</p></div>
  <h3>Valores e Cultura</h3><p>Ética, proximidade com o cliente, foco em resultados sustentáveis e colaboração entre áreas.</p>
  <h3>Como usamos a Escola Zelo</h3><p>Concluir trilhas obrigatórias no prazo definido pelo RH, manter certificações ativas e acionar o gestor em caso de dúvidas.</p></div>`;
}

function renderAdmin(){
  if(user().role!=='admin') return '<div class="card">Sem permissão.</div>';
  return `<div class="grid grid-2"><section class="card"><h2>Usuários</h2><table class="table"><tr><th>Nome</th><th>Setor</th><th>Perfil</th><th>Ação</th></tr>${state.users.map(u=>`<tr><td>${u.name}</td><td>${u.sector}</td><td>${u.role}</td><td><button class="btn secondary" data-toggle-user="${u.id}">${u.active?'Desativar':'Ativar'}</button></td></tr>`).join('')}</table>
  <h3>Novo usuário</h3><input id="newName" placeholder="Nome"/><input id="newEmail" placeholder="Email"/><select id="newRole"><option value="aluno">Aluno</option><option value="admin">Admin</option></select><input id="newSector" placeholder="Setor"/><input id="newPos" placeholder="Cargo"/><button class="btn" id="createUser">Criar</button></section>
  <section class="card"><h2>Notificações</h2><input id="nTitle" placeholder="Título"/><textarea id="nMsg" placeholder="Mensagem (rich text simples)"></textarea><select id="nPriority"><option>normal</option><option>importante</option></select><select id="nAudience"><option value="todos">Todos</option><option value="setor">Por setor</option></select><input id="nSector" placeholder="Setor alvo (se aplicável)"/><button class="btn" id="publishNot">Publicar</button>
  <h3>Relatórios rápidos</h3><p>Certificados emitidos: ${state.certificates.length}</p><p>Tentativas de avaliação: ${state.attempts.length}</p><p>Logs de auditoria: ${state.logs.length}</p></section></div>
  <div class="card"><h2>Auditoria</h2><table class="table"><tr><th>Quando</th><th>Ação</th><th>Quem</th></tr>${state.logs.slice(-10).reverse().map(l=>`<tr><td>${new Date(l.at).toLocaleString()}</td><td>${l.action}</td><td>${state.users.find(u=>u.id===l.by)?.name||'-'}</td></tr>`).join('')}</table></div>`;
}

function attachEvents(){
  const on = (id, ev, fn) => { const el = document.getElementById(id); if(el) el.addEventListener(ev, fn); };
  on('doLogin','click',()=>{
    const email=document.getElementById('email').value.trim().toLowerCase(); const pass=document.getElementById('password').value;
    const u=state.users.find(x=>x.email===email&&x.password===pass&&x.active); if(!u) return alert('Credenciais inválidas');
    u.lastLogin=new Date().toISOString(); session.userId=u.id; session.route='dashboard'; persist();
    if(!u.privacyAccepted) setTimeout(()=>{ if(confirm('Aviso de privacidade LGPD: seus dados são usados para treinamento interno. Aceita?')) {u.privacyAccepted=true; persist(); render();}},50);
    if(u.firstAccess){ setTimeout(()=>{ const n=prompt('Primeiro acesso: defina nova senha'); if(n){u.password=n;u.firstAccess=false;persist();alert('Senha alterada.');}},100); }
    render();
  });
  on('forgot','click',()=>alert('Fluxo mock: solicitação de redefinição enviada por e-mail.'));
  document.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>{ session.route=b.dataset.route; render(); }));
  on('logout','click',()=>{ session={userId:null,route:'dashboard'}; render(); });
  on('exportData','click',()=>{ const u=user(); const payload={user:u,progress:state.progress.filter(p=>p.userId===u.id),attempts:state.attempts.filter(a=>a.userId===u.id),certificates:state.certificates.filter(c=>c.userId===u.id)}; const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`dados-${u.id}.json`; a.click(); URL.revokeObjectURL(a.href); });
  document.querySelectorAll('[data-go-course],[data-open-course]').forEach(b=>b.addEventListener('click',()=>{ session.selectedCourse=b.dataset.goCourse||b.dataset.openCourse; session.route='lesson'; lessonMetrics={startedAt:Date.now(),watchPercent:0,scrolledBottom:false}; render(); }));
  document.querySelectorAll('[data-open-track]').forEach(b=>b.addEventListener('click',()=>{ session.selectedTrack=b.dataset.openTrack; session.route='course'; render(); }));
  document.querySelectorAll('[data-open-lesson]').forEach(b=>b.addEventListener('click',()=>{ session.selectedLesson=b.dataset.openLesson; lessonMetrics={startedAt:Date.now(),watchPercent:0,scrolledBottom:false}; render(); }));
  on('watchRange','input',e=>{ lessonMetrics.watchPercent=Number(e.target.value); render(); });
  on('completeLesson','click',()=>{
    const lid=session.selectedLesson || courseLessons(session.selectedCourse)[0].id;
    const rec=state.progress.find(p=>p.userId===user().id&&p.lessonId===lid);
    const p={userId:user().id,lessonId:lid,status:'concluido',watchedPercent:lessonMetrics.watchPercent,timeSpent:Math.round((Date.now()-lessonMetrics.startedAt)/1000),completedAt:new Date().toISOString()};
    rec?Object.assign(rec,p):state.progress.push(p); persist(); log('lesson_completed',{lessonId:lid}); render();
  });
  on('goQuiz','click',()=>{ session.route='quiz'; render(); });
  const lc=document.getElementById('lessonContent'); if(lc){ lc.addEventListener('scroll',()=>{ if(lc.scrollTop+lc.clientHeight>=lc.scrollHeight-4) lessonMetrics.scrolledBottom=true; }); }
  on('submitQuiz','click',()=>{
    const cid=session.selectedCourse, quiz=state.quizzes.find(q=>q.courseId===cid), qs=state.questions.filter(q=>q.quizId===quiz.id); let score=0;
    qs.forEach(q=>{ const c=document.querySelector(`input[name="q-${q.id}"]:checked`); if(c&&c.value===q.correct) score++; });
    const percent=Math.round((score/qs.length)*100); const course=state.courses.find(c=>c.id===cid); const attemptN=state.attempts.filter(a=>a.quizId===quiz.id&&a.userId===user().id).length+1;
    const attempt={id:crypto.randomUUID(),quizId:quiz.id,userId:user().id,score:percent,passed:percent>=course.passingScore,attemptNumber:attemptN,startedAt:new Date(Date.now()-120000).toISOString(),finishedAt:new Date().toISOString()};
    state.attempts.push(attempt); persist(); log('quiz_submitted',{courseId:cid,score:percent});
    alert(`Resultado: ${percent}% (${attempt.passed?'Aprovado':'Reprovado'})`);
    session.route=attempt.passed?'completion':'quiz'; render();
  });
  document.querySelectorAll('[data-read]').forEach(b=>b.addEventListener('click',()=>{ if(!state.reads.find(r=>r.userId===user().id&&r.notificationId===b.dataset.read)) state.reads.push({userId:user().id,notificationId:b.dataset.read,readAt:new Date().toISOString()}); persist(); render(); }));
  on('viewCert','click',()=>{ const course=state.courses.find(c=>c.id===session.selectedCourse); alert(`${user().name}\nConcluiu ${course.title}\nZelo Imóveis`); });
  on('downloadCert','click',()=>{
    const { jsPDF } = window.jspdf || {}; if(!jsPDF) return alert('Biblioteca PDF indisponível.');
    const c=state.courses.find(c=>c.id===session.selectedCourse), cert=state.certificates.find(x=>x.userId===user().id&&x.courseId===c.id);
    const doc=new jsPDF(); doc.text('Certificado de Conclusão - Escola Zelo',20,20); doc.text(`Aluno: ${user().name}`,20,40); doc.text(`Curso: ${c.title}`,20,50); doc.text(`Carga horária: ${c.workloadHours}h`,20,60); doc.text(`Data: ${new Date(cert.issuedAt).toLocaleDateString()}`,20,70); doc.text(`Código: ${cert.code}`,20,80); doc.text('Zelo Imóveis',20,100); doc.save(`certificado-${cert.code}.pdf`);
  });
  on('searchTrack','input',e=>{ const t=e.target.value.toLowerCase(); document.querySelectorAll('#trackList>.card').forEach(c=>{ c.style.display=c.innerText.toLowerCase().includes(t)?'block':'none'; }); });

  on('createUser','click',()=>{ const nu={id:crypto.randomUUID(),name:newName.value,email:newEmail.value,password:'123456',role:newRole.value,sector:newSector.value,position:newPos.value,admissionDate:new Date().toISOString().slice(0,10),firstAccess:true,lastLogin:null,active:true,privacyAccepted:false}; state.users.push(nu); persist(); log('user_created',{id:nu.id}); render(); });
  document.querySelectorAll('[data-toggle-user]').forEach(b=>b.addEventListener('click',()=>{ const u=state.users.find(x=>x.id===b.dataset.toggleUser); u.active=!u.active; persist(); log('user_toggled',{id:u.id,active:u.active}); render(); }));
  on('publishNot','click',()=>{ const n={id:crypto.randomUUID(),title:nTitle.value,message:nMsg.value,priority:nPriority.value,audience:nAudience.value,sector:nAudience.value==='setor'?nSector.value:null,scheduledAt:null,createdAt:new Date().toISOString(),createdBy:user().id}; state.notifications.push(n); persist(); log('notification_published',{id:n.id}); render(); });
}

render();
