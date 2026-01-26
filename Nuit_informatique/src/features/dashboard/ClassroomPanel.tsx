import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ComputerSlot } from './ComputerSlot';


interface Props {
    title: string;
    classroomId: number;
}

export const ClassroomPanel: React.FC<Props> = ({ title, classroomId }) => {
    const computers = useGameStore((state) => state.computers).filter(
        (c) => c.classroomId === classroomId
    );
    const events = useGameStore((state) => state.events);
    const openLaserGame = useGameStore((state) => state.openLaserGame);

    return (
        <div className="w-full h-full p-2 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-retro-dark px-2 text-xs text-retro-green border border-retro-gray">
                {title}
            </div>
            <div className="flex-1 grid grid-cols-4 gap-2 p-2 justify-items-center content-start">
                {computers.map((pc, index) => (
                    <div
                        key={pc.id}
                        className={`flex justify-center ${index === 8 ? 'col-start-2' : ''} cursor-pointer hover:scale-110 transition-transform`}
                        onClick={() => {
                            if (pc.status === 'infected') {
                                const event = events.find(e => e.computerId === pc.id && e.type === 'virus_attack');
                                if (event) {
                                    openLaserGame(event.id);
                                }
                            } else if (pc.status === 'broken') {
                                // No direct repair anymore, and no alert as requested
                            }
                        }}
                    >
                        <ComputerSlot computer={pc} />
                    </div>
                ))}
            </div>
        </div>
    );
};
