import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import popUpSound from '../../assets/pop_up.mp3';

export const VictoryModal: React.FC = () => {
    const { dependency, turn } = useGameStore();
    const popUpAudioRef = useRef<HTMLAudioElement | null>(null);
    const hasPlayedRef = useRef(false);

    // Initialize audio
    useEffect(() => {
        popUpAudioRef.current = new Audio(popUpSound);
        popUpAudioRef.current.volume = 0.4;
    }, []);

    // Play sound when modal appears (victory achieved)
    useEffect(() => {
        if (dependency <= 0 && !hasPlayedRef.current && popUpAudioRef.current) {
            popUpAudioRef.current.currentTime = 0;
            popUpAudioRef.current.play().catch(() => {});
            hasPlayedRef.current = true;
        }
    }, [dependency]);

    if (dependency > 0) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] animate-pulse">
            <div className="bg-gradient-to-b from-green-900 to-green-950 border-4 border-green-400 p-8 max-w-lg w-full mx-4 shadow-[0_0_50px_rgba(74,222,128,0.6)] text-center">
                {/* Victory Banner */}
                <div className="text-6xl mb-4">🎉🏆🎉</div>

                <h1 className="text-4xl font-bold text-green-400 mb-4 animate-bounce uppercase tracking-widest">
                    VICTOIRE !
                </h1>

                <div className="text-green-300 text-xl mb-6 font-mono">
                    Vous avez libéré l'école des Big Tech !
                </div>

                <div className="bg-black/50 p-4 rounded mb-6 border border-green-500/50">
                    <div className="text-white mb-2">
                        <span className="text-gray-400">Mois écoulés :</span>{' '}
                        <span className="text-yellow-400 font-bold">{turn}</span>
                    </div>
                    <div className="text-white">
                        <span className="text-gray-400">Dépendance Big Tech :</span>{' '}
                        <span className="text-green-400 font-bold">0%</span>
                    </div>
                </div>

                <div className="text-green-200 text-sm mb-6 italic">
                    "La liberté numérique est le fondement de toutes les autres libertés."
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-green-600 text-white font-bold border-4 border-green-800 
                                   hover:bg-green-500 active:translate-y-1 transition-all uppercase
                                   shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                    >
                        🔄 REJOUER
                    </button>
                </div>

                {/* Confetti Effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-2xl animate-bounce"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${1 + Math.random() * 2}s`
                            }}
                        >
                            {['🐧', '💚', '✨', '🎊', '🌟'][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
