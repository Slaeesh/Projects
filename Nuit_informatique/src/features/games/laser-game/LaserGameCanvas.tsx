import React, { useRef, useEffect } from 'react';
import type { LaserGameState, Virus, Player, Projectile, Particle, FloatingText } from './types';

interface Props {
    gameState: LaserGameState;
    onShoot: (x: number, y: number) => void;
}

export const LaserGameCanvas: React.FC<Props> = ({ gameState, onShoot }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
        const { x, y, size } = player;

        // PC Monitor Body
        ctx.fillStyle = '#e5e7eb'; // Gray-200
        ctx.fillRect(x - size / 2, y - size / 2, size, size * 0.8);

        // Screen
        ctx.fillStyle = '#1f2937'; // Gray-800
        ctx.fillRect(x - size / 2 + 4, y - size / 2 + 4, size - 8, size * 0.8 - 8);

        // Stand
        ctx.fillStyle = '#9ca3af'; // Gray-400
        ctx.fillRect(x - 5, y + size / 2 - 5, 10, 10);
        ctx.fillRect(x - 15, y + size / 2 + 5, 30, 5);

        // Face on Screen (Cute PC)
        ctx.fillStyle = '#4ade80'; // Green-400
        ctx.fillRect(x - 10, y - 5, 5, 5); // Left Eye
        ctx.fillRect(x + 5, y - 5, 5, 5); // Right Eye
        ctx.fillRect(x - 5, y + 5, 10, 2); // Mouth

        // Health Bar
        const hpWidth = 40;
        ctx.fillStyle = 'black';
        ctx.fillRect(x - hpWidth / 2, y - size / 2 - 15, hpWidth, 8);
        ctx.fillStyle = player.hp > 1 ? '#22c55e' : '#ef4444';
        ctx.fillRect(x - hpWidth / 2 + 1, y - size / 2 - 14, (hpWidth - 2) * (player.hp / player.maxHp), 6);
    };

    const drawVirus = (ctx: CanvasRenderingContext2D, virus: Virus) => {
        const { x, y } = virus;

        if (virus.type === 'tank') {
            // Big Red Spiky Virus (Increased Size)
            const size = 35; // Was 20
            ctx.fillStyle = '#ef4444'; // Red-500
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            // Inner gradient/detail
            const gradient = ctx.createRadialGradient(x, y, 5, x, y, size);
            gradient.addColorStop(0, '#fca5a5');
            gradient.addColorStop(1, '#ef4444');
            ctx.fillStyle = gradient;
            ctx.fill();

            // Spikes
            for (let i = 0; i < 12; i++) { // More spikes
                const angle = (i / 12) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
                ctx.lineTo(x + Math.cos(angle) * (size + 15), y + Math.sin(angle) * (size + 15));
                ctx.strokeStyle = '#991b1b'; // Red-800
                ctx.lineWidth = 6;
                ctx.stroke();
            }
            // Face
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(x - 15, y - 10); ctx.lineTo(x - 5, y); ctx.lineTo(x - 15, y + 5); // Left eye
            ctx.moveTo(x + 15, y - 10); ctx.lineTo(x + 5, y); ctx.lineTo(x + 15, y + 5); // Right eye
            ctx.fill();

            ctx.fillRect(x - 10, y + 15, 20, 5); // Mouth
        } else if (virus.type === 'speedy') {
            // Small Yellow Fast Virus (Increased Size)
            const size = 20; // Was ~10
            ctx.fillStyle = '#facc15'; // Yellow-400
            ctx.beginPath();
            ctx.moveTo(x, y - size - 10);
            ctx.lineTo(x + size + 5, y + size);
            ctx.lineTo(x - size - 5, y + size);
            ctx.fill();

            // Wings
            ctx.fillStyle = '#fef08a'; // Yellow-200
            ctx.beginPath();
            ctx.ellipse(x - size - 5, y, 15, 8, Math.PI / 4, 0, Math.PI * 2);
            ctx.ellipse(x + size + 5, y, 15, 8, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = 'black';
            ctx.fillRect(x - 5, y - 5, 4, 4);
            ctx.fillRect(x + 1, y - 5, 4, 4);
        } else {
            // Basic Green Bug (Increased Size)
            const size = 25; // Was 20 (rect)
            ctx.fillStyle = '#22c55e'; // Green-500
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            // Body segments
            ctx.strokeStyle = '#14532d';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - size, y); ctx.lineTo(x + size, y);
            ctx.stroke();

            // Legs
            ctx.strokeStyle = '#14532d'; // Green-900
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x - size + 5, y); ctx.lineTo(x - size - 10, y - 15);
            ctx.moveTo(x - size + 5, y); ctx.lineTo(x - size - 10, y + 15);
            ctx.moveTo(x + size - 5, y); ctx.lineTo(x + size + 10, y - 15);
            ctx.moveTo(x + size - 5, y); ctx.lineTo(x + size + 10, y + 15);
            ctx.stroke();

            // Eyes
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(x - 8, y - 8, 4, 0, Math.PI * 2);
            ctx.arc(x + 8, y - 8, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw HP bar
        if (virus.maxHp > 1) {
            ctx.fillStyle = 'black';
            ctx.fillRect(virus.x - 20, virus.y - 45, 40, 6);
            ctx.fillStyle = 'red';
            ctx.fillRect(virus.x - 20, virus.y - 45, 40 * (virus.hp / virus.maxHp), 6);
        }
    };

    const drawProjectile = (ctx: CanvasRenderingContext2D, proj: Projectile) => {
        ctx.fillStyle = proj.owner === 'player' ? '#60a5fa' : '#ef4444'; // Blue for player, Red for enemy
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
        ctx.fill();
    };

    const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    };

    const drawFloatingText = (ctx: CanvasRenderingContext2D, text: FloatingText) => {
        ctx.globalAlpha = text.life;
        ctx.fillStyle = text.color;
        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text.text, text.x, text.y);
        ctx.globalAlpha = 1.0;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Screen Shake
            ctx.save();
            if (gameState.shakeIntensity > 0) {
                const dx = (Math.random() - 0.5) * gameState.shakeIntensity;
                const dy = (Math.random() - 0.5) * gameState.shakeIntensity;
                ctx.translate(dx, dy);
            }

            // Draw Player
            if (gameState.player) {
                drawPlayer(ctx, gameState.player);
            }

            // Draw viruses
            gameState.viruses.forEach(v => drawVirus(ctx, v));

            // Draw Projectiles
            gameState.projectiles.forEach(p => drawProjectile(ctx, p));

            // Draw Particles
            if (gameState.particles) {
                gameState.particles.forEach(p => drawParticle(ctx, p));
            }

            // Draw Floating Texts
            if (gameState.floatingTexts) {
                gameState.floatingTexts.forEach(t => drawFloatingText(ctx, t));
            }

            ctx.restore(); // Restore shake transform

            // Glitch Effect (Post-processing)
            if (gameState.glitchIntensity > 0) {
                const intensity = gameState.glitchIntensity;
                const numSlices = Math.floor(intensity * 10);
                for (let i = 0; i < numSlices; i++) {
                    const y = Math.random() * canvas.height;
                    const h = Math.random() * 50 + 10;
                    const offset = (Math.random() - 0.5) * intensity * 50;

                    // Draw slice offset
                    ctx.drawImage(canvas, 0, y, canvas.width, h, offset, y, canvas.width, h);
                }

                // Color overlay for glitch
                ctx.save();
                ctx.globalCompositeOperation = 'overlay';
                ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.3})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }
        };

        render();
    }, [gameState]);

    const handleClick = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        onShoot(x, y);
    };

    return (
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            className="absolute top-0 left-0 w-full h-full cursor-crosshair"
            onClick={handleClick}
        />
    );
};
