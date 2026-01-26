import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import clsx from 'clsx';
import alerteSound from '../../assets/alerte.mp3';

export const EventLog: React.FC = () => {
    const { events, planAction, isCentreOpen, toggleCentre, computers } = useGameStore();
    const [showAlert, setShowAlert] = useState(false);
    const alerteAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        alerteAudioRef.current = new Audio(alerteSound);
        alerteAudioRef.current.volume = 0.2;
    }, []);

    // Show alert when new events arrive
    useEffect(() => {
        const unresolvedEvents = events.filter(e => !e.resolved);
        if (unresolvedEvents.length > 0 && !isCentreOpen) {
            // Check if we have seen these events? For now just show if not open
            // A better way is to track "new" events. 
            // Simplified: If events exist and centre is closed, show alert briefly or persistent?
            // User said: "l'alerte apparait, on peut la fermer et les retrouver dans Centre"
            setShowAlert(true);
            // Play alert sound for hack/virus events
            if (alerteAudioRef.current) {
                alerteAudioRef.current.currentTime = 0;
                alerteAudioRef.current.play().catch(() => {});
            }
        }
    }, [events.length, isCentreOpen]);

    if (showAlert && !isCentreOpen) {
        return (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
                <div className="bg-red-900/80 border-2 border-red-500 p-2 text-white shadow-xl flex items-center gap-4 animate-bounce-short backdrop-blur-sm">
                    <span className="text-sm">⚠️ PROBLÈMES DÉTECTÉS</span>
                    <button
                        onClick={() => { setShowAlert(false); toggleCentre(true); }}
                        className="bg-white/90 text-red-900 px-2 py-1 text-[10px] font-bold hover:bg-white"
                    >
                        VOIR
                    </button>
                    <button onClick={() => setShowAlert(false)} className="text-[10px] underline opacity-70 hover:opacity-100">Fermer</button>
                </div>
            </div>
        );
    }

    if (!isCentreOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-retro-dark border-4 border-retro-gray p-6 max-w-2xl w-full h-3/4 shadow-2xl flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b-2 border-retro-gray pb-2">
                    <h2 className="text-xl text-retro-green">CENTRE DE MAINTENANCE</h2>
                    <button onClick={() => toggleCentre(false)} className="text-red-500 hover:text-red-400">X FERMER</button>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                    {events.length === 0 ? (
                        <p className="text-gray-500 text-center mt-10">Aucun problème signalé.</p>
                    ) : (
                        events.map((event) => {
                            const pc = computers.find(c => c.id === event.computerId);
                            const pending = pc?.pendingAction;

                            return (
                                <div key={event.id} className="border-2 border-retro-gray p-4 bg-gray-800 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-white mb-1">{event.message}</p>
                                        {pending && (
                                            <span className="text-xs text-yellow-400">
                                                Action prévue : {pending === 'repair' ? 'Réparation' : 'Installation Linux'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => planAction(event.id, 'repair')}
                                            disabled={!!pending}
                                            className={clsx(
                                                "px-3 py-1 text-xs border transition-all",
                                                pending === 'repair' ? "bg-blue-600 text-white border-white" : "bg-blue-900 text-blue-200 border-blue-700 hover:bg-blue-800",
                                                !!pending && pending !== 'repair' && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            Réparer (100€)
                                        </button>
                                        <button
                                            onClick={() => planAction(event.id, 'linux')}
                                            disabled={!!pending}
                                            className={clsx(
                                                "px-3 py-1 text-xs border transition-all",
                                                pending === 'linux' ? "bg-retro-green text-black border-white" : "bg-green-900 text-green-200 border-green-700 hover:bg-green-800",
                                                !!pending && pending !== 'linux' && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            Installer Linux (20€)
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
