import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useScale } from '../../contexts/ScaleContext';
import { GAME_CONFIG } from '../../config/gameConfig';

// Import PNJ1 Assets
import pnj1IdleDown from '../../assets/pnj1/pnj1idledown_ndl.png';
import pnj1IdleUp from '../../assets/pnj1/pnj1idleup_ndl.png';
import pnj1IdleLeft from '../../assets/pnj1/pnj1idleleft_ndl.png';
import pnj1IdleRight from '../../assets/pnj1/pnj1idleright_ndl.png';
import pnj1Down1 from '../../assets/pnj1/pnj1down1_ndl.png';
import pnj1Down2 from '../../assets/pnj1/pnj1down2_ndl3.png';
import pnj1Up1 from '../../assets/pnj1/pnj1up1_ndl.png';
import pnj1Up2 from '../../assets/pnj1/pnj1up2_ndl.png';
import pnj1Left1 from '../../assets/pnj1/pnj1left1_ndl.png';
import pnj1Left2 from '../../assets/pnj1/pnj1left2_ndl.png';
import pnj1Right1 from '../../assets/pnj1/pnj1right1_ndl.png';
import pnj1Right2 from '../../assets/pnj1/pnj1right2_ndl.png';
import pnj1Dance1 from '../../assets/pnj1/pnj1dance1_ndl.png';
import pnj1Dance2 from '../../assets/pnj1/pnj1dance2_ndl.png';

// Import PNJ2 Assets
import pnj2IdleDown from '../../assets/pnj2/pnj2idledown_ndl.png';
import pnj2IdleUp from '../../assets/pnj2/pnj2idleup_ndl.png';
import pnj2IdleLeft from '../../assets/pnj2/pnj2idleleft_ndl.png';
import pnj2IdleRight from '../../assets/pnj2/pnj2idleright_ndl.png';
import pnj2Down1 from '../../assets/pnj2/pnj2down1_ndl.png';
import pnj2Down2 from '../../assets/pnj2/pnj2down2_ndl.png';
import pnj2Up1 from '../../assets/pnj2/pnj2up1_ndl.png';
import pnj2Up2 from '../../assets/pnj2/pnj2up2_ndl.png';
import pnj2Left1 from '../../assets/pnj2/pnj2left1_ndl.png';
import pnj2Left2 from '../../assets/pnj2/pnj2left2_ndl.png';
import pnj2Right1 from '../../assets/pnj2/pnj2right1_ndl.png';
import pnj2Right2 from '../../assets/pnj2/pnj2right2_ndl.png';
import pnj2Dance1 from '../../assets/pnj2/pnj2dance1_ndl.png';
import pnj2Dance2 from '../../assets/pnj2/pnj2dance2_ndl.png';

// Import PNJ3 Assets
import pnj3IdleDown from '../../assets/pnj3/pnj3idledown_ndl.png';
import pnj3IdleUp from '../../assets/pnj3/pnj3idleup_ndl.png';
import pnj3IdleLeft from '../../assets/pnj3/pnj3idleleft_ndl.png';
import pnj3IdleRight from '../../assets/pnj3/pnj3idleright_ndl.png';
import pnj3Down1 from '../../assets/pnj3/pnj3down1_ndl.png';
import pnj3Down2 from '../../assets/pnj3/pnj3down2_ndl.png';
import pnj3Up1 from '../../assets/pnj3/pnj3up1_ndl.png';
import pnj3Up2 from '../../assets/pnj3/pnj3up2_ndl.png';
import pnj3Left1 from '../../assets/pnj3/pnj3left1_ndl.png';
import pnj3Left2 from '../../assets/pnj3/pnj3left2_ndl.png';
import pnj3Right1 from '../../assets/pnj3/pnj3right1_ndl.png';
import pnj3Right2 from '../../assets/pnj3/pnj3right2_ndl.png';
import pnj3Dance1 from '../../assets/pnj3/pnj3dance1_ndl.png';
import pnj3Dance2 from '../../assets/pnj3/pnj3dance2_ndl.png';

type Direction = 'down' | 'up' | 'left' | 'right';
type Position = { x: number, y: number };
type PNJType = 1 | 2 | 3;

// Sprite sets per type
const SPRITES = {
    1: {
        idleDown: pnj1IdleDown, idleUp: pnj1IdleUp, idleLeft: pnj1IdleLeft, idleRight: pnj1IdleRight,
        down1: pnj1Down1, down2: pnj1Down2, up1: pnj1Up1, up2: pnj1Up2,
        left1: pnj1Left1, left2: pnj1Left2, right1: pnj1Right1, right2: pnj1Right2,
        dance1: pnj1Dance1, dance2: pnj1Dance2
    },
    2: {
        idleDown: pnj2IdleDown, idleUp: pnj2IdleUp, idleLeft: pnj2IdleLeft, idleRight: pnj2IdleRight,
        down1: pnj2Down1, down2: pnj2Down2, up1: pnj2Up1, up2: pnj2Up2,
        left1: pnj2Left1, left2: pnj2Left2, right1: pnj2Right1, right2: pnj2Right2,
        dance1: pnj2Dance1, dance2: pnj2Dance2
    },
    3: {
        idleDown: pnj3IdleDown, idleUp: pnj3IdleUp, idleLeft: pnj3IdleLeft, idleRight: pnj3IdleRight,
        down1: pnj3Down1, down2: pnj3Down2, up1: pnj3Up1, up2: pnj3Up2,
        left1: pnj3Left1, left2: pnj3Left2, right1: pnj3Right1, right2: pnj3Right2,
        dance1: pnj3Dance1, dance2: pnj3Dance2
    }
};

// Define Zones (in percentages)
const ZONES = {
    CORRIDOR: { x: 4, y: 42, w: 92, h: 14 },
    CLASS1: { x: 4, y: 5.6, w: 28, h: 31.5 },
    CLASS2: { x: 36, y: 5.6, w: 28, h: 31.5 },
    MYSTERY1: { x: 68, y: 5.6, w: 28, h: 31.5 },
    MYSTERY2: { x: 4, y: 62, w: 28, h: 31.5 },
    ADMIN: { x: 36, y: 62, w: 28, h: 31.5 },
    SERVER: { x: 68, y: 62, w: 28, h: 31.5 },
};

const TOP_ROOMS = ['CLASS1', 'CLASS2', 'MYSTERY1'];
const BOTTOM_ROOMS = ['MYSTERY2', 'ADMIN', 'SERVER'];

const getDoorPosition = (zoneName: string): Position => {
    const zone = ZONES[zoneName as keyof typeof ZONES];
    const centerX = zone.x + zone.w / 2;

    if (TOP_ROOMS.includes(zoneName)) {
        // Door is inside the room, not at the boundary
        return { x: centerX, y: zone.y + zone.h - 5 };
    } else if (BOTTOM_ROOMS.includes(zoneName)) {
        // Door is inside the room, not at the boundary
        return { x: centerX, y: zone.y + 5 };
    }
    return { x: centerX, y: zone.y + zone.h / 2 };
};

const getRandomZone = (): string => {
    const zoneNames = Object.keys(ZONES);
    return zoneNames[Math.floor(Math.random() * zoneNames.length)];
};

const getRandomPointInZone = (zoneName: string): Position => {
    const zone = ZONES[zoneName as keyof typeof ZONES];

    // Top rooms need extra padding at bottom (wall area)
    const bottomPadding = TOP_ROOMS.includes(zoneName) ? 20 : 3;
    // Bottom rooms need extra padding at top (wall area)  
    const topPadding = BOTTOM_ROOMS.includes(zoneName) ? 8 : 3;

    return {
        x: zone.x + 3 + Math.random() * (zone.w - 6),
        y: zone.y + topPadding + Math.random() * (zone.h - topPadding - bottomPadding)
    };
};

// Taille de base du PNJ (référence à 1080p)
const BASE_PNJ_SIZE = 44; // pixels

interface Mission {
    targetZone: string;
    type: 'repair' | 'install' | 'migration';
}

interface PNJCharacterProps {
    type: PNJType;
    initialZone?: string;
    role: 'student' | 'admin';
    mission?: Mission;
}

const PNJCharacter: React.FC<PNJCharacterProps> = ({ type, initialZone, role, mission }) => {
    const { scale } = useScale();
    // Compute initial position only once using lazy state initialization
    const initialPosRef = useRef<Position | null>(null);
    if (!initialPosRef.current) {
        const zone = initialZone || (role === 'admin' ? 'ADMIN' : getRandomZone());
        initialPosRef.current = getRandomPointInZone(zone);
    }

    const [position, setPosition] = useState<Position>(initialPosRef.current);
    const [direction, setDirection] = useState<Direction>('down');
    const [isMoving, setIsMoving] = useState(false);
    const [frame, setFrame] = useState(0);

    const waypointsRef = useRef<Position[]>([]);
    const speedRef = useRef(0.15 + Math.random() * 0.1);

    // Track mission state: 'idle' | 'going_to_target' | 'working' | 'returning'
    const missionStateRef = useRef<'idle' | 'going_to_target' | 'working' | 'returning'>('idle');

    const sprites = SPRITES[type];
    const discoActive = useGameStore(state => state.discoActive);
    const phase = useGameStore(state => state.phase);

    // Check if PNJ is in corridor (disco zone)
    const isInCorridor = position.x >= ZONES.CORRIDOR.x &&
        position.x <= ZONES.CORRIDOR.x + ZONES.CORRIDOR.w &&
        position.y >= ZONES.CORRIDOR.y &&
        position.y <= ZONES.CORRIDOR.y + ZONES.CORRIDOR.h;

    const getZone = (pos: Position): string => {
        for (const [name, zone] of Object.entries(ZONES)) {
            if (pos.x >= zone.x && pos.x <= zone.x + zone.w &&
                pos.y >= zone.y && pos.y <= zone.y + zone.h) {
                return name;
            }
        }
        return 'CORRIDOR';
    };

    // Animation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setFrame(prev => (prev === 0 ? 1 : 0));
        }, 200);
        return () => clearInterval(interval);
    }, []);

    // Initial Movement Trigger
    useEffect(() => {
        const delay = 1000 + Math.random() * 2000;
        const timer = setTimeout(() => {
            if (initialPosRef.current) {
                pickNewDestination(initialPosRef.current);
            }
        }, delay);
        return () => clearTimeout(timer);
    }, []);

    // Admin Fast Work Animation during Execution Phase
    useEffect(() => {
        if (role === 'admin') {
            if (phase === 'executing') {
                // Speed up significantly during execution
                speedRef.current = GAME_CONFIG.ADMIN_SPEED;

                // If we have a mission and we are idle, start it
                if (mission && missionStateRef.current === 'idle') {
                    missionStateRef.current = 'going_to_target';
                    pickNewDestination(position);
                } else if (!mission) {
                    // Just panic in the room if no mission
                    pickNewDestination(position);
                }
            } else {
                // Reset speed and state
                speedRef.current = 0.15 + Math.random() * 0.1;
                missionStateRef.current = 'idle';
                waypointsRef.current = [];
                setIsMoving(false);
            }
        }
    }, [phase, role, mission]);

    const pickNewDestination = (currentPos: Position) => {
        const currentZone = getZone(currentPos);
        let targetZone: string;

        // MISSION LOGIC FOR ADMINS
        if (role === 'admin' && phase === 'executing' && mission) {
            if (missionStateRef.current === 'going_to_target') {
                targetZone = mission.targetZone;
            } else if (missionStateRef.current === 'returning') {
                targetZone = 'ADMIN';
            } else {
                // Working or Idle, stay put or random move in zone
                targetZone = currentZone;
            }
        }
        // STANDARD LOGIC
        else if (role === 'admin') {
            targetZone = 'ADMIN';
        } else {
            // Students logic
            if (currentZone === 'CORRIDOR') {
                if (Math.random() > 0.3) {
                    const classrooms = ['CLASS1', 'CLASS2', 'MYSTERY1', 'MYSTERY2'];
                    targetZone = classrooms[Math.floor(Math.random() * classrooms.length)];
                } else {
                    targetZone = 'CORRIDOR';
                }
            } else {
                targetZone = 'CORRIDOR';
            }
        }

        const waypoints: Position[] = [];
        const corridorCenterY = ZONES.CORRIDOR.y + ZONES.CORRIDOR.h / 2;

        if (currentZone === targetZone) {
            waypoints.push(getRandomPointInZone(targetZone));
        } else {
            // Pathfinding: Room -> Door -> Corridor -> Door -> Room
            if (currentZone !== 'CORRIDOR') {
                const currentDoor = getDoorPosition(currentZone);
                waypoints.push(currentDoor);
                waypoints.push({ x: currentDoor.x, y: corridorCenterY });
            }

            if (targetZone !== 'CORRIDOR') {
                const targetDoor = getDoorPosition(targetZone);
                waypoints.push({ x: targetDoor.x, y: corridorCenterY });
                waypoints.push(targetDoor);
            }

            waypoints.push(getRandomPointInZone(targetZone));
        }

        waypointsRef.current = waypoints;
        moveToNextWaypoint(currentPos);
    };

    const moveToNextWaypoint = (currentPos: Position) => {
        if (waypointsRef.current.length === 0) {
            setIsMoving(false);

            // MISSION STATE MACHINE
            if (role === 'admin' && phase === 'executing' && mission) {
                if (missionStateRef.current === 'going_to_target') {
                    // Arrived at target, start working
                    missionStateRef.current = 'working';
                    setTimeout(() => {
                        missionStateRef.current = 'returning';
                        pickNewDestination(currentPos);
                    }, 500); // Work for 500ms
                    return;
                } else if (missionStateRef.current === 'returning') {
                    // Returned to base, done
                    missionStateRef.current = 'idle';
                    return;
                }
            }

            // Standard wait time
            const waitTime = (role === 'admin' && phase === 'executing')
                ? 100
                : 2000 + Math.random() * 4000;

            setTimeout(() => {
                // Only pick new dest if we are not in a specific mission state that handles itself
                if (missionStateRef.current !== 'working') {
                    pickNewDestination(currentPos);
                }
            }, waitTime);
            return;
        }

        const nextWaypoint = waypointsRef.current[0];
        const diffX = nextWaypoint.x - currentPos.x;
        const diffY = nextWaypoint.y - currentPos.y;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            setDirection(diffX > 0 ? 'right' : 'left');
        } else {
            setDirection(diffY > 0 ? 'down' : 'up');
        }
        setIsMoving(true);
    };

    // Movement Loop
    useEffect(() => {
        const moveInterval = setInterval(() => {
            setPosition(current => {
                if (!isMoving || waypointsRef.current.length === 0) return current;

                const target = waypointsRef.current[0];
                const dx = target.x - current.x;
                const dy = target.y - current.y;

                let moveX = 0;
                let moveY = 0;
                const currentSpeed = speedRef.current;

                if (Math.abs(dx) > currentSpeed) {
                    moveX = Math.sign(dx) * currentSpeed;
                    setDirection(moveX > 0 ? 'right' : 'left');
                } else if (Math.abs(dy) > currentSpeed) {
                    moveY = Math.sign(dy) * currentSpeed;
                    setDirection(moveY > 0 ? 'down' : 'up');
                } else {
                    waypointsRef.current.shift();
                    const reachedPos = { x: target.x, y: target.y };

                    setTimeout(() => {
                        moveToNextWaypoint(reachedPos);
                    }, 100);

                    return reachedPos;
                }

                return {
                    x: current.x + moveX,
                    y: current.y + moveY
                };
            });
        }, 50);

        return () => clearInterval(moveInterval);
    }, [isMoving]);

    // Select Sprite
    let sprite = sprites.idleDown;

    // Dance animation when disco is active and in corridor (Only students dance)
    if (discoActive && isInCorridor && role === 'student') {
        sprite = frame === 0 ? sprites.dance1 : sprites.dance2;
    } else if (!isMoving) {
        switch (direction) {
            case 'up': sprite = sprites.idleUp; break;
            case 'left': sprite = sprites.idleLeft; break;
            case 'right': sprite = sprites.idleRight; break;
            case 'down': default: sprite = sprites.idleDown; break;
        }
    } else {
        switch (direction) {
            case 'up': sprite = frame === 0 ? sprites.up1 : sprites.up2; break;
            case 'left': sprite = frame === 0 ? sprites.left1 : sprites.left2; break;
            case 'right': sprite = frame === 0 ? sprites.right1 : sprites.right2; break;
            case 'down': default: sprite = frame === 0 ? sprites.down1 : sprites.down2; break;
        }
    }

    const pnjSize = BASE_PNJ_SIZE * scale * 2; // *2 pour compenser l'ancien scale(2)
    const shadowWidth = 24 * scale;
    const shadowHeight = 8 * scale;

    return (
        <div
            className="absolute pointer-events-none z-20 transition-transform duration-50"
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
                imageRendering: 'pixelated'
            }}
        >
            <img 
                src={sprite} 
                alt="PNJ" 
                style={{ width: pnjSize, height: pnjSize }}
                className="object-contain" 
            />
            <div 
                className="absolute left-1/2 transform -translate-x-1/2 bg-black opacity-20 rounded-full blur-[1px]" 
                style={{ width: shadowWidth, height: shadowHeight, bottom: 1 }}
            />
            {role === 'admin' && (
                <div 
                    className="absolute left-1/2 transform -translate-x-1/2 text-white px-1 rounded border border-red-500"
                    style={{ 
                        top: -16 * scale, 
                        fontSize: 8 * scale, 
                        backgroundColor: 'rgb(127, 29, 29)' 
                    }}
                >
                    ADMIN
                </div>
            )}
        </div>
    );
};

// Manager component that spawns multiple PNJs
export const PNJManager: React.FC = () => {
    const pnjCount = GAME_CONFIG.PNJ_COUNT;
    const adminCount = GAME_CONFIG.ADMIN_COUNT;

    // Get game state for missions
    const computers = useGameStore(state => state.computers);
    const pendingMigrations = useGameStore(state => state.pendingMigrations);
    const pendingLocalServer = useGameStore(state => state.pendingLocalServer);

    // Stable PNJ definitions
    const studentTypes = React.useMemo(() =>
        Array.from({ length: pnjCount }).map(() => (Math.floor(Math.random() * 3) + 1) as PNJType),
        [pnjCount]
    );

    const adminTypes = React.useMemo(() =>
        Array.from({ length: adminCount }).map(() => (Math.floor(Math.random() * 3) + 1) as PNJType),
        [adminCount]
    );

    // Calculate missions
    const missions: Mission[] = [];

    // 1. Computer Actions
    computers.forEach(pc => {
        if (pc.pendingAction) {
            let zone = 'CLASS1';
            if (pc.classroomId === 2) zone = 'CLASS2';
            if (pc.classroomId === 3) zone = 'MYSTERY1';
            if (pc.classroomId === 4) zone = 'MYSTERY2';

            missions.push({ targetZone: zone, type: 'repair' });
        }
    });

    // 2. Migrations
    pendingMigrations.forEach(classId => {
        let zone = 'CLASS1';
        if (classId === 2) zone = 'CLASS2';
        if (classId === 3) zone = 'MYSTERY1';
        if (classId === 4) zone = 'MYSTERY2';
        missions.push({ targetZone: zone, type: 'migration' });
    });

    // 3. Local Server
    if (pendingLocalServer) {
        missions.push({ targetZone: 'SERVER', type: 'install' });
    }

    return (
        <>
            {/* Students */}
            {studentTypes.map((type, i) => (
                <PNJCharacter
                    key={`student-${i}`}
                    type={type}
                    initialZone="CORRIDOR"
                    role="student"
                />
            ))}

            {/* Admins */}
            {adminTypes.map((type, i) => {
                // Assign mission if available
                const mission = missions[i] || undefined;

                return (
                    <PNJCharacter
                        key={`admin-${i}`}
                        type={type}
                        initialZone="ADMIN"
                        role="admin"
                        mission={mission}
                    />
                );
            })}
        </>
    );
};

// Keep default export for backwards compatibility
export { PNJCharacter };
