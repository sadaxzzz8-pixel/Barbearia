// ============================================================
// server.js — Backend completo Barbearia Carvalho
// Node.js + Express (CommonJS)
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

// ─── AUTH MIDDLEWARE ──────────────────────────────────────
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token === db.adminPassword) return next();
  return res.status(401).json({ error: 'Não autorizado' });
}

// ─── GET CONFIGURAÇÕES (público) ──────────────────────────
app.get('/api/settings', (req, res) => {
  res.json(db.settings);
});

// ─── PUT CONFIGURAÇÕES (admin) ────────────────────────────
app.put('/api/settings', requireAdmin, (req, res) => {
  const allowed = [
    'phone','email','instagram','address',
    'hours','about','heroTitle','heroSubtitle'
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) db.settings[key] = req.body[key];
  }
  res.json({ success: true, settings: db.settings });
});

// ─── CRIAR AGENDAMENTO ────────────────────────────────────
app.post('/api/appointments', (req, res) => {
  const { name, phone, service, barber, date, time } = req.body;
  if (!name || !phone || !service || !barber || !date || !time)
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });

  const conflict = db.appointments.find(
    a => a.barber === barber && a.date === date && a.time === time && a.status !== 'cancelado'
  );
  if (conflict)
    return res.status(409).json({ error: 'Horário já reservado para este barbeiro' });

  const appointment = {
    id: Date.now().toString(),
    name, phone, service, barber, date, time,
    status: 'pendente',
    createdAt: new Date().toISOString()
  };
  db.appointments.push(appointment);
  res.status(201).json({ success: true, appointment });
});

// ─── LISTAR AGENDAMENTOS (admin) ──────────────────────────
app.get('/api/appointments', requireAdmin, (req, res) => {
  const sorted = [...db.appointments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(sorted);
});

// ─── ATUALIZAR STATUS (admin) ─────────────────────────────
app.patch('/api/appointments/:id', requireAdmin, (req, res) => {
  const appt = db.appointments.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Agendamento não encontrado' });
  appt.status = req.body.status;
  res.json({ success: true, appointment: appt });
});

// ─── DELETAR AGENDAMENTO (admin) ──────────────────────────
app.delete('/api/appointments/:id', requireAdmin, (req, res) => {
  const idx = db.appointments.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Não encontrado' });
  db.appointments.splice(idx, 1);
  res.json({ success: true });
});

// ─── HORÁRIOS DISPONÍVEIS ─────────────────────────────────
app.get('/api/available-slots', (req, res) => {
  const { date, barber } = req.query;
  const allSlots = [
    '09:00','09:30','10:00','10:30','11:00','11:30',
    '13:00','13:30','14:00','14:30','15:00','15:30',
    '16:00','16:30','17:00','17:30','18:00','18:30','19:00'
  ];
  const booked = db.appointments
    .filter(a => a.date === date && a.barber === barber && a.status !== 'cancelado')
    .map(a => a.time);
  res.json(allSlots.filter(s => !booked.includes(s)));
});

// ─── LISTAR SERVIÇOS (público) ────────────────────────────
app.get('/api/services', (req, res) => {
  res.json(db.services);
});

// ─── ATUALIZAR SERVIÇO (admin) ────────────────────────────
app.put('/api/services/:id', requireAdmin, (req, res) => {
  const svc = db.services.find(s => s.id === req.params.id);
  if (!svc) return res.status(404).json({ error: 'Serviço não encontrado' });
  const allowed = ['name', 'desc', 'price', 'duration', 'icon', 'active'];
  for (const k of allowed) {
    if (req.body[k] !== undefined) svc[k] = req.body[k];
  }
  res.json({ success: true, service: svc });
});

// ─── CRIAR SERVIÇO (admin) ────────────────────────────────
app.post('/api/services', requireAdmin, (req, res) => {
  const { name, desc, price, duration, icon } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Nome e preço obrigatórios' });
  const svc = {
    id: Date.now().toString(),
    name, desc: desc || '', price, duration: duration || '',
    icon: icon || '✂', active: true
  };
  db.services.push(svc);
  res.status(201).json({ success: true, service: svc });
});

// ─── DELETAR SERVIÇO (admin) ──────────────────────────────
app.delete('/api/services/:id', requireAdmin, (req, res) => {
  const idx = db.services.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Serviço não encontrado' });
  db.services.splice(idx, 1);
  res.json({ success: true });
});

// ─── LOGIN ADMIN ──────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === db.adminPassword)
    return res.json({ success: true, token: db.adminPassword });
  res.status(401).json({ error: 'Senha incorreta' });
});

// ════════════════════════════════════════════════════════════
// 🔑 GEMINI API KEY — COLE SUA CHAVE PERMANENTE AQUI
// ════════════════════════════════════════════════════════════
//
//  ✅ COMO PEGAR A CHAVE PERMANENTE (AIzaSy...):
//
//  1. Abra: https://aistudio.google.com/app/apikey
//  2. Clique em "Get API key" → "Create API key in new project"
//  3. A chave gerada começa com "AIzaSy" e NÃO expira
//  4. Cole ela abaixo
//
//  ❌ NÃO use as chaves "AQ.Ab8..." que aparecem no canto superior
//     direito do AI Studio — essas são tokens OAuth temporários
//     que expiram em 1 hora e NÃO funcionam aqui.
//
//  💡 DICA: Na página do AI Studio, procure o botão azul
//     "Create API key" — NÃO o botão de copiar no topo da página.
//
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'COLE_AQUI_AIzaSy...';

// Modelos em ordem de preferência (fallback automático se quota acabar)
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-001',
];
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// ─── ATUALIZAR KEY VIA ADMIN (sem reiniciar servidor) ─────
// Permite trocar a API Key pelo painel admin em tempo real
app.post('/api/admin/gemini-key', requireAdmin, (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || apiKey.length < 10)
    return res.status(400).json({ error: 'Chave inválida' });
  // Atualiza em memória (reiniciar o servidor zera; edite o arquivo para persistir)
  db.geminiKey = apiKey;
  res.json({ success: true, message: 'API Key atualizada! Teste o chat agora.' });
});

// ─── CHAT GEMINI ──────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensagem obrigatória' });

  // Pega a key — prioridade: admin atualizado > env > arquivo
  const activeKey = db.geminiKey || GEMINI_API_KEY;

  if (!activeKey || activeKey.includes('COLE_AQUI')) {
    return res.status(503).json({
      error: 'sem_key',
      message: 'API Key não configurada. Cole sua chave AIzaSy... no server.js'
    });
  }

  const { default: fetch } = await import('node-fetch');

  const systemPrompt = `Você é o assistente virtual da Barbearia Carvalho.
Informações: ${JSON.stringify(db.settings)}.
Serviços: Corte Masculino R$45 (45min), Barba R$35 (30min), Corte+Barba R$70 (1h15), Pigmentação R$60 (1h), Relaxamento R$80 (1h30), Sobrancelha R$20 (15min).
Barbeiros: Carlos Carvalho, Rafael Silva, Miguel Santos.
Responda em português brasileiro, de forma amigável e concisa.`;

  const contents = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const h of history)
      contents.push({ role: h.role, parts: [{ text: h.text }] });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  const payload = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { maxOutputTokens: 512, temperature: 0.7 }
  };

  // Tenta cada modelo — fallback automático se quota acabar
  for (const model of GEMINI_MODELS) {
    try {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${activeKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // ✅ Sucesso
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log(`✅ Gemini OK [${model}]`);
        return res.json({ reply: data.candidates[0].content.parts[0].text });
      }

      const errStatus = data.error?.status;
      const errCode   = data.error?.code;

      // Chave inválida / expirada
      if (errCode === 400 || errCode === 401 || errStatus === 'UNAUTHENTICATED' || errStatus === 'INVALID_ARGUMENT') {
        console.error(`❌ Chave inválida/expirada. Use uma chave AIzaSy... permanente.`);
        return res.status(401).json({
          error: 'key_invalida',
          message: 'Chave Gemini inválida ou expirada. Gere uma nova chave AIzaSy... em aistudio.google.com/app/apikey'
        });
      }

      // Quota esgotada — tenta próximo modelo
      if (errCode === 429 || errStatus === 'RESOURCE_EXHAUSTED') {
        console.warn(`⚠️  Quota esgotada [${model}], tentando próximo...`);
        continue;
      }

      // Outro erro
      console.warn(`⚠️  Erro [${model}]:`, errStatus, data.error?.message?.slice(0, 80));
      continue;

    } catch (err) {
      console.error(`Erro de rede [${model}]:`, err.message);
      continue;
    }
  }

  // Todos os modelos com quota esgotada
  return res.status(429).json({
    error: 'quota_esgotada',
    message: 'Limite diário da IA atingido. Tente novamente mais tarde.'
  });
});

// ─── SPA FALLBACK ─────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  const keyOk = (db.geminiKey || GEMINI_API_KEY || '').startsWith('AIza');
  console.log(`\n✅  Barbearia Carvalho → http://localhost:${PORT}`);
  console.log(`🔑  Senha admin: ${db.adminPassword}`);
  console.log(keyOk
    ? `🤖  Gemini IA: ✅ Chave configurada (AIzaSy...)`
    : `🤖  Gemini IA: ❌ Chave NÃO configurada! Leia as instruções no server.js`
  );
  console.log(`\n📋  Para configurar a IA sem reiniciar:`);
  console.log(`    POST /api/admin/gemini-key  { "apiKey": "AIzaSy..." }\n`);
});
