# 🚀 Deploy Rápido - Edge Function Gemini

## Comandos Rápidos

### Primeira vez (configuração inicial)

```bash
# 1. Login no Supabase
npm run supabase:login

# 2. Linkar ao projeto
npm run supabase:link

# 3. Deploy da function
npm run supabase:deploy
```

### Deploy subsequente

```bash
# Apenas fazer deploy
npm run supabase:deploy
```

## Usando npx diretamente

```bash
# Login (primeira vez)
npx supabase login

# Linkar (primeira vez)
npx supabase link --project-ref lypnxkbbxeagehrqpuoj

# Deploy
npx supabase functions deploy gemini
```

## ⚠️ Importante

Antes de fazer o deploy, certifique-se de:

1. ✅ Configurar `GEMINI_API_KEY` no Dashboard do Supabase:
   - Dashboard → Edge Functions → Settings → Secrets
   - Adicionar: `GEMINI_API_KEY` = sua chave da API Gemini

2. ✅ Configurar variáveis no `.env`:
   ```env
   VITE_SUPABASE_URL=https://lypnxkbbxeagehrqpuoj.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 📝 Scripts Disponíveis

- `npm run supabase:login` - Login no Supabase
- `npm run supabase:link` - Linkar ao projeto
- `npm run supabase:deploy` - Deploy da function gemini
- `npm run supabase:deploy:all` - Deploy de todas as functions
