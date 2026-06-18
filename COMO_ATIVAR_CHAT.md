# 🤖 Como ativar o Chat IA — Passo a Passo

## ❌ O problema atual
A chave `AQ.Ab8RN6...` é uma **chave OAuth do Google Cloud**.
Ela NÃO funciona com o Gemini API.

## ✅ A chave certa começa com `AIzaSy...`

---

## 📋 Passo a passo (2 minutos)

### 1. Abra este link no navegador:
👉 https://aistudio.google.com/app/apikey

### 2. Faça login com sua conta Google

### 3. Clique em **"Create API key"**
- Selecione um projeto existente OU clique em "Create API key in new project"

### 4. A chave vai aparecer assim:
```
AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```
(39 caracteres, sempre começa com AIzaSy)

### 5. Copie a chave e abra o arquivo `server.js`

### 6. Na linha 122, substitua:
```js
// ANTES:
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'COLE_SUA_API_KEY_AQUI';

// DEPOIS (com sua chave real):
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567';
```

### 7. Salve e reinicie o servidor:
```bash
node server.js
```

### 8. Teste no chat do site — deve funcionar! 🎉

---

## ⚡ Alternativa rápida (sem editar arquivo)
```bash
GEMINI_API_KEY=AIzaSySuaChaveAqui node server.js
```

---

## ❓ Dúvidas comuns

**Por que minha chave `AQ.Ab8RN6...` não funciona?**
> Essa chave é para a API OAuth do Google (Drive, Gmail, etc).
> O Gemini API usa um sistema de API Key diferente, gerado no AI Studio.

**O AI Studio é pago?**
> Não! O plano gratuito do AI Studio inclui:
> - 15 RPM (requisições por minuto)
> - 1.500 requisições/dia
> - 1 milhão de tokens/minuto
> Mais do que suficiente para um site de barbearia.

**Posso usar outra conta Google?**
> Sim! Qualquer conta Google funciona no AI Studio.
