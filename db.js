// ============================================================
// db.js — Banco de dados em memória (substitua por MongoDB/MySQL em produção)
// ============================================================

const db = {
  settings: {
    phone: "(11) 99999-9999",
    email: "contato@barbearia-carvalho.com",
    instagram: "@barbearia.carvalho",
    address: "Rua das Barbearias, 123 - São Paulo, SP",
    hours: "Seg-Sex: 9h às 20h | Sáb: 8h às 18h",
    about: "A Barbearia Carvalho é referência em estilo e tradição. Com mais de 10 anos de experiência, nossos barbeiros são especialistas em cortes modernos e clássicos, sempre com o máximo cuidado e precisão.",
    heroTitle: "Estilo & Tradição em Cada Corte",
    heroSubtitle: "Barbearia Carvalho — Onde o clássico encontra o moderno"
  },
  appointments: [],
  adminPassword: "carvalho2024"
};

module.exports = db;
