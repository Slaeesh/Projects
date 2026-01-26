import { useState, useEffect, useCallback, useRef } from 'react';
import type { FruitType } from './useSnakeGameLogic';

// Face Indices:
// 0: Front
// 1: Right
// 2: Back
// 3: Left
// 4: Top
// 5: Bottom

type CubePosition = { face: number; x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const INITIAL_SPEED = 150;
const GRID_SIZE = 10; // 10x10 per face

const FRUIT_TYPES: { type: FruitType; color: string; points: number }[] = [
    { type: 'APPLE', color: '#ef4444', points: 10 },
    { type: 'BANANA', color: '#eab308', points: 20 },
    { type: 'GRAPE', color: '#a855f7', points: 30 },
    { type: 'CHERRY', color: '#ec4899', points: 50 },
];

export const useSnakeGameLogicCube = (onGameOver: (score: number) => void) => {
    const [snake, setSnake] = useState<CubePosition[]>([{ face: 0, x: 5, y: 5 }]);
    const [fruit, setFruit] = useState<CubePosition & { type: FruitType; color: string; points: number }>({ face: 0, x: 2, y: 2, type: 'APPLE', color: '#ef4444', points: 10 });
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const directionRef = useRef<Direction>('RIGHT');
    const gameLoopRef = useRef<number | null>(null);

    const spawnFruit = useCallback((currentSnake: CubePosition[] = []) => {
        let newFruit: { face: number; x: number; y: number; type: FruitType; color: string; points: number };
        let isValid = false;
        while (!isValid) {
            const typeInfo = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
            newFruit = {
                face: Math.floor(Math.random() * 6),
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
                ...typeInfo
            };
            isValid = !currentSnake.some(s => s.face === newFruit.face && s.x === newFruit.x && s.y === newFruit.y);
        }
        return newFruit!;
    }, []);

    const startGame = () => {
        setSnake([{ face: 0, x: 5, y: 5 }, { face: 0, x: 4, y: 5 }, { face: 0, x: 3, y: 5 }]);
        setFruit(spawnFruit());
        directionRef.current = 'RIGHT';
        setScore(0);
        setIsPlaying(true);
        setIsPaused(false);
    };

    const stopGame = () => {
        setIsPlaying(false);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };

    const lastProcessedDirectionRef = useRef<Direction>('RIGHT');

    const moveSnake = useCallback(() => {
        if (!isPlaying || isPaused) return;

        setSnake(prevSnake => {
            const head = prevSnake[0];
            let newHead = { ...head };
            let newDir = directionRef.current;

            // Update last processed direction
            lastProcessedDirectionRef.current = directionRef.current;

            // Move within face
            switch (directionRef.current) {
                case 'UP': newHead.y -= 1; break;
                case 'DOWN': newHead.y += 1; break;
                case 'LEFT': newHead.x -= 1; break;
                case 'RIGHT': newHead.x += 1; break;
            }

            // Check Face Transitions
            if (newHead.x < 0) { // Left Edge
                switch (head.face) {
                    case 0: newHead.face = 3; newHead.x = GRID_SIZE - 1; break;
                    case 1: newHead.face = 0; newHead.x = GRID_SIZE - 1; break;
                    case 2: newHead.face = 1; newHead.x = GRID_SIZE - 1; break;
                    case 3: newHead.face = 2; newHead.x = GRID_SIZE - 1; break;
                    case 4: newHead.face = 3; newHead.x = head.y; newHead.y = 0; newDir = 'DOWN'; break;
                    case 5: newHead.face = 3; newHead.x = GRID_SIZE - 1 - head.y; newHead.y = GRID_SIZE - 1; newDir = 'UP'; break;
                }
            } else if (newHead.x >= GRID_SIZE) { // Right Edge
                switch (head.face) {
                    case 0: newHead.face = 1; newHead.x = 0; break;
                    case 1: newHead.face = 2; newHead.x = 0; break;
                    case 2: newHead.face = 3; newHead.x = 0; break;
                    case 3: newHead.face = 0; newHead.x = 0; break;
                    case 4: newHead.face = 1; newHead.x = GRID_SIZE - 1 - head.y; newHead.y = 0; newDir = 'DOWN'; break;
                    case 5: newHead.face = 1; newHead.x = head.y; newHead.y = GRID_SIZE - 1; newDir = 'UP'; break;
                }
            } else if (newHead.y < 0) { // Top Edge
                switch (head.face) {
                    case 0: newHead.face = 4; newHead.y = GRID_SIZE - 1; break;
                    case 1: newHead.face = 4; newHead.y = GRID_SIZE - 1 - head.x; newHead.x = GRID_SIZE - 1; newDir = 'LEFT'; break;
                    case 2: newHead.face = 4; newHead.y = 0; newHead.x = GRID_SIZE - 1 - head.x; newDir = 'DOWN'; break;
                    case 3: newHead.face = 4; newHead.y = head.x; newHead.x = 0; newDir = 'RIGHT'; break;
                    case 4: newHead.face = 2; newHead.y = 0; newHead.x = GRID_SIZE - 1 - head.x; newDir = 'DOWN'; break;
                    case 5: newHead.face = 0; newHead.y = GRID_SIZE - 1; break;
                }
            } else if (newHead.y >= GRID_SIZE) { // Bottom Edge
                switch (head.face) {
                    case 0: newHead.face = 5; newHead.y = 0; break;
                    case 1: newHead.face = 5; newHead.y = head.x; newHead.x = GRID_SIZE - 1; newDir = 'LEFT'; break;
                    case 2: newHead.face = 5; newHead.y = GRID_SIZE - 1; newHead.x = GRID_SIZE - 1 - head.x; newDir = 'UP'; break;
                    case 3: newHead.face = 5; newHead.y = GRID_SIZE - 1 - head.x; newHead.x = 0; newDir = 'RIGHT'; break;
                    case 4: newHead.face = 0; newHead.y = 0; break;
                    case 5: newHead.face = 2; newHead.y = GRID_SIZE - 1; newHead.x = GRID_SIZE - 1 - head.x; newDir = 'UP'; break;
                }
            }

            // Update direction if changed
            if (newDir !== directionRef.current) {
                directionRef.current = newDir;
            }

            // Check Self Collision
            const willEatFruit = newHead.face === fruit.face && newHead.x === fruit.x && newHead.y === fruit.y;
            const collisionSnake = willEatFruit ? prevSnake : prevSnake.slice(0, -1);
            const justSwitchedFace = newHead.face !== head.face;

            if (!justSwitchedFace && collisionSnake.some(segment => segment.face === newHead.face && segment.x === newHead.x && segment.y === newHead.y)) {
                stopGame();
                onGameOver(score);
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            // Check Fruit Collision
            if (willEatFruit) {
                setScore(s => s + fruit.points);
                setFruit(spawnFruit(newSnake));
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [isPlaying, isPaused, fruit, score, onGameOver, spawnFruit, stopGame]);

    useEffect(() => {
        if (isPlaying && !isPaused) {
            gameLoopRef.current = window.setInterval(moveSnake, INITIAL_SPEED);
        } else if (gameLoopRef.current) {
            clearInterval(gameLoopRef.current);
        }

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [isPlaying, isPaused, moveSnake]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPlaying) return;

            switch (e.key) {
                case 'ArrowUp':
                    if (lastProcessedDirectionRef.current !== 'DOWN' && directionRef.current !== 'DOWN') directionRef.current = 'UP';
                    break;
                case 'ArrowDown':
                    if (lastProcessedDirectionRef.current !== 'UP' && directionRef.current !== 'UP') directionRef.current = 'DOWN';
                    break;
                case 'ArrowLeft':
                    if (lastProcessedDirectionRef.current !== 'RIGHT' && directionRef.current !== 'RIGHT') directionRef.current = 'LEFT';
                    break;
                case 'ArrowRight':
                    if (lastProcessedDirectionRef.current !== 'LEFT' && directionRef.current !== 'LEFT') directionRef.current = 'RIGHT';
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
        gridSize: GRID_SIZE
    };
};
