import React, { useEffect, useRef } from 'react';

type CubePosition = { face: number; x: number; y: number };

interface SnakeGameCubeCanvasProps {
    snake: CubePosition[];
    fruit: CubePosition & { color: string };
    gridSize: number;
    width: number;
    height: number;
}

// 3D Math Helpers
const rotateX = (x: number, y: number, z: number, theta: number) => {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    return { x, y: y * cos - z * sin, z: y * sin + z * cos };
};

const rotateY = (x: number, y: number, z: number, theta: number) => {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    return { x: x * cos + z * sin, y, z: -x * sin + z * cos };
};

export const SnakeGameCubeCanvas: React.FC<SnakeGameCubeCanvasProps> = ({ snake, fruit, gridSize, width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);

    // Camera Rotation State
    const currentRotationRef = useRef({ x: 0, y: 0 });
    // const targetRotationRef = useRef({ x: 0, y: 0 }); // Unused

    // Game State Refs (to avoid re-running effect on every tick)
    const gameStateRef = useRef({ snake, fruit, gridSize, width, height });

    useEffect(() => {
        gameStateRef.current = { snake, fruit, gridSize, width, height };
    }, [snake, fruit, gridSize, width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const CUBE_SIZE = 350;
        const FACE_SIZE = CUBE_SIZE / 2; // Distance from center to face

        // Map face to rotation (Target rotations to bring face to front)
        const getTargetRotation = (face: number) => {
            switch (face) {
                case 0: return { x: 0, y: 0 }; // Front
                case 1: return { x: 0, y: -Math.PI / 2 }; // Right
                case 2: return { x: 0, y: Math.PI }; // Back
                case 3: return { x: 0, y: Math.PI / 2 }; // Left
                case 4: return { x: Math.PI / 2, y: 0 }; // Top
                case 5: return { x: -Math.PI / 2, y: 0 }; // Bottom
                default: return { x: 0, y: 0 };
            }
        };

        const render = () => {
            try {
                const { snake, fruit, gridSize, width, height } = gameStateRef.current;

                // Always draw background first
                ctx.fillStyle = '#111827';
                ctx.fillRect(0, 0, width, height);

                // Camera Rotation (smooth follow)
                if (snake.length === 0) {
                    ctx.fillStyle = '#4ade80';
                    ctx.font = '20px monospace';
                    ctx.fillText("Waiting for game...", width / 2 - 100, height / 2);
                    return;
                }

                const head = snake[0];
                const target = getTargetRotation(head.face);

                // Smooth interpolation
                currentRotationRef.current.x += (target.x - currentRotationRef.current.x) * 0.1;
                currentRotationRef.current.y += (target.y - currentRotationRef.current.y) * 0.1;

                // Center of screen
                const cx = width / 2;
                const cy = height / 2;

                // Perspective Projection
                const project = (x: number, y: number, z: number) => {
                    // Rotate
                    let p = { x, y, z };
                    p = rotateY(p.x, p.y, p.z, currentRotationRef.current.y);
                    p = rotateX(p.x, p.y, p.z, currentRotationRef.current.x);

                    // Project
                    const fov = 800;
                    const scale = fov / (fov + p.z + 500); // +500 to push cube back

                    return {
                        x: cx + p.x * scale,
                        y: cy + p.y * scale,
                        scale
                    };
                };

                // Draw Face Function
                const targetFace = head.face;
                if (targetFace < 0 || targetFace > 5) {
                    ctx.fillStyle = 'red';
                    ctx.font = '20px monospace';
                    ctx.fillText(`INVALID FACE: ${targetFace}`, 20, 80);
                    return;
                }

                const drawFace = (faceIndex: number) => {
                    // Define face vertices relative to center
                    // 0: Front (z = -FACE_SIZE)
                    // ...
                    // Let's define basis vectors for each face to map 2D grid to 3D
                    let origin = { x: 0, y: 0, z: 0 };
                    let u = { x: 0, y: 0, z: 0 }; // Right vector
                    let v = { x: 0, y: 0, z: 0 }; // Down vector

                    switch (faceIndex) {
                        case 0: // Front
                            origin = { x: -FACE_SIZE, y: -FACE_SIZE, z: -FACE_SIZE };
                            u = { x: 1, y: 0, z: 0 };
                            v = { x: 0, y: 1, z: 0 };
                            break;
                        case 1: // Right
                            origin = { x: FACE_SIZE, y: -FACE_SIZE, z: -FACE_SIZE };
                            u = { x: 0, y: 0, z: 1 };
                            v = { x: 0, y: 1, z: 0 };
                            break;
                        case 2: // Back
                            origin = { x: FACE_SIZE, y: -FACE_SIZE, z: FACE_SIZE };
                            u = { x: -1, y: 0, z: 0 };
                            v = { x: 0, y: 1, z: 0 };
                            break;
                        case 3: // Left
                            origin = { x: -FACE_SIZE, y: -FACE_SIZE, z: FACE_SIZE };
                            u = { x: 0, y: 0, z: -1 };
                            v = { x: 0, y: 1, z: 0 };
                            break;
                        case 4: // Top
                            origin = { x: -FACE_SIZE, y: -FACE_SIZE, z: FACE_SIZE };
                            u = { x: 1, y: 0, z: 0 };
                            v = { x: 0, y: 0, z: -1 };
                            break;
                        case 5: // Bottom
                            origin = { x: -FACE_SIZE, y: FACE_SIZE, z: -FACE_SIZE };
                            u = { x: 1, y: 0, z: 0 };
                            v = { x: 0, y: 0, z: 1 };
                            break;
                    }

                    // Full width is CUBE_SIZE.
                    const step = CUBE_SIZE / gridSize;

                    // Project 4 corners of face
                    const p1 = project(origin.x, origin.y, origin.z);
                    const p2 = project(origin.x + u.x * CUBE_SIZE, origin.y + u.y * CUBE_SIZE, origin.z + u.z * CUBE_SIZE);
                    const p3 = project(origin.x + u.x * CUBE_SIZE + v.x * CUBE_SIZE, origin.y + u.y * CUBE_SIZE + v.y * CUBE_SIZE, origin.z + u.z * CUBE_SIZE + v.z * CUBE_SIZE);
                    const p4 = project(origin.x + v.x * CUBE_SIZE, origin.y + v.y * CUBE_SIZE, origin.z + v.z * CUBE_SIZE);

                    // Draw Face Background
                    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)'; // Slate-800
                    ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
                    ctx.lineWidth = 1;

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.lineTo(p4.x, p4.y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    // Draw Snake Segments on this face
                    snake.forEach((s, i) => {
                        if (s.face === faceIndex) {
                            const sx = origin.x + u.x * (s.x * step + step / 2) + v.x * (s.y * step + step / 2);
                            const sy = origin.y + u.y * (s.x * step + step / 2) + v.y * (s.y * step + step / 2);
                            const sz = origin.z + u.z * (s.x * step + step / 2) + v.z * (s.y * step + step / 2);

                            const p = project(sx, sy, sz);
                            const size = step * 0.8 * p.scale;

                            ctx.fillStyle = i === 0 ? '#4ade80' : '#ffffff';
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    });

                    // Draw Fruit
                    if (fruit.face === faceIndex) {
                        const fx = origin.x + u.x * (fruit.x * step + step / 2) + v.x * (fruit.y * step + step / 2);
                        const fy = origin.y + u.y * (fruit.x * step + step / 2) + v.y * (fruit.y * step + step / 2);
                        const fz = origin.z + u.z * (fruit.x * step + step / 2) + v.z * (fruit.y * step + step / 2);

                        const p = project(fx, fy, fz);
                        const size = step * 0.8 * p.scale;

                        ctx.fillStyle = fruit.color;
                        ctx.shadowColor = fruit.color;
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                };

                // Draw all 6 faces
                [0, 1, 2, 3, 4, 5].forEach(f => drawFace(f));

            } catch (e) {
                console.error("Render error:", e);
                // Draw error message on canvas
                ctx.fillStyle = 'red';
                ctx.font = '20px monospace';
                ctx.fillText(`Render Error: ${(e as Error).message}`, 20, 40);
            }
        };

        frameRef.current = requestAnimationFrame(function loop() {
            render();
            frameRef.current = requestAnimationFrame(loop);
        });

        return () => cancelAnimationFrame(frameRef.current);
    }, []); // Empty dependency array = stable loop!

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="border-4 border-retro-gray shadow-[0_0_20px_rgba(168,85,247,0.3)] bg-black rounded-lg w-full h-full object-contain"
        />
    );
};
