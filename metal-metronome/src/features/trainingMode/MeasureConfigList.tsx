// src/features/trainingMode/MeasureConfigList.tsx

import React, { useState } from 'react';
import { useTrainingContext } from '@/contexts/TrainingContext';
import { NoteValue } from '@/types/training';
import { exportSingleSection, importSingleSection } from '@/components/ExportImportSection';

const presetOptions = [
  { label: '選択してください', value: '' },
  { label: 'テスト用', value: '4_4_120.json' },
];

const MeasureConfigList: React.FC = () => {
    const { sections, setSections, parts, setParts, accentList, setAccentList } = useTrainingContext();
    const [message, setMessage] = useState<string | null>(null);

    const updateSection = (index: number, key: keyof typeof sections[number], value: any) => {
        if (key === 'numerator') {
            const oldNumerator = sections[index].numerator;
            const newNumerator = parseInt(value);
            if (newNumerator === oldNumerator) return;
            const startIndex = sections.slice(0, index).reduce((sum, s) => sum + s.numerator, 0);
            const hasLinkedBeats = parts.some(part => {
                for (let i = 0; i < oldNumerator; i++) {
                    const beat = part.beats[startIndex + i];
                    if (beat?.n && beat.n > 1 && beat.isStart) {
                        // この連結が小節をまたぐ場合、アウト
                        const endIndex = startIndex + beat.n - 1;
                        const sectionEndIndex = startIndex + newNumerator - 1;
                        if (endIndex > sectionEndIndex) {
                            return true;
                        }
                    }
                }
                return false;
            });
            if (hasLinkedBeats) {
                alert("この小節には連結されたリズムがあります。拍数を変更するには先にリズム設定画面で連結を解除してください。");
                return;
            }
            // ビート数の変更を適用
            const delta = newNumerator - oldNumerator;
            const newParts = parts.map(part => {
                const updatedBeats = [...part.beats];
                if (delta > 0) {
                    // 拍を追加
                    const insertBeats = Array.from({ length: delta }, () => ({
                        isStart: true,
                        n: 1,
                        m: 1,
                        sound: 'kick',
                        volumes: [0.0],
                    }));
                    updatedBeats.splice(startIndex + oldNumerator, 0, ...insertBeats);
                } else {
                    // 拍を削除
                    updatedBeats.splice(startIndex + newNumerator, -delta);
                }
                return { ...part, beats: updatedBeats };
            });
            setParts(newParts);
        }
        // セクション情報を更新
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], [key]: value };
        setSections(newSections);
    };

    const addSection = () => {
        const last = sections[sections.length - 1];
        const newSection = last ?? {
            numerator: 4,
            denominator: 4,
            noteValue: 'quarter' as NoteValue,
            bpm: 120,
            loopCount: 1,
            parts: [],
        };
        const newSections = [...sections, { ...newSection }];
        setSections(newSections);
    };

    const removeSection = (index: number) => {
        const sectionToRemove = sections[index];
        const beatsToRemove = sectionToRemove.numerator;
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);

        // パーツのビート更新
        const totalBeatsBefore = sections
            .slice(0, index)
            .reduce((sum, sec) => sum + sec.numerator, 0);
        const newParts = parts.map(part => {
            const updatedBeats = [...part.beats];
            updatedBeats.splice(totalBeatsBefore, beatsToRemove); // 拍だけ削除
            return { ...part, beats: updatedBeats };
        });

        setParts(newParts);
    };
    const handleDuplicateSection = (index: number) => {
        const baseSection = sections[index];
        const startGlobalIndex = sections
            .slice(0, index)
            .reduce((acc, sec) => acc + sec.numerator, 0);
        const endGlobalIndex = startGlobalIndex + baseSection.numerator;

        // 連結リズムがあるか確認（n > 1 のものが小節を跨ぐ）
        for (const part of parts) {
            for (let i = startGlobalIndex; i < endGlobalIndex; i++) {
                const beat = part.beats[i];
                if (beat?.isStart && beat.n && beat.n > 1) {
                    if (i + beat.n > endGlobalIndex) {
                        alert("この小節には他の小節にまたがるリズムがあるため、複製できません！");
                        return;
                    }
                }
            }
        }

        // 複製する section（name は自動リネーム）
        const copiedSection = {
            ...baseSection,
            name: baseSection.name ? `${baseSection.name}_copy` : undefined,
            description: baseSection.description || '',
            parts: JSON.parse(JSON.stringify(baseSection.parts)), // deep copy
        };

        // 新しい sections に追加
        const newSections = [...sections, copiedSection];
        setSections(newSections);

        // beats を各パートごとにコピーして末尾に追加
        const newParts = parts.map((part) => {
            const beatsCopy = [...part.beats];
            const beatsToCopy = beatsCopy.slice(startGlobalIndex, endGlobalIndex);
            const copiedBeats = beatsToCopy.map(b => b ? { ...b } : undefined); // 安全コピー
            return {
                ...part,
                beats: [...beatsCopy, ...copiedBeats],
            };
        });
        setParts(newParts);
    };

    return (
        <div className="space-y-4">
            {message && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
                {message}
              </div>
            )}
            <div className="flex justify-between items-center">
                <h2 className="text-white text-lg font-semibold">小節設定</h2>
                <button onClick={addSection} className="w-25 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black border-2 border-gray-400 text-white text-xl flex items-center justify-center shadow hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:border-white transition duration-200 focus:outline-none">
                    ＋追加
                </button>
            </div>

            {sections.map((section, idx) => (
                <div key={idx} className="bg-gray-800 p-4 rounded shadow space-y-4">
                    {/* プリセット読み込み */}
                    <div>
                        <label className="text-sm text-gray-300 font-semibold block mb-1">プリセット読み込み</label>
                        <select
                            className="w-full px-2 py-1 rounded bg-gray-900 text-white border border-gray-600"
                            onChange={async (e) => {
                                const filename = e.target.value;
                                if (!filename) return;
                                const res = await fetch(`/metal-metronome/json/sections/${filename}`);
                                const json = await res.json();
                                importSingleSection(
                                    idx,
                                    sections,
                                    parts,
                                    accentList,
                                    (newSec, newParts, newAccent) => {
                                        setSections(newSec);
                                        setParts(newParts);
                                        setAccentList(newAccent);
                                        setMessage(`✅ プリセットを読み込みました`);
                                        setTimeout(() => setMessage(null), 3000);
                                    },
                                    json
                                );
                            }}
                        >
                            {presetOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* 小節名・説明 */}
                    <div>
                        <label className="text-sm text-gray-300 font-semibold block mb-1">小節名</label>
                        <input
                            type="text"
                            value={section.name || ''}
                            onChange={(e) => {
                                const updated = [...sections];
                                updated[idx].name = e.target.value;
                                setSections(updated);
                            }}
                            placeholder={`小節${idx + 1}（任意）`}
                            className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-300 font-semibold block mb-1">小節の説明</label>
                        <textarea
                            value={section.description || ''}
                            onChange={(e) => {
                                const updated = [...sections];
                                updated[idx].description = e.target.value;
                                setSections(updated);
                            }}
                            placeholder="この小節の説明（任意）"
                            className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 resize-y min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    {/* 拍子・音価・BPM */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex gap-2 items-center">
                            <label className="text-white">拍子</label>
                            <input
                                type="number"
                                value={section.numerator}
                                onChange={(e) => updateSection(idx, 'numerator', parseInt(e.target.value))}
                                className="w-16 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                            />
                            /
                            <select
                                value={section.denominator}
                                onChange={(e) => updateSection(idx, 'denominator', parseInt(e.target.value))}
                                className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                            >
                                {[1, 2, 4, 8, 16].map((val) => (
                                    <option key={val} value={val}>{val}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2 items-center">
                            <label className="text-white">音価</label>
                            <select
                                value={section.noteValue}
                                onChange={(e) => updateSection(idx, 'noteValue', e.target.value as NoteValue)}
                                className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                            >
                                <option value="quarter">♩</option>
                                <option value="eighth">♪</option>
                            </select>
                        </div>
                        <div className="flex gap-2 items-center">
                            <label className="text-white">BPM</label>
                            <input
                                type="number"
                                value={section.bpm}
                                onChange={(e) => updateSection(idx, 'bpm', parseInt(e.target.value))}
                                className="w-24 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                            />
                        </div>
                    </div>
                    {/* 操作ボタンたち */}
                    <div className="flex flex-wrap gap-2 justify-end mt-2">
                        <button
                            onClick={() => exportSingleSection(idx, sections, parts, accentList)}
                            className="px-3 py-1 text-sm bg-gradient-to-br from-blue-500 to-black text-white rounded shadow hover:shadow-lg"
                        >
                            📤 エクスポート
                        </button>
                        <button
                            onClick={() =>
                                importSingleSection(idx, sections, parts, accentList, (newSec, newParts, newAccent) => {
                                    setSections(newSec);
                                    setParts(newParts);
                                    setAccentList(newAccent);
                                })
                            }
                            className="px-3 py-1 text-sm bg-gradient-to-br from-green-500 to-black text-white rounded shadow hover:shadow-lg"
                        >
                            📥 インポート
                        </button>
                        <button
                            onClick={() => handleDuplicateSection(idx)}
                            className="px-3 py-1 text-sm bg-gradient-to-br from-purple-600 to-black text-white rounded shadow hover:shadow-lg"
                        >
                            📄 複製
                        </button>
                        <button
                            onClick={() => removeSection(idx)}
                            className="px-3 py-1 text-sm bg-gradient-to-br from-red-600 to-black text-white rounded shadow hover:shadow-lg"
                        >
                            🗑️ 削除
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MeasureConfigList;
