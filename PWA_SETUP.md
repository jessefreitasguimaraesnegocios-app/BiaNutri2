# 🚀 Configuração PWA - BiaNutri

O app BiaNutri agora está configurado como Progressive Web App (PWA) e pode ser instalado como um app nativo!

## ✅ O que foi configurado

1. ✅ **vite-plugin-pwa** instalado e configurado
2. ✅ **Service Worker** configurado automaticamente
3. ✅ **Manifest.json** gerado automaticamente
4. ✅ **Meta tags PWA** adicionadas no index.html
5. ✅ **Cache de API** configurado (Gemini e Supabase)
6. ✅ **Suporte iOS e Android** configurado

## 📦 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Adicionar Ícones

**IMPORTANTE:** Você precisa criar os ícones antes de fazer o build:

1. Crie uma imagem quadrada do logo do BiaNutri (mínimo 512x512px)
2. Coloque na pasta `public/`:
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
   - `apple-touch-icon.png` (180x180px) - opcional

**Geradores online recomendados:**
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

### 3. Build e Deploy

```bash
npm run build
```

O Service Worker e o manifest serão gerados automaticamente na pasta `dist/`.

## 🧪 Testar Localmente

### 1. Build e Preview

```bash
npm run build
npm run preview
```

### 2. Testar PWA no Chrome/Edge

1. Abra `http://localhost:4173` (ou a porta do preview)
2. Abra DevTools (F12)
3. Vá em **Application** > **Service Workers**
4. Verifique se o Service Worker está registrado
5. Vá em **Application** > **Manifest**
6. Verifique se o manifest está correto
7. Clique no ícone de instalação na barra de endereços

### 3. Testar no Mobile

#### Android (Chrome)
1. Acesse o app no navegador
2. Menu (3 pontos) > **Adicionar à tela inicial**
3. O app será instalado como um app nativo

#### iOS (Safari)
1. Acesse o app no Safari
2. Compartilhar (ícone de compartilhar) > **Adicionar à Tela de Início**
3. O app será instalado como um app nativo

## 🌐 Deploy na Vercel

O PWA funciona automaticamente na Vercel! Não precisa de configuração adicional.

1. Faça commit das mudanças
2. Push para o repositório
3. A Vercel fará o build automaticamente
4. O Service Worker será servido automaticamente

**Importante:** Certifique-se de que os ícones estão na pasta `public/` antes do deploy!

## 📱 Funcionalidades PWA

- ✅ **Instalável** - Usuários podem instalar como app nativo
- ✅ **Offline** - Service Worker cacheia recursos
- ✅ **Atualização automática** - Service Worker atualiza automaticamente
- ✅ **Ícone na tela inicial** - Aparece como app instalado
- ✅ **Tela cheia** - Abre em modo standalone (sem barra do navegador)
- ✅ **Cache de API** - Cacheia chamadas à API Gemini e Supabase

## 🔧 Configurações

### Theme Color
A cor do tema está configurada como `#22c55e` (verde). Para mudar, edite:
- `vite.config.ts` - `theme_color` no manifest
- `index.html` - `meta name="theme-color"`

### Cache
O cache está configurado para:
- **Gemini API**: 24 horas, máximo 10 entradas
- **Supabase API**: 24 horas, máximo 50 entradas

Para ajustar, edite `vite.config.ts` > `workbox.runtimeCaching`.

## 🐛 Troubleshooting

### Service Worker não registra
- Verifique se está usando HTTPS (ou localhost)
- Limpe o cache do navegador
- Verifique o console para erros

### Ícones não aparecem
- Certifique-se de que os arquivos estão em `public/`
- Verifique se os nomes estão corretos: `icon-192.png` e `icon-512.png`
- Faça um novo build após adicionar os ícones

### App não instala
- Verifique se o manifest está válido (DevTools > Application > Manifest)
- Certifique-se de que está usando HTTPS em produção
- Verifique se o Service Worker está registrado

## 📚 Recursos

- [Documentação vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [PWA Builder](https://www.pwabuilder.com/)
- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
