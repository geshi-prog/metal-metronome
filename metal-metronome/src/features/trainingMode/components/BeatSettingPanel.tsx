import React, { useState, useEffect } from 'react';
import TrainingVisualizer from './TrainingVisualizer';
import { useTrainingContext } from '@/contexts/TrainingContext';
import { playRhythm } from '@/lib/trainingRhythmLogic'

type Props = {
    sectionIndex: number;
    beatIndex: number;
    partIndex: number;
    onClose: () => void;
};

const BeatSettingPanel: React.FC<Props> = ({
    sectionIndex,
    beatIndex,
    partIndex,
    onClose,
}) => {
    const { sections, parts, setParts } = useTrainingContext();

    // グローバルインデックスの計算
    const globalIndex = sections.slice(0, sectionIndex).reduce((sum, sec) => sum + sec.numerator, 0) + beatIndex;
    const initialBeat = parts[partIndex]?.beats?.[globalIndex];

    const [n, setN] = useState(initialBeat?.n ?? 1);
    const [m, setM] = useState(initialBeat?.m ?? 1);
    const [sound, setSound] = useState(initialBeat?.sound ?? 'kick');
    const [volumes, setVolumes] = useState<number[]>(initialBeat?.volumes ?? Array(m).fill(1.0));

    // mの変更時にvolumesを調整
    useEffect(() => {
        setVolumes((prev) => {
            if (m > prev.length) {
                return [...prev, ...Array(m - prev.length).fill(1.0)];
            } else {
                return prev.slice(0, m);
            }
        });
    }, [m]);

    const handleSave = () => {
        const newParts = [...parts];
        const flatBeats = [...newParts[partIndex].beats];
        // グローバルインデックスを計算
        let globalIndex = 0;
        for (let i = 0; i < sectionIndex; i++) {
            globalIndex += sections[i].numerator;
        }
        globalIndex += beatIndex;
        // バリデーション処理開始
        let sectionIdx = sectionIndex;
        const baseBpm = sections[sectionIdx].bpm;
        const baseNote = sections[sectionIdx].noteValue;
        const baseDenominator = sections[sectionIdx].denominator;
        const nowSectionRemainingBeats = sections[sectionIdx].numerator - beatIndex; // この小節で残り何拍か
        let remainingBeats = n - nowSectionRemainingBeats; // 後の小節で残り何拍設定が必要か
        let remainingSectionIdx = sectionIdx; // 何小節目まで必要か
        for (const [index, section] of sections.entries()) {
            if (sectionIdx >= index) {
                continue;
            }
            remainingBeats -= section.numerator;
            remainingSectionIdx = index;
            if (remainingBeats < 0) {
                break;
            }
        }
        if (remainingBeats > 0) {
            alert("指定したn拍が小節を跨いでも入りきりません！");
            return;
        }
        for (let i = sectionIdx; i <= remainingSectionIdx; i++) {
            // 現在設定している小節から拍が跨ぐ小節までの数
            if (sections[i].bpm !== baseBpm){
                alert("跨る小節のBPMが一致していません！");
                return;
            }
            if (sections[i].noteValue !== baseNote){
                alert("跨る小節の音価が一致していません！");
                return;
            }
            if (sections[i].denominator !== baseDenominator){
                alert("跨る小節の拍子（分母）が一致していません！");
                return;
            }
        }
        // 保存処理
        const prevBeat = parts[partIndex]?.beats?.[globalIndex];
        const prevN = prevBeat?.n ?? 1;
        const defaultBeat = {
            isStart: true,
            n: 1,
            m: 1,
            sound: 'kick',
            volumes: [0.0],
        };
        for (let i = 0; i < Math.max(prevN, n); i++) {
            if (i === 0) {
                flatBeats[globalIndex + i] = { isStart: true, n, m, sound, volumes };
            } else {
                flatBeats[globalIndex + i] = { ...defaultBeat };
            }
        }
        newParts[partIndex].beats = flatBeats;
        setParts(newParts);
        onClose();
    };

    const playSample = () => {
        const bpm = sections[sectionIndex].bpm;
        const noteValue = sections[sectionIndex].noteValue;
        const denominator = sections[sectionIndex].denominator;

        console.log(volumes);
        playRhythm({
            bpm,
            noteValue,
            denominator,
            n,
            m,
            sound,
            volumes,
        });
    };

    return (
        <div className="bg-gray-800 text-white p-4 rounded shadow-md mt-4">
            <h3 className="text-lg font-semibold mb-2">リズム設定</h3>
            <div className="text-sm text-gray-300 mb-3">
                <div>
                    {sections[sectionIndex]?.name && (
                        <div>
                            <span className="font-bold text-white">
                                {`小節名：${sections[sectionIndex]?.name}`}
                            </span><br />
                        </div>
                    )}
                    パート{partIndex + 1} の {beatIndex + 1}拍目
                </div>
                {sections[sectionIndex]?.description && (
                    <div className="text-gray-400 italic">
                        {sections[sectionIndex].description}
                    </div>
                )}
            </div>
            {/* n拍m連設定 */}
            <div className="flex gap-4 items-center mb-3">
                <label>n拍：</label>
                <input
                    type="number"
                    min={1}
                    value={n}
                    onChange={(e) => setN(parseInt(e.target.value))}
                    className="w-16 p-1 rounded bg-gray-700 border border-gray-600"
                />
                <label>m連：</label>
                <input
                    type="number"
                    min={1}
                    value={m}
                    onChange={(e) => {
                        const newM = parseInt(e.target.value);
                        setM(newM);
                        setVolumes(Array(newM).fill(1.0));
                    }}
                    className="w-16 p-1 rounded bg-gray-700 border border-gray-600"
                />
            </div>

            {/* 楽器の選択 */}
            <div className="mb-3">
                <label className="block mb-1">楽器:</label>
                <select
                    value={sound}
                    onChange={(e) => setSound(e.target.value)}
                    className="bg-gray-700 p-1 rounded w-full"
                >
                    {[
                        'kick', 'kick_sub', 'snare', 'snare_ghost', 'snare_rim',
                        'tom_high1', 'tom_high2', 'tom_mid1', 'tom_mid2',
                        'tom_low1', 'tom_low2', 'hihat_closed', 'hihat_open',
                        'hihat_pedal', 'crash1', 'crash2', 'ride_bell',
                        'ride_crash', 'ride_tip', 'china', 'splash',
                        'bell', 'click', 'click_high'
                    ].map(name => (
                        <option key={name} value={name}>{name.replace(/_/g, ' ')}</option>
                    ))}
                </select>
            </div>

            {/* 視覚イメージ（TrainingVisualizer） */}
            <div className="w-full flex items-center justify-center overflow-hidden" style={{ minHeight: '200px' }}>
                <TrainingVisualizer
                    sectionIndex={sectionIndex}
                    partIndex={partIndex}
                    beatIndex={beatIndex}
                    volumes={volumes}
                    onVolumesChange={setVolumes}
                    m={m}
                />
            </div>

            {/* 設定完了ボタン */}
            <div className="flex justify-end gap-4 mt-4">
                <button
                    onClick={playSample}
                    className="px-4 py-1 bg-gradient-to-br from-green-600 to-black hover:bg-green-500 rounded"
                >
                    サンプル再生
                </button>
                <button
                    onClick={onClose}
                    className="px-4 py-1 bg-gradient-to-br from-grey-600 to-black hover:bg-gray-500 rounded"
                >
                    キャンセル
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-1 bg-gradient-to-br from-blue-600 to-black hover:bg-blue-500 rounded"
                >
                    設定する
                </button>
            </div>
        </div>
    );
};

export default BeatSettingPanel;
