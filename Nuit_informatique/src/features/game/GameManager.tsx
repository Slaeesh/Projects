import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { GAME_CONFIG } from '../../config/gameConfig';

export const GameManager: React.FC = () => {
    const [day, setDay] = useState(1);
    const [showStartModal, setShowStartModal] = useState(true);
    const {
        turn,
        phase,
        applyTurn,
        partyPlanned,
        startGame
    } = useGameStore();

    useEffect(() => {
        if (phase === 'executing') {
            setDay(1);
            const interval = setInterval(() => {
                setDay(prev => {
                    if (prev >= 30) {
                        clearInterval(interval);
                        return 30;
                    }
                    return prev + 1;
                });
            }, GAME_CONFIG.TURN_DURATION_MS / 30);

            return () => clearInterval(interval);
        } else if (phase === 'planning') {
            setDay(1); // Reset day when back to planning
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'executing' && day === 30) {
            applyTurn();
        }
    }, [day, phase, applyTurn]);

    const handleStart = () => {
        startGame();
        setShowStartModal(false);
    };

    if (showStartModal) {
        return (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
                <div className="bg-retro-dark border-4 border-retro-gray p-8 max-w-2xl text-center">
                    <h1 className="text-2xl text-retro-green mb-4">VILLAGE NUMÉRIQUE RÉSISTANT</h1>
                    <p className="mb-4 text-sm leading-6 text-white">
                        Vous êtes nommé directeur d'un établissement. Microsoft arrête le support de Windows 10.
                        <br /><br />
                        Vous avez 4 ans (48 mois) pour passer au "Village Numérique Résistant".
                        <br /><br />
                        🎯 <strong>Pour gagner :</strong> Baissez la dépendance aux Big Tech à 0% tout en gardant le bonheur des étudiants le plus haut possible !
                    </p>
                    <button
                        onClick={handleStart}
                        className="bg-retro-green text-black px-6 py-3 border-b-4 border-r-4 border-green-800 hover:brightness-110 active:border-0 active:translate-y-1 font-bold"
                    >
                        COMMENCER LA MISSION
                    </button>
                </div>
            </div>
        );
    }

    if (phase !== 'executing') return null;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-center">
                <h2 className="text-4xl text-retro-green mb-4 animate-pulse">
                    {partyPlanned ? "SOIRÉE EN COURS..." : `MOIS ${turn + 1}`}
                </h2>
                <div className="text-2xl text-white">
                    JOUR {day} / 30
                </div>
            </div>
        </div>
    );
};

