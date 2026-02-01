-- Migration para corrigir problemas de criação de usuários no Supabase Auth
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se a tabela auth.users existe e está acessível
-- (Esta tabela já existe por padrão, mas vamos garantir que não há problemas)

-- 2. Criar tabela de perfis (se não existir) para armazenar dados adicionais do usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar política para usuários verem apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 5. Criar política para usuários atualizarem apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 6. Criar função para criar perfil automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar trigger para executar a função quando novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Garantir que a função tem as permissões corretas
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

-- 9. Verificar e corrigir permissões do schema public
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 10. Garantir que o usuário anon tem permissão para criar usuários
-- (Isso é necessário para o signup funcionar)
GRANT USAGE ON SCHEMA auth TO anon, authenticated;

-- 11. Verificar se há outras tabelas que podem estar causando problemas
-- Se você tiver outras tabelas relacionadas a usuários, adicione-as aqui

-- 12. Comentários úteis:
-- Se ainda houver erro, verifique:
-- - Se há outras triggers na tabela auth.users que podem estar falhando
-- - Se há constraints que podem estar bloqueando
-- - Se há funções que podem estar retornando erro
-- - Verifique os logs do Postgres no Dashboard > Logs > Postgres Logs
