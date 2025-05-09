// src/features/trainingMode/TrainingPlayback.tsx
import React from 'react';

const TrainingPlayback: React.FC = () => {
    return (
        <div className="w-full max-w-3xl bg-gray-900 rounded-lg p-6 shadow-lg text-white">
            <h2 className="text-xl font-bold mb-4">▶️ 再生モード</h2>

            {/* 再生ステータス（例：現在の小節・テンポなど） */}
            <div className="mb-6">
                <p>🧭 現在の小節：1 / 4</p>
                <p>🎵 現在のテンポ：120 BPM</p>
            </div>

            {/* 再生・停止ボタン */}
            <div className="flex justify-center">
                <button className="px-6 py-3  rounded-full focus:outline-noneto-black border-2 border-gray-400 text-white text-xl flex items-center justify-center shadow hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] transition duration-200 bg-gradient-to-br from-green-600 hover:from-green-700">
                    ▶️ 再生
                </button>
            </div>
        </div>
    );
};

export default TrainingPlayback;
