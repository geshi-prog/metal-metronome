// src/features/trainingMode/RhythmNameEditor.tsx

import React from 'react';
import { useTrainingContext } from '@/contexts/TrainingContext';

const RhythmNameEditor: React.FC = () => {
    const { rhythmName, setRhythmName } = useTrainingContext();

    return (
        <div>
            <label className="block text-white mb-1">リズム名</label>
            <input
                type="text"
                value={rhythmName}
                onChange={(e) => setRhythmName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="リズム名を入力してください"
            />
        </div>
    );
};

export default RhythmNameEditor;
