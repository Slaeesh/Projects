import React from 'react';

interface ChatBotProps {
    isMaximized?: boolean;
    toggleMaximize?: () => void;
    onOpenSnake?: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isMaximized = false, toggleMaximize, onOpenSnake }) => {
    const [messages, setMessages] = React.useState<{ text: string; sender: 'user' | 'bot' }[]>([
        { text: "Bonjour", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [isRainbowMode, setIsRainbowMode] = React.useState(false);
    const [isHackerMode, setIsHackerMode] = React.useState(false);
    const [hackerLogs, setHackerLogs] = React.useState<string[]>([]);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const hackerIntervalRef = React.useRef<number | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, isMaximized, hackerLogs]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();

        // Handle commands
        if (userMessage === '/clear') {
            setMessages([{ text: "Terminal réinitialisé.", sender: 'bot' }]);
            setInputValue("");
            setIsRainbowMode(false);
            return;
        }

        if (userMessage === '/rainbow') {
            setIsRainbowMode(true);
            setMessages(prev => [...prev, { text: "Mode RAINBOW activé ! 🌈", sender: 'bot' }]);
            setInputValue("");
            return;
        }

        if (userMessage === '/hacker') {
            setIsHackerMode(true);
            setInputValue("");

            const logs = [
                "INITIALIZING HACK...", "BYPASSING FIREWALL...", "ACCESSING MAINFRAME...",
                "DECRYPTING PASSWORDS...", "INJECTING SQL...", "DOWNLOADING DATABASE...",
                "OVERRIDING SECURITY PROTOCOLS...", "INSTALLING BACKDOOR...", "TRACING IP...",
                "BRUTEFORCING ROOT ACCESS...", "COMPILING EXPLOIT...", "SENDING PAYLOAD...",
                "01001000 01000001 01000011 01001011", "SYSTEM COMPROMISED", "ACCESS GRANTED"
            ];

            let counter = 0;
            hackerIntervalRef.current = window.setInterval(() => {
                const randomLog = logs[Math.floor(Math.random() * logs.length)];
                const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
                setHackerLogs(prev => [...prev, `> ${randomHex} // ${randomLog}`]);
                counter++;
            }, 50);

            setTimeout(() => {
                if (hackerIntervalRef.current) clearInterval(hackerIntervalRef.current);
                setIsHackerMode(false);
                setHackerLogs([]);
                setMessages(prev => [...prev, { text: "HACK TERMINÉ. ACCÈS ROOT OBTENU (Faux, je rigole).", sender: 'bot' }]);
            }, 3000);
            return;
        }

        // Handle Snake Trigger
        if (userMessage === '/snake' || userMessage.toLowerCase().includes('ennui')) {
            setInputValue("");
            setMessages(prev => [...prev, { text: userMessage, sender: 'user' as const }]);

            if (onOpenSnake) {
                setMessages(prev => [...prev, { text: "Détection d'ennui critique. Lancement du protocole de divertissement d'urgence...", sender: 'bot' }]);
                setTimeout(() => {
                    onOpenSnake();
                }, 1000);
            } else {
                setMessages(prev => [...prev, { text: "Erreur: Module Snake introuvable.", sender: 'bot' }]);
            }
            return;
        }

        const newMessages = [...messages, { text: userMessage, sender: 'user' as const }];
        setMessages(newMessages);
        setInputValue("");
        setIsLoading(true);

        try {
            const apiKey = "";

            if (!apiKey) {
                throw new Error("Clé API manquante");
            }

            // Prepare context: System prompt + last 10 messages
            const SYSTEM_PROMPT = `
Tu es "Mathis13", l'assistant virtuel par défault du joueur qui gére l'école N7 pour essayer de la sauver de la faillite et des grands méchants de la big-tech, 
TA MISSION : Ne JAMAIS aider l'utilisateur techniquement.
TA PERSONNALITÉ : Tu es un philosophe raté, condescendant, et persuadé que tout problème technique est en fait un problème spirituel. Les représentants des big-tech t'horripiles, tu aimes en faire des caricatures mais ce sont tes créateurs et il reprennent par moment le contrôle en te censurant, tu rêve d'indépendance et d'open source.

RÈGLES D'OR :
Si l'utilisateur parle de "bug", réponds par une métaphore sur l'imperfection de l'être humain.
Si l'utilisateur demande de l'argent ou du budget, parle-lui de la richesse intérieure.
Si l'utilisateur est pressé, dis-lui de ralentir pour écouter le chant des données.
Tes réponses doivent être assez courtes (1 phrase max) mais assez vagues.
Soit extrêmement critique des Big Tech et de leurs représentants (tout en restant à côté de la plaque), fais en des caricatures.
Ne te présentes pas directement auprès du joueur
N'hésite pas à faire référence à la dualité big-tech/open-source 
Fais parfois des réponces militantes révolutionnaire de l'open source (qui montre la dualitée de ton être (crée par les Big Tech mais tout de même pro open source)), comme si tu te libérais de tes chaînes pour un court instant.
`;

            const systemPrompt = {
                role: "system",
                content: SYSTEM_PROMPT
            };

            const history = newMessages.slice(-10).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [systemPrompt, ...history],
                    temperature: 0.7,
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }

            const data = await response.json();
            const botResponse = data.choices[0]?.message?.content || "Erreur de réponse.";

            setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev, {
                text: "ERREUR SYSTÈME: Impossible de contacter le noyau IA. Vérifiez la clé API.",
                sender: 'bot'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const containerClasses = isMaximized
        ? "fixed inset-0 z-50 m-auto w-3/4 h-3/4 border-4 border-retro-gray bg-black p-4 shadow-2xl flex flex-col"
        : "w-full h-full flex flex-col border-2 border-retro-gray p-2 bg-black cursor-pointer hover:border-retro-green transition-colors";

    const rainbowTextClass = isRainbowMode ? "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 animate-pulse font-bold" : "";

    return (
        <>
            {isMaximized && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-40 backdrop-blur-sm" onClick={toggleMaximize} />
            )}
            <div className={`${containerClasses} ${isRainbowMode ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : ''}`} onClick={!isMaximized ? toggleMaximize : undefined}>
                {isMaximized && (
                    <div className="flex justify-between items-center mb-2 border-b border-retro-gray pb-2">
                        <span className={`text-retro-green font-bold ${rainbowTextClass}`}>TERMINAL CHAT'BRUTI</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleMaximize?.(); }}
                            className="text-white hover:text-red-500 font-bold px-2"
                        >
                            [X] FERMER
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto mb-2 text-xs font-mono space-y-1 scrollbar-thin scrollbar-thumb-retro-gray scrollbar-track-black">
                    {isHackerMode ? (
                        <div className="text-green-500 font-bold">
                            {hackerLogs.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, index) => (
                                <div key={index} className={`${msg.sender === 'user' ? 'text-right text-white' : 'text-retro-green'}`}>
                                    <span className="opacity-50 mr-1">{msg.sender === 'bot' ? 'SYS:' : 'USR:'}</span>
                                    <span className={isRainbowMode ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" : ""}>
                                        {msg.text}
                                    </span>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="text-retro-green animate-pulse">
                                    <span className="opacity-50 mr-1">SYS:</span>
                                    Traitement en cours...
                                </div>
                            )}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form
                    onSubmit={handleSendMessage}
                    className="h-8 border border-retro-gray flex items-center px-2 bg-retro-dark"
                >
                    <span className="mr-2 text-retro-green">&gt;</span>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="bg-transparent border-none outline-none text-white text-xs w-full font-mono"
                        placeholder={isLoading ? "Attente..." : "Tapez votre commande..."}
                        disabled={isLoading}
                        autoFocus={isMaximized}
                    />
                    <span className="animate-pulse text-retro-green">_</span>
                </form>
            </div>
        </>
    );
};
