import { useEffect, useRef, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import musicDiscoUrl from '../assets/music_disco2.mp3';

// Configuration du visualiseur
const CONFIG = {
    gridWidth: 34,      // +2 (1 à gauche, 1 à droite)
    gridDepth: 8,       // +2 vers le bas
    tileSize: 25,
    gap: 4,
    kickThreshold: 0.95,
    // Multiplieur pour réduire combien de lignes sont considérées "hautes"
    amplitudeMultiplier: 1.7,
    // Seuil minimal d'amplitude pour qu'une colonne affecte les tuiles
    amplitudeThreshold: 0.06,
    // Exposant >1 creuse les creux (petites amplitudes → beaucoup plus faibles),
    // valeurs typiques : 1.5..3.0 (plus grand => creux plus profonds)
    amplifyExponent: 2.0,
    // Boost supplémentaire pour mieux marquer les pics lorsque la courbe est déjà élevée
    peakBoost: 1.4,
    // (supprimé) troughBoost removed because we now use exponent >1 to deepen troughs
    colors: {
        base: 0x111122,
        neonGreen: 0x39FF14,
        cyberCyan: 0x00FFD5,
        laserBlue: 0x00C3FF,
        electricIndigo: 0x6E0DD0,
        neonPurple: 0xB900FF,
        miamiPink: 0xFF0090,
        flash: 0xFFFFFF
    }
};

interface DiscoFloorProps {
    className?: string;
    style?: React.CSSProperties;
}

export const DiscoFloor: React.FC<DiscoFloorProps> = ({ className, style }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const tilesRef = useRef<PIXI.Sprite[][]>([]);
    const floorContainerRef = useRef<PIXI.Container | null>(null);

    // Audio refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const waveformArrayRef = useRef<Uint8Array | null>(null);
    const audioStartedRef = useRef(false);

    const startAudio = useCallback(async () => {
        if (audioStartedRef.current || audioContextRef.current) return;

        try {
            console.log('🎵 Soirée Logiciel Libre - Disco!');

            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioCtx;

            const audioElement = new Audio(musicDiscoUrl);
            audioElement.crossOrigin = "anonymous";
            audioElement.loop = true;
            audioElementRef.current = audioElement;

            const source = audioCtx.createMediaElementSource(audioElement);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;

            source.connect(analyser);
            analyser.connect(audioCtx.destination);

            analyserRef.current = analyser;
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
            waveformArrayRef.current = new Uint8Array(analyser.fftSize);

            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }

            await audioElement.play();
            audioStartedRef.current = true;
            console.log('🎵 Disco music playing!');
        } catch (err) {
            console.error("Erreur audio:", err);
        }
    }, []);

    // Démarrer l'audio automatiquement au montage
    useEffect(() => {
        // Essayer de démarrer immédiatement
        startAudio();

        // Fallback: si le navigateur bloque, démarrer au premier clic
        const handleInteraction = () => {
            if (!audioStartedRef.current) {
                startAudio();
            }
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
    }, [startAudio]);

    useEffect(() => {
        if (!containerRef.current) return;

        let destroyed = false;
        let cleanupResize: (() => void) | undefined;

        const initPixi = async () => {
            if (destroyed) return;

            const app = new PIXI.Application();

            await app.init({
                background: 0x050505,
                backgroundAlpha: 0,
                antialias: true,
                width: containerRef.current!.clientWidth + 60, // +30px de chaque côté (1 carré)
                height: containerRef.current!.clientHeight + 60, // +60px en bas (2 carrés)
            });

            if (destroyed) {
                app.destroy(true);
                return;
            }

            // Positionner le canvas pour qu'il déborde du conteneur
            app.canvas.style.position = 'absolute';
            // left/top seront définis dans updateLayout

            containerRef.current!.appendChild(app.canvas);
            appRef.current = app;

            // Créer le conteneur pour les tuiles
            const floorContainer = new PIXI.Container();
            floorContainerRef.current = floorContainer;
            app.stage.addChild(floorContainer);

            // Créer la texture de tuile
            const tileGraphics = new PIXI.Graphics();
            tileGraphics.rect(0, 0, CONFIG.tileSize, CONFIG.tileSize);
            tileGraphics.fill(0xFFFFFF);
            tileGraphics.stroke({ width: 1, color: 0x000000, alpha: 0.5 });

            const tileTexture = app.renderer.generateTexture(tileGraphics);

            // Fonction de mise à jour de la mise en page
            const updateLayout = () => {
                if (!containerRef.current || !floorContainer) return;

                const containerWidth = containerRef.current.clientWidth;
                const containerHeight = containerRef.current.clientHeight;

                // Calculer les dimensions VISIBLES (sans les tuiles de débordement)
                // On a 1 tuile cachée à gauche, 1 à droite, et 2 en bas
                const visibleCols = CONFIG.gridWidth - 2;
                const visibleRows = CONFIG.gridDepth - 2;

                const unitSize = CONFIG.tileSize + CONFIG.gap;
                const visibleWidthLocal = visibleCols * unitSize;
                const visibleHeightLocal = visibleRows * unitSize;

                // Calculer l'échelle pour que la partie VISIBLE remplisse le conteneur
                const scaleX = containerWidth / visibleWidthLocal;
                const scaleY = containerHeight / visibleHeightLocal;

                // Calculer la taille d'une tuile (et gap) sur l'écran
                const tileScreenSizeX = unitSize * scaleX;
                const tileScreenSizeY = unitSize * scaleY;

                // Redimensionner le canvas avec assez de marge pour les tuiles cachées
                // Marge gauche/droite : 1 tuile min
                // Marge bas : 2 tuiles min
                const marginX = Math.ceil(tileScreenSizeX * 1.5);
                const marginBottom = Math.ceil(tileScreenSizeY * 2.5);

                const newCanvasWidth = containerWidth + (marginX * 2);
                const newCanvasHeight = containerHeight + marginBottom;

                app.renderer.resize(newCanvasWidth, newCanvasHeight);

                // Positionner le canvas
                app.canvas.style.left = `-${marginX}px`;
                app.canvas.style.top = '0px';

                (floorContainer as any).scale.set(scaleX, scaleY);

                // Positionner le conteneur pour aligner la grille visible avec le conteneur HTML
                // Le canvas commence à -marginX.
                // Le contenu doit commencer à x=0 relative au conteneur HTML.
                // Donc contenu relative au canvas = marginX.
                // MAIS la grille a 1 colonne cachée à gauche (index 0).
                // Donc le début de la grille (x=0 local) doit être décalé vers la gauche de 1 tuile.
                // Position X = marginX - (1 colonne * scale)
                floorContainer.x = marginX - tileScreenSizeX;
                floorContainer.y = 0; // Le haut est aligné, le bas déborde
            };

            // Appliquer la mise en page initiale
            updateLayout();

            // Créer la grille de tuiles
            const tiles: PIXI.Sprite[][] = [];
            for (let col = 0; col < CONFIG.gridWidth; col++) {
                tiles[col] = [];
                for (let row = 0; row < CONFIG.gridDepth; row++) {
                    const tile = new PIXI.Sprite(tileTexture);
                    tile.x = col * (CONFIG.tileSize + CONFIG.gap);
                    tile.y = row * (CONFIG.tileSize + CONFIG.gap);
                    tile.tint = CONFIG.colors.base;
                    tile.alpha = 0.3;
                    floorContainer.addChild(tile);
                    tiles[col][row] = tile;
                }
            }
            tilesRef.current = tiles;

            // Fonction de redimensionnement
            const handleResize = () => {
                updateLayout();
            };

            window.addEventListener('resize', handleResize);
            cleanupResize = () => {
                window.removeEventListener('resize', handleResize);
            };

            // Boucle d'animation
            app.ticker.add(() => {
                const tiles = tilesRef.current;
                if (tiles.length === 0) return;

                const analyser = analyserRef.current;
                const dataArray = dataArrayRef.current;
                const waveformArray = waveformArrayRef.current;

                // Vérifier si l'audio est actif
                if (analyser && dataArray && waveformArray && audioStartedRef.current) {
                    analyser.getByteFrequencyData(dataArray as any);
                    analyser.getByteTimeDomainData(waveformArray as any);

                    // Calculer le niveau de kick (basses fréquences)
                    let kickSum = 0;
                    for (let i = 0; i < 5; i++) kickSum += dataArray[i];
                    const kickLevel = (kickSum / 5) / 255;
                    const isHugeKick = kickLevel > CONFIG.kickThreshold;

                    for (let col = 0; col < CONFIG.gridWidth; col++) {
                        const waveIndex = Math.floor((col / CONFIG.gridWidth) * waveformArray.length);
                        const rawValue = waveformArray[waveIndex];
                        const normalized = Math.abs(rawValue - 128) / 128;
                        // Courbe de base (sélectivité des très gros mouvements)
                        const curvedAmplitude = Math.pow(normalized, 2);
                        // Appliquer un exposant >1 pour 'creuser' les creux (petites amplitudes deviennent beaucoup plus petites)
                        const shaped = Math.pow(normalized, CONFIG.amplifyExponent ?? 2.2);
                        // Accentuer les pics en utilisant la courbe carrée (curvedAmplitude)
                        const accent = Math.min(1, shaped * (1 + (CONFIG.peakBoost ?? 1.25) * curvedAmplitude));
                        const barHeight = accent * CONFIG.gridDepth * (CONFIG.amplitudeMultiplier ?? 1.2);
                        const activeColumn = accent > (CONFIG.amplitudeThreshold ?? 0.08);

                        for (let row = 0; row < CONFIG.gridDepth; row++) {
                            const t = tiles[col][row];
                            const distFromBottom = (CONFIG.gridDepth - 1) - row;

                            // Couleurs selon la hauteur
                            if (distFromBottom < 1) t.tint = CONFIG.colors.neonGreen;
                            else if (distFromBottom < 2) t.tint = CONFIG.colors.cyberCyan;
                            else if (distFromBottom < 3) t.tint = CONFIG.colors.laserBlue;
                            else if (distFromBottom < 4) t.tint = CONFIG.colors.electricIndigo;
                            else if (distFromBottom < 5) t.tint = CONFIG.colors.neonPurple;
                            else t.tint = CONFIG.colors.miamiPink;

                            // Animation
                            if (isHugeKick) {
                                t.alpha = 0.9;
                                t.tint = CONFIG.colors.flash;
                            } else {
                                let targetAlpha = 0.03; // presque invisible par défaut
                                // N'éclairer que si la colonne est significative ET la hauteur dépasse
                                if (activeColumn && distFromBottom < barHeight) {
                                    targetAlpha = 0.92;
                                }

                                if (targetAlpha > t.alpha) {
                                    t.alpha += (targetAlpha - t.alpha) * 0.35;
                                } else {
                                    t.alpha += (targetAlpha - t.alpha) * 0.06;
                                }
                            }
                        }
                    }
                } else {
                    // Animation d'attente (pulsation douce)
                    const time = Date.now() / 1000;
                    for (let col = 0; col < CONFIG.gridWidth; col++) {
                        for (let row = 0; row < CONFIG.gridDepth; row++) {
                            const t = tiles[col][row];
                            const distFromBottom = (CONFIG.gridDepth - 1) - row;

                            // Couleurs selon la hauteur
                            if (distFromBottom < 1) t.tint = CONFIG.colors.neonGreen;
                            else if (distFromBottom < 2) t.tint = CONFIG.colors.cyberCyan;
                            else if (distFromBottom < 3) t.tint = CONFIG.colors.laserBlue;
                            else if (distFromBottom < 4) t.tint = CONFIG.colors.electricIndigo;
                            else if (distFromBottom < 5) t.tint = CONFIG.colors.neonPurple;
                            else t.tint = CONFIG.colors.miamiPink;

                            // Pulsation douce en attendant l'audio
                            const wave = Math.sin(time * 2 + col * 0.2) * 0.5 + 0.5;
                            t.alpha = 0.1 + wave * 0.3;
                        }
                    }
                }
            });

            // Cleanup handled by useEffect return
        };

        initPixi();

        return () => {
            destroyed = true;
            if (cleanupResize) cleanupResize();
            if (appRef.current) {
                appRef.current.destroy(true);
                appRef.current = null;
            }
        };
    }, []);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioElementRef.current) {
                audioElementRef.current.pause();
                audioElementRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            audioStartedRef.current = false;
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                position: 'relative',
                overflow: 'visible',
                background: 'transparent',
                ...style
            }}
        />
    );
};
