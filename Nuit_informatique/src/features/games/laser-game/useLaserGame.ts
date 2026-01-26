import { useState, useEffect, useRef, useCallback } from 'react';
import type { LaserGameState, Virus, VirusType, GamePhase, Projectile, Particle } from './types';
import LaserIntro from '../../../assets/Laser_Intro.mp3';
import LaserLoop from '../../../assets/Laser_Loop.mp3';
import LaserShoot from '../../../assets/laser_shoot.wav';

const SPAWN_RATE = 1500; // Slower spawn for standoff
const BONUS_DURATION = 15;
const BONUS_SPAWN_RATE = 400;
const PLAYER_SPEED = 5;
const PROJECTILE_SPEED = 7;
const ENEMY_PROJECTILE_SPEED = 3;

export const useLaserGame = () => {
    const [gameState, setGameState] = useState<LaserGameState>({
        phase: 'intro',
        score: 0,
        timeLeft: 0,
        viruses: [],
        combo: 0,
        player: { x: window.innerWidth / 2, y: window.innerHeight - 50, size: 40, speed: PLAYER_SPEED, hp: 3, maxHp: 3 },
        projectiles: [],
        particles: [],
        floatingTexts: [],
        shakeIntensity: 0,
        glitchIntensity: 0
    });

    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const spawnTimerRef = useRef<number>(0);
    const keysPressed = useRef<{ [key: string]: boolean }>({});
    const virusesSpawnedRef = useRef(0);
    const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);

    // Audio Refs
    const introAudioRef = useRef<HTMLAudioElement | null>(null);
    const loopAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        introAudioRef.current = new Audio(LaserIntro);
        loopAudioRef.current = new Audio(LaserLoop);
        loopAudioRef.current.loop = true;

        const playLoop = () => {
            loopAudioRef.current?.play().catch(e => console.error("Audio play failed", e));
        };

        introAudioRef.current.addEventListener('ended', playLoop);

        return () => {
            introAudioRef.current?.removeEventListener('ended', playLoop);
            introAudioRef.current?.pause();
            loopAudioRef.current?.pause();
        };
    }, []);

    const startGame = useCallback(() => {
        setGameState({
            phase: 'playing',
            score: 0,
            timeLeft: 0,
            viruses: [],
            combo: 0,
            player: { x: window.innerWidth / 2, y: window.innerHeight - 50, size: 40, speed: PLAYER_SPEED, hp: 3, maxHp: 3 },
            projectiles: [],
            particles: [],
            floatingTexts: [],
            shakeIntensity: 0,
            glitchIntensity: 0
        });
        spawnTimerRef.current = 0;
        virusesSpawnedRef.current = 0;
        setGameResult(null);

        // Start Music
        if (introAudioRef.current) {
            introAudioRef.current.currentTime = 0;
            const playPromise = introAudioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Intro playback failed:", error);
                });
            }
        }
        if (loopAudioRef.current) {
            // Warm up loop audio to prevent autoplay issues
            // Use volume 0 to avoid audio glitches during warmup
            loopAudioRef.current.volume = 0;
            loopAudioRef.current.play().then(() => {
                loopAudioRef.current?.pause();
                loopAudioRef.current!.currentTime = 0;
                loopAudioRef.current!.volume = 1; // Restore volume for actual playback
            }).catch(e => console.error("Audio warmup failed", e));
        }
    }, []);

    const stopMusic = useCallback(() => {
        introAudioRef.current?.pause();
        loopAudioRef.current?.pause();
    }, []);

    const spawnVirus = useCallback(() => {
        const id = Math.random().toString(36).substr(2, 9);
        const type: VirusType = Math.random() > 0.8 ? 'tank' : (Math.random() > 0.8 ? 'speedy' : 'basic');

        // Spawn at top
        const x = Math.random() * (window.innerWidth - 40) + 20;
        const y = -50;

        const virus: Virus = {
            id,
            x,
            y,
            type,
            hp: type === 'tank' ? 3 : 1,
            maxHp: type === 'tank' ? 3 : 1,
            speed: type === 'speedy' ? 3 : (type === 'tank' ? 1 : 2),
            vx: 0,
            vy: 0
        };

        setGameState(prev => ({
            ...prev,
            viruses: [...prev.viruses, virus]
        }));
    }, []);

    const createExplosion = (x: number, y: number, color: string) => {
        const particles: Particle[] = [];
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            particles.push({
                id: Math.random().toString(36).substr(2, 9),
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                maxLife: 1.0,
                color,
                size: Math.random() * 4 + 2
            });
        }
        return particles;
    };

    const addFloatingText = (x: number, y: number, text: string, color: string) => {
        return {
            id: Math.random().toString(36).substr(2, 9),
            x,
            y,
            text,
            color,
            life: 1.0,
            maxLife: 1.0,
            vy: 1 + Math.random() // Float up
        };
    };

    const shoot = useCallback((targetX: number, targetY: number) => {
        setGameState(prev => {
            if (prev.phase !== 'playing' && prev.phase !== 'bonus') return prev;

            // Play Shoot Sound
            const audio = new Audio(LaserShoot);
            audio.volume = 0.4;
            audio.play().catch(e => console.error("SFX play failed", e));

            const dx = targetX - prev.player.x;
            const dy = targetY - prev.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const vx = (dx / dist) * PROJECTILE_SPEED;
            const vy = (dy / dist) * PROJECTILE_SPEED;

            const projectile: Projectile = {
                id: Math.random().toString(36).substr(2, 9),
                x: prev.player.x,
                y: prev.player.y - 20,
                vx,
                vy,
                owner: 'player',
                damage: 1
            };

            return {
                ...prev,
                projectiles: [...prev.projectiles, projectile],
                shakeIntensity: Math.min(prev.shakeIntensity + 2, 10) // Small shake on shoot
            };
        });
    }, []);

    const MAX_VIRUSES_NORMAL = 20;

    const update = useCallback((time: number) => {
        if (lastTimeRef.current !== 0) {
            const deltaTime = time - lastTimeRef.current;

            setGameState(prev => {
                if (prev.phase === 'game_over' || prev.phase === 'intro') return prev;

                let newPhase: GamePhase = prev.phase;
                let newTimeLeft = prev.timeLeft;
                let newViruses = [...prev.viruses];
                let newPlayer = { ...prev.player };
                let newProjectiles = [...prev.projectiles];
                let newParticles = [...prev.particles];
                let newFloatingTexts = [...prev.floatingTexts];
                let newScore = prev.score;
                let newCombo = prev.combo;
                let newShake = prev.shakeIntensity * 0.9; // Decay shake
                if (newShake < 0.5) newShake = 0;
                let newGlitch = prev.glitchIntensity * 0.95; // Decay glitch
                if (newGlitch < 0.01) newGlitch = 0;

                // Player Movement (X-axis only)
                if (keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || keysPressed.current['q'] || keysPressed.current['Q']) newPlayer.x -= newPlayer.speed;
                if (keysPressed.current['ArrowRight'] || keysPressed.current['d'] || keysPressed.current['D']) newPlayer.x += newPlayer.speed;
                newPlayer.x = Math.max(20, Math.min(window.innerWidth - 20, newPlayer.x));

                // Spawning
                spawnTimerRef.current += deltaTime;
                const currentSpawnRate = prev.phase === 'bonus' ? BONUS_SPAWN_RATE : SPAWN_RATE;
                if (spawnTimerRef.current > currentSpawnRate) {
                    if (prev.phase === 'playing' && virusesSpawnedRef.current < MAX_VIRUSES_NORMAL) {
                        spawnVirus();
                        virusesSpawnedRef.current++;
                        spawnTimerRef.current = 0;
                    } else if (prev.phase === 'bonus') {
                        spawnVirus();
                        spawnTimerRef.current = 0;
                    }
                }

                // Virus AI
                newViruses = newViruses.map(v => {
                    // Move towards player X
                    let vx = 0;
                    if (v.x < newPlayer.x - 10) vx = v.speed * 0.5;
                    else if (v.x > newPlayer.x + 10) vx = -v.speed * 0.5;

                    // Maintain Y distance (top half of screen)
                    let vy = 0;
                    const targetY = 100 + Math.random() * 200; // Random height in top area
                    if (v.y < targetY) vy = v.speed;
                    else if (v.y > targetY + 10) vy = -v.speed * 0.5;

                    // Random Shoot
                    if (Math.random() < 0.005) { // Low chance per frame
                        const dx = newPlayer.x - v.x;
                        const dy = newPlayer.y - v.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const pvx = (dx / dist) * ENEMY_PROJECTILE_SPEED;
                        const pvy = (dy / dist) * ENEMY_PROJECTILE_SPEED;

                        newProjectiles.push({
                            id: Math.random().toString(36).substr(2, 9),
                            x: v.x,
                            y: v.y + 20,
                            vx: pvx,
                            vy: pvy,
                            owner: 'enemy',
                            damage: 1
                        });
                    }

                    return { ...v, x: v.x + vx, y: v.y + vy };
                });

                // Particles
                newParticles = newParticles.filter(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= 0.02;
                    return p.life > 0;
                });

                // Floating Texts
                newFloatingTexts = newFloatingTexts.filter(t => {
                    t.y -= t.vy;
                    t.life -= 0.015;
                    return t.life > 0;
                });

                // Projectiles Movement & Collision
                newProjectiles = newProjectiles.filter(p => {
                    p.x += p.vx;
                    p.y += p.vy;

                    // Out of bounds
                    if (p.x < 0 || p.x > window.innerWidth || p.y < 0 || p.y > window.innerHeight) return false;

                    if (p.owner === 'player') {
                        // Check collision with viruses
                        let hit = false;
                        newViruses = newViruses.filter(v => {
                            if (hit) return true; // Only hit one
                            // Increased hitbox size for larger viruses
                            const hitRadius = v.type === 'tank' ? 40 : (v.type === 'speedy' ? 25 : 30);
                            const dist = Math.sqrt((v.x - p.x) ** 2 + (v.y - p.y) ** 2);
                            if (dist < hitRadius) {
                                hit = true;
                                v.hp -= p.damage;
                                if (v.hp <= 0) {
                                    const points = v.type === 'tank' ? 30 : (v.type === 'speedy' ? 20 : 10);
                                    newScore += points + (newCombo * 5);
                                    newCombo++;
                                    // Spawn particles
                                    const color = v.type === 'tank' ? '#ef4444' : (v.type === 'speedy' ? '#facc15' : '#22c55e');
                                    newParticles.push(...createExplosion(v.x, v.y, color));
                                    // Add Floating Text
                                    newFloatingTexts.push(addFloatingText(v.x, v.y, `+${points}`, '#fff'));
                                    if (newCombo > 1) {
                                        newFloatingTexts.push(addFloatingText(v.x, v.y - 20, `${newCombo}x COMBO`, '#fbbf24'));
                                    }
                                    // Shake
                                    newShake = Math.min(newShake + 5, 20);
                                    return false; // Remove virus
                                }
                                return true;
                            }
                            return true;
                        });
                        return !hit; // Remove projectile if hit
                    } else {
                        // Check collision with player
                        const dist = Math.sqrt((newPlayer.x - p.x) ** 2 + (newPlayer.y - p.y) ** 2);
                        if (dist < newPlayer.size / 2) {
                            newPlayer.hp -= p.damage;
                            // Shake & Glitch on hit
                            newShake = Math.min(newShake + 15, 30);
                            newGlitch = Math.min(newGlitch + 0.5, 1.0);

                            if (newPlayer.hp <= 0) {
                                newPhase = 'game_over';
                                if (prev.phase === 'bonus') {
                                    setGameResult('win'); // Died in bonus = Win
                                } else {
                                    setGameResult('loss'); // Died before bonus = Loss
                                }
                                stopMusic(); // Stop music on loss/win
                                // Save score
                                const stored = localStorage.getItem('nird_laser_scores');
                                const scores = stored ? JSON.parse(stored) : [];
                                scores.push({ name: 'Player', score: newScore, date: Date.now() });
                                localStorage.setItem('nird_laser_scores', JSON.stringify(scores));
                            }
                            return false; // Remove projectile
                        }
                        return true;
                    }
                });

                // Phase Transition
                if (prev.phase === 'playing' && virusesSpawnedRef.current >= MAX_VIRUSES_NORMAL && newViruses.length === 0) {
                    newPhase = 'bonus';
                    newTimeLeft = BONUS_DURATION;
                    setGameResult('win'); // Reached bonus round = Win
                }
                if (prev.phase === 'bonus') {
                    newTimeLeft -= deltaTime / 1000;
                    if (newTimeLeft <= 0) {
                        newPhase = 'game_over';
                        stopMusic(); // Stop music on win/end
                        // Save score
                        const stored = localStorage.getItem('nird_laser_scores');
                        const scores = stored ? JSON.parse(stored) : [];
                        scores.push({ name: 'Player', score: newScore, date: Date.now() });
                        localStorage.setItem('nird_laser_scores', JSON.stringify(scores));
                    }
                }

                return {
                    ...prev,
                    phase: newPhase,
                    timeLeft: newTimeLeft,
                    viruses: newViruses,
                    player: newPlayer,
                    projectiles: newProjectiles,
                    particles: newParticles,
                    floatingTexts: newFloatingTexts,
                    score: newScore,
                    combo: newCombo,
                    shakeIntensity: newShake,
                    glitchIntensity: newGlitch
                };
            });
        }
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(update);
    }, [spawnVirus, stopMusic]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current);
    }, [update]);

    // Reset spawn count on start
    useEffect(() => {
        if (gameState.phase === 'playing') {
            virusesSpawnedRef.current = 0;
            setGameResult(null);
        }
    }, [gameState.phase]);

    // Cleanup music on unmount
    useEffect(() => {
        return () => {
            stopMusic();
        };
    }, [stopMusic]);

    return {
        gameState,
        startGame,
        shoot,
        setGameState,
        gameResult
    };
};
