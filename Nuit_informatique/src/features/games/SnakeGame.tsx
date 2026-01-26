import React, { useState, useEffect, useRef } from 'react';
import { useSnakeGameLogic } from './snake-game/useSnakeGameLogic';
import { useSnakeGameLogic3D } from './snake-game/useSnakeGameLogic3D';
import { useSnakeGameLogicCube } from './snake-game/useSnakeGameLogicCube';
import { SnakeGameCanvas } from './snake-game/SnakeGameCanvas';
import { SnakeGame3DCanvas } from './snake-game/SnakeGame3DCanvas';
import { SnakeGameCubeCanvas } from './snake-game/SnakeGameCubeCanvas';
import snakeLoopMusic from '../../assets/snake_loop.mp3';


interface SnakeGameProps {
    onClose?: () => void;
}

type GameMode = 'MENU' | '2D' | '3D' | 'CUBE';

export const SnakeGame: React.FC<SnakeGameProps> = ({ onClose }) => {
    const CANVAS_WIDTH = 1200;
    const CANVAS_HEIGHT = 800;
    const GRID_SIZE = 20;

    const [mode, setMode] = useState<GameMode>('MENU');
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const handleGameOver = (finalScore: number) => {
        setGameOver(true);
        setScore(finalScore);
    };

    // Initialize all hooks (rules of hooks)
    const game2D = useSnakeGameLogic(CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, handleGameOver);
    const game3D = useSnakeGameLogic3D(CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, handleGameOver);
    const gameCube = useSnakeGameLogicCube(handleGameOver);

    // Music Control
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(snakeLoopMusic);
            audioRef.current.loop = true;
            audioRef.current.volume = 0.3;
        }

        if (mode !== 'MENU' && !gameOver) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        } else {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        return () => {
            audioRef.current?.pause();
        };
    }, [mode, gameOver]);

    // Effect to start/stop games based on mode
    useEffect(() => {
        if (mode === '2D') {
            game2D.startGame();
            game3D.stopGame();
            gameCube.stopGame();
        } else if (mode === '3D') {
            game3D.startGame();
            game2D.stopGame();
            gameCube.stopGame();
        } else if (mode === 'CUBE') {
            gameCube.startGame();
            game2D.stopGame();
            game3D.stopGame();
        } else {
            game2D.stopGame();
            game3D.stopGame();
            gameCube.stopGame();
        }
    }, [mode]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-6xl flex flex-col items-center">

                {/* Header */}
                <div className="w-full flex justify-between items-center mb-4 px-4">
                    <h2 className="text-4xl font-bold text-retro-green font-mono tracking-wider drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                        SNAKE_OS v2.0
                    </h2>
                    <div className="flex gap-4">
                        {mode !== 'MENU' && (
                            <div className="text-2xl font-mono text-white">
                                SCORE: <span className="text-retro-green">{mode === '2D' ? game2D.score : mode === '3D' ? game3D.score : gameCube.score}</span>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-500/20 rounded-full transition-colors group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-red-500">
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Screen Container */}
                <div className="relative z-10 w-full max-w-[1200px] aspect-[4/3] max-h-[80vh] bg-black border-8 border-retro-gray rounded-xl shadow-2xl overflow-hidden relative">

                    {/* CRT Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-10" />
                    <div className="absolute inset-0 pointer-events-none z-50 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />

                    {/* Menu */}
                    {mode === 'MENU' && !gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-black/80 z-40">
                            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 filter drop-shadow-[0_0_20px_rgba(74,222,128,0.5)] animate-pulse">
                                SELECT MODE
                            </h1>
                            <div className="flex gap-8">
                                <button
                                    onClick={() => setMode('2D')}
                                    className="px-8 py-4 bg-gray-800 border-2 border-green-500 rounded-lg text-2xl font-mono text-green-400 hover:bg-green-500/20 hover:scale-105 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                                >
                                    2D CLASSIC
                                </button>
                                <button
                                    onClick={() => setMode('3D')}
                                    className="px-8 py-4 bg-gray-800 border-2 border-blue-500 rounded-lg text-2xl font-mono text-blue-400 hover:bg-blue-500/20 hover:scale-105 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                >
                                    3D VOLUMETRIC
                                </button>
                                <button
                                    onClick={() => setMode('CUBE')}
                                    className="px-8 py-4 bg-gray-800 border-2 border-purple-500 rounded-lg text-2xl font-mono text-purple-400 hover:bg-purple-500/20 hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                                >
                                    CUBE SURFACE
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Game Over Screen */}
                    {gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/90 z-50">
                            <h2 className="text-6xl font-bold text-red-500 font-mono animate-bounce">GAME OVER</h2>
                            <p className="text-3xl text-white font-mono">FINAL SCORE: {score}</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setGameOver(false);
                                        if (mode === '2D') game2D.startGame();
                                        else if (mode === '3D') game3D.startGame();
                                        else if (mode === 'CUBE') gameCube.startGame();
                                    }}
                                    className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-mono text-xl"
                                >
                                    RETRY
                                </button>
                                <button
                                    onClick={() => {
                                        setGameOver(false);
                                        setMode('MENU');
                                    }}
                                    className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 font-mono text-xl"
                                >
                                    MENU
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Game Canvases */}
                    {mode === '2D' && (
                        <SnakeGameCanvas
                            snake={game2D.snake}
                            fruit={game2D.fruit}
                            gridSize={GRID_SIZE}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            score={game2D.score}
                        />
                    )}

                    {mode === '3D' && (
                        <SnakeGame3DCanvas
                            snake={game3D.snake}
                            fruit={game3D.fruit}
                            dimensions={game3D.dimensions}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            score={game3D.score}
                        />
                    )}

                    {mode === 'CUBE' && (
                        <SnakeGameCubeCanvas
                            snake={gameCube.snake}
                            fruit={gameCube.fruit}
                            gridSize={gameCube.gridSize}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                        />
                    )}

                </div>

                {/* Controls Helper */}
                <div className="mt-4 text-gray-400 font-mono text-sm flex gap-8">
                    {mode === '2D' && <span>[ARROWS] Move • [ESC] Pause</span>}
                    {mode === '3D' && <span>[ARROWS] Move X/Y • [SHIFT+UP/DOWN] Move Z • [ESC] Pause</span>}
                    {mode === 'CUBE' && <span>[ARROWS] Move on Surface • [ESC] Pause</span>}
                </div>
            </div>
        </div>
    );
};
