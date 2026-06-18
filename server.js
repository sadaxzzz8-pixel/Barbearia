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

// ─── LOGIN ADMIN ──────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === db.adminPassword)
    return res.json({ success: true, token: db.adminPassword });
  res.status(401).json({ error: 'Senha incorreta' });
});

// ─── CHAT GEMINI ──────────────────────────────────────────
// 🔑 Coloque sua API Key abaixo OU use variável de ambiente GEMINI_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6LLCJeUObENMaWQM-qLg2K-fR8IknZ0Dr-q093rDcEDaw';

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensagem obrigatória' });

  try {
    const { default: fetch } = await import('node-fetch');

    const systemContext = `Você é o assistente virtual da Barbearia Carvalho.
Informações da barbearia: ${JSON.stringify(db.settings)}.
Serviços disponíveis:
- Corte Masculino: R$45 (45 min)
- Barba: R$35 (30 min)
- Corte + Barba: R$70 (1h15)
- Pigmentação: R$60 (1h)
- Relaxamento: R$80 (1h30)
- Sobrancelha: R$20 (15 min)
Barbeiros: Carlos Carvalho, Rafael Silva, Miguel Santos.
Responda sempre em português brasileiro, de forma amigável, simpática e profissional.
Seja conciso. Ajude com serviços, preços, agendamentos e informações da barbearia.`;

    const contents = [];
    if (Array.isArray(history)) {
      for (const h of history)
        contents.push({ role: h.role, parts: [{ text: h.text }] });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const payload = {
      system_instruction: { parts: [{ text: systemContext }] },
      contents
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );

    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ error: 'Sem resposta da IA', detail: data });
    }
  } catch (err) {
    console.error('Erro Gemini:', err);
    res.status(500).json({ error: 'Erro interno ao conectar com a IA' });
  }
});

// ─── SPA FALLBACK ─────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅  Barbearia Carvalho → http://localhost:${PORT}`);
  console.log(`🔑  Senha admin: ${db.adminPassword}`);
  console.log(`💬  Chat IA: defina GEMINI_API_KEY em server.js ou como variável de ambiente\n`);
});
