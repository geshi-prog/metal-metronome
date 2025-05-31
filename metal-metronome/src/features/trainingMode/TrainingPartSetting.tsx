import React, { useEffect, useState } from 'react';
import { useTrainingContext } from '@/contexts/TrainingContext';
import { AccentType } from '@/types/training';
import BeatSettingPanel from './components/BeatSettingPanel';

const partLabels = ['パート1', 'パート2', 'パート3', 'パート4'];
const BEAT_WIDTH_PX = 100;

const getNoteSymbol = (noteValue: 'quarter' | 'eighth'): string => {
    switch (noteValue) {
        case 'quarter': return '♩';
        case 'eighth': return '♪';
        default: return '?';
    }
};

const accentSymbols: Record<AccentType, string> = {
    strong: '強',
    normal: '中',
    weak: '弱',
    none: '無',
};

const nextAccent = (accent: AccentType): AccentType => {
    const order: AccentType[] = ['strong', 'normal', 'weak', 'none'];
    return order[(order.indexOf(accent) + 1) % order.length];
};

const TrainingPartSetting: React.FC = () => {
    const {
        sections,
        setCurrentPage,
        parts,
        setParts,
        accentList,
        setAccentList,
    } = useTrainingContext();

    const totalBeats = sections.reduce((sum, sec) => sum + sec.numerator, 0);

    // アクセントリストの初期化・調整（拍数変更時）
    useEffect(() => {
        if (accentList.length !== totalBeats) {
            setAccentList(Array(totalBeats).fill('normal'));
        }
    }, [sections, accentList.length, totalBeats, setAccentList]);

    // パートの初期化（既存処理）
    useEffect(() => {
        const defaultBeat = {
            isStart: true,
            n: 1,
            m: 1,
            sound: 'kick',
            volumes: [0.0],
        };
        let needsUpdate = false;
        let newParts = [...parts];
        if (parts.length === 0) {
            needsUpdate = true;
            newParts = Array.from({ length: 4 }, () => ({
                beats: Array.from({ length: totalBeats }, () => ({ ...defaultBeat })),
            }));
        } else {
            newParts = parts.map(part => {
                const updatedBeats = [...(part?.beats ?? [])];
                let globalIndex = 0;
                for (const section of sections) {
                    for (let i = 0; i < section.numerator; i++) {
                        if (!updatedBeats[globalIndex]) {
                            updatedBeats[globalIndex] = { ...defaultBeat };
                            needsUpdate = true;
                        }
                        globalIndex++;
                    }
                }
                return {
                    ...part,
                    beats: updatedBeats,
                };
            });
        }
        if (needsUpdate) {
            setParts(newParts);
        }
    }, [sections]);

    const [selectedBeat, setSelectedBeat] = useState<{
        sectionIndex: number;
        beatIndex: number;
        partIndex: number;
        n: number;
        m: number;
        sound: string;
        volumes: number[];
    } | null>(null);

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-white text-xl font-bold">パート設定</h2>

            <div className="overflow-x-auto max-w-full border border-gray-800 rounded">
                <div className="min-w-max" style={{ width: `${BEAT_WIDTH_PX * totalBeats}px` }}>
                    <div className="flex border-b border-gray-600 pb-2">
                        <div className="flex w-full">
                            {sections.map((section, sectionIndex) => (
                                <div
                                    key={sectionIndex}
                                    style={{ width: `${BEAT_WIDTH_PX * section.numerator}px` }}
                                    className="border-r-4 border-gray-700 px-1 text-white text-xs text-center"
                                >
                                    {sections[sectionIndex]?.name && (
                                        <div>小節名: {section.name}</div>
                                    )}
                                    {sections[sectionIndex]?.description && (
                                        <div>説明: {section.description}</div>
                                    )}
                                    <div>拍子: {section.numerator}/{section.denominator}</div>
                                    <div>音価: {getNoteSymbol(section.noteValue)}</div>
                                    <div>BPM: {section.bpm}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex border-b-2 border-gray-500 py-2">
                        {accentList.map((accent, globalIndex) => (
                            <div
                                key={globalIndex}
                                onClick={() => {
                                    const newList = [...accentList];
                                    newList[globalIndex] = nextAccent(accent);
                                    setAccentList(newList);
                                }}
                                style={{ width: `${BEAT_WIDTH_PX}px` }}
                                className="h-[40px] bg-gray-800 border-l border-gray-600 flex items-center justify-center text-white text-lg hover:bg-gray-700 cursor-pointer"
                            >
                                {accentSymbols[accent]}
                            </div>
                        ))}
                    </div>

                    {partLabels.map((label, partIndex) => (
                        <div key={partIndex} className="flex items-center border-b border-gray-700 py-2">
                            <div className="flex">
                                {(() => {
                                    const elements = [];
                                    let i = 0;
                                    while (i < totalBeats) {
                                        const beat = parts[partIndex]?.beats?.[i];
                                        if (!beat?.isStart) {
                                            i++;
                                            continue;
                                        }
                                        const width = BEAT_WIDTH_PX * (beat.n ?? 1);
                                        const { sectionIndex, beatIndex } = (() => {
                                            let remain = i;
                                            for (let s = 0; s < sections.length; s++) {
                                                const num = sections[s].numerator;
                                                if (remain < num) return { sectionIndex: s, beatIndex: remain };
                                                remain -= num;
                                            }
                                            return { sectionIndex: 0, beatIndex: 0 };
                                        })();
                                        const isSelected = selectedBeat?.sectionIndex === sectionIndex && selectedBeat?.beatIndex === beatIndex && selectedBeat?.partIndex === partIndex;
                                        const isTransparent = (beat?.volumes ?? []).every(v => v === 0);
                                        elements.push(
                                            <div
                                                key={`${partIndex}-${i}`}
                                                onClick={() => setSelectedBeat({
                                                    sectionIndex,
                                                    beatIndex,
                                                    partIndex,
                                                    n: beat?.n ?? 1,
                                                    m: beat?.m ?? 1,
                                                    sound: beat?.sound ?? 'kick',
                                                    volumes: beat?.volumes ?? [0.0],
                                                })}
                                                style={{ width: `${width}px`, height: "80px" }}
                                                className={`h-[40px] ${
                                                    isSelected
                                                        ? 'bg-yellow-500'
                                                        : isTransparent
                                                          ? 'bg-gray-700 opacity-30 border-dashed'
                                                          : 'bg-gray-700'
                                                    } border-l border-gray-600 flex items-center justify-center text-white text-xs hover:bg-gray-600 flex-col cursor-pointer`}
                                            >
                                                <div>{beatIndex + 1}拍目</div>
                                                <div className="text-[10px]">{beat.n}拍{beat.m}連<br />({beat.sound})</div>
                                            </div>
                                        );
                                        i += beat.n ?? 1;
                                    }
                                    return elements;
                                })()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedBeat && (
                <BeatSettingPanel
                    key={`${selectedBeat.partIndex}-${selectedBeat.sectionIndex}-${selectedBeat.beatIndex}`}
                    sectionIndex={selectedBeat.sectionIndex}
                    beatIndex={selectedBeat.beatIndex}
                    partIndex={selectedBeat.partIndex}
                    onClose={() => setSelectedBeat(null)}
                    n={selectedBeat.n}
                    m={selectedBeat.m}
                    sound={selectedBeat.sound}
                    volumes={selectedBeat.volumes}
                />
            )}

            <div className="flex justify-between mt-6">
                <button
                    onClick={() => setCurrentPage('measure')}
                    className="bg-gradient-to-br from-gray-600 to-black hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                    ← 小節設定に戻る
                </button>
                <button
                    onClick={() => setCurrentPage('loop')}
                    className="bg-gradient-to-br from-blue-600 to-black hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    ループ設定へ進む →
                </button>
            </div>
        </div>
    );
};

export default TrainingPartSetting;
