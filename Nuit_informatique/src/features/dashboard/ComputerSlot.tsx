import React from 'react';
import clsx from 'clsx';
import { useGameStore } from '../../store/useGameStore';
import type { Computer } from '../../store/useGameStore';
import { useScale } from '../../contexts/ScaleContext';

interface Props {
    computer: Computer;
}

import pcWinImg from '../../assets/pcwin_ndl.png';
import pcLinImg from '../../assets/pclin_ndl.png';
import pcDownImg from '../../assets/pcdown_ndl.png';
import pcPirImg from '../../assets/pcpir_ndl.png';
import warningImg from '../../assets/warning_ndl.png';
import pcBrokenImg from '../../assets/pcbroken_ndl.png';

// Taille de base du PC (référence à 1080p)
const BASE_PC_SIZE = 88; // pixels

export const ComputerSlot: React.FC<Props> = ({ computer }) => {
    const { toggleLinux } = useGameStore();
    const { scale } = useScale();
    const isBroken = computer.status === 'broken';
    const isLinux = computer.os === 'linux';
    const isLibreOffice = computer.software === 'libreoffice';
    const pending = computer.pendingAction;

    const pcSize = BASE_PC_SIZE * scale;

    const handleClick = () => {
        if (!isBroken && !isLinux) {
            toggleLinux(computer.id);
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{ width: pcSize, height: pcSize }}
            className={clsx(
                "border-2 flex items-center justify-center text-xs relative transition-all cursor-pointer hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]",
                isBroken ? "border-transparent bg-transparent" :
                    computer.status === 'infected' ? "border-transparent bg-transparent" :
                        computer.status === 'destroyed' ? "border-transparent bg-transparent" :
                            "border-transparent bg-transparent",
                pending && "ring-2 ring-yellow-400 ring-offset-1 ring-offset-black"
            )}
        >
            {isBroken ? (
                <div className="relative w-full h-full">
                    <img src={pcDownImg} alt="Broken PC" className="w-full h-full object-contain" />
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 flex items-end justify-end animate-warning">
                        <img
                            src={warningImg}
                            alt="Warning"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            ) : computer.status === 'infected' ? (
                <div className="relative w-full h-full">
                    <img src={pcPirImg} alt="Infected PC" className="w-full h-full object-contain" />
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 flex items-end justify-end animate-warning">
                        <img
                            src={warningImg}
                            alt="Warning"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            ) : computer.status === 'destroyed' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                    <img src={pcBrokenImg} alt="Destroyed PC" className="w-full h-full object-contain" />
                    {pending === 'replace' && (
                        <div className="absolute inset-0 bg-yellow-900/80 flex items-center justify-center animate-pulse">
                            <span className="text-yellow-400 text-lg">📦</span>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <img
                        src={isLinux ? pcLinImg : pcWinImg}
                        alt={isLinux ? "Linux PC" : "Windows PC"}
                        className="w-full h-full object-contain"
                    />
                    <span className={clsx(
                        "absolute bottom-0 right-0 text-[6px] px-0.5 rounded",
                        isLibreOffice ? "bg-orange-900/80 text-orange-400" : "bg-gray-800/80 text-gray-400"
                    )}>
                        {isLibreOffice ? "LO" : "MS"}
                    </span>
                </>
            )}

            {pending && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[8px] w-3 h-3 flex items-center justify-center rounded-full font-bold z-10">
                    {pending === 'repair' ? 'R' : 'L'}
                </div>
            )}
        </div>
    );
};
