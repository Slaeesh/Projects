import React, { useState, useEffect, useRef } from 'react';
import popUpSound from '../assets/pop_up.mp3';

interface TutorialContent {
    title: string;
    steps: string[];
}

const TUTORIALS: Record<string, TutorialContent> = {
    classroom: {
        title: "SALLE DE CLASSE",
        steps: [
            "🖥️ Chaque PC peut être sous Windows ou Linux",
            "🐧 Linux = moins de dépendance aux logiciels propriétaires (réduit la dépendance de 0.5%)  ",
            "🦠 Les PC Windows peuvent être infectés par des virus",
            "🔧 Cliquez sur un PC pour le passer en Linux",
            "💡 Migrez progressivement vers Linux pour réduire les coûts"
        ]
    },
    resources: {
        title: "RESSOURCES",
        steps: [
            "💰 Budget : Votre argent disponible pour les actions",
            "😊 Bonheur : Satisfaction des étudiants (objectif : le maintenir haut)",
            "⚠️ Dépendance : Votre dépendance aux logiciels propriétaires",
            "🎯 Objectif : Réduire la dépendance tout en gardant le bonheur élevé"
        ]
    },
    actions: {
        title: "ACTIONS",
        steps: [
            "🔄 Chaque mois, planifiez vos actions avant de passer au suivant",
            "🖥️ Installez des serveurs locaux pour héberger vos propres services",
            "📚 Formez les étudiants à l'utilisation de Linux",
            "🛡️ Maintenez vos systèmes pour éviter les problèmes"
        ]
    },
    server: {
        title: "SALLE SERVEUR",
        steps: [
            "🖥️ Les serveurs locaux réduisent votre dépendance cloud",
            "💵 Chaque serveur a un coût d'installation et de maintenance",
            "⚡ Plus de serveurs = plus d'autonomie",
            "🔧 Attention à la maintenance régulière !"
        ]
    },
    chatbot: {
        title: "TERMINAL CHAT'BRUTI",
        steps: [
            "💬 Posez des questions sur le jeu ou le logiciel libre",
            "🎮 Commandes spéciales : /snake, /clear, /rainbow",
            "🐍 Tapez 'ennui' pour jouer au Snake !",
            "🌈 Mode rainbow pour un terminal plus fun"
        ]
    },
    general: {
        title: "NIRD VILLAGE",
        steps: [
            "🎓 Vous êtes directeur d'un établissement scolaire",
            "🎯 Objectif : migrez vers le logiciel libre !",
            "📅 Le jeu se déroule mois par mois",
            "😊 Gardez les étudiants heureux pendant la transition",
            "💰 Gérez votre budget intelligemment",
            "🏆 VICTOIRE : Atteignez 0% de dépendance Big Tech !"
        ]
    }
};

interface TutorialButtonProps {
    tutorialKey: keyof typeof TUTORIALS;
    className?: string;
}

export const TutorialButton: React.FC<TutorialButtonProps> = ({ tutorialKey, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const tutorial = TUTORIALS[tutorialKey];
    const popUpAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        popUpAudioRef.current = new Audio(popUpSound);
        popUpAudioRef.current.volume = 0.4;
    }, []);

    // Play sound when modal opens
    useEffect(() => {
        if (isOpen && popUpAudioRef.current) {
            popUpAudioRef.current.currentTime = 0;
            popUpAudioRef.current.play().catch(() => {});
        }
    }, [isOpen]);

    if (!tutorial) return null;

    return (
        <>
            {/* Tutorial Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className={`w-6 h-6 rounded-full bg-retro-dark border-2 border-retro-green text-retro-green 
                           flex items-center justify-center text-sm font-bold
                           hover:bg-retro-green hover:text-retro-dark transition-all
                           shadow-[0_0_8px_rgba(74,222,128,0.3)] hover:shadow-[0_0_12px_rgba(74,222,128,0.6)]
                           ${className}`}
                title="Aide"
            >
                ?
            </button>

            {/* Tutorial Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-retro-dark border-4 border-retro-green p-6 max-w-md w-full mx-4 shadow-[0_0_30px_rgba(74,222,128,0.4)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-retro-green text-xl font-bold mb-4 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                            <span className="text-2xl">📖</span>
                            {tutorial.title}
                        </h3>

                        <div className="space-y-3 mb-6">
                            {tutorial.steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="text-white font-mono text-sm bg-black/30 p-2 rounded border-l-2 border-retro-green"
                                >
                                    {step}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full px-6 py-2 bg-retro-green text-retro-dark font-bold border-2 border-green-800 
                                       hover:bg-green-400 active:translate-y-1 transition-all uppercase"
                        >
                            COMPRIS !
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
