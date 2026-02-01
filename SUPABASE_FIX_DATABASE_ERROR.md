# 🔧 Corrigir Erro "Database error saving new user"

## ⚠️ Problema

Erro `500` ao criar conta: `AuthApiError: Database error saving new user`

Este erro geralmente ocorre quando há:
- Triggers ou funções no banco que falham ao criar usuário
- Políticas RLS (Row Level Security) mal configuradas
- Tabelas relacionadas com constraints que falham
- Falta de permissões no banco de dados

## ✅ Solução Rápida

### Passo 1: Executar Script SQL

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)
4. Clique em **New query**
5. Copie e cole o conteúdo do arquivo `supabase/migrations/001_fix_auth_setup.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 2: Verificar Configurações de Auth

1. Vá em **Authentication** > **Providers**
2. Certifique-se de que **Email** está habilitado
3. Vá em **Authentication** > **URL Configuration**
4. Adicione `http://localhost:3000` nas URLs permitidas

### Passo 3: Verificar Triggers Existentes

1. Vá em **Database** > **Database** > **Triggers**
2. Verifique se há triggers na tabela `auth.users` que podem estar falhando
3. Se houver triggers problemáticos, desabilite temporariamente para testar

### Passo 4: Verificar Logs

1. Vá em **Logs** > **Postgres Logs**
2. Procure por erros relacionados a `auth.users` ou `INSERT`
3. Os logs mostrarão o erro específico que está causando o problema

## 🔍 Troubleshooting Avançado

### Se o script SQL não resolver:

#### Opção 1: Verificar Triggers Existentes

Execute no SQL Editor:

```sql
-- Listar todos os triggers na tabela auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth';
```

Se houver triggers problemáticos, você pode desabilitá-los temporariamente:

```sql
-- Desabilitar trigger específico (substitua 'nome_do_trigger')
ALTER TABLE auth.users DISABLE TRIGGER nome_do_trigger;
```

#### Opção 2: Verificar Constraints

```sql
-- Verificar constraints na tabela auth.users
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'auth'
  AND table_name = 'users';
```

#### Opção 3: Verificar Funções que Podem Estar Falhando

```sql
-- Listar funções relacionadas a auth
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%user%';
```

#### Opção 4: Testar Criação Manual de Usuário

Execute no SQL Editor (apenas para teste):

```sql
-- Isso deve funcionar se não houver problemas de permissão
-- NÃO use isso em produção, é apenas para diagnóstico
SELECT auth.users;
```

## 📋 Checklist de Verificação

- [ ] Script SQL executado com sucesso
- [ ] Email Provider habilitado no Supabase
- [ ] Site URL configurada (`http://localhost:3000`)
- [ ] Sem triggers problemáticos na tabela `auth.users`
- [ ] Tabela `profiles` criada (se necessário)
- [ ] Políticas RLS configuradas corretamente
- [ ] Logs do Postgres verificados para erros específicos

## 🚨 Se Nada Funcionar

### Última Opção: Recriar Projeto (Apenas se necessário)

Se o problema persistir e você estiver em desenvolvimento:

1. Crie um novo projeto no Supabase
2. Atualize as variáveis de ambiente no `.env`
3. Execute o script SQL novamente

**⚠️ ATENÇÃO:** Isso apagará todos os dados. Use apenas em desenvolvimento.

## 📚 Recursos

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Troubleshooting Supabase](https://supabase.com/docs/guides/platform/troubleshooting)
- [SQL Editor do Supabase](https://supabase.com/docs/guides/database/tables)

## 💡 Dica

Se você tiver acesso ao **Supabase CLI**, pode executar o script diretamente:

```bash
npx supabase db reset
# ou
npx supabase migration up
```

Mas para a maioria dos casos, executar o script no SQL Editor do Dashboard é suficiente.
