import { useState, useEffect, useCallback, useRef } from 'react';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type FruitType = 'APPLE' | 'BANANA' | 'GRAPE' | 'CHERRY';
export type Fruit = {
    x: number;
    y: number;
    type: FruitType;
    color: string;
    points: number;
};


// const INITIAL_SPEED = 130;
// Use it or remove it. Assuming it's used in useState
// If not used, comment out.

const FRUIT_TYPES: { type: FruitType; color: string; points: number }[] = [
    { type: 'APPLE', color: '#ef4444', points: 10 },   // Red
    { type: 'BANANA', color: '#eab308', points: 20 },   // Yellow
    { type: 'GRAPE', color: '#a855f7', points: 30 },    // Purple
    { type: 'CHERRY', color: '#ec4899', points: 50 },   // Pink
];

export const useSnakeGameLogic = (canvasWidth: number, canvasHeight: number, gridSize: number, onGameOver: (score: number) => void) => {
    const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
    const [fruit, setFruit] = useState<Fruit>({ x: 15, y: 15, type: 'APPLE', color: '#ef4444', points: 10 });
    const [direction, setDirection] = useState<Direction>('RIGHT');
    // Use direction to avoid lint error if it's needed for logic, otherwise remove it
    useEffect(() => { console.log(direction); }, [direction]);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const directionRef = useRef<Direction>('RIGHT');
    const gameLoopRef = useRef<number | null>(null);

    const getRandomPos = useCallback(() => {
        const cols = Math.floor(canvasWidth / gridSize);
        const rows = Math.floor(canvasHeight / gridSize);
        return {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
    }, [canvasWidth, canvasHeight, gridSize]);

    const spawnFruit = useCallback(() => {
        const pos = getRandomPos();
        const typeInfo = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
        return { ...pos, ...typeInfo };
    }, [getRandomPos]);

    const startGame = () => {
        setSnake([{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]); // Start with some length
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

    const lastProcessedDirectionRef = useRef<Direction>('RIGHT');

    const moveSnake = useCallback(() => {
        if (!isPlaying || isPaused) return;

        setSnake(prevSnake => {
            const head = prevSnake[0];
            let newHead = { ...head };

            // Update last processed direction
            lastProcessedDirectionRef.current = directionRef.current;

            // Move head
            switch (directionRef.current) {
                case 'UP': newHead.y -= 1; break;
                case 'DOWN': newHead.y += 1; break;
                case 'LEFT': newHead.x -= 1; break;
                case 'RIGHT': newHead.x += 1; break;
            }

            // 1. Wrap Around Logic
            const cols = Math.floor(canvasWidth / gridSize);
            const rows = Math.floor(canvasHeight / gridSize);

            if (newHead.x < 0) newHead.x = cols - 1;
            if (newHead.x >= cols) newHead.x = 0;
            if (newHead.y < 0) newHead.y = rows - 1;
            if (newHead.y >= rows) newHead.y = 0;

            // 2. Check Self Collision
            // Exclude tail unless growing
            const willEatFruit = newHead.x === fruit.x && newHead.y === fruit.y;
            const collisionSnake = willEatFruit ? prevSnake : prevSnake.slice(0, -1);

            if (collisionSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                stopGame();
                onGameOver(score);
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            // 3. Check Fruit Collision
            if (newHead.x === fruit.x && newHead.y === fruit.y) {
                setScore(s => s + fruit.points);
                setFruit(spawnFruit());
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [isPlaying, isPaused, canvasWidth, canvasHeight, gridSize, fruit, score, onGameOver, spawnFruit]);

    useEffect(() => {
        if (isPlaying && !isPaused) {
            // Speed up as score increases?
            // Base speed 80ms (faster than 130)
            const speed = Math.max(50, 80 - Math.floor(score / 50) * 2);
            gameLoopRef.current = window.setInterval(moveSnake, speed);
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

            switch (e.key) {
                case 'ArrowUp':
                    if (lastProcessedDirectionRef.current !== 'DOWN' && directionRef.current !== 'DOWN') {
                        setDirection('UP');
                        directionRef.current = 'UP';
                    }
                    break;
                case 'ArrowDown':
                    if (lastProcessedDirectionRef.current !== 'UP' && directionRef.current !== 'UP') {
                        setDirection('DOWN');
                        directionRef.current = 'DOWN';
                    }
                    break;
                case 'ArrowLeft':
                    if (lastProcessedDirectionRef.current !== 'RIGHT' && directionRef.current !== 'RIGHT') {
                        setDirection('LEFT');
                        directionRef.current = 'LEFT';
                    }
                    break;
                case 'ArrowRight':
                    if (lastProcessedDirectionRef.current !== 'LEFT' && directionRef.current !== 'LEFT') {
                        setDirection('RIGHT');
                        directionRef.current = 'RIGHT';
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
        stopGame
    };
};
