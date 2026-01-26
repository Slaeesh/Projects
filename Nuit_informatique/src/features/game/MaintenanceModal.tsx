import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { GAME_CONFIG } from '../../config/gameConfig';
import popUpSound from '../../assets/pop_up.mp3';

export const MaintenanceModal: React.FC = () => {
    const { isCentreOpen, toggleCentre, computers, replaceComputer, budget } = useGameStore();
    const popUpAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        popUpAudioRef.current = new Audio(popUpSound);
        popUpAudioRef.current.volume = 0.4;
    }, []);

    // Play sound when modal opens
    useEffect(() => {
        if (isCentreOpen && popUpAudioRef.current) {
            popUpAudioRef.current.currentTime = 0;
            popUpAudioRef.current.play().catch(() => {});
        }
    }, [isCentreOpen]);

    if (!isCentreOpen) return null;

    const destroyedComputers = computers.filter(c => c.status === 'destroyed');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="bg-retro-dark border-4 border-retro-gray p-8 max-w-4xl w-full shadow-2xl relative">
                <button
                    onClick={() => toggleCentre(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-white"
                >
                    [X]
                </button>

                <h2 className="text-2xl text-retro-green mb-6 text-center border-b-2 border-retro-gray pb-4">
                    CENTRE DE MAINTENANCE
                </h2>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="bg-black p-2 text-center text-sm border border-retro-gray mb-4">
                        <span className="text-gray-400">Actions de maintenance restantes : </span>
                        <span className={useGameStore.getState().maintenanceActionsUsed >= GAME_CONFIG.MAX_MAINTENANCE_ACTIONS_PER_TURN ? "text-red-500" : "text-green-500"}>
                            {GAME_CONFIG.MAX_MAINTENANCE_ACTIONS_PER_TURN - useGameStore.getState().maintenanceActionsUsed}/{GAME_CONFIG.MAX_MAINTENANCE_ACTIONS_PER_TURN}
                        </span>
                    </div>

                    {/* SECTION: OS BUGÉ (Broken PCs) */}
                    <div className="bg-gray-900 p-4 border border-gray-700">
                        <h3 className="text-lg text-white mb-2">OS Bugé (PC Obsolètes)</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Réparer le système d'exploitation ou passer sous Linux.
                        </p>
                        {computers.filter(c => c.status === 'broken').length === 0 ? (
                            <div className="text-center text-green-500 py-2 text-sm">Aucun PC à réparer.</div>
                        ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {computers.filter(c => c.status === 'broken').map(pc => (
                                    <div key={pc.id} className="flex justify-between items-center bg-black p-2 border border-red-900/30">
                                        <span className="text-red-400">PC {pc.id} (Salle {pc.classroomId})</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => useGameStore.getState().planAction(
                                                    useGameStore.getState().events.find(e => e.computerId === pc.id)?.id || '',
                                                    'repair'
                                                )}
                                                disabled={budget < GAME_CONFIG.REPAIR_COST || (!!pc.pendingAction ? false : useGameStore.getState().maintenanceActionsUsed >= GAME_CONFIG.MAX_MAINTENANCE_ACTIONS_PER_TURN)}
                                                className="px-3 py-1 bg-blue-600 text-white text-xs hover:bg-blue-500 disabled:opacity-50"
                                            >
                                                {pc.pendingAction === 'repair' ? "EN ATTENTE" : `FIX WINDOWS (${GAME_CONFIG.REPAIR_COST}€)`}
                                            </button>
                                            <button
                                                onClick={() => useGameStore.getState().planAction(
                                                    useGameStore.getState().events.find(e => e.computerId === pc.id)?.id || '',
                                                    'linux_fix'
                                                )}
                                                disabled={!!pc.pendingAction ? false : useGameStore.getState().maintenanceActionsUsed >= GAME_CONFIG.MAX_MAINTENANCE_ACTIONS_PER_TURN}
                                                className="px-3 py-1 bg-orange-600 text-white text-xs hover:bg-orange-500 disabled:opacity-50"
                                            >
                                                {pc.pendingAction === 'linux_fix' ? "EN ATTENTE" : "PASSER SOUS LINUX (📉 -10% Bonheur)"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SECTION: MIGRATION LINUX (Working Windows PCs) */}
                    <div className="bg-gray-900 p-4 border border-gray-700">
                        <h3 className="text-lg text-white mb-2">Migration Linux</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Installer Linux sur les PC fonctionnels.
                            Coût : <span className="text-green-400">Gratuit</span>
                        </p>
                        {computers.filter(c => c.status === 'working' && c.os === 'windows').length === 0 ? (
                            <div className="text-center text-gray-500 py-2 text-sm">Aucun PC éligible.</div>
                        ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {computers.filter(c => c.status === 'working' && c.os === 'windows').map(pc => (
                                    <div key={pc.id} className="flex justify-between items-center bg-black p-2 border border-blue-900/30">
                                        <span className="text-blue-400">PC {pc.id} (Salle {pc.classroomId})</span>
                                        <button
                                            onClick={() => useGameStore.getState().toggleLinux(pc.id)}
                                            disabled={!!pc.pendingAction ? false : useGameStore.getState().maintenanceActionsUsed >= GAME_CONFIG.MAX_MAINTENANCE_ACTIONS_PER_TURN}
                                            className="px-3 py-1 bg-orange-600 text-white text-xs hover:bg-orange-500 disabled:opacity-50"
                                        >
                                            {pc.pendingAction === 'linux' ? "EN ATTENTE" : "INSTALLER LINUX (📉 -10% Bonheur)"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SECTION: REMPLACEMENT (Destroyed PCs) */}
                    <div className="bg-gray-900 p-4 border border-gray-700">
                        <h3 className="text-lg text-white mb-2">Remplacement Matériel</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Les ordinateurs détruits par des virus doivent être remplacés intégralement.
                            Coût unitaire : <span className="text-yellow-400">{GAME_CONFIG.REPLACEMENT_COST}€</span>
                        </p>

                        {destroyedComputers.length === 0 ? (
                            <div className="text-center text-green-500 py-4">
                                Aucun ordinateur détruit à signaler.
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {destroyedComputers.map(pc => (
                                    <div key={pc.id} className="flex justify-between items-center bg-black p-3 border border-red-900/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">☠️</span>
                                            <div>
                                                <div className="text-red-500 font-bold">PC {pc.id}</div>
                                                <div className="text-xs text-gray-500">Salle {pc.classroomId}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => replaceComputer(pc.id)}
                                            disabled={budget < GAME_CONFIG.REPLACEMENT_COST || (pc.pendingAction === 'replace' ? false : useGameStore.getState().maintenanceActionsUsed >= GAME_CONFIG.MAX_MAINTENANCE_ACTIONS_PER_TURN)}
                                            className={`px-4 py-2 text-sm border-b-2 active:border-0 active:translate-y-[2px] ${pc.pendingAction === 'replace'
                                                ? "bg-yellow-600 text-black border-yellow-800 cursor-not-allowed opacity-75"
                                                : "bg-blue-600 text-white hover:bg-blue-500 border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                }`}
                                        >
                                            {pc.pendingAction === 'replace' ? "EN ATTENTE..." : `PLANIFIER (${GAME_CONFIG.REPLACEMENT_COST}€)`}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="text-center text-xs text-gray-500 mt-4">
                        Budget actuel : <span className="text-yellow-400">{budget.toFixed(2)}€</span>
                    </div>
                </div>
            </div >
        </div >
    );
};
