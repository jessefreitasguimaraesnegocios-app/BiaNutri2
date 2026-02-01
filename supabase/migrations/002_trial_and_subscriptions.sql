-- Trial (30 min acumulado) e assinaturas (Mercado Pago)
-- Perfil: telefone + controle de trial. Telefone usado para evitar trial duplicado.

-- 1. Adicionar colunas de trial e telefone em profiles (se a tabela já existir)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS trial_seconds_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trial_used_at TIMESTAMP WITH TIME ZONE;

-- 2. Índice para buscar por telefone (evitar mesmo número usar trial duas vezes)
CREATE INDEX IF NOT EXISTS idx_profiles_phone_trial_used
  ON public.profiles (phone)
  WHERE trial_used_at IS NOT NULL;

-- 3. Tabela de assinaturas
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  mp_payment_id TEXT,
  mp_preference_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- 4. RLS em subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas sua própria assinatura
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role pode inserir/atualizar (webhook)
DROP POLICY IF EXISTS "Service role full access subscriptions" ON public.subscriptions;
CREATE POLICY "Service role full access subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- 5. Comentários
COMMENT ON COLUMN public.profiles.phone IS 'Telefone normalizado (apenas dígitos) para evitar trial duplicado';
COMMENT ON COLUMN public.profiles.trial_seconds_used IS 'Segundos de uso acumulado no trial (máx 1800 = 30 min)';
COMMENT ON COLUMN public.profiles.trial_used_at IS 'Preenchido quando o trial acaba (30 min usados ou bloqueado)';
