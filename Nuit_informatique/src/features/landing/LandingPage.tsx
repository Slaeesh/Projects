import React, { useEffect, useRef, useState } from 'react';

const introVideo = 'https://res.cloudinary.com/dsjbdcsts/video/upload/v1764908010/final_VP9_dyfs0w.webm';

interface LandingPageProps {
    onComplete: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showTitle, setShowTitle] = useState(false);

    useEffect(() => {
        // Fade in title after a short delay
        const timer = setTimeout(() => setShowTitle(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleVideoEnd = () => {
        onComplete();
    };

    return (
        <div
            className="fixed inset-0 bg-black flex flex-col items-center justify-between z-50 cursor-pointer p-8 pb-16"
            onClick={onComplete} // Click to skip
        >
            {/* Overlay Content - Title (Centered in available space) */}
            <div className={`flex-grow flex flex-col items-center justify-center text-center transition-opacity duration-1000 ${showTitle ? 'opacity-100' : 'opacity-0'}`}>
                <h1 className="text-6xl md:text-9xl font-pixel text-retro-green drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] mb-4 animate-pulse">
                    NIRD VILLAGE
                </h1>
                <p className="text-retro-green font-pixel text-sm md:text-xl mb-8 animate-bounce">
                    Made by : SOUEIC (X?)
                </p>
                <p className="text-white font-pixel text-sm md:text-base opacity-70">
                    Cliquez pour passer...
                </p>
            </div>

            {/* Video Player (Small, at bottom) */}
            <div className="relative w-64 md:w-80 aspect-video overflow-hidden">
                <video
                    ref={videoRef}
                    src={introVideo}
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnd}
                    className="w-full h-full object-contain"
                />
                {/* Scanline Effect Overlay only on video */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-20 opacity-20" />
            </div>
        </div>
    );
};
