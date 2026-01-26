import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import popUpSound from '../../assets/pop_up.mp3';

export const GameOverModal: React.FC = () => {
    const { gameOver, gameOverReason, restartGame } = useGameStore();
    const popUpAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        popUpAudioRef.current = new Audio(popUpSound);
        popUpAudioRef.current.volume = 0.4;
    }, []);

    // Play sound when modal appears
    useEffect(() => {
        if (gameOver && popUpAudioRef.current) {
            popUpAudioRef.current.currentTime = 0;
            popUpAudioRef.current.play().catch(() => {});
        }
    }, [gameOver]);

    if (!gameOver) return null;

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50">
            <div className="bg-retro-dark border-4 border-red-500 p-8 max-w-2xl text-center shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                <h1 className="text-4xl text-red-500 mb-6 animate-pulse">GAME OVER</h1>
                <p className="text-white text-lg mb-8 leading-8">
                    {gameOverReason || "La mission a échoué."}
                </p>
                <button
                    onClick={restartGame}
                    className="bg-red-900 text-white px-8 py-4 border-b-4 border-r-4 border-red-700 hover:bg-red-800 active:border-0 active:translate-y-1 text-xl"
                >
                    RECOMMENCER
                </button>
            </div>
        </div>
    );
};
