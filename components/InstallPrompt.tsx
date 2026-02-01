import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  theme: 'light' | 'dark';
  lang: 'pt' | 'en';
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ theme, lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIOSInstalled = isIOS && (window.navigator as any).standalone;

    if (isStandalone || isIOSInstalled) {
      setIsInstalled(true);
      return;
    }

    // Sempre mostrar popup quando acessar pelo navegador (não instalado)
    // Aguardar um pouco antes de mostrar (melhor UX)
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000); // 2 segundos após carregar

    // Listener para o evento beforeinstallprompt (para instalação nativa)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Se não houver prompt nativo, não fazer nada (não mostrar alert)
      setShowPrompt(false);
      return;
    }

    try {
      // Mostrar o prompt nativo de instalação do navegador
      await deferredPrompt.prompt();

      // Aguardar a resposta do usuário
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        // App será instalado automaticamente pelo navegador
      }
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Não salvar no localStorage - sempre mostrar quando acessar pelo navegador
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  const texts = {
    pt: {
      title: 'Instalar BiaNutri',
      description: 'Instale o app para acesso rápido e experiência melhor!',
      install: 'Instalar',
      dismiss: 'Agora não'
    },
    en: {
      title: 'Install BiaNutri',
      description: 'Install the app for quick access and better experience!',
      install: 'Install',
      dismiss: 'Not now'
    }
  };

  const t = texts[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl ${
        theme === 'dark' 
          ? 'bg-slate-800 border border-slate-700' 
          : 'bg-white border border-slate-200'
      }`}>
        <button
          onClick={handleDismiss}
          className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${
            theme === 'dark' 
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X size={20} />
        </button>

        <div className="p-6 pt-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-2 rounded-2xl bg-transparent">
              <img 
                src="/icon-192.png" 
                alt="BiaNutri" 
                className="w-16 h-16 rounded-2xl shadow-lg"
              />
            </div>
          </div>

          <h3 className={`text-xl font-bold text-center mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            {t.title}
          </h3>

          <p className={`text-sm text-center mb-6 ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {t.description}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.dismiss}
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-3 px-4 rounded-xl font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              {t.install}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
