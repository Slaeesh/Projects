import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import macronImg from '../../assets/macron_pixel_art.png';
import popUpSound from '../../assets/pop_up.mp3';
import alerteSound from '../../assets/alerte.mp3';

export const TurnSummaryModal: React.FC = () => {
    const { showTurnSummary, turnSummary, closeTurnSummary, turn } = useGameStore();
    const popUpAudioRef = useRef<HTMLAudioElement | null>(null);
    const alerteAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        popUpAudioRef.current = new Audio(popUpSound);
        popUpAudioRef.current.volume = 0.4;
        alerteAudioRef.current = new Audio(alerteSound);
        alerteAudioRef.current.volume = 0.2;
    }, []);

    // Play sounds when modal appears
    useEffect(() => {
        if (showTurnSummary && turnSummary) {
            // Play pop-up sound
            if (popUpAudioRef.current) {
                popUpAudioRef.current.currentTime = 0;
                popUpAudioRef.current.play().catch(() => {});
            }
            // Play alert sound if collectivité territoriale appears
            if (turnSummary.specialEvent?.includes("Collectivité") && alerteAudioRef.current) {
                setTimeout(() => {
                    if (alerteAudioRef.current) {
                        alerteAudioRef.current.currentTime = 0;
                        alerteAudioRef.current.play().catch(() => {});
                    }
                }, 300);
            }
        }
    }, [showTurnSummary, turnSummary]);

    if (!showTurnSummary || !turnSummary) return null;

    return (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="bg-retro-dark border-4 border-retro-gray p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl text-retro-green mb-6 text-center border-b-2 border-retro-gray pb-4 shrink-0">
                    BILAN DU MOIS {turn}
                </h2>

                <div className="space-y-4 mb-8 overflow-y-auto pr-2 flex-grow">
                    <div className="flex justify-between items-center text-lg">
                        <span className="text-blue-300">Revenus (Parc info) :</span>
                        <span className="text-green-400 font-bold">+{turnSummary.income.toFixed(2)} €</span>
                    </div>

                    <div className="flex justify-between items-center text-lg">
                        <span className="text-orange-300">Dépenses Totales :</span>
                        <span className="text-red-400 font-bold">-{turnSummary.expenses.toFixed(2)} €</span>
                    </div>

                    {/* Détail des dépenses */}
                    <div className="bg-gray-900/50 p-3 border border-gray-700 space-y-1">
                        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Détail des dépenses</div>
                        
                        {turnSummary.officeLicenseCost > 0 && (
                            <div className="text-sm text-gray-400 flex justify-between items-center">
                                <span>Licences Microsoft Office :</span>
                                <span className="text-red-400">-{turnSummary.officeLicenseCost.toFixed(2)} €</span>
                            </div>
                        )}
                        
                        {turnSummary.dataCost > 0 && (
                            <div className="text-sm text-gray-400 flex justify-between items-center">
                                <span>Stockage Données (Cloud) :</span>
                                <span className="text-red-400">-{turnSummary.dataCost.toFixed(2)} €</span>
                            </div>
                        )}
                        
                        {turnSummary.trainingCost > 0 && (
                            <div className="text-sm text-gray-400 flex justify-between items-center">
                                <span>Formation Logiciel Libre :</span>
                                <span className="text-blue-400">-{turnSummary.trainingCost.toFixed(2)} €</span>
                            </div>
                        )}
                        
                        {turnSummary.migrationCost > 0 && (
                            <div className="text-sm text-gray-400 flex justify-between items-center">
                                <span>Migration LibreOffice :</span>
                                <span className="text-orange-400">-{turnSummary.migrationCost.toFixed(2)} €</span>
                            </div>
                        )}
                        
                        {turnSummary.partyCost > 0 && (
                            <div className="text-sm text-gray-400 flex justify-between items-center">
                                <span>Soirée Logiciel Libre :</span>
                                <span className="text-pink-400">-{turnSummary.partyCost.toFixed(2)} €</span>
                            </div>
                        )}
                        
                        {turnSummary.serverCost > 0 && (
                            <div className="text-sm text-gray-400 flex justify-between items-center">
                                <span>Installation Serveur Local :</span>
                                <span className="text-purple-400">-{turnSummary.serverCost.toFixed(2)} €</span>
                            </div>
                        )}
                        
                        {turnSummary.maintenanceCost > 0 && (
                            <div className="text-sm text-gray-400 flex justify-between items-center">
                                <span>Maintenance / Remplacement :</span>
                                <span className="text-yellow-400">-{turnSummary.maintenanceCost.toFixed(2)} €</span>
                            </div>
                        )}

                        {turnSummary.expenses === 0 && (
                            <div className="text-sm text-green-400 text-center">Aucune dépense ce mois-ci !</div>
                        )}
                    </div>

                    <div className="h-px bg-gray-600 my-2" />

                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Incidents résolus :</span>
                        <span className="text-white">{turnSummary.resolvedEvents}</span>
                    </div>

                    {turnSummary.warning && (
                        <div className="bg-red-900/50 border-2 border-red-500 p-3 mb-4 animate-pulse">
                            <p className="text-red-400 font-bold text-center text-sm uppercase tracking-widest">
                                ⚠️ {turnSummary.warning} ⚠️
                            </p>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <span className="text-red-300">Nouveaux incidents :</span>
                        <span className="text-red-400 font-bold">{turnSummary.newEvents}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-purple-300">PC Infectés/Détruits :</span>
                        <span className="text-purple-400 font-bold">{turnSummary.infectedCount}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-pink-300">Variation Bonheur :</span>
                        <span className={turnSummary.happinessChange >= 0 ? "text-green-400" : "text-red-400"}>
                            {turnSummary.happinessChange > 0 ? "+" : ""}{turnSummary.happinessChange.toFixed(2)}
                        </span>
                    </div>

                    {turnSummary.specialEvent && (
                        <div className="mt-4 p-4 bg-red-900/50 border-2 border-red-500 text-center animate-pulse flex flex-col items-center gap-4">
                            <h3 className="text-red-300 font-bold mb-1">ÉVÉNEMENT MAJEUR</h3>
                            {turnSummary.specialEvent.includes("Collectivité") && (
                                <img
                                    src={macronImg}
                                    alt="Collectivité Representative"
                                    className="w-24 h-24 pixelated border-2 border-white shadow-lg"
                                />
                            )}
                            <p className="text-white">{turnSummary.specialEvent}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={closeTurnSummary}
                    className="w-full bg-retro-green text-black px-6 py-3 border-b-4 border-r-4 border-green-800 hover:brightness-110 active:border-0 active:translate-y-1 font-bold text-lg shrink-0"
                >
                    CONTINUER
                </button>
            </div>
        </div>
    );
};
