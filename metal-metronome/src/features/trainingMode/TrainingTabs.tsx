// src/features/trainingMode/TrainingTabs.tsx
import React from 'react';

type Props = {
    activeTab: 'setting' | 'playback';
    onTabChange: (tab: 'setting' | 'playback') => void;
    disabled?: boolean;
};

const TrainingTabs: React.FC<Props> = ({ activeTab, onTabChange, disabled }) => {
    return (
        <div className="flex gap-4 mb-4">
            <button
                onClick={() => onTabChange('playback')}
                disabled={disabled || activeTab === 'playback'}
                className={`px-4 py-2 rounded-full focus:outline-noneto-black border-2 border-gray-400 text-white text-xl flex items-center justify-center shadow hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:border-white transition duration-200 bg-gradient-to-br ${
                    activeTab === 'playback' ? 'from-gray-700' : 'from-gray-900 hover:from-gray-700'
                } transition`}
            >
                再生▶️
            </button>
            <button
                onClick={() => onTabChange('setting')}
                disabled={disabled || activeTab === 'setting'}
                className={`px-4 py-2 rounded-full focus:outline-noneto-black border-2 border-gray-400 text-white text-xl flex items-center justify-center shadow hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:border-white transition duration-200 bg-gradient-to-br ${
                    activeTab === 'setting' ? 'from-gray-700' : 'from-gray-900 hover:from-gray-700'
                } transition`}
            >
                設定⚙️
            </button>
        </div>
    );
};

export default TrainingTabs;
