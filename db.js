// ============================================================
// db.js — Banco de dados em memória
// ============================================================

const db = {
  settings: {
    phone:    "(351) 912 345 678",
    email:    "contato@barbearia-carvalho.pt",
    instagram:"@barbearia.carvalho",
    address:  "Almada, Portugal",
    hours:    "Seg-Sex: 9h às 20h | Sáb: 8h às 18h",
    about:    "A Barbearia Carvalho é referência em estilo e tradição em Almada. Com anos de experiência, os nossos barbeiros são especialistas em cortes modernos e clássicos, sempre com o máximo cuidado e precisão.",
    heroTitle:    "Estilo & Tradição em Cada Corte",
    heroSubtitle: "Barbearia Carvalho — Onde o clássico encontra o moderno"
  },

  // ── Barbeiros ─────────────────────────────────────────────
  barbers: [
    { id: "1", name: "Carlos Carvalho", role: "Fundador · Master Barber", bio: "Com mais de 10 anos de experiência, Carlos é especialista em cortes clássicos e técnicas modernas. Fundou a barbearia com paixão pelo ofício.", icon: "🧔", active: true },
    { id: "2", name: "Rafael Silva",    role: "Barber Especialista",      bio: "Referência em barbas e acabamentos perfeitos. O trabalho do Rafael com navalha é impecável — os seus clientes saem sempre mais do que satisfeitos.", icon: "💈", active: true },
    { id: "3", name: "Miguel Santos",   role: "Barber · Colorista",       bio: "Especialista em pigmentação e relaxamento capilar. Miguel traz tendências internacionais para cada atendimento, sempre actualizado nas novidades.", icon: "✂",  active: true },
  ],

  // ── Serviços ──────────────────────────────────────────────
  services: [
    { id: "1", name: "Corte Masculino", desc: "Corte personalizado ao teu estilo com acabamento impecável e técnicas modernas.", price: "15", duration: "45 min",  icon: "✂",  points: 50,  active: true },
    { id: "2", name: "Barba",           desc: "Modelagem com navalha quente, toalha aquecida e produtos premium de acabamento.", price: "10", duration: "30 min",  icon: "🪒", points: 30,  active: true },
    { id: "3", name: "Corte + Barba",   desc: "O combo completo para um visual impecável do início ao fim. O mais pedido!", price: "22", duration: "1h 15min", icon: "💈", points: 80,  active: true },
    { id: "4", name: "Pigmentação",     desc: "Pigmentação capilar para realçar o visual e disfarçar falhas com total naturalidade.", price: "25", duration: "1h",      icon: "🎨", points: 100, active: true },
    { id: "5", name: "Relaxamento",     desc: "Tratamento profundo para cabelos rebeldes com resultado duradouro e profissional.", price: "30", duration: "1h 30min", icon: "💆", points: 120, active: true },
    { id: "6", name: "Sobrancelha",     desc: "Design de sobrancelha masculina para um olhar mais marcante e bem definido.", price: "7",  duration: "15 min",  icon: "✦",  points: 20,  active: true },
  ],

  // ── Agendamentos ──────────────────────────────────────────
  appointments: [],

  // ── Clientes / Perfis ─────────────────────────────────────
  clients: [],
  // Estrutura de cada cliente:
  // {
  //   id, name, phone, email (optional),
  //   points, level (bronze/silver/gold),
  //   totalVisits, history: [{date, service, barber, points}],
  //   favorites: ["Fade", "Degradê"],
  //   recommendedProducts: [],
  //   joinedAt, lastVisit
  // }

  // ── Desafios mensais ──────────────────────────────────────
  challenges: [
    { id: "1", title: "3 Visitas no Mês",    desc: "Visita-nos 3 vezes este mês e ganha pontos extra!",  goal: 3,  reward: 150, icon: "🔥", type: "visits",  active: true },
    { id: "2", title: "Experimenta a Barba",  desc: "Faz o serviço de Barba pela primeira vez e ganha.",  goal: 1,  reward: 80,  icon: "🪒", type: "service", serviceId: "2", active: true },
    { id: "3", title: "Traz um Amigo",        desc: "Traz um amigo novo à barbearia e sê recompensado!",  goal: 1,  reward: 200, icon: "👥", type: "referral", active: true },
  ],

  // ── Recompensas / Rewards ─────────────────────────────────
  rewards: [
    { id: "1", title: "Desconto 10%",       desc: "10% de desconto no próximo serviço",     cost: 100, icon: "🏷",  active: true },
    { id: "2", title: "Sobrancelha Grátis", desc: "Um design de sobrancelha por conta da casa", cost: 200, icon: "🎁",  active: true },
    { id: "3", title: "Corte Grátis",       desc: "Um corte masculino completamente grátis",  cost: 500, icon: "✂",  active: true },
    { id: "4", title: "Kit de Produtos",    desc: "Kit exclusivo de produtos para cabelo",    cost: 350, icon: "💎", active: true },
  ],

  // ── Configuração de níveis ────────────────────────────────
  levels: {
    bronze: { min: 0,    max: 299,  label: "Bronze", icon: "🥉", color: "#cd7f32", perks: ["5% desconto em produtos"] },
    silver: { min: 300,  max: 799,  label: "Prata",  icon: "🥈", color: "#c0c0c0", perks: ["10% desconto em produtos", "Agendamento prioritário"] },
    gold:   { min: 800,  max: 99999,label: "Ouro",   icon: "🥇", color: "#ffd700", perks: ["15% desconto em produtos", "Agendamento prioritário", "Brinde mensal exclusivo"] },
  },

  // ── Produtos recomendados ─────────────────────────────────
  products: [
    { id: "1", name: "Pomada Mate",         desc: "Fixação forte, acabamento mate",        price: "12", icon: "💪", active: true },
    { id: "2", name: "Óleo de Barba",       desc: "Hidratação e brilho para a barba",      price: "14", icon: "✨", active: true },
    { id: "3", name: "Shampoo Anticaspa",   desc: "Couro cabeludo limpo e saudável",       price: "10", icon: "🧴", active: true },
    { id: "4", name: "Cera de Cabelo",      desc: "Modelação flexível com brilho natural", price: "11", icon: "🌟", active: true },
  ],

  adminPassword: "carvalho2024",
  geminiKey: null
};

module.exports = db;
