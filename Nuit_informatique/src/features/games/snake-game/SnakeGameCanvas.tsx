import React, { useEffect, useRef } from 'react';
import type { Fruit } from './useSnakeGameLogic';

type Position = { x: number; y: number };

interface SnakeGameCanvasProps {
    snake: Position[];
    fruit: Fruit;
    gridSize: number;
    width: number;
    height: number;
    score: number;
}

export const SnakeGameCanvas: React.FC<SnakeGameCanvasProps> = ({ snake, fruit, gridSize, width, height, score }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);
    const particlesRef = useRef<{ x: number, y: number, vx: number, vy: number, life: number, color: string }[]>([]);
    const lastScoreRef = useRef(score);

    // Interpolation State
    const prevSnakeRef = useRef<Position[]>(snake);
    const lastUpdateRef = useRef<number>(0);
    // const ANIMATION_DURATION = 130; // Removed, calculated dynamically

    useEffect(() => {
        prevSnakeRef.current = snake;
        lastUpdateRef.current = performance.now();
    }, [snake]);

    useEffect(() => {
        // Trigger particles on score increase
        if (score > lastScoreRef.current) {
            const head = snake[0];
            for (let i = 0; i < 20; i++) {
                particlesRef.current.push({
                    x: head.x * gridSize + gridSize / 2,
                    y: head.y * gridSize + gridSize / 2,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    life: 1.0,
                    color: fruit.color
                });
            }
        }
        lastScoreRef.current = score;
    }, [score, snake, gridSize, fruit]);

    // Game State Refs
    const gameStateRef = useRef({ snake, fruit, gridSize, width, height, score });

    useEffect(() => {
        gameStateRef.current = { snake, fruit, gridSize, width, height, score };
    }, [snake, fruit, gridSize, width, height, score]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = (time: number) => {
            const { snake, fruit, gridSize, width, height, score } = gameStateRef.current;

            // Calculate Speed based on Score
            const currentSpeed = Math.max(50, 80 - Math.floor(score / 50) * 2);
            const ANIMATION_DURATION = currentSpeed;

            // Calculate Interpolation Progress
            const elapsed = time - lastUpdateRef.current;
            const t = Math.min(elapsed / ANIMATION_DURATION, 1);
            const easeT = t;

            // Clear with trail effect
            ctx.fillStyle = 'rgba(26, 26, 26, 0.8)';
            ctx.fillRect(0, 0, width, height);

            // Draw Cyber Grid
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.1)';

            for (let x = 0; x <= width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y <= height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw Fruit
            ctx.shadowBlur = 20;
            ctx.shadowColor = fruit.color;
            ctx.fillStyle = fruit.color;

            const fruitX = fruit.x * gridSize + gridSize / 2;
            const fruitY = fruit.y * gridSize + gridSize / 2;

            ctx.beginPath();
            if (fruit.type === 'APPLE') {
                ctx.arc(fruitX, fruitY, gridSize / 2 - 2, 0, Math.PI * 2);
            } else if (fruit.type === 'BANANA') {
                ctx.ellipse(fruitX, fruitY, gridSize / 2 - 2, gridSize / 4, Math.PI / 4, 0, Math.PI * 2);
            } else if (fruit.type === 'GRAPE') {
                ctx.arc(fruitX - 3, fruitY - 3, 4, 0, Math.PI * 2);
                ctx.arc(fruitX + 3, fruitY - 3, 4, 0, Math.PI * 2);
                ctx.arc(fruitX, fruitY + 4, 4, 0, Math.PI * 2);
            } else {
                ctx.arc(fruitX, fruitY, gridSize / 2 - 2, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw Snake
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // 1. Glow Layer
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#4ade80';

            const getInterpolatedPos = (index: number) => {
                const current = snake[index];
                // Use prevSnakeRef from component scope (it's already a ref)
                if (index < prevSnakeRef.current.length) {
                    const prev = prevSnakeRef.current[index];

                    const dx = current.x - prev.x;
                    const dy = current.y - prev.y;
                    const cols = width / gridSize;
                    const rows = height / gridSize;

                    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                        if (dx < -1) return { x: -1 + (0 - -1) * easeT, y: prev.y };
                        if (dx > 1) return { x: cols + (cols - 1 - cols) * easeT, y: prev.y };
                        if (dy < -1) return { x: prev.x, y: -1 + (0 - -1) * easeT };
                        if (dy > 1) return { x: prev.x, y: rows + (rows - 1 - rows) * easeT };
                    }

                    return {
                        x: prev.x + dx * easeT,
                        y: prev.y + dy * easeT
                    };
                }
                return current;
            };

            ctx.beginPath();
            if (snake.length > 0) {
                snake.forEach((_, i) => {
                    const segment = getInterpolatedPos(i);
                    const sx = segment.x * gridSize;
                    const sy = segment.y * gridSize;
                    ctx.fillRect(sx, sy, gridSize, gridSize);

                    // Ghost segments logic
                    if (i < prevSnakeRef.current.length) {
                        const prev = prevSnakeRef.current[i];
                        const current = snake[i];
                        const dx = current.x - prev.x;
                        const dy = current.y - prev.y;

                        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                            let ghostX = prev.x;
                            let ghostY = prev.y;
                            if (dx < -1) ghostX = prev.x + easeT;
                            else if (dx > 1) ghostX = prev.x - easeT;
                            else if (dy < -1) ghostY = prev.y + easeT;
                            else if (dy > 1) ghostY = prev.y - easeT;
                            ctx.fillRect(ghostX * gridSize, ghostY * gridSize, gridSize, gridSize);
                        }
                    }
                });
            }
            ctx.stroke();

            // 2. Core Layer
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            snake.forEach((_, i) => {
                const segment = getInterpolatedPos(i);
                const padding = 4;
                ctx.fillRect(segment.x * gridSize + padding, segment.y * gridSize + padding, gridSize - padding * 2, gridSize - padding * 2);
            });

            // Draw Snake Head
            if (snake.length > 0) {
                const head = getInterpolatedPos(0);
                const hx = head.x * gridSize;
                const hy = head.y * gridSize;

                ctx.fillStyle = '#4ade80';
                ctx.fillRect(hx, hy, gridSize, gridSize);

                // Eyes
                ctx.fillStyle = 'black';
                let eye1 = { x: 4, y: 4 };
                let eye2 = { x: 4, y: 12 };

                if (snake.length > 1) {
                    const next = snake[1];
                    if (next.x < snake[0].x) { eye1 = { x: 14, y: 4 }; eye2 = { x: 14, y: 12 }; }
                    else if (next.x > snake[0].x) { eye1 = { x: 2, y: 4 }; eye2 = { x: 2, y: 12 }; }
                    else if (next.y < snake[0].y) { eye1 = { x: 4, y: 14 }; eye2 = { x: 12, y: 14 }; }
                    else if (next.y > snake[0].y) { eye1 = { x: 4, y: 2 }; eye2 = { x: 12, y: 2 }; }
                }

                ctx.fillRect(hx + eye1.x, hy + eye1.y, 4, 4);
                ctx.fillRect(hx + eye2.x, hy + eye2.y, 4, 4);

                // Tongue
                if (Math.floor(time / 100) % 5 === 0) {
                    ctx.fillStyle = 'red';
                    if (snake.length > 1) {
                        const next = snake[1];
                        if (next.x < snake[0].x) ctx.fillRect(hx + gridSize, hy + 8, 6, 4);
                        else if (next.x > snake[0].x) ctx.fillRect(hx - 6, hy + 8, 6, 4);
                        else if (next.y < snake[0].y) ctx.fillRect(hx + 8, hy + gridSize, 4, 6);
                        else ctx.fillRect(hx + 8, hy - 6, 4, 6);
                    } else {
                        ctx.fillRect(hx + 8, hy + gridSize, 4, 6);
                    }
                }
            }

            // Render Particles
            particlesRef.current.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;

                if (p.life > 0) {
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x, p.y, 4, 4);
                    ctx.globalAlpha = 1;
                }
            });
            particlesRef.current = particlesRef.current.filter(p => p.life > 0);

            // Scanline Overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            for (let y = 0; y < height; y += 4) {
                ctx.fillRect(0, y, width, 1);
            }

            frameRef.current = requestAnimationFrame(render);
        };

        frameRef.current = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(frameRef.current);
        };
    }, []); // Empty dependency array

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="border-4 border-retro-gray shadow-[0_0_20px_rgba(74,222,128,0.3)] bg-black rounded-lg w-full h-full object-contain"
        />
    );
};
