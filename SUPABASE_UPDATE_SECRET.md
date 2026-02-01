# 🔄 Como Atualizar a Chave da API Gemini no Supabase

## ⚠️ IMPORTANTE: Após atualizar a secret, você DEVE fazer redeploy da Edge Function!

## Passo a Passo

### 1. Atualizar a Secret no Dashboard

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto **BiaNutri**
3. Vá em **Edge Functions** > **Secrets** (ou **Settings** > **Secrets**)
4. Encontre `GEMINI_API_KEY` na lista
5. Clique nos três pontos (⋯) ao lado
6. Selecione **Edit** ou **Update**
7. Cole a **nova chave da API Gemini**
8. Clique em **Save**

### 2. Fazer Redeploy da Edge Function (OBRIGATÓRIO!)

**⚠️ CRÍTICO:** A Edge Function só lê as secrets quando é deployada. Atualizar a secret sem fazer redeploy não funciona!

#### Opção A: Usando npm scripts (Recomendado)

```bash
npm run supabase:deploy
```

#### Opção B: Usando npx diretamente

```bash
npx supabase functions deploy gemini
```

#### Opção C: Pelo Dashboard

1. Vá em **Edge Functions**
2. Encontre a função `gemini`
3. Clique em **Deploy** ou **Redeploy**

### 3. Verificar se Funcionou

1. Abra o console do navegador (F12)
2. Tente analisar uma imagem
3. Verifique os logs no console:
   - Deve aparecer: `✅ GEMINI_API_KEY encontrada. Tamanho: XX`
   - Se aparecer erro 401/403, a chave ainda está incorreta
   - Se aparecer erro 429, pode ser quota mesmo (mas verifique se a chave está correta)

### 4. Verificar Logs da Edge Function

1. No Dashboard do Supabase, vá em **Edge Functions** > **Logs**
2. Selecione a função `gemini`
3. Procure por:
   - `✅ GEMINI_API_KEY encontrada` - Chave está sendo lida
   - `❌ GEMINI_API_KEY não encontrada` - Chave não configurada
   - `⚠️ Erro 401/403` - Chave inválida
   - `⚠️ Erro 429` - Quota excedida (mas verifique a chave primeiro)

## 🔍 Troubleshooting

### Erro: "API Key inválida ou sem permissão"

**Causa:** A chave está incorreta ou não foi redeployada após atualizar

**Solução:**
1. Verifique se copiou a chave completa (sem espaços extras)
2. **Faça redeploy da Edge Function** (passo 2 acima)
3. Aguarde alguns segundos após o deploy
4. Tente novamente

### Erro: "GEMINI_API_KEY não configurada"

**Causa:** A secret não existe ou tem nome diferente

**Solução:**
1. Verifique se o nome da secret é exatamente `GEMINI_API_KEY` (case-sensitive)
2. Crie a secret se não existir
3. Faça redeploy

### Erro: "Quota excedida" mesmo após trocar a chave

**Causa:** 
- A Edge Function ainda está usando a chave antiga (não fez redeploy)
- A nova chave também está sem quota
- Há cache da resposta de erro

**Solução:**
1. **Faça redeploy da Edge Function** (muito importante!)
2. Limpe o cache do navegador
3. Verifique se a nova chave tem quota disponível no Google AI Studio
4. Aguarde alguns minutos e tente novamente

## ✅ Checklist

- [ ] Secret `GEMINI_API_KEY` atualizada no Dashboard
- [ ] Edge Function `gemini` redeployada após atualizar a secret
- [ ] Aguardou alguns segundos após o deploy
- [ ] Verificou os logs da Edge Function
- [ ] Testou novamente no app
- [ ] Verificou console do navegador para erros

## 📚 Recursos

- [Documentação Supabase Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Deploy Edge Functions](https://supabase.com/docs/guides/functions/deploy)

## 💡 Dica

Sempre que atualizar uma secret no Supabase, **faça redeploy da Edge Function** que usa essa secret. As secrets são lidas apenas no momento do deploy, não em runtime.
