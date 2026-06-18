// ============================================================
// db.js — Banco de dados em memória
// ============================================================

const db = {
  settings: {
    phone:    "(11) 99999-9999",
    email:    "contato@barbearia-carvalho.com",
    instagram:"@barbearia.carvalho",
    address:  "Almada, Portugal",
    hours:    "Seg-Sex: 9h às 20h | Sáb: 8h às 18h",
    about:    "A Barbearia Carvalho é referência em estilo e tradição em Almada. Com anos de experiência, os nossos barbeiros são especialistas em cortes modernos e clássicos, sempre com o máximo cuidado e precisão.",
    heroTitle:    "Estilo & Tradição em Cada Corte",
    heroSubtitle: "Barbearia Carvalho — Onde o clássico encontra o moderno"
  },

  // ── Barbeiros editáveis pelo admin ────────────────────────
  barbers: [
    { id: "1", name: "Carlos Carvalho", role: "Fundador · Master Barber", bio: "Com mais de 10 anos de experiência, Carlos é especialista em cortes clássicos e técnicas modernas. Fundou a barbearia com paixão pelo ofício.", icon: "🧔", active: true },
    { id: "2", name: "Rafael Silva",    role: "Barber Especialista",      bio: "Referência em barbas e acabamentos perfeitos. O trabalho do Rafael com navalha é impecável — seus clientes sempre saem mais do que satisfeitos.", icon: "💈", active: true },
    { id: "3", name: "Miguel Santos",   role: "Barber · Colorista",       bio: "Especialista em pigmentação e relaxamento capilar. Miguel traz tendências internacionais para cada atendimento, sempre atualizado nas novidades.", icon: "✂",  active: true },
  ],

  // ── Serviços editáveis pelo admin ──────────────────────────
  services: [
    { id: "1", name: "Corte Masculino", desc: "Corte personalizado ao seu estilo com acabamento impecável e técnicas modernas.", price: "45", duration: "45 min",  icon: "✂",  active: true },
    { id: "2", name: "Barba",           desc: "Modelagem com navalha quente, toalha aquecida e produtos premium de acabamento.", price: "35", duration: "30 min",  icon: "🪒", active: true },
    { id: "3", name: "Corte + Barba",   desc: "O combo completo para um visual impecável do início ao fim. O mais pedido!", price: "70", duration: "1h 15min", icon: "💈", active: true },
    { id: "4", name: "Pigmentação",     desc: "Pigmentação capilar para realçar o visual e disfarçar falhas com total naturalidade.", price: "60", duration: "1h",      icon: "🎨", active: true },
    { id: "5", name: "Relaxamento",     desc: "Tratamento profundo para cabelos rebeldes com resultado duradouro e profissional.", price: "80", duration: "1h 30min", icon: "💆", active: true },
    { id: "6", name: "Sobrancelha",     desc: "Design de sobrancelha masculina para um olhar mais marcante e bem definido.", price: "20", duration: "15 min",  icon: "✦",  active: true },
  ],

  appointments:  [],
  adminPassword: "carvalho2024",
  geminiKey:     null
};

module.exports = db;
