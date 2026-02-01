# BiaNutri

Aplicativo de análise nutricional usando React + Vite com Google Gemini API.

## 🚀 Tecnologias

- **Frontend**: React 19 + Vite
- **UI**: Tailwind CSS
- **3D**: React Three Fiber
- **IA**: Google Gemini API

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Chave da API do Gemini

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd BiaNutri-main
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_GEMINI_API_KEY=sua-chave-gemini-aqui
```

## 🏃 Executar Localmente

```bash
npm run dev
```

O app estará disponível em `http://localhost:3000`

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`

## 📁 Estrutura do Projeto

```
.
├── components/          # Componentes React
├── services/            # Serviços (Gemini, etc)
├── utils/               # Utilitários
├── App.tsx              # Componente principal
├── index.tsx            # Entry point
├── index.html           # HTML template
├── vite.config.ts       # Configuração do Vite
└── package.json         # Dependências
```

## 🔑 Funcionalidades

- 📸 Análise de imagens de alimentos usando IA (Google Gemini)
- 📊 Visualização de informações nutricionais
- 💧 Rastreamento de água
- 📅 Histórico de refeições
- 🧮 Calculadora de BMR/TDEE
- 🎨 Tema claro/escuro
- 🌍 Suporte a PT/EN

## 📝 Notas

- O app usa localStorage para persistir dados localmente
- A análise de imagens é feita diretamente no frontend usando a API do Gemini
- Certifique-se de configurar a variável de ambiente `VITE_GEMINI_API_KEY` antes de executar

## 🤝 Contribuindo

Sinta-se à vontade para abrir issues e pull requests!

## 📄 Licença

Este projeto é privado.
