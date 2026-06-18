# 💈 Barbearia Carvalho — Site Completo

Site profissional completo com backend, agendamento online, painel admin em tempo real e chat com IA Gemini.

---

## 🚀 Como Rodar

### 1. Instalar dependências
```bash
cd barbearia-carvalho
npm install
```

### 2. Iniciar o servidor
```bash
node server.js
# ou para desenvolvimento com auto-reload:
npx nodemon server.js
```

### 3. Acessar
- **Site:** http://localhost:3000
- **Painel Admin:** http://localhost:3000/admin.html
- **Senha Admin:** `carvalho2024`

---

## 🤖 Configurar Chat IA (Gemini)

1. Acesse [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Crie uma API Key gratuita
3. No arquivo `server.js`, localize a linha:
   ```js
   const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'SUA_API_KEY_AQUI';
   ```
4. Substitua `SUA_API_KEY_AQUI` pela sua chave
5. Reinicie o servidor

**Ou usando variável de ambiente:**
```bash
GEMINI_API_KEY=sua_chave_aqui node server.js
```

---

## ⚙ Funcionalidades

### Site (index.html)
- ✅ Hero animado com estatísticas
- ✅ Seção de serviços com preços
- ✅ Perfil dos barbeiros
- ✅ **Agendamento online** com seleção de horários disponíveis
- ✅ Depoimentos de clientes
- ✅ Informações de contato (ao vivo do banco de dados)
- ✅ **Chat com IA Gemini** (canto inferior direito)
- ✅ Design 100% responsivo (mobile first)

### Painel Admin (admin.html)
- ✅ **Login seguro** com senha
- ✅ **Dashboard** com estatísticas em tempo real
- ✅ **Agendamentos do dia** separados
- ✅ **Pendentes** com botão de confirmação rápida
- ✅ **Todos os agendamentos** com filtros por status
- ✅ Ações: Confirmar / Concluir / Cancelar / Excluir
- ✅ **Configurações ao vivo:** edite telefone, email, Instagram, endereço, horários, texto sobre nós, títulos do hero — e **aplica instantaneamente no site**
- ✅ Guia de configuração do Gemini AI

### Backend (server.js)
- ✅ `GET /api/settings` — configurações públicas
- ✅ `PUT /api/settings` — atualizar configurações (admin)
- ✅ `POST /api/appointments` — criar agendamento
- ✅ `GET /api/appointments` — listar agendamentos (admin)
- ✅ `PATCH /api/appointments/:id` — atualizar status (admin)
- ✅ `DELETE /api/appointments/:id` — excluir (admin)
- ✅ `GET /api/available-slots` — horários disponíveis
- ✅ `POST /api/admin/login` — autenticação
- ✅ `POST /api/chat` — proxy Gemini AI

---

## 📁 Estrutura de Arquivos

```
barbearia-carvalho/
├── server.js          ← Backend Node.js + Express
├── db.js              ← Banco de dados em memória
├── package.json       ← Dependências
├── README.md          ← Este arquivo
└── public/
    ├── index.html     ← Site principal
    └── admin.html     ← Painel administrativo
```

---

## 🔒 Segurança

- Senha admin configurável em `db.js` → campo `adminPassword`
- Em produção, use variáveis de ambiente e um banco de dados real (MongoDB, MySQL, etc.)
- Adicione HTTPS em produção

---

## 🎨 Personalização

- **Cores:** edite as variáveis CSS em `:root` no `index.html`
- **Logo:** substitua o SVG inline na navbar
- **Serviços e preços:** edite diretamente no HTML ou adapte para vir do backend
- **Barbeiros:** edite as cards na seção `#barbers`
- **Horários disponíveis:** edite o array `allSlots` em `server.js`

---

Feito com ♥ para a Barbearia Carvalho
