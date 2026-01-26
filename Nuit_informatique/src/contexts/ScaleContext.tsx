import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

interface ScaleContextType {
    scale: number;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

const ScaleContext = createContext<ScaleContextType>({ scale: 1, containerRef: { current: null } });

// Dimensions de référence (design original à 1080p)
const BASE_WIDTH = 1920 * 0.75; // Le panel de jeu fait 75% de la largeur
const BASE_HEIGHT = 1080;

interface ScaleProviderProps {
    children: ReactNode;
}

export const ScaleProvider: React.FC<ScaleProviderProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const updateScale = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Calculer le scale basé sur la plus petite dimension pour garder le ratio
            const scaleX = rect.width / BASE_WIDTH;
            const scaleY = rect.height / BASE_HEIGHT;
            const newScale = Math.min(scaleX, scaleY);
            setScale(newScale);
        }
    }, []);

    useEffect(() => {
        updateScale();

        // Observer les changements de taille du conteneur
        const resizeObserver = new ResizeObserver(updateScale);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Fallback pour le resize de fenêtre
        window.addEventListener('resize', updateScale);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateScale);
        };
    }, [updateScale]);

    return (
        <ScaleContext.Provider value={{ scale, containerRef }}>
            {children}
        </ScaleContext.Provider>
    );
};

export const useScale = () => useContext(ScaleContext);

// Hook utilitaire pour obtenir une taille scalée
export const useScaledSize = (baseSize: number) => {
    const { scale } = useScale();
    return baseSize * scale;
};

