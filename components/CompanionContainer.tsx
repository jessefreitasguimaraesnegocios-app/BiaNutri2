import React, { useState, useEffect } from 'react';
import VirtualPetScene from './VirtualPetScene';
import Avatar3D from './Avatar3D';
import { PetDefinition } from '../utils/petRegistry';

interface CompanionContainerProps {
    isLoading: boolean;
    hasResult: boolean;
    hasError: boolean;
    onVariantChange?: () => void;
    selectedPet?: string;
    petData?: PetDefinition;
}

const CompanionContainer: React.FC<CompanionContainerProps> = ({
    isLoading,
    hasResult,
    hasError,
    onVariantChange,
    selectedPet = 'panda_glb',
    petData
}) => {
    type PetState = 'idle' | 'scanning' | 'success' | 'error' | 'walk' | 'sleep' | 'play' | 'eat' | 'lowHealth';

    const [animationState, setAnimationState] = useState<PetState>('idle');
    const [message, setMessage] = useState<string>('Olá! Sou seu Pet Virtual.');
    const [life, setLife] = useState(100);

    // Life Decay System
    useEffect(() => {
        const interval = setInterval(() => {
            setLife(prev => {
                if (animationState === 'sleep') return prev;
                return Math.max(prev - 0.2, 0);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [animationState]);

    // Check Low Health
    useEffect(() => {
        if (life < 20 && animationState === 'idle') {
            setAnimationState("lowHealth");
            setMessage("Estou cansado...");
        }
    }, [life, animationState]);

    // Actions
    const play = () => {
        if (animationState === 'sleep') return;
        setAnimationState("play");
        setLife(prev => Math.min(prev + 10, 100));
        setMessage("Yaaay! Brincar!");
        setTimeout(() => {
            setAnimationState('idle');
            setMessage('Foi divertido!');
        }, 3000);
    };

    const eat = () => {
        if (animationState === 'sleep') return;
        setAnimationState("eat");
        setLife(prev => Math.min(prev + 20, 100));
        setMessage("Nham nham! Delícia!");
        setTimeout(() => {
            setAnimationState('idle');
            setMessage('Estou cheio!');
        }, 3000);
    };

    const sleep = () => {
        setAnimationState("sleep");
        setMessage("Zzz... recuperando energia...");

        // Recover health loop
        const recover = setInterval(() => {
            setLife(prev => {
                if (prev >= 100) {
                    clearInterval(recover);
                    setAnimationState("idle");
                    setMessage("Acordei renovado!");
                    return 100;
                }
                return Math.min(prev + 2, 100);
            });
        }, 1000);

        return () => clearInterval(recover);
    };

    // React to App State Changes
    useEffect(() => {
        if (isLoading) {
            setAnimationState('scanning');
            setMessage('Analisando...');
        } else if (hasError) {
            setAnimationState('error');
            setMessage('Oops! Erro.');
        } else if (hasResult) {
            setAnimationState('success');
            setMessage('Incrível!');
            setTimeout(() => {
                setAnimationState('idle');
                setMessage('Mais alguma coisa?');
            }, 5000);
        }
    }, [isLoading, hasResult, hasError]);

    // Map App State to Animation Name (GLB)
    const getAnimationName = (state: PetState): string => {
        switch (state) {
            case 'idle': return 'Idle';
            case 'scanning': return 'Thinking';
            case 'success': return 'Happy';
            case 'error': return 'Error';
            case 'walk': return 'Walk';
            case 'sleep': return 'Sad';
            case 'play': return 'Happy';
            case 'eat': return 'Eat';
            case 'lowHealth': return 'LowHealth';
            default: return 'Idle';
        }
    };

    const renderPet = () => {
        // Fallback or loading state if petData is missing
        if (!petData) return <div className="animate-pulse w-32 h-32 bg-slate-200 rounded-full" />;

        if (petData.type === 'glb' || petData.type === 'fbx') {
            return (
                <VirtualPetScene
                    animationName={getAnimationName(animationState)}
                    message={message}
                    modelType={petData.type}
                    url={petData.src} // Pass URL explicitly to Scene -> Panda
                />
            );
        } else {
            // Render 2D Variant (Image)
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Speech Bubble 2D */}
                    {message && (
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 p-2 px-4 rounded-xl shadow-lg border-2 border-brand-100 dark:border-brand-900 animate-in fade-in zoom-in duration-300 z-20 w-max max-w-[200px] text-center">
                            <p className="text-sm font-bold text-slate-700 dark:text-brand-300">
                                {message}
                            </p>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 rotate-45 border-b-2 border-r-2 border-brand-100 dark:border-brand-900"></div>
                        </div>
                    )}

                    <Avatar3D
                        src={petData.src}
                        className="scale-90"
                        onInteract={play}
                    />
                </div>
            );
        }
    };

    return (
        <div className="relative w-full h-80 mx-auto -mb-10 z-10 group flex flex-col items-center">
            {renderPet()}

            {/* Life Bar */}
            <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden border border-slate-300 dark:border-slate-600 relative z-10">
                <div
                    className={`h - full transition - all duration - 500 ${life < 20 ? 'bg-red-500' : 'bg-green-500'} `}
                    style={{ width: `${life}% ` }}
                ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono relative z-10">Energia: {Math.floor(life)}%</p>

            {/* Interaction Controls */}
            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-10 flex-wrap justify-center">
                <button onClick={eat} className="bg-orange-100 hover:bg-orange-200 text-orange-600 dark:text-orange-900 border border-orange-200 text-xs px-3 py-1 rounded-full font-bold transition-colors">
                    🍎 Comer
                </button>
                <button onClick={play} className="bg-blue-100 hover:bg-blue-200 text-blue-600 dark:text-blue-900 border border-blue-200 text-xs px-3 py-1 rounded-full font-bold transition-colors">
                    ⚽ Brincar
                </button>
                <button onClick={sleep} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 dark:text-indigo-900 border border-indigo-200 text-xs px-3 py-1 rounded-full font-bold transition-colors">
                    💤 Dormir
                </button>
                {onVariantChange && (
                    <button onClick={onVariantChange} className="bg-purple-100 hover:bg-purple-200 text-purple-600 dark:text-purple-900 border border-purple-200 text-xs px-3 py-1 rounded-full font-bold transition-colors">
                        🔄 Trocar
                    </button>
                )}
            </div>
        </div>
    );
};

export default CompanionContainer;
