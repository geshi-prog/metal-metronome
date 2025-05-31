// src/features/trainingMode/TrainingMeasureSetting.tsx

import React from 'react';
import { useTrainingContext } from '@/contexts/TrainingContext';
import MeasureConfigList from './MeasureConfigList';

const TrainingMeasureSetting: React.FC = () => {
    const { setCurrentPage, sections, setSections } = useTrainingContext();

    const handleNext = () => {
        // パート設定へ
        setCurrentPage('part');
    };

    const handleBack = () => {
        // 空小節のみなら削除（後で拡張でもOK）
        if (sections.length === 0) {
            setSections([]);
        }
        setCurrentPage('base');
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-white text-xl font-bold">小節設定</h2>
            <p className="text-gray-300 text-sm">
                拍子、音価、BPMなどを小節ごとに設定します。
            </p>

            <div className="flex justify-between mt-4">
                <button
                    onClick={handleBack}
                    className="bg-gradient-to-br from-gray-600 to-black hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                    ← 戻る
                </button>

                <button
                    onClick={handleNext}
                    disabled={sections.length === 0}
                    className="bg-gradient-to-br from-blue-600 to-black hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    パート設定へ進む →
                </button>
            </div>

            <MeasureConfigList />

            <div className="flex justify-between mt-4">
                <button
                    onClick={handleBack}
                    className="bg-gradient-to-br from-gray-600 to-black hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                    ← 戻る
                </button>

                <button
                    onClick={handleNext}
                    disabled={sections.length === 0}
                    className="bg-gradient-to-br from-blue-600 to-black hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    パート設定へ進む →
                </button>
            </div>
        </div>
    );
};

export default TrainingMeasureSetting;
