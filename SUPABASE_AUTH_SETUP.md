# Configuração do Supabase Auth

## ⚠️ Erro "Database error saving new user"

Este erro geralmente ocorre quando o Supabase Auth não está configurado corretamente. Siga estes passos:

## 📋 Passo a Passo

### 1. Habilitar Email Provider

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Authentication** > **Providers**
4. Encontre **Email** na lista
5. Clique para habilitar (toggle ON)
6. **Importante:** Configure as opções:
   - ✅ **Enable email provider** - Deve estar ON
   - ✅ **Confirm email** - Você pode desabilitar para login imediato (recomendado para desenvolvimento)
   - ✅ **Secure email change** - Opcional

### 2. Configurar Site URL (Opcional mas Recomendado)

1. Vá em **Authentication** > **URL Configuration**
2. Adicione sua URL local para desenvolvimento:
   - `http://localhost:3000`
   - `http://localhost:3000/BiaNutri`
3. Para produção, adicione:
   - `https://bianutri.vercel.app`
   - `https://bianutri.vercel.app/BiaNutri`

### 3. Desabilitar Confirmação de Email (Desenvolvimento)

Se você quiser login imediato sem confirmação de email:

1. Vá em **Authentication** > **Providers** > **Email**
2. Desabilite **"Confirm email"** (toggle OFF)
3. Isso permite login imediato após cadastro

### 4. Verificar Políticas RLS (Row Level Security)

Se você tiver tabelas no Supabase:

1. Vá em **Table Editor**
2. Verifique se as políticas RLS não estão bloqueando a criação de usuários
3. Para a tabela `auth.users`, o Supabase gerencia automaticamente

### 5. Verificar Variáveis de Ambiente

Certifique-se de que seu `.env` tem:

```env
VITE_SUPABASE_URL=https://lypnxkbbxeagehrqpuoj.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

**Onde encontrar:**
- **URL:** Dashboard > Settings > API > Project URL
- **Anon Key:** Dashboard > Settings > API > Project API keys > `anon` `public`

### 6. Testar Novamente

Após configurar:

1. Recarregue a página do app
2. Tente criar uma nova conta
3. Se ainda der erro, verifique o console do navegador para mais detalhes

## 🔍 Troubleshooting

### Erro 500 ao criar conta

**Causa:** Supabase Auth não habilitado ou configuração incorreta

**Solução:**
1. Verifique se o Email Provider está habilitado
2. Verifique se as variáveis de ambiente estão corretas
3. Verifique o console do navegador para erros específicos

### "User already registered"

**Causa:** E-mail já cadastrado

**Solução:** Use outro e-mail ou faça login com a conta existente

### "Email not confirmed"

**Causa:** Confirmação de email está habilitada

**Solução:**
1. Verifique sua caixa de entrada (e spam)
2. Ou desabilite confirmação de email no dashboard (desenvolvimento)

## ✅ Checklist

- [ ] Email Provider habilitado no Supabase
- [ ] Variáveis de ambiente configuradas no `.env`
- [ ] Site URL configurada (opcional)
- [ ] Confirmação de email desabilitada (se quiser login imediato)
- [ ] Testado criação de conta
- [ ] Testado login

## 📚 Recursos

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Configuração de Email Provider](https://supabase.com/docs/guides/auth/auth-email)
