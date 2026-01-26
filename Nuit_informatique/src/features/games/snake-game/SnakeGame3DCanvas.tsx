import React, { useEffect, useRef } from 'react';
import type { Fruit } from './useSnakeGameLogic';

type Position3D = { x: number; y: number; z: number };

interface SnakeGame3DCanvasProps {
    snake: Position3D[];
    fruit: Fruit & { z: number };
    dimensions: { w: number; h: number; d: number };
    width: number;
    height: number;
    score: number;
}

export const SnakeGame3DCanvas: React.FC<SnakeGame3DCanvasProps> = ({ snake, fruit, dimensions, width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);

    // Interpolation State
    const prevSnakeRef = useRef<Position3D[]>(snake);
    const lastUpdateRef = useRef<number>(0);
    const ANIMATION_DURATION = 200; // Match the logic tick speed

    useEffect(() => {
        prevSnakeRef.current = snake;
        lastUpdateRef.current = performance.now();
    }, [snake]);

    // Game State Refs
    const gameStateRef = useRef({ snake, fruit, dimensions, width, height });

    useEffect(() => {
        gameStateRef.current = { snake, fruit, dimensions, width, height };
    }, [snake, fruit, dimensions, width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const TILE_SIZE = 24;
        const ISO_OFFSET_X = width / 2;
        const ISO_OFFSET_Y = 400;

        const toIso = (x: number, y: number, z: number) => {
            return {
                x: (x - y) * TILE_SIZE + ISO_OFFSET_X,
                y: (x + y) * (TILE_SIZE / 2) - (z * TILE_SIZE) + ISO_OFFSET_Y
            };
        };

        const adjustColor = (color: string, _amount: number) => {
            return color;
        };

        const drawCube = (x: number, y: number, z: number, color: string, alpha: number = 1, scale: number = 1) => {
            const iso = toIso(x, y, z);
            const size = TILE_SIZE * scale;

            const topColor = color;
            const rightColor = adjustColor(color, -40);
            const leftColor = adjustColor(color, -20);

            ctx.globalAlpha = alpha;

            // Top Face
            ctx.fillStyle = topColor;
            ctx.beginPath();
            ctx.moveTo(iso.x, iso.y - size);
            ctx.lineTo(iso.x + size, iso.y - (size / 2) - size);
            ctx.lineTo(iso.x, iso.y - size - size);
            ctx.lineTo(iso.x - size, iso.y - (size / 2) - size);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.stroke();

            // Right Face
            ctx.fillStyle = rightColor;
            ctx.beginPath();
            ctx.moveTo(iso.x, iso.y - size);
            ctx.lineTo(iso.x + size, iso.y - (size / 2) - size);
            ctx.lineTo(iso.x + size, iso.y - (size / 2));
            ctx.lineTo(iso.x, iso.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Left Face
            ctx.fillStyle = leftColor;
            ctx.beginPath();
            ctx.moveTo(iso.x, iso.y - size);
            ctx.lineTo(iso.x - size, iso.y - (size / 2) - size);
            ctx.lineTo(iso.x - size, iso.y - (size / 2));
            ctx.lineTo(iso.x, iso.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.globalAlpha = 1;
        };

        const drawGridFloor = (z: number, w: number, h: number) => {
            ctx.strokeStyle = `rgba(255, 255, 255, ${z === 0 ? 0.1 : 0.05})`;
            ctx.lineWidth = 1;

            for (let x = 0; x <= w; x++) {
                const start = toIso(x, 0, z);
                const end = toIso(x, h, z);
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
            for (let y = 0; y <= h; y++) {
                const start = toIso(0, y, z);
                const end = toIso(w, y, z);
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        };

        const render = (time: number) => {
            try {
                const { snake, fruit, dimensions, width, height } = gameStateRef.current;

                if (!snake || !fruit || !dimensions) return;

                // Calculate Interpolation Progress
                const elapsed = time - lastUpdateRef.current;
                const t = Math.min(elapsed / ANIMATION_DURATION, 1);
                const easeT = t;

                // Clear
                ctx.fillStyle = '#111827';
                ctx.fillRect(0, 0, width, height);

                // Draw Volume Guide
                const c1 = toIso(0, 0, 0);
                const c2 = toIso(dimensions.w, 0, 0);
                const c3 = toIso(dimensions.w, dimensions.h, 0);
                const c4 = toIso(0, dimensions.h, 0);

                const c1_top = toIso(0, 0, dimensions.d);
                const c2_top = toIso(dimensions.w, 0, dimensions.d);
                const c3_top = toIso(dimensions.w, dimensions.h, dimensions.d);
                const c4_top = toIso(0, dimensions.h, dimensions.d);

                // Draw Floor Grid
                drawGridFloor(0, dimensions.w, dimensions.h);

                // Draw Ceiling Grid (Faint)
                drawGridFloor(dimensions.d, dimensions.w, dimensions.h);

                // Draw Pillars
                ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)';
                ctx.beginPath();
                [
                    [c1, c1_top], [c2, c2_top], [c3, c3_top], [c4, c4_top]
                ].forEach(([bottom, top]) => {
                    ctx.moveTo(bottom.x, bottom.y);
                    ctx.lineTo(top.x, top.y);
                });
                ctx.stroke();

                const entities: { type: 'SNAKE' | 'FRUIT', x: number, y: number, z: number, data: any, sortKey: number }[] = [];

                if (snake && prevSnakeRef.current) {
                    snake.forEach((s, i) => {
                        let renderX = s.x;
                        let renderY = s.y;
                        let renderZ = s.z;

                        if (i < prevSnakeRef.current.length) {
                            const prev = prevSnakeRef.current[i];
                            if (Math.abs(s.x - prev.x) <= 1 && Math.abs(s.y - prev.y) <= 1 && Math.abs(s.z - prev.z) <= 1) {
                                renderX = prev.x + (s.x - prev.x) * easeT;
                                renderY = prev.y + (s.y - prev.y) * easeT;
                                renderZ = prev.z + (s.z - prev.z) * easeT;
                            }
                        }

                        entities.push({
                            type: 'SNAKE',
                            x: renderX, y: renderY, z: renderZ,
                            data: { index: i },
                            sortKey: (renderX + renderY) * 10 + renderZ
                        });
                    });
                }

                if (fruit) {
                    entities.push({
                        type: 'FRUIT',
                        x: fruit.x, y: fruit.y, z: fruit.z,
                        data: fruit,
                        sortKey: (fruit.x + fruit.y) * 10 + fruit.z
                    });
                }

                entities.sort((a, b) => a.sortKey - b.sortKey);

                entities.forEach(e => {
                    if (e.type === 'FRUIT') {
                        const head = snake[0];
                        const onSameZ = head && head.z === e.z;

                        const bottomIso = toIso(e.x, e.y, 0);
                        const topIso = toIso(e.x, e.y, dimensions.d);

                        ctx.strokeStyle = onSameZ ? '#ffffff' : e.data.color;
                        ctx.lineWidth = onSameZ ? 2 : 1;
                        ctx.setLineDash([4, 4]);
                        ctx.beginPath();
                        ctx.moveTo(bottomIso.x, bottomIso.y);
                        ctx.lineTo(topIso.x, topIso.y);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        ctx.fillStyle = 'rgba(0,0,0,0.5)';
                        ctx.beginPath();
                        ctx.ellipse(bottomIso.x, bottomIso.y, TILE_SIZE / 2, TILE_SIZE / 4, 0, 0, Math.PI * 2);
                        ctx.fill();

                        const bounce = Math.abs(Math.sin(time / 200)) * 0.2;
                        const scale = onSameZ ? 1 + Math.sin(time / 100) * 0.2 : 1;
                        drawCube(e.x, e.y, e.z + bounce, e.data.color, 1, scale);
                    } else if (e.type === 'SNAKE') {
                        const isHead = e.data.index === 0;
                        const color = isHead ? '#4ade80' : '#ffffff';

                        if (isHead) {
                            const shadowIso = toIso(e.x, e.y, 0);
                            ctx.fillStyle = 'rgba(0,0,0,0.3)';
                            ctx.beginPath();
                            ctx.ellipse(shadowIso.x, shadowIso.y, TILE_SIZE / 2, TILE_SIZE / 4, 0, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        drawCube(e.x, e.y, e.z, color, isHead ? 1 : 0.8);
                    }
                });
            } catch (e) {
                console.error("Render error:", e);
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
            className="border-4 border-retro-gray shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-black rounded-lg w-full h-full object-contain"
        />
    );
};
