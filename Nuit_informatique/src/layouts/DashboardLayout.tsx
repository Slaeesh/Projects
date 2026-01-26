import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_CONFIG } from '../config/gameConfig';
import { ChatBot } from '../features/chatbot/ChatBot';
import { ClassroomPanel } from '../features/dashboard/ClassroomPanel';
import { GameManager } from '../features/game/GameManager';
import { EventLog } from '../features/events/EventLog';
import { ActionMenu } from '../features/actions/ActionMenu';
import { GameOverModal } from '../features/game/GameOverModal';
import { TurnSummaryModal } from '../features/game/TurnSummaryModal';
import { MaintenanceModal } from '../features/game/MaintenanceModal';
import fondNdlSalles from '../assets/fond_ndl_salles.png';
import solNdl from '../assets/sol_ndl.png';
import serverImg from '../assets/server_ndl.png';
import { SnakeGame } from '../features/games/SnakeGame';
import { LaserGame } from '../features/games/LaserGame';
import { DiscoFloor } from '../components/DiscoFloor';
import { ScaleProvider, useScale } from '../contexts/ScaleContext';
import { TutorialButton } from '../components/TutorialButton';
import { VictoryModal } from '../features/game/VictoryModal';
import popUpSound from '../assets/pop_up.mp3';

// Tailles de base des serveurs (référence à 1080p)
const BASE_SERVER_WIDTH = 154; // pixels
const BASE_SERVER_HEIGHT = 176; // pixels

// Dimensions uniformisées pour toutes les salles
const ROOM_WIDTH = 28;
const ROOM_HEIGHT = 31.5;

// Couloir (référence de base)
const CORRIDOR_BASE = {
    x: 4.28,
    y: 42.69,
    width: 91.84,
    height: 14.62,
};

// Ajustement du couloir : côté gauche -4px vers la gauche
const ADJ_CORRIDOR_LEFT = -0.3;

// Couloir avec ajustement
const CORRIDOR = {
    x: CORRIDOR_BASE.x + ADJ_CORRIDOR_LEFT,
    y: CORRIDOR_BASE.y,
    width: CORRIDOR_BASE.width - ADJ_CORRIDOR_LEFT, // Compense pour garder le côté droit fixe
    height: CORRIDOR_BASE.height,
};

// Calcul automatique pour des salles parfaitement alignées et équidistantes
// Gap horizontal = (largeur_couloir - 3 × largeur_salle) / 2
const GAP_X = (CORRIDOR.width - 3 * ROOM_WIDTH) / 2; // = 3.92%

// Positions X de base alignées avec les bords du couloir
const X1_BASE = CORRIDOR.x;                              // Aligné bord gauche couloir
const X2_BASE = CORRIDOR.x + ROOM_WIDTH + GAP_X;         // Centre
const X3_BASE = CORRIDOR.x + 2 * ROOM_WIDTH + 2 * GAP_X; // Aligné bord droit couloir

// Gap vertical (basé sur position originale des salles du haut)
const GAP_Y = CORRIDOR.y - ROOM_HEIGHT - 5.46;      // ≈ 5.73%

// Positions Y de base symétriques par rapport au couloir
const Y_TOP_BASE = 5.46;
const Y_BOTTOM_BASE = CORRIDOR.y + CORRIDOR.height + GAP_Y;

// Ajustements fins (en %, ~1px ≈ 0.07% horizontal, ~1px ≈ 0.1% vertical)
const ADJ_Y_TOP = 0.2;      // +2px vers le bas pour salles du haut
const ADJ_Y_BOTTOM = -0.2;  // -2px vers le haut pour salles du bas
const ADJ_X_LEFT = 0;       // Colonne gauche (ajustement annulé)
const ADJ_X_CENTER = -0.08; // -1px vers la gauche pour colonne centre
const ADJ_X_RIGHT = -0.07;  // -1px vers la gauche pour colonne droite

// Positions finales avec ajustements
const X1 = X1_BASE + ADJ_X_LEFT;
const X2 = X2_BASE + ADJ_X_CENTER;
const X3 = X3_BASE + ADJ_X_RIGHT;
const Y_TOP = Y_TOP_BASE + ADJ_Y_TOP;
const Y_BOTTOM = Y_BOTTOM_BASE + ADJ_Y_BOTTOM;

import { PNJManager } from '../features/dashboard/PNJCharacter';

// Composant interne qui utilise le scale
const DashboardContent: React.FC = () => {
    const { budget, turn, startExecution: applyTurn, phase, toggleCentre, happiness, dependency, localServerCount, pendingLocalServer, activeMiniGame, resolveMiniGame, discoActive, stopDisco, computers, unlockedClassrooms, unlockClassroom } = useGameStore();
    const { scale, containerRef } = useScale();
    const [unlockModal, setUnlockModal] = useState<{ id: number, cost: number } | null>(null);
    const [showActions, setShowActions] = useState(false);
    const [showSnake, setShowSnake] = useState(false);
    const [isChatMaximized, setIsChatMaximized] = useState(false);
    const [showInfectionWarning, setShowInfectionWarning] = useState(false);
    const popUpAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        popUpAudioRef.current = new Audio(popUpSound);
        popUpAudioRef.current.volume = 0.4;
    }, []);

    // Play pop-up sound when unlock modal or infection warning appears
    useEffect(() => {
        if ((unlockModal || showInfectionWarning) && popUpAudioRef.current) {
            popUpAudioRef.current.currentTime = 0;
            popUpAudioRef.current.play().catch(() => {});
        }
    }, [unlockModal, showInfectionWarning]);

    // Tailles scalées des serveurs
    const serverWidth = BASE_SERVER_WIDTH * scale;
    const serverHeight = BASE_SERVER_HEIGHT * scale;

    const startExecution = () => {
        if (phase === 'planning') {
            // Check for infected PCs before proceeding
            const hasInfectedPCs = computers.some(c => c.status === 'infected');
            if (hasInfectedPCs) {
                setShowInfectionWarning(true);
                return;
            }
            applyTurn();
        }
    };
    return (
        <div className="h-screen w-screen bg-gray-900 p-4 font-pixel text-white flex gap-4 overflow-hidden relative">
            {/* Tutorial Buttons - All at z-50 level */}
            <div className="absolute top-2 left-2 z-50">
                <TutorialButton tutorialKey="general" className="w-8 h-8 text-lg" />
            </div>
            {/* Classroom Tutorial - positioned at bottom-left of CLASSE 1 */}
            <div className="absolute z-50" style={{
                left: `calc(1rem + ${X1}% + 4px - 24px)`,
                top: `calc(1rem + ${Y_TOP}% + ${ROOM_HEIGHT}% - 28px - 12px)`
            }}>
                <TutorialButton tutorialKey="classroom" />
            </div>
            {/* Server Tutorial - positioned at bottom-left of SERVEUR */}
            <div className="absolute z-50" style={{
                left: `calc(1rem + ${X3}% + 4px)`,
                top: `calc(1rem + ${Y_BOTTOM}% + ${ROOM_HEIGHT}% - 28px - 36px)`
            }}>
                <TutorialButton tutorialKey="server" />
            </div>

            {activeMiniGame?.type === 'laser' && (
                <LaserGame
                    onComplete={resolveMiniGame}
                />
            )}

            <GameManager />
            <EventLog />
            <GameOverModal />
            <TurnSummaryModal />
            <MaintenanceModal />
            <VictoryModal />
            {showActions && <ActionMenu onClose={() => setShowActions(false)} />}

            {/* LEFT PANEL - GAME AREA (75%) */}
            <div ref={containerRef} className="flex-grow shadow-lg relative">
                {/* DISCO FLOOR - Visualiseur audio DERRIÈRE le fond (activé lors de la Soirée Logiciel Libre) */}
                {discoActive && (
                    <>
                        <DiscoFloor
                            className="absolute"
                            style={{
                                left: `${CORRIDOR.x}%`,
                                top: `${CORRIDOR.y}%`,
                                width: `${CORRIDOR.width}%`,
                                height: `${CORRIDOR.height}%`,
                                zIndex: 0,
                            }}
                        />
                        {/* Bouton STOP au-dessus du fond */}
                        <button
                            onClick={stopDisco}
                            className="absolute"
                            style={{
                                left: `${CORRIDOR.x + CORRIDOR.width - 5}%`,
                                top: `${CORRIDOR.y}%`,
                                padding: '4px 8px',
                                fontSize: '10px',
                                background: 'rgba(255, 0, 100, 0.9)',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '3px',
                                zIndex: 10,
                            }}
                        >
                            ✕ STOP DISCO
                        </button>
                    </>
                )}

                {/* Image de fond PAR-DESSUS le disco */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: discoActive
                            ? `url(${fondNdlSalles})`
                            : `url(${fondNdlSalles}), url(${solNdl})`,
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 1,
                    }}
                />
                {/* === RANGÉE DU HAUT === */}

                {/* CLASSE 1 */}
                <div
                    className="absolute"
                    style={{
                        left: `${X1}%`,
                        top: `${Y_TOP}%`,
                        width: `${ROOM_WIDTH}%`,
                        height: `${ROOM_HEIGHT}%`,
                        zIndex: 2,
                    }}
                >
                    <ClassroomPanel title="CLASSE 1" classroomId={1} />
                </div>

                {/* CLASSE 2 */}
                <div
                    className="absolute"
                    style={{
                        left: `${X2}%`,
                        top: `${Y_TOP}%`,
                        width: `${ROOM_WIDTH}%`,
                        height: `${ROOM_HEIGHT}%`,
                        zIndex: 2,
                    }}
                >
                    <ClassroomPanel title="CLASSE 2" classroomId={2} />
                </div>

                {/* CLASSE 3 (MYSTERE 1) */}
                <div
                    className="absolute"
                    style={{
                        left: `${X3}%`,
                        top: `${Y_TOP}%`,
                        width: `${ROOM_WIDTH}%`,
                        height: `${ROOM_HEIGHT}%`,
                        zIndex: 2,
                    }}
                >
                    {unlockedClassrooms.includes(3) ? (
                        <ClassroomPanel title="CLASSE 3" classroomId={3} />
                    ) : (
                        <div className="w-full h-full border-4 border-retro-gray p-2 flex items-center justify-center bg-black/50">
                            {dependency <= GAME_CONFIG.DEPENDENCY_THRESHOLD_CLASSROOM_3 ? (
                                <button
                                    onClick={() => setUnlockModal({ id: 3, cost: GAME_CONFIG.UNLOCK_COST_CLASSROOM_3 })}
                                    className="text-4xl text-green-400 hover:scale-125 transition-transform animate-pulse"
                                    title={`Débloquer la Classe 3 (${GAME_CONFIG.UNLOCK_COST_CLASSROOM_3}€)`}
                                >
                                    +
                                </button>
                            ) : (
                                <span className="text-4xl text-gray-600" title={`Nécessite dépendance <= ${GAME_CONFIG.DEPENDENCY_THRESHOLD_CLASSROOM_3}%`}>?</span>
                            )}
                        </div>
                    )}
                </div>

                {/* === COULOIR === */}
                <div
                    className="absolute border-dashed p-2 pointer-events-none"
                    style={{
                        left: `${CORRIDOR.x}%`,
                        top: `${CORRIDOR.y}%`,
                        width: `${CORRIDOR.width}%`,
                        height: `${CORRIDOR.height}%`,
                        zIndex: 2,
                    }}
                />

                {/* === RANGÉE DU BAS === */}

                {/* CLASSE 4 (MYSTERE 2) */}
                <div
                    className="absolute"
                    style={{
                        left: `${X1}%`,
                        top: `${Y_BOTTOM}%`,
                        width: `${ROOM_WIDTH}%`,
                        height: `${ROOM_HEIGHT}%`,
                        zIndex: 2,
                    }}
                >
                    {unlockedClassrooms.includes(4) ? (
                        <ClassroomPanel title="CLASSE 4" classroomId={4} />
                    ) : (
                        <div className="w-full h-full border-4 border-retro-gray p-2 flex items-center justify-center bg-black/50">
                            {dependency <= GAME_CONFIG.DEPENDENCY_THRESHOLD_CLASSROOM_4 ? (
                                <button
                                    onClick={() => setUnlockModal({ id: 4, cost: GAME_CONFIG.UNLOCK_COST_CLASSROOM_4 })}
                                    className="text-4xl text-green-400 hover:scale-125 transition-transform animate-pulse"
                                    title={`Débloquer la Classe 4 (${GAME_CONFIG.UNLOCK_COST_CLASSROOM_4}€)`}
                                >
                                    +
                                </button>
                            ) : (
                                <span className="text-4xl text-gray-600" title={`Nécessite dépendance <= ${GAME_CONFIG.DEPENDENCY_THRESHOLD_CLASSROOM_4}%`}>?</span>
                            )}
                        </div>
                    )}
                </div>

                {/* ADMIN */}
                <div
                    className="absolute p-2"
                    style={{
                        left: `${X2}%`,
                        top: `${Y_BOTTOM}%`,
                        width: `${ROOM_WIDTH}%`,
                        height: `${ROOM_HEIGHT}%`,
                        zIndex: 2,
                    }}
                >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-retro-dark px-2 text-xs text-retro-green border border-retro-gray">
                        ADMIN
                    </div>

                </div>

                {/* SERVEUR */}
                <div
                    className="absolute p-2"
                    style={{
                        left: `${X3}%`,
                        top: `${Y_BOTTOM}%`,
                        width: `${ROOM_WIDTH}%`,
                        height: `${ROOM_HEIGHT}%`,
                        zIndex: 2,
                    }}
                >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-retro-dark px-2 text-xs text-retro-green border border-retro-gray">
                        SERVEUR
                    </div>
                    <div className="h-full flex flex-col justify-end p-2 relative">
                        {localServerCount === 0 && !pendingLocalServer ? (
                            <span className="text-gray-600 text-xs text-center w-full">[VIDE]</span>
                        ) : (
                            <>
                                {/* Rangée du haut (serveurs 5-8) - affichée derrière */}
                                {(() => {
                                    const totalServers = localServerCount + (pendingLocalServer ? 1 : 0);
                                    const topRowCount = Math.max(0, Math.min(4, totalServers - 4));
                                    if (topRowCount === 0) return null;

                                    return (
                                        <div className="grid grid-cols-4 gap-2 justify-items-center mb-[-20px] relative z-0">
                                            {Array.from({ length: topRowCount }).map((_, i) => {
                                                const serverIndex = 4 + i;
                                                const isPending = serverIndex >= localServerCount;
                                                return (
                                                    <img
                                                        key={`top-${i}`}
                                                        src={serverImg}
                                                        alt={isPending ? "Installation en cours..." : "Serveur Local"}
                                                        style={{ width: serverWidth, height: serverHeight }}
                                                        className={`object-contain ${isPending ? 'opacity-50 animate-pulse' : ''}`}
                                                        title={isPending ? "Installation en cours..." : "Serveur Local"}
                                                    />
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                                {/* Rangée du bas (serveurs 1-4) - affichée devant */}
                                <div className="grid grid-cols-4 gap-2 justify-items-center relative z-10">
                                    {Array.from({ length: Math.min(4, localServerCount + (pendingLocalServer ? 1 : 0)) }).map((_, i) => {
                                        const isPending = i >= localServerCount;
                                        return (
                                            <img
                                                key={`bottom-${i}`}
                                                src={serverImg}
                                                alt={isPending ? "Installation en cours..." : "Serveur Local"}
                                                style={{ width: serverWidth, height: serverHeight }}
                                                className={`object-contain ${isPending ? 'opacity-50 animate-pulse' : ''}`}
                                                title={isPending ? "Installation en cours..." : "Serveur Local"}
                                            />
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* PNJ Characters - Inside left panel for correct positioning */}
                <PNJManager />
            </div>

            {/* RIGHT PANEL - SIDEBAR (25%) */}
            <div className="w-1/4 flex flex-col gap-4">
                {/* Resources */}
                <div className="border-4 border-retro-gray p-4 bg-retro-dark relative">
                    <h2 className="text-center text-retro-green mb-4 border-b-2 border-retro-gray pb-2">RESSOURCES</h2>
                    <div className="flex justify-between mb-2">
                        <span>BUDGET:</span>
                        <span className="text-yellow-400">{budget.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between mb-4">
                        <span>MOIS:</span>
                        <span className="text-blue-400">{turn}</span>
                    </div>

                    {/* Happiness Bar */}
                    <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                            <span>BONHEUR</span>
                            <span className={happiness < 30 ? "text-red-500" : "text-green-400"}>{happiness.toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2">
                            <div
                                className={`h-full transition-all duration-500 ${happiness < 30 ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${happiness}%` }}
                            />
                        </div>
                    </div>

                    {/* Dependency Bar */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>DÉPENDANCE BIG TECH</span>
                            <span className="text-purple-400">{dependency.toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2">
                            <div
                                className="h-full bg-purple-500 transition-all duration-500"
                                style={{ width: `${dependency}%` }}
                            />
                        </div>
                    </div>
                    {/* Tutorial Button */}
                    <div className="absolute top-2 right-2">
                        <TutorialButton tutorialKey="resources" />
                    </div>
                </div>

                {/* Actions */}
                <div className="border-4 border-retro-gray p-4 bg-retro-dark flex-grow flex flex-col gap-4 relative">
                    <h2 className="text-xs text-gray-400 mb-2">ACTIONS</h2>
                    <button
                        onClick={() => toggleCentre(true)}
                        className="bg-retro-green text-black p-3 border-b-4 border-r-4 border-green-800 active:border-0 active:translate-y-1 hover:brightness-110 transition-all"
                    >
                        CENTRE MAINTENANCE
                    </button>
                    <button
                        onClick={() => setShowActions(true)}
                        className="bg-blue-600 text-white p-3 border-b-4 border-r-4 border-blue-800 active:border-0 active:translate-y-1 hover:brightness-110 transition-all"
                    >
                        ACTIONS SPÉCIALES
                    </button>
                    <button
                        className="bg-retro-gray text-white p-2 border-b-4 border-r-4 border-black hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                        onClick={startExecution}
                        disabled={phase !== 'planning'}
                    >
                        {phase === 'executing' ? 'EN COURS...' : (turn === 0 ? 'MOIS SUIVANT' : 'MOIS SUIVANT')}
                    </button>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {/* Buttons removed as per request */}
                    </div>
                    {/* Tutorial Button */}
                    <div className="absolute top-2 right-2">
                        <TutorialButton tutorialKey="actions" />
                    </div>
                </div>

                {/* Chatbot */}
                <div className="h-1/3 border-4 border-retro-gray bg-retro-dark relative">
                    <div className="absolute -top-3 left-4 bg-retro-dark px-2 text-xs text-retro-green border border-retro-gray z-10">
                        CHATBOX
                    </div>
                    <ChatBot
                        isMaximized={isChatMaximized}
                        toggleMaximize={() => setIsChatMaximized(!isChatMaximized)}
                        onOpenSnake={() => setShowSnake(true)}
                    />
                </div>
            </div>

            {/* Modals */}
            {showSnake && <SnakeGame onClose={() => setShowSnake(false)} />}

            {/* Unlock Confirmation Modal */}
            {unlockModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-retro-dark border-4 border-green-600 p-6 max-w-md w-full shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                        <h3 className="text-green-500 text-xl font-bold mb-4 text-center uppercase tracking-widest">
                            NOUVELLE SALLE
                        </h3>
                        <p className="text-white text-center mb-6 font-mono">
                            Débloquer la Classe {unlockModal.id} ?
                            <br /><br />
                            <span className="text-yellow-400">Coût : {unlockModal.cost}€</span>
                            <br />
                            <span className="text-blue-400">Bonus : +{GAME_CONFIG.NEW_CLASSROOM_PC_COUNT} PC (Linux)</span>
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    if (budget >= unlockModal.cost) {
                                        unlockClassroom(unlockModal.id);
                                        setUnlockModal(null);
                                    }
                                }}
                                disabled={budget < unlockModal.cost}
                                className="px-6 py-2 bg-green-600 text-white font-bold border-2 border-green-800 hover:bg-green-500 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                DÉBLOQUER
                            </button>
                            <button
                                onClick={() => setUnlockModal(null)}
                                className="px-6 py-2 bg-gray-600 text-white font-bold border-2 border-gray-800 hover:bg-gray-500 active:translate-y-1 transition-all"
                            >
                                ANNULER
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Infection Warning Modal */}
            {showInfectionWarning && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-retro-dark border-4 border-red-600 p-6 max-w-md w-full shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                        <h3 className="text-red-500 text-xl font-bold mb-4 text-center uppercase tracking-widest">
                            ⚠️ ATTENTION ⚠️
                        </h3>
                        <p className="text-white text-center mb-6 font-mono">
                            Un PC est actuellement infecté. Passer au mois suivant le détruira.
                            <br /><br />
                            <span className="text-red-400 font-bold">Êtes-vous sûr de vouloir continuer ?</span>
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    setShowInfectionWarning(false);
                                    applyTurn();
                                }}
                                className="px-6 py-2 bg-red-600 text-white font-bold border-2 border-red-800 hover:bg-red-500 active:translate-y-1 transition-all"
                            >
                                OUI
                            </button>
                            <button
                                onClick={() => setShowInfectionWarning(false)}
                                className="px-6 py-2 bg-gray-600 text-white font-bold border-2 border-gray-800 hover:bg-gray-500 active:translate-y-1 transition-all"
                            >
                                NON
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Composant principal qui fournit le contexte de scale
export const DashboardLayout: React.FC = () => {
    return (
        <ScaleProvider>
            <DashboardContent />
        </ScaleProvider>
    );
};
