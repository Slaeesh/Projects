import React, { useEffect, useState } from 'react';
import type { ScoreEntry } from './types';

export const STORAGE_KEY = 'nird_laser_scores';

interface Props {
    currentScore?: number;
    lastUpdate?: number;
}

export const Leaderboard: React.FC<Props> = ({ currentScore, lastUpdate }) => {
    const [scores, setScores] = useState<ScoreEntry[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setScores(JSON.parse(stored));
        }
    }, [lastUpdate]);

    useEffect(() => {
        if (currentScore !== undefined && currentScore > 0) {
            // Check if high score
            // This logic might need to be moved to a "submit score" function
        }
    }, [currentScore]);

    return (
        <div className="bg-gray-800 p-4 border-4 border-white font-pixel text-white w-96">
            <h2 className="text-xl text-center mb-4 text-yellow-400">TOP HACKERS</h2>
            <ul>
                {scores.length === 0 && <li className="text-center text-gray-400">No scores yet</li>}
                {scores.sort((a, b) => b.score - a.score).slice(0, 5).map((entry, i) => (
                    <li key={i} className="flex justify-between mb-2">
                        <span>{i + 1}. {entry.name}</span>
                        <span>{entry.score}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
