// ============================================================
// server.js — Backend completo Barbearia Carvalho
// ============================================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── HELPERS ──────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token === db.adminPassword) return next();
  return res.status(401).json({ error: 'Não autorizado' });
}

function getLevel(points) {
  if (points >= db.levels.gold.min)   return 'gold';
  if (points >= db.levels.silver.min) return 'silver';
  return 'bronze';
}

function findOrCreateClient(phone, name) {
  let c = db.clients.find(x => x.phone === phone);
  if (!c) {
    c = {
      id: Date.now().toString(),
      name: name || 'Cliente',
      phone,
      email: '',
      points: 0,
      level: 'bronze',
      totalVisits: 0,
      history: [],
      favorites: [],
      recommendedProducts: ['1','2'],
      joinedAt: new Date().toISOString(),
      lastVisit: null,
      challengeProgress: {}
    };
    db.clients.push(c);
  }
  return c;
}

// ─── SETTINGS ─────────────────────────────────────────────
app.get('/api/settings', (req, res) => res.json(db.settings));

app.put('/api/settings', requireAdmin, (req, res) => {
  const allowed = ['phone','email','instagram','address','hours','about','heroTitle','heroSubtitle'];
  for (const k of allowed) if (req.body[k] !== undefined) db.settings[k] = req.body[k];
  res.json({ success: true, settings: db.settings });
});

// ─── BARBEIROS ────────────────────────────────────────────
app.get('/api/barbers', (req, res) => res.json(db.barbers));

app.post('/api/barbers', requireAdmin, (req, res) => {
  const { name, role, bio, icon } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
  const b = { id: Date.now().toString(), name, role: role||'', bio: bio||'', icon: icon||'✂', active: true };
  db.barbers.push(b);
  res.status(201).json({ success: true, barber: b });
});

app.put('/api/barbers/:id', requireAdmin, (req, res) => {
  const b = db.barbers.find(x => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Não encontrado' });
  for (const k of ['name','role','bio','icon','active']) if (req.body[k] !== undefined) b[k] = req.body[k];
  res.json({ success: true, barber: b });
});

app.delete('/api/barbers/:id', requireAdmin, (req, res) => {
  const idx = db.barbers.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Não encontrado' });
  db.barbers.splice(idx, 1);
  res.json({ success: true });
});

// ─── SERVIÇOS ─────────────────────────────────────────────
app.get('/api/services', (req, res) => res.json(db.services));

app.post('/api/services', requireAdmin, (req, res) => {
  const { name, desc, price, duration, icon, points } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Nome e preço obrigatórios' });
  const s = { id: Date.now().toString(), name, desc: desc||'', price, duration: duration||'', icon: icon||'✂', points: points||0, active: true };
  db.services.push(s);
  res.status(201).json({ success: true, service: s });
});

app.put('/api/services/:id', requireAdmin, (req, res) => {
  const s = db.services.find(x => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Não encontrado' });
  for (const k of ['name','desc','price','duration','icon','points','active']) if (req.body[k] !== undefined) s[k] = req.body[k];
  res.json({ success: true, service: s });
});

app.delete('/api/services/:id', requireAdmin, (req, res) => {
  const idx = db.services.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Não encontrado' });
  db.services.splice(idx, 1);
  res.json({ success: true });
});

// ─── AGENDAMENTOS ─────────────────────────────────────────
app.post('/api/appointments', (req, res) => {
  const { name, phone, service, barber, date, time } = req.body;
  if (!name || !phone || !service || !barber || !date || !time)
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  const conflict = db.appointments.find(a => a.barber === barber && a.date === date && a.time === time && a.status !== 'cancelado');
  if (conflict) return res.status(409).json({ error: 'Horário já reservado' });
  const appt = { id: Date.now().toString(), name, phone, service, barber, date, time, status: 'pendente', createdAt: new Date().toISOString() };
  db.appointments.push(appt);
  res.status(201).json({ success: true, appointment: appt });
});

app.get('/api/appointments', requireAdmin, (req, res) => {
  res.json([...db.appointments].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)));
});

app.patch('/api/appointments/:id', requireAdmin, (req, res) => {
  const a = db.appointments.find(x => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'Não encontrado' });
  a.status = req.body.status;
  // Se concluído, adiciona pontos ao cliente
  if (req.body.status === 'concluido') {
    const svc = db.services.find(s => s.name === a.service);
    const pts  = svc ? Number(svc.points) : 0;
    if (pts > 0 && a.phone) {
      const client = findOrCreateClient(a.phone, a.name);
      client.points      += pts;
      client.totalVisits += 1;
      client.level        = getLevel(client.points);
      client.lastVisit    = new Date().toISOString();
      client.history.unshift({ date: a.date, service: a.service, barber: a.barber, points: pts });
      a.pointsAwarded = pts;
      a.clientId      = client.id;
    }
  }
  res.json({ success: true, appointment: a });
});

app.delete('/api/appointments/:id', requireAdmin, (req, res) => {
  const idx = db.appointments.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Não encontrado' });
  db.appointments.splice(idx, 1);
  res.json({ success: true });
});

app.get('/api/available-slots', (req, res) => {
  const { date, barber } = req.query;
  const all = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00'];
  const booked = db.appointments.filter(a => a.date === date && a.barber === barber && a.status !== 'cancelado').map(a => a.time);
  res.json(all.filter(s => !booked.includes(s)));
});

// ─── CLIENTES / FIDELIDADE ────────────────────────────────
// Lookup por telefone (público — o cliente acede pelo próprio tel)
app.get('/api/clients/lookup', (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'Telefone obrigatório' });
  const c = db.clients.find(x => x.phone === phone.replace(/\s/g,''));
  if (!c) return res.status(404).json({ error: 'Cliente não encontrado. Faça uma visita para criar o seu perfil!' });
  const levelInfo = db.levels[c.level];
  const nextLevel = c.level === 'bronze' ? db.levels.silver : c.level === 'silver' ? db.levels.gold : null;
  const progress  = nextLevel ? Math.min(100, Math.round(((c.points - levelInfo.min) / (nextLevel.min - levelInfo.min)) * 100)) : 100;
  res.json({ ...c, levelInfo, nextLevel, progress, rewards: db.rewards.filter(r=>r.active), challenges: db.challenges.filter(r=>r.active) });
});

// Admin — listar todos os clientes
app.get('/api/clients', requireAdmin, (req, res) => {
  res.json([...db.clients].sort((a,b) => b.points - a.points));
});

// Admin — editar cliente (pontos, favoritos, produtos recomendados)
app.put('/api/clients/:id', requireAdmin, (req, res) => {
  const c = db.clients.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Não encontrado' });
  for (const k of ['name','email','points','favorites','recommendedProducts']) if (req.body[k] !== undefined) c[k] = req.body[k];
  if (req.body.points !== undefined) c.level = getLevel(Number(req.body.points));
  res.json({ success: true, client: c });
});

// Admin — adicionar pontos manualmente
app.post('/api/clients/:id/points', requireAdmin, (req, res) => {
  const c = db.clients.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Não encontrado' });
  const delta = Number(req.body.delta) || 0;
  c.points = Math.max(0, c.points + delta);
  c.level  = getLevel(c.points);
  if (delta > 0 && req.body.reason) {
    c.history.unshift({ date: new Date().toISOString().split('T')[0], service: req.body.reason, barber: 'Admin', points: delta });
  }
  res.json({ success: true, client: c });
});

// Resgatar recompensa
app.post('/api/clients/:id/redeem', (req, res) => {
  const c = db.clients.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Cliente não encontrado' });
  const r = db.rewards.find(x => x.id === req.body.rewardId);
  if (!r) return res.status(404).json({ error: 'Recompensa não encontrada' });
  if (c.points < r.cost) return res.status(400).json({ error: `Pontos insuficientes. Precisas de ${r.cost} pontos.` });
  c.points -= r.cost;
  c.level   = getLevel(c.points);
  c.history.unshift({ date: new Date().toISOString().split('T')[0], service: `🎁 Resgate: ${r.title}`, barber: '-', points: -r.cost });
  res.json({ success: true, points: c.points, level: c.level, reward: r });
});

// ─── DESAFIOS ─────────────────────────────────────────────
app.get('/api/challenges', (req, res) => res.json(db.challenges));

app.post('/api/challenges', requireAdmin, (req, res) => {
  const { title, desc, goal, reward, icon, type } = req.body;
  if (!title || !goal || !reward) return res.status(400).json({ error: 'Campos obrigatórios' });
  const c = { id: Date.now().toString(), title, desc: desc||'', goal: Number(goal), reward: Number(reward), icon: icon||'🏆', type: type||'visits', active: true };
  db.challenges.push(c);
  res.status(201).json({ success: true, challenge: c });
});

app.put('/api/challenges/:id', requireAdmin, (req, res) => {
  const c = db.challenges.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Não encontrado' });
  for (const k of ['title','desc','goal','reward','icon','type','active']) if (req.body[k] !== undefined) c[k] = req.body[k];
  res.json({ success: true, challenge: c });
});

app.delete('/api/challenges/:id', requireAdmin, (req, res) => {
  const idx = db.challenges.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Não encontrado' });
  db.challenges.splice(idx, 1);
  res.json({ success: true });
});

// ─── RECOMPENSAS ──────────────────────────────────────────
app.get('/api/rewards', (req, res) => res.json(db.rewards));

app.post('/api/rewards', requireAdmin, (req, res) => {
  const { title, desc, cost, icon } = req.body;
  if (!title || !cost) return res.status(400).json({ error: 'Campos obrigatórios' });
  const r = { id: Date.now().toString(), title, desc: desc||'', cost: Number(cost), icon: icon||'🎁', active: true };
  db.rewards.push(r);
  res.status(201).json({ success: true, reward: r });
});

app.put('/api/rewards/:id', requireAdmin, (req, res) => {
  const r = db.rewards.find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Não encontrado' });
  for (const k of ['title','desc','cost','icon','active']) if (req.body[k] !== undefined) r[k] = req.body[k];
  res.json({ success: true, reward: r });
});

app.delete('/api/rewards/:id', requireAdmin, (req, res) => {
  const idx = db.rewards.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Não encontrado' });
  db.rewards.splice(idx, 1);
  res.json({ success: true });
});

// ─── PRODUTOS ─────────────────────────────────────────────
app.get('/api/products', (req, res) => res.json(db.products.filter(p=>p.active)));

app.post('/api/products', requireAdmin, (req, res) => {
  const { name, desc, price, icon } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Campos obrigatórios' });
  const p = { id: Date.now().toString(), name, desc: desc||'', price, icon: icon||'📦', active: true };
  db.products.push(p);
  res.status(201).json({ success: true, product: p });
});

app.put('/api/products/:id', requireAdmin, (req, res) => {
  const p = db.products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Não encontrado' });
  for (const k of ['name','desc','price','icon','active']) if (req.body[k] !== undefined) p[k] = req.body[k];
  res.json({ success: true, product: p });
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const idx = db.products.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Não encontrado' });
  db.products.splice(idx, 1);
  res.json({ success: true });
});

// ─── LOGIN & SENHA ADMIN ──────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === db.adminPassword)
    return res.json({ success: true, token: db.adminPassword });
  res.status(401).json({ error: 'Senha incorreta' });
});

app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Preencha todos os campos' });
  if (currentPassword !== db.adminPassword) return res.status(401).json({ error: 'Senha atual incorreta' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
  db.adminPassword = newPassword;
  res.json({ success: true, token: newPassword, message: 'Senha alterada com sucesso!' });
});

app.post('/api/admin/gemini-key', requireAdmin, (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || apiKey.length < 10) return res.status(400).json({ error: 'Chave inválida' });
  db.geminiKey = apiKey;
  res.json({ success: true, message: 'API Key actualizada!' });
});

// ─── CHAT GEMINI ──────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'COLE_AQUI_AIzaSy...';
const GEMINI_MODELS  = ['gemini-2.0-flash','gemini-2.0-flash-lite','gemini-2.0-flash-001'];
const GEMINI_BASE    = 'https://generativelanguage.googleapis.com/v1beta/models';

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensagem obrigatória' });
  const activeKey = db.geminiKey || GEMINI_API_KEY;
  if (!activeKey || activeKey.includes('COLE_AQUI')) return res.status(503).json({ error: 'sem_key' });

  const { default: fetch } = await import('node-fetch');
  const systemPrompt = `Você é o assistente virtual da Barbearia Carvalho em Almada, Portugal.
Informações: ${JSON.stringify(db.settings)}.
Serviços: ${db.services.filter(s=>s.active).map(s=>`${s.name} €${s.price} (${s.duration}) = ${s.points}pts`).join(', ')}.
Barbeiros: ${db.barbers.filter(b=>b.active).map(b=>b.name).join(', ')}.
Programa de fidelidade: Bronze (0-299pts), Prata (300-799pts), Ouro (800+pts). Clientes ganham pontos por cada serviço.
Recompensas disponíveis: ${db.rewards.filter(r=>r.active).map(r=>`${r.title} (${r.cost}pts)`).join(', ')}.
Responde sempre em português europeu, de forma simpática e profissional. Sê conciso.`;

  const contents = [];
  if (Array.isArray(history)) for (const h of history) contents.push({ role: h.role, parts:[{text:h.text}] });
  contents.push({ role:'user', parts:[{text:message}] });
  const payload = { system_instruction:{parts:[{text:systemPrompt}]}, contents, generationConfig:{maxOutputTokens:512,temperature:0.7} };

  for (const model of GEMINI_MODELS) {
    try {
      const resp = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${activeKey}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data = await resp.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) return res.json({ reply: data.candidates[0].content.parts[0].text });
      if (data.error?.code === 429) continue;
      if ([400,401].includes(data.error?.code)) return res.status(401).json({ error:'key_invalida' });
    } catch { continue; }
  }
  res.status(429).json({ error:'quota_esgotada' });
});

// ─── SPA FALLBACK ─────────────────────────────────────────
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n✅  Barbearia Carvalho → http://localhost:${PORT}`);
  console.log(`🔑  Senha admin: ${db.adminPassword}`);
  console.log(`🎮  Programa de fidelidade: ACTIVO\n`);
});
