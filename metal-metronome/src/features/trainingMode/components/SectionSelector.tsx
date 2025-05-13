import React from 'react';
import { useTrainingContext } from '@/contexts/TrainingContext';

const SectionSelector: React.FC = () => {
    const {
        sections,
        currentSectionIndex,
        setCurrentSectionIndex,
        addSection,
        removeSection
    } = useTrainingContext();

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-gray-900 text-white rounded shadow">
            <h2 className="text-lg font-bold">セクション一覧</h2>

            <div className="flex gap-2 flex-wrap justify-center">
                {sections.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSectionIndex(index)}
                        className={`px-3 py-1 rounded border ${
                            index === currentSectionIndex
                                ? 'bg-blue-500 border-blue-700 text-white'
                                : 'bg-gray-700 border-gray-500 text-gray-300'
                        }`}
                    >
                        {`セクション ${index + 1}`}
                    </button>
                ))}
            </div>

            <div className="flex gap-4 mt-2">
                <button
                    onClick={addSection}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                    ➕ 追加
                </button>
                {sections.length > 1 && (
                    <button
                        onClick={removeSection}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                        🗑️ 削除
                    </button>
                )}
            </div>
        </div>
    );
};

export default SectionSelector;