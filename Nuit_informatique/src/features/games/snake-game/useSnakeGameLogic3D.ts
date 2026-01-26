import { useState, useEffect, useCallback, useRef } from 'react';
import type { FruitType, Fruit } from './useSnakeGameLogic';

type Position3D = { x: number; y: number; z: number };
type Direction3D = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'FORWARD' | 'BACKWARD';

const INITIAL_SPEED = 200; // Slower for 3D to help navigation

const FRUIT_TYPES: { type: FruitType; color: string; points: number }[] = [
    { type: 'APPLE', color: '#ef4444', points: 10 },
    { type: 'BANANA', color: '#eab308', points: 20 },
    { type: 'GRAPE', color: '#a855f7', points: 30 },
    { type: 'CHERRY', color: '#ec4899', points: 50 },
];

export const useSnakeGameLogic3D = (
    _canvasWidth: number,
    _canvasHeight: number,
    _gridSize: number,
    onGameOver: (score: number) => void
) => {
    // 3D Grid Dimensions
    // Larger and more cubic as requested
    const GRID_W = 15; // X
    const GRID_H = 15; // Y
    const GRID_D = 15; // Z

    const [snake, setSnake] = useState<Position3D[]>([{ x: 7, y: 7, z: 7 }]);
    const [fruit, setFruit] = useState<Fruit & { z: number }>({ x: 10, y: 10, z: 7, type: 'APPLE', color: '#ef4444', points: 10 });
    const [direction, setDirection] = useState<Direction3D>('RIGHT');
    useEffect(() => { console.log(direction); }, [direction]);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const directionRef = useRef<Direction3D>('RIGHT');
    const gameLoopRef = useRef<number | null>(null);

    const spawnFruit = useCallback((currentSnake: Position3D[] = []) => {
        let newFruit: { x: number; y: number; z: number; type: FruitType; color: string; points: number };
        let isValid = false;
        while (!isValid) {
            const typeInfo = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
            newFruit = {
                x: Math.floor(Math.random() * GRID_W),
                y: Math.floor(Math.random() * GRID_H),
                z: Math.floor(Math.random() * GRID_D),
                ...typeInfo
            };
            // Check if on snake
            isValid = !currentSnake.some(s => s.x === newFruit.x && s.y === newFruit.y && s.z === newFruit.z);
        }
        return newFruit!;
    }, []);

    const startGame = () => {
        const center = Math.floor(GRID_W / 2);
        setSnake([{ x: center, y: center, z: center }, { x: center - 1, y: center, z: center }, { x: center - 2, y: center, z: center }]);
        setFruit(spawnFruit());
        setDirection('RIGHT');
        directionRef.current = 'RIGHT';
        setScore(0);
        setIsPlaying(true);
        setIsPaused(false);
    };

    const stopGame = () => {
        setIsPlaying(false);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };

    const moveSnake = useCallback(() => {
        if (!isPlaying || isPaused) return;

        setSnake(prevSnake => {
            const head = prevSnake[0];
            const newHead = { ...head };

            switch (directionRef.current) {
                case 'FORWARD': newHead.y -= 1; break; // "Up" on screen (Y-)
                case 'BACKWARD': newHead.y += 1; break; // "Down" on screen (Y+)
                case 'LEFT': newHead.x -= 1; break;
                case 'RIGHT': newHead.x += 1; break;
                case 'UP': newHead.z += 1; break; // Real 3D Up (Z+)
                case 'DOWN': newHead.z -= 1; break; // Real 3D Down (Z-)
            }

            // Wrap Around Logic (Teleport to opposite side)
            if (newHead.x < 0) newHead.x = GRID_W - 1;
            if (newHead.x >= GRID_W) newHead.x = 0;

            if (newHead.y < 0) newHead.y = GRID_H - 1;
            if (newHead.y >= GRID_H) newHead.y = 0;

            if (newHead.z < 0) newHead.z = GRID_D - 1;
            if (newHead.z >= GRID_D) newHead.z = 0;

            // Check Self Collision
            if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y && segment.z === newHead.z)) {
                stopGame();
                onGameOver(score);
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            // Check Fruit Collision
            if (newHead.x === fruit.x && newHead.y === fruit.y && newHead.z === fruit.z) {
                setScore(s => s + fruit.points);
                setFruit(spawnFruit(newSnake));
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [isPlaying, isPaused, fruit, score, onGameOver, spawnFruit]);

    useEffect(() => {
        if (isPlaying && !isPaused) {
            gameLoopRef.current = window.setInterval(moveSnake, INITIAL_SPEED);
        } else if (gameLoopRef.current) {
            clearInterval(gameLoopRef.current);
        }

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [isPlaying, isPaused, moveSnake, score]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPlaying) return;

            // Controls:
            // Arrow Keys: X/Y Plane (Left/Right, Forward/Backward)
            // Shift + Up/Down: Z Axis (Up/Down)
            // OR: W/S for Z Axis? 
            // Let's try:
            // Arrows: X/Y
            // PageUp/PageDown: Z
            // W/S: Z (Alternative)

            const isShift = e.shiftKey;

            switch (e.key) {
                case 'ArrowUp':
                    if (isShift) {
                        if (directionRef.current !== 'DOWN') {
                            setDirection('UP');
                            directionRef.current = 'UP';
                        }
                    } else {
                        if (directionRef.current !== 'BACKWARD') {
                            setDirection('FORWARD');
                            directionRef.current = 'FORWARD';
                        }
                    }
                    break;
                case 'ArrowDown':
                    if (isShift) {
                        if (directionRef.current !== 'UP') {
                            setDirection('DOWN');
                            directionRef.current = 'DOWN';
                        }
                    } else {
                        if (directionRef.current !== 'FORWARD') {
                            setDirection('BACKWARD');
                            directionRef.current = 'BACKWARD';
                        }
                    }
                    break;
                case 'ArrowLeft':
                    if (directionRef.current !== 'RIGHT') {
                        setDirection('LEFT');
                        directionRef.current = 'LEFT';
                    }
                    break;
                case 'ArrowRight':
                    if (directionRef.current !== 'LEFT') {
                        setDirection('RIGHT');
                        directionRef.current = 'RIGHT';
                    }
                    break;
                case 'w': // Alt Z-Up
                case 'PageUp':
                    if (directionRef.current !== 'DOWN') {
                        setDirection('UP');
                        directionRef.current = 'UP';
                    }
                    break;
                case 's': // Alt Z-Down
                case 'PageDown':
                    if (directionRef.current !== 'UP') {
                        setDirection('DOWN');
                        directionRef.current = 'DOWN';
                    }
                    break;
                case 'Escape':
                    setIsPaused(prev => !prev);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying]);

    return {
        snake,
        fruit,
        score,
        isPlaying,
        startGame,
        stopGame,
        dimensions: { w: GRID_W, h: GRID_H, d: GRID_D }
    };
};
