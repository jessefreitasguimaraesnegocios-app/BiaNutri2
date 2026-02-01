import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  theme: 'light' | 'dark';
  lang: 'pt' | 'en';
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess, theme, lang }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const texts = {
    pt: {
      login: 'Entrar',
      signup: 'Criar Conta',
      email: 'E-mail',
      password: 'Senha',
      confirmPassword: 'Repita a Senha',
      loginButton: 'Entrar',
      signupButton: 'Criar Conta',
      haveAccount: 'Já tem uma conta?',
      noAccount: 'Não tem uma conta?',
      createAccount: 'Criar conta',
      backToLogin: 'Voltar ao login',
      error: 'Erro ao fazer login',
      signupError: 'Erro ao criar conta',
      success: 'Login realizado com sucesso!',
      signupSuccess: 'Conta criada com sucesso!',
      passwordsDontMatch: 'As senhas não coincidem',
      passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',
    },
    en: {
      login: 'Sign In',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      loginButton: 'Sign In',
      signupButton: 'Sign Up',
      haveAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      createAccount: 'Create account',
      backToLogin: 'Back to login',
      error: 'Error signing in',
      signupError: 'Error creating account',
      success: 'Successfully signed in!',
      signupSuccess: 'Account created successfully!',
      passwordsDontMatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
    },
  };

  const t = texts[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Validar senhas antes de criar conta
        if (password !== confirmPassword) {
          setError(t.passwordsDontMatch);
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError(t.passwordTooShort);
          setLoading(false);
          return;
        }

        console.log('🔵 Iniciando criação de conta...');
        const { user, session, error } = await signUp(email, password);
        
        if (error) {
          console.error('❌ Erro ao criar conta:', error);
          // Melhorar mensagens de erro
          let errorMessage = error.message || t.signupError;
          
          // Mensagens mais amigáveis em português
          if (error.message?.includes('Database error') || error.message?.includes('500')) {
            errorMessage = lang === 'pt' 
              ? 'Erro ao criar conta. Verifique se o Supabase Auth está configurado corretamente. Veja o console para mais detalhes.'
              : 'Error creating account. Please check if Supabase Auth is configured correctly. Check console for details.';
          } else if (error.message?.includes('User already registered') || error.message?.includes('already registered')) {
            errorMessage = lang === 'pt'
              ? 'Este e-mail já está cadastrado. Tente fazer login.'
              : 'This email is already registered. Try signing in.';
          } else if (error.message?.includes('Password') || error.message?.includes('password')) {
            errorMessage = lang === 'pt'
              ? 'A senha deve ter pelo menos 6 caracteres.'
              : 'Password must be at least 6 characters.';
          } else if (error.message?.includes('Invalid email')) {
            errorMessage = lang === 'pt'
              ? 'E-mail inválido. Verifique o formato do e-mail.'
              : 'Invalid email. Please check the email format.';
          }
          
          setError(errorMessage);
        } else if (user) {
          // Usuário foi criado (com ou sem sessão)
          console.log('✅ Conta criada com sucesso!', { hasSession: !!session, userId: user.id });
          
          if (session) {
            // Tem sessão, sucesso imediato
            console.log('✅ Login automático realizado!');
            onSuccess();
          } else {
            // Usuário criado mas sem sessão - pode precisar confirmar email
            // Mas o signUp já tentou fazer login automático, então vamos tentar mais uma vez
            console.log('⚠️ Usuário criado mas sem sessão. Tentando login manual...');
            
            // Aguardar um pouco mais
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { error: loginError, session: loginSession } = await signIn(email, password);
            
            if (loginError) {
              console.log('⚠️ Login manual falhou:', loginError.message);
              // Mesmo assim, informar que a conta foi criada
              setError(
                lang === 'pt'
                  ? 'Conta criada com sucesso! Por favor, faça login com suas credenciais.'
                  : 'Account created successfully! Please sign in with your credentials.'
              );
              
              // Mudar para modo de login após 2 segundos
              setTimeout(() => {
                setIsSignUp(false);
                setError(null);
              }, 2000);
            } else if (loginSession) {
              console.log('✅ Login manual bem-sucedido!');
              onSuccess();
            }
          }
        } else {
          // Nenhum usuário retornado - erro desconhecido
          console.error('❌ Erro: Nenhum usuário retornado do signUp');
          setError(
            lang === 'pt'
              ? 'Erro ao criar conta. Tente novamente ou verifique o console para mais detalhes.'
              : 'Error creating account. Try again or check console for details.'
          );
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          let errorMessage = error.message || t.error;
          
          if (error.message?.includes('Invalid login credentials')) {
            errorMessage = lang === 'pt'
              ? 'E-mail ou senha incorretos.'
              : 'Invalid email or password.';
          } else if (error.message?.includes('Email not confirmed')) {
            errorMessage = lang === 'pt'
              ? 'Por favor, confirme seu e-mail antes de fazer login.'
              : 'Please confirm your email before signing in.';
          }
          
          setError(errorMessage);
        } else {
          onSuccess();
        }
      }
    } catch (err: any) {
      console.error('Erro inesperado:', err);
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
          theme === 'dark'
            ? 'bg-slate-800 border border-slate-700'
            : 'bg-white border border-slate-200'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${
            theme === 'dark'
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X size={20} />
        </button>

        <div className="p-6 pt-8">
          <div className="flex items-center justify-center mb-6">
            <div className={`p-4 rounded-2xl ${
              theme === 'dark' ? 'bg-brand-500/20' : 'bg-brand-100'
            }`}>
              {isSignUp ? (
                <UserPlus className={`${
                  theme === 'dark' ? 'text-brand-400' : 'text-brand-600'
                }`} size={48} />
              ) : (
                <LogIn className={`${
                  theme === 'dark' ? 'text-brand-400' : 'text-brand-600'
                }`} size={48} />
              )}
            </div>
          </div>

          <h2 className={`text-2xl font-bold text-center mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            {isSignUp ? t.signup : t.login}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {t.email}
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`} size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                  } focus:outline-none focus:ring-2 focus:ring-brand-500`}
                  placeholder={t.email}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {t.password}
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                  } focus:outline-none focus:ring-2 focus:ring-brand-500`}
                  placeholder={t.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                    theme === 'dark'
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`} size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={isSignUp}
                    minLength={6}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                    } focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                    placeholder={t.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                      theme === 'dark'
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {t.passwordsDontMatch}
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className={`p-3 rounded-xl text-sm ${
                theme === 'dark'
                  ? 'bg-red-900/20 border border-red-800 text-red-300'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isSignUp ? t.signupButton : t.loginButton}...
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
                  {isSignUp ? t.signupButton : t.loginButton}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setConfirmPassword(''); // Limpar campo de confirmação ao mudar de modo
                setShowPassword(false); // Resetar visibilidade das senhas
                setShowConfirmPassword(false);
              }}
              className={`text-sm font-medium ${
                theme === 'dark'
                  ? 'text-brand-400 hover:text-brand-300'
                  : 'text-brand-600 hover:text-brand-700'
              }`}
            >
              {isSignUp ? t.haveAccount : t.noAccount}{' '}
              <span className="underline">
                {isSignUp ? t.backToLogin : t.createAccount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
