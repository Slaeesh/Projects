import React, { useEffect } from 'react';
import { useLaserGame } from './laser-game/useLaserGame';
import { LaserGameCanvas } from './laser-game/LaserGameCanvas';
import { Leaderboard, STORAGE_KEY } from './laser-game/Leaderboard';
import type { ScoreEntry } from './laser-game/types';


interface Props {
    onComplete: (success: boolean) => void;
}

export const LaserGame: React.FC<Props> = ({ onComplete }) => {
    const { gameState, startGame, shoot, gameResult } = useLaserGame();
    const [nickname, setNickname] = React.useState('');
    const [isScoreSubmitted, setIsScoreSubmitted] = React.useState(false);
    const [leaderboardUpdate, setLeaderboardUpdate] = React.useState(0);


    // Intervention Logic Removed as per request


    const handleSubmitScore = () => {
        if (!nickname.trim()) return;

        const newScore: ScoreEntry = {
            name: nickname.trim(),
            score: gameState.score,
            date: Date.now()
        };

        const stored = localStorage.getItem(STORAGE_KEY);
        const scores: ScoreEntry[] = stored ? JSON.parse(stored) : [];
        scores.push(newScore);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));

        setIsScoreSubmitted(true);
        setLeaderboardUpdate(prev => prev + 1);
    };

    // Reset state when game starts
    useEffect(() => {
        if (gameState.phase === 'intro') {
            setIsScoreSubmitted(false);
            setNickname('');
        }
    }, [gameState.phase]);

    useEffect(() => {
        // Auto start for now, or maybe wait for user click?
        // Let's show a start screen
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm font-pixel">

            {/* Game Canvas */}
            <div className="absolute inset-0">
                <LaserGameCanvas gameState={gameState} onShoot={shoot} />
            </div>

            {/* UI Overlay */}
            <div className="relative z-10 pointer-events-none w-full h-full flex flex-col justify-between p-8">

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="text-white text-2xl drop-shadow-md">
                        SCORE: <span className="text-yellow-400">{gameState.score}</span>
                    </div>
                    {gameState.phase === 'bonus' && (
                        <div className="text-white text-4xl animate-pulse text-red-500">
                            BONUS TIME: {Math.ceil(gameState.timeLeft)}s
                        </div>
                    )}
                </div>

                {/* Center Content (Menus) */}
                <div className="pointer-events-auto flex flex-col items-center">
                    {gameState.phase === 'intro' && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <h1 className="text-4xl md:text-6xl text-white font-bold mb-8 text-center drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
                                SYSTEM INFECTED
                            </h1>
                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-red-600 text-white font-pixel text-xl border-b-8 border-red-800 hover:bg-red-500 active:border-b-0 active:mt-2 transition-all shadow-lg animate-pulse"
                            >
                                NETTOYER LE BORDEL
                            </button>
                        </div>
                    )}



                    {gameState.phase === 'game_over' && (
                        <div className="bg-gray-800 p-8 border-4 border-white text-center flex gap-8">
                            <div>
                                <h1 className={`text-4xl mb-4 ${gameResult === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                                    {gameResult === 'win' ? 'SYSTEM SECURED' : 'SYSTEM INFECTED'}
                                </h1>
                                <p className="text-white mb-4">FINAL SCORE: {gameState.score}</p>

                                {gameResult === 'win' && !isScoreSubmitted && (
                                    <div className="mt-8">
                                        <p className="text-white mb-2">ENTER NICKNAME:</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={nickname}
                                                onChange={(e) => setNickname(e.target.value)}
                                                maxLength={10}
                                                className="bg-gray-700 text-white px-4 py-2 border-2 border-white outline-none focus:border-yellow-400 font-pixel uppercase"
                                                placeholder="AAA"
                                            />
                                            <button
                                                onClick={handleSubmitScore}
                                                disabled={!nickname.trim()}
                                                className="px-4 py-2 bg-yellow-600 text-white border-b-4 border-yellow-800 hover:bg-yellow-500 active:border-b-0 active:mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                SUBMIT
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {isScoreSubmitted && (
                                    <div className="mt-8 text-yellow-400 animate-pulse">
                                        SCORE SUBMITTED!
                                    </div>
                                )}
                            </div>
                            <Leaderboard currentScore={gameState.score} lastUpdate={leaderboardUpdate} />
                        </div>
                    )}

                    {gameState.phase === 'game_over' && (
                        <button
                            onClick={() => onComplete(gameResult === 'win')}
                            className="mt-8 px-6 py-3 bg-gray-600 text-white border-b-4 border-gray-800 hover:bg-gray-500"
                        >
                            CLOSE SYSTEM
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="text-white/50 text-sm text-center">
                    NIRD DEFENSE SYSTEM v1.0
                </div>
            </div>
        </div>
    );
};
