import React from 'react';

interface Props {
    x: number;
    y: number;
    children: React.ReactNode;
    className?: string;
}

// Dimensions of the background image
const BG_WIDTH = 1038;
const BG_HEIGHT = 916;

export const RelativePosition: React.FC<Props> = ({ x, y, children, className = '' }) => {
    const left = (x / BG_WIDTH) * 100;
    const top = (y / BG_HEIGHT) * 100;

    return (
        <div
            className={`absolute ${className}`}
            style={{
                left: `${left}%`,
                top: `${top}%`,
            }}
        >
            {children}
        </div>
    );
};
