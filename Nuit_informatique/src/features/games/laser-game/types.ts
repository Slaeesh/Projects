export type VirusType = 'basic' | 'tank' | 'speedy';

export interface Virus {
    id: string;
    x: number;
    y: number;
    type: VirusType;
    hp: number;
    maxHp: number;
    speed: number;
    vx: number;
    vy: number;
}

export interface ScoreEntry {
    name: string;
    score: number;
    date: number;
}

export type GamePhase = 'intro' | 'playing' | 'bonus_intro' | 'bonus' | 'game_over' | 'intervention';

export interface Player {
    x: number;
    y: number;
    size: number;
    speed: number;
    hp: number;
    maxHp: number;
}

export interface Projectile {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    owner: 'player' | 'enemy';
    damage: number;
}

export interface Particle {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}

export interface FloatingText {
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    life: number;
    maxLife: number;
    vy: number;
}

export interface LaserGameState {
    phase: GamePhase;
    score: number;
    timeLeft: number; // For bonus round
    viruses: Virus[];
    combo: number;
    player: Player;
    projectiles: Projectile[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    shakeIntensity: number;
    glitchIntensity: number;
}
