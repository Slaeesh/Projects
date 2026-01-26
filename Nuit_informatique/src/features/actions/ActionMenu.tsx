import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { GAME_CONFIG } from '../../config/gameConfig';
import popUpSound from '../../assets/pop_up.mp3';

interface Props {
    onClose: () => void;
}

export const ActionMenu: React.FC<Props> = ({ onClose }) => {
    const popUpAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize and play sound when component mounts
    useEffect(() => {
        popUpAudioRef.current = new Audio(popUpSound);
        popUpAudioRef.current.volume = 0.4;
        popUpAudioRef.current.play().catch(() => {});
    }, []);
    const {
        budget,
        planTraining,
        planMigration,
        turn,
        lastTrainingTurn,
        pendingTraining,
        pendingMigrations,
        computers,
        planParty,
        partyPlanned,
        installLocalServer,
        pendingLocalServer
    } = useGameStore();

    const turnsSinceTraining = lastTrainingTurn !== null ? turn - lastTrainingTurn : Infinity;
    const trainingCooldown = GAME_CONFIG.TRAINING_COOLDOWN_TURNS;
    const isTrainingOnCooldown = turnsSinceTraining < trainingCooldown;
    const turnsRemaining = trainingCooldown - turnsSinceTraining;

    // Check if classrooms need migration
    const class1NeedsMigration = computers.some(c => c.classroomId === 1 && c.software === 'office');
    const class2NeedsMigration = computers.some(c => c.classroomId === 2 && c.software === 'office');

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-retro-dark border-4 border-retro-gray p-6 max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 border-b-2 border-retro-gray pb-2 shrink-0">
                    <h2 className="text-xl text-retro-green">ACTIONS SPÉCIALES</h2>
                    <button onClick={onClose} className="text-red-500 hover:text-red-400">X FERMER</button>
                </div>

                <div className="bg-black p-2 text-center text-sm border border-retro-gray mb-4 shrink-0">
                    <span className="text-gray-400">Actions Spéciales restantes : </span>
                    <span className={useGameStore.getState().specialActionsUsed >= GAME_CONFIG.MAX_SPECIAL_ACTIONS_PER_TURN ? "text-red-500" : "text-green-500"}>
                        {GAME_CONFIG.MAX_SPECIAL_ACTIONS_PER_TURN - useGameStore.getState().specialActionsUsed}/{GAME_CONFIG.MAX_SPECIAL_ACTIONS_PER_TURN}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-8 overflow-y-auto pr-2">
                    {/* FORMATIONS */}
                    <div>
                        <h3 className="text-lg text-white mb-4 border-b border-gray-600">FORMATIONS</h3>
                        <div className="bg-gray-800 p-4 border border-gray-600">
                            <h4 className="font-bold text-blue-300 mb-2">Formation Logiciel Libre</h4>
                            <p className="text-xs text-gray-400 mb-4">
                                Formez votre personnel pour réduire la dépendance aux Big Tech.
                                <br />
                                <span className="text-yellow-400">Réduit la dépendance de {GAME_CONFIG.DEPENDENCY_REDUCTION_TRAINING}%</span>
                            </p>

                            {pendingTraining ? (
                                <div className="w-full bg-yellow-900/50 text-yellow-400 border border-yellow-600 px-4 py-2 text-center text-xs">
                                    FORMATION PLANIFIÉE
                                </div>
                            ) : isTrainingOnCooldown ? (
                                <div className="w-full bg-gray-700 text-gray-400 border border-gray-600 px-4 py-2 text-center text-xs">
                                    DISPONIBLE DANS {turnsRemaining} MOIS
                                </div>
                            ) : (
                                <button
                                    onClick={planTraining}
                                    disabled={budget < GAME_CONFIG.TRAINING_COST || useGameStore.getState().specialActionsUsed >= GAME_CONFIG.MAX_SPECIAL_ACTIONS_PER_TURN}
                                    className="w-full bg-blue-900 text-blue-200 border border-blue-700 px-4 py-2 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Planifier Formation ({GAME_CONFIG.TRAINING_COST}€)
                                </button>
                            )}
                        </div>
                    </div>

                    {/* LOGICIELS */}
                    <div>
                        <h3 className="text-lg text-white mb-4 border-b border-gray-600">LOGICIELS</h3>

                        {/* CLASSE 1 */}
                        {class1NeedsMigration && (
                            <div className="bg-gray-800 p-4 border border-gray-600 mb-4">
                                <h4 className="font-bold text-orange-300 mb-2">Migration LibreOffice (Classe 1)</h4>
                                <p className="text-xs text-gray-400 mb-4">
                                    Remplacez MS Office par LibreOffice.
                                    <br />
                                    <span className="text-green-400">Ne payez plus la licence Microsoft mensuelle !</span>
                                    <br />
                                    <span className="text-yellow-400">Réduit la dépendance de {GAME_CONFIG.DEPENDENCY_REDUCTION_SOFTWARE}%</span>
                                    <br />
                                    <span className="text-red-400">Coût temporaire en bonheur.</span>
                                </p>
                                {pendingMigrations.includes(1) ? (
                                    <div className="w-full bg-yellow-900/50 text-yellow-400 border border-yellow-600 px-4 py-2 text-center text-xs">
                                        MIGRATION PLANIFIÉE
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => planMigration(1)}
                                        disabled={budget < GAME_CONFIG.LIBREOFFICE_MIGRATION_COST || useGameStore.getState().specialActionsUsed >= GAME_CONFIG.MAX_SPECIAL_ACTIONS_PER_TURN}
                                        className="w-full bg-orange-900 text-orange-200 border border-orange-700 px-4 py-2 hover:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Planifier Migration ({GAME_CONFIG.LIBREOFFICE_MIGRATION_COST}€)
                                    </button>
                                )}
                            </div>
                        )}

                        {/* CLASSE 2 */}
                        {class2NeedsMigration && (
                            <div className="bg-gray-800 p-4 border border-gray-600">
                                <h4 className="font-bold text-orange-300 mb-2">Migration LibreOffice (Classe 2)</h4>
                                <p className="text-xs text-gray-400 mb-4">
                                    Remplacez MS Office par LibreOffice.
                                    <br />
                                    <span className="text-green-400">Ne payez plus la licence Microsoft mensuelle !</span>
                                    <br />
                                    <span className="text-yellow-400">Réduit la dépendance de {GAME_CONFIG.DEPENDENCY_REDUCTION_SOFTWARE}%</span>
                                    <br />
                                    <span className="text-red-400">Coût temporaire en bonheur.</span>
                                </p>
                                {pendingMigrations.includes(2) ? (
                                    <div className="w-full bg-yellow-900/50 text-yellow-400 border border-yellow-600 px-4 py-2 text-center text-xs">
                                        MIGRATION PLANIFIÉE
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => planMigration(2)}
                                        disabled={budget < GAME_CONFIG.LIBREOFFICE_MIGRATION_COST || useGameStore.getState().specialActionsUsed >= GAME_CONFIG.MAX_SPECIAL_ACTIONS_PER_TURN}
                                        className="w-full bg-orange-900 text-orange-200 border border-orange-700 px-4 py-2 hover:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Planifier Migration ({GAME_CONFIG.LIBREOFFICE_MIGRATION_COST}€)
                                    </button>
                                )}
                            </div>
                        )}

                        {!class1NeedsMigration && !class2NeedsMigration && (
                            <p className="text-green-400 text-center text-sm">Toutes les classes sont migrées !</p>
                        )}
                    </div>

                    {/* EVENTS */}
                    <div className="col-span-2 border-t border-gray-600 pt-4">
                        <h3 className="text-lg text-white mb-4">ÉVÉNEMENTS</h3>
                        <div className="bg-gray-800 p-4 border border-gray-600 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-pink-300 mb-1">Soirée Logiciel Libre</h4>
                                <p className="text-xs text-gray-400">
                                    Organisez une soirée pour détendre l'atmosphère.
                                    <br />
                                    <span className="text-green-400">Gain de bonheur : +{GAME_CONFIG.PARTY_HAPPINESS_GAIN}</span>
                                </p>
                            </div>
                            {partyPlanned ? (
                                <div className="bg-pink-900/50 text-pink-400 border border-pink-600 px-4 py-2 text-center text-xs">
                                    SOIRÉE PLANIFIÉE
                                </div>
                            ) : (
                                <button
                                    onClick={planParty}
                                    disabled={budget < GAME_CONFIG.PARTY_COST || useGameStore.getState().specialActionsUsed >= GAME_CONFIG.MAX_SPECIAL_ACTIONS_PER_TURN}
                                    className="bg-pink-900 text-pink-200 border border-pink-700 px-4 py-2 hover:bg-pink-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Organiser ({GAME_CONFIG.PARTY_COST}€)
                                </button>
                            )}
                        </div>
                    </div>

                    {/* INFRASTRUCTURE */}
                    <div className="col-span-2 border-t border-gray-600 pt-4">
                        <h3 className="text-lg text-white mb-4">INFRASTRUCTURE</h3>
                        <div className="bg-gray-800 p-4 border border-gray-600 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-purple-300 mb-1">Serveur Local</h4>
                                <p className="text-xs text-gray-400">
                                    Installez un serveur pour héberger les données localement.
                                    <br />
                                    <span className="text-yellow-400">Couvre {GAME_CONFIG.LOCAL_SERVER_CAPACITY} PC (Évite coût données)</span>
                                </p>
                            </div>
                            {pendingLocalServer ? (
                                <div className="bg-purple-900/50 text-purple-400 border border-purple-600 px-4 py-2 text-center text-xs">
                                    INSTALLATION PLANIFIÉE
                                </div>
                            ) : (
                                <button
                                    onClick={installLocalServer}
                                    disabled={budget < GAME_CONFIG.LOCAL_SERVER_COST || useGameStore.getState().specialActionsUsed >= GAME_CONFIG.MAX_SPECIAL_ACTIONS_PER_TURN}
                                    className="bg-purple-900 text-purple-200 border border-purple-700 px-4 py-2 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Installer ({GAME_CONFIG.LOCAL_SERVER_COST}€)
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
