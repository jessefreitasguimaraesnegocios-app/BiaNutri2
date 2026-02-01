# Instruções de Deploy - Migração para Supabase Edge Functions

## ✅ O que foi feito

1. ✅ Criada Edge Function `gemini` em `supabase/functions/gemini/index.ts`
2. ✅ Atualizado `services/geminiService.ts` para chamar a Edge Function
3. ✅ Removidas referências à API key do frontend
4. ✅ Atualizadas mensagens de erro no `App.tsx`

## 📋 Próximos Passos

### 1. Configurar Variáveis de Ambiente no Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Edge Functions** > **Settings**
4. Adicione a variável de ambiente:
   - **Nome:** `GEMINI_API_KEY`
   - **Valor:** Sua chave da API Gemini (a mesma que estava em `VITE_GEMINI_API_KEY`)

### 2. Configurar Variáveis de Ambiente no Frontend

No arquivo `.env` (ou nas variáveis de ambiente do seu provedor de hospedagem), configure:

```env
# Remover ou comentar esta linha (não é mais necessária):
# VITE_GEMINI_API_KEY=...

# Adicionar estas linhas (descomente se já estiverem comentadas):
VITE_SUPABASE_URL=https://lypnxkbbxeagehrqpuoj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG54a2JieGVhZ2VocnFwdW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4Nzk0OTYsImV4cCI6MjA4MzQ1NTQ5Nn0.2pH8zDht5dJSefKlfeaf-HFiTuTDRXQI0WwuYCZ52vU
```

### 3. Deploy da Edge Function

#### Opção A: Usando npx (Recomendado - sem instalação global)

```bash
# Fazer login (primeira vez apenas)
npm run supabase:login

# Linkar ao projeto (primeira vez apenas)
npm run supabase:link

# Deploy da function gemini
npm run supabase:deploy
```

Ou usando npx diretamente:

```bash
# Fazer login (primeira vez apenas)
npx supabase login

# Linkar ao projeto (primeira vez apenas)
npx supabase link --project-ref lypnxkbbxeagehrqpuoj

# Deploy da function gemini
npx supabase functions deploy gemini
```

#### Opção B: Usando o Dashboard

1. Acesse o Dashboard do Supabase
2. Vá em **Edge Functions**
3. Clique em **Create a new function**
4. Nome: `gemini`
5. Cole o conteúdo de `supabase/functions/gemini/index.ts`
6. Salve e faça deploy

### 4. Testar a Function

Após o deploy, você pode testar a function diretamente:

```bash
curl -X POST https://lypnxkbbxeagehrqpuoj.supabase.co/functions/v1/gemini \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "base64Image": "base64_encoded_image_here",
    "mimeType": "image/jpeg",
    "lang": "pt"
  }'
```

### 5. Remover Dependência Desnecessária (Opcional)

A dependência `@google/genai` não é mais necessária no frontend. Você pode removê-la:

```bash
npm uninstall @google/genai
```

**Nota:** Não remova ainda se quiser testar primeiro. Você pode removê-la depois de confirmar que tudo está funcionando.

## 🔒 Segurança

✅ A API key do Gemini agora está **segura** no backend (Supabase Edge Function)
✅ A API key não é mais exposta no frontend
✅ O frontend usa apenas a chave anônima do Supabase (que é segura para ser exposta)

## 🐛 Troubleshooting

### Erro: "GEMINI_API_KEY não configurada"
- Verifique se a variável de ambiente foi configurada no Supabase Dashboard
- Certifique-se de que fez o deploy da function após configurar a variável

### Erro: "Configuração do Supabase não encontrada"
- Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas no `.env`
- Certifique-se de que as variáveis estão sendo carregadas (reinicie o servidor de desenvolvimento)

### Erro: CORS
- A Edge Function já está configurada com CORS headers
- Se ainda houver problemas, verifique se a URL do Supabase está correta

## 📝 Notas

- A Edge Function mantém a mesma interface que o serviço anterior, então não há necessidade de mudanças no código do frontend além das já feitas
- O modelo usado é `gemini-2.0-flash` (modelo mais recente - lançado em fevereiro 2025)
- A resposta da API mantém o mesmo formato, garantindo compatibilidade total
