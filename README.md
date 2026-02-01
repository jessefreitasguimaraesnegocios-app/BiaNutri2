# BiaNutri

App de calorias e análise nutricional com trial, paywall e Mercado Pago.

## 🚀 Tecnologias

- **Frontend**: React 19 + Vite
- **UI**: Tailwind CSS
- **3D**: React Three Fiber
- **Backend**: Supabase (Auth, Edge Functions)
- **IA**: Google Gemini API
- **Pagamento**: Mercado Pago (Checkout Pro + Webhook)

## 📋 Pré-requisitos

- Node.js 18+
- Conta Supabase e Mercado Pago

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/jessefreitasguimaraesnegocios-app/BiaNutri2.git
cd BiaNutri2
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o `.env` (veja `CHAVES_E_CREDENCIAIS.md`):
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

## 🏃 Executar localmente

```bash
npm run dev
```

O app estará em `http://localhost:3000`

## 🔑 Funcionalidades

- 📸 Análise de imagens de alimentos (Gemini)
- 📊 Informações nutricionais, histórico, meta de calorias
- 💧 Rastreamento de água
- 🧮 Calculadora BMR/TDEE
- ⏱️ Trial 30 min + paywall (Mercado Pago)
- 🎨 Tema claro/escuro, PT/EN

## 📄 Documentação

- `CHAVES_E_CREDENCIAIS.md` – Chaves Supabase e Mercado Pago
- `PAYMENT_SETUP.md` – Configuração do trial e pagamento
- `DEPLOY_INSTRUCTIONS.md` – Deploy do app
