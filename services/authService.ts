import { supabase } from './supabaseClient';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

// Login com email e senha
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
};

// Cadastro com email e senha
export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('🔵 Iniciando signUp para:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        // URL de redirecionamento após confirmação de email
        emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    });

    // Log detalhado para debug
    console.log('🔵 SignUp response:', {
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      error: error ? {
        message: error.message,
        status: error.status,
        name: error.name,
      } : null,
    });

    if (error) {
      console.error('❌ Erro no signUp:', error);
      return {
        user: data?.user || null,
        session: data?.session || null,
        error,
      };
    }

    // Se não há erro, mesmo sem sessão, o usuário foi criado
    if (data?.user) {
      console.log('✅ Usuário criado com sucesso:', data.user.id);
      
      // Se não há sessão, pode ser que precise confirmar email
      // Mas vamos tentar fazer login automaticamente
      if (!data.session) {
        console.log('⚠️ Usuário criado mas sem sessão. Tentando login automático...');
        
        // Aguardar um pouco antes de tentar login (pode haver delay no Supabase)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Tentar fazer login automaticamente
        const loginResult = await signIn(email.trim().toLowerCase(), password);
        
        if (loginResult.error) {
          console.log('⚠️ Login automático falhou:', loginResult.error.message);
          // Mesmo assim, retornar sucesso porque o usuário foi criado
          // O usuário pode precisar confirmar email ou tentar login manualmente
        } else {
          console.log('✅ Login automático bem-sucedido!');
          return loginResult;
        }
      }
    }

    return {
      user: data?.user || null,
      session: data?.session || null,
      error: null,
    };
  } catch (err: any) {
    console.error('❌ Erro inesperado no signUp:', err);
    return {
      user: null,
      session: null,
      error: {
        message: err.message || 'Erro desconhecido ao criar conta',
        status: 500,
      } as any,
    };
  }
};

// Logout — apenas encerra a sessão; os dados ficam salvos por usuário (chaves biaNutri*_userId)
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err: any) {
    console.error('Erro ao fazer logout:', err);
    return { error: err };
  }
};

// Obter sessão atual
export const getSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Obter usuário atual
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Listener de mudanças de autenticação
export const onAuthStateChange = (callback: (session: Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return subscription;
};
