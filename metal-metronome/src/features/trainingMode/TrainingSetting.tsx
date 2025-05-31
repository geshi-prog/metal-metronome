/**
 * ファイル名：src/features/trainingMode/TrainingSetting.tsx
 * 目的：トレーニングモード設定ページのルーティング管理
 */

import React, {useEffect} from 'react';
import { useTrainingContext } from '@/contexts/TrainingContext';
import { ClickTrackData, RhythmPartData, RhythmSoundSource, Section } from '../../types/training';
import RhythmNameEditor from './RhythmNameEditor';
import TrainingMeasureSetting from './TrainingMeasureSetting';
import TrainingPartSetting from './TrainingPartSetting';
import TrainingLoopSetting from './TrainingLoopSetting';
import ExportImportControls from '@/components/ExportImportControls.tsx';
import { loadTrainingSamples, playConvertedSounds, stopTrainingRhythm } from '@/lib/trainingRhythm';

function generateBpmSteps(
    baseBpms: number[],
    mode: string,
    tempoStep: number,
    minTempo: number,
    maxTempo: number,
    loopChangeCount: number,
    loopRepeatLimit: number
): number[][] {
    const result: number[][] = [];

    const stepUp = (bpms: number[]) => bpms.map(b => b + tempoStep);
    const stepDown = (bpms: number[]) => bpms.map(b => b - tempoStep);

    const isMax = (bpms: number[]) => bpms[0] >= baseBpms[0] + (maxTempo - baseBpms[0]);
    const isMin = (bpms: number[]) => bpms[0] <= baseBpms[0] - (baseBpms[0] - minTempo);
    const isBase = (bpms: number[], base: number[]) => bpms[0] === base[0];

    let current = [...baseBpms];
    const base = [...baseBpms];

    const repeat = (fn: () => void, count: number) => {
        for (let i = 0; i < count; i++) fn();
    };

    if (mode === "accelerate") {
        while (true) {
            repeat(() => result.push([...current]), loopChangeCount);
            if (isMax(current)) break;
            current = stepUp(current);
        }
    }

    else if (mode === "decelerate") {
        while (true) {
            repeat(() => result.push([...current]), loopChangeCount);
            if (isMin(current)) break;
            current = stepDown(current);
        }
    }

    else if (mode === "repeat-accel-decel") {
        for (let i = 0; i < loopRepeatLimit; i++) {
            // base → max
            while (!isMax(current)) {
                repeat(() => result.push([...current]), loopChangeCount);
                current = stepUp(current);
            }
            repeat(() => result.push([...current]), loopChangeCount); // max

            // max → min
            while (!isMin(current)) {
                current = stepDown(current);
                repeat(() => result.push([...current]), loopChangeCount);
            }

            // min → base（base直前まで刻む）
            while (true) {
                const next = stepUp(current);
                if (isBase(next, base)) break;
                current = next;
                repeat(() => result.push([...current]), loopChangeCount);
            }

            // baseには戻すがpushはしない（次ループ開始用）
            current = [...base];
        }
    }

    else if (mode === "repeat-decel-accel") {
        for (let i = 0; i < loopRepeatLimit; i++) {
            // base → min
            while (!isMin(current)) {
                repeat(() => result.push([...current]), loopChangeCount);
                current = stepDown(current);
            }
            repeat(() => result.push([...current]), loopChangeCount); // min

            // min → max
            while (!isMax(current)) {
                current = stepUp(current);
                repeat(() => result.push([...current]), loopChangeCount);
            }

            // max → base（base直前まで刻む）
            while (true) {
                const next = stepDown(current);
                if (isBase(next, base)) break;
                current = next;
                repeat(() => result.push([...current]), loopChangeCount);
            }

            // baseには戻すがpushはしない（次ループ開始用）
            current = [...base];
        }
    }

    else if (mode === "endless") {
        for (let i = 0; i < loopRepeatLimit; i++) {
            result.push([...current]);
        }
    }

    return result;
}

const isBase = (current: number[], base: number[]) =>
    current.every((bpm, idx) => bpm === base[idx]);

function insertCountInTracks(
    clickTracks: ClickTrackData[][],
    rhythmTracks: RhythmPartData[][][],
    countInTrack: ClickTrackData[][] | undefined,
    loopChangeCount: number
): {
    clickTracksWithCountIn: ClickTrackData[][],
    rhythmTracksWithCountIn: RhythmPartData[][][]
} {
    if (!countInTrack) {
        return {
            clickTracksWithCountIn: clickTracks,
            rhythmTracksWithCountIn: rhythmTracks
        };
    }

    const resultClick: ClickTrackData[][] = [];
    const resultRhythm: RhythmPartData[][][] = [];

    for (let i = 0; i < clickTracks.length; i++) {
        if (i % loopChangeCount === 0 && i !== 0) {
            const countIn = countInTrack[i] ?? countInTrack[0];
            // 🔧 空拍を作成
            const countInEmptyBeat: RhythmPartData = {
                bpm: countInTrack[i][0].bpm,
                noteValue: countInTrack[i][0].noteValue,
                denominator: countInTrack[i][0].denominator,
                n: 1,
                m: 1,
                sound: "kick",
                volume: 0,
            };
            const countInEmptyPart: RhythmPartData[] = Array(countIn.length).fill(countInEmptyBeat);
            const countInEmptyParts: RhythmPartData[][] = Array(4).fill(0).map(() => [...countInEmptyPart]);

            resultClick.push(countIn);
            resultRhythm.push(countInEmptyParts); // カウントイン後に通常のリズム再生
        }

        resultClick.push(clickTracks[i]);
        resultRhythm.push(rhythmTracks[i]);
    }

    return {
        clickTracksWithCountIn: resultClick,
        rhythmTracksWithCountIn: resultRhythm
    };
}

/**
 * ClickTrackDataとRhythmPartDataを統合し、playBeat用に変換する
 * n拍m連やvolume配列は分解され、1つずつの音として返される
 */
export function generateConvertedSounds(
  clickTracksWithCountIn: ClickTrackData[][],
  rhythmTracksWithCountIn: RhythmPartData[][][]
): RhythmPartData[][][] {
  const converted: RhythmPartData[][][] = [];

  for (let loopIndex = 0; loopIndex < clickTracksWithCountIn.length; loopIndex++) {
    const clickLoop = clickTracksWithCountIn[loopIndex];
    const rhythmLoop = rhythmTracksWithCountIn[loopIndex];

    const loopData: RhythmPartData[][] = [];

    // クリック音をパート0に格納
    const clickPart: RhythmPartData[] = clickLoop.map(click => {
      let sound = 'click';
      let volume = 1.0;

      switch (click.accent) {
        case 'bell':
          sound = 'bell';
          volume = 1.0;
          break;
        case 'strong':
          sound = 'click_high';
          volume = 1.0;
          break;
        case 'normal':
          sound = 'click';
          volume = 1.0;
          break;
        case 'weak':
          sound = 'click';
          volume = 0.5;
          break;
        case 'none':
          sound = 'click';
          volume = 0.0;
          break;
      }

      return {
        bpm: click.bpm,
        noteValue: click.noteValue,
        denominator: click.denominator,
        n: 1,
        m: 1,
        sound,
        volume,
      };
    });

    loopData.push(clickPart);

    // リズムパート（パート1以降）
    for (let partIndex = 0; partIndex < rhythmLoop.length; partIndex++) {
      const rhythmPart: RhythmPartData[] = [];

      for (const rhythm of rhythmLoop[partIndex]) {
        const {
          bpm,
          noteValue,
          denominator,
          n,
          m,
          sound,
          volume
        } = rhythm;

        // volumeが配列 → m連で展開
        if (Array.isArray(volume)) {
          for (let i = 0; i < volume.length; i++) {
            rhythmPart.push({
              bpm,
              noteValue,
              denominator,
              n,
              m,
              sound,
              volume: volume[i],
            });
          }
        } else {
          rhythmPart.push({
            bpm,
            noteValue,
            denominator,
            n,
            m,
            sound,
            volume,
          });
        }
      }

      loopData.push(rhythmPart);
    }

    converted.push(loopData);
  }

  return converted;
}

const TrainingSetting: React.FC = () => {
    const { currentPage, setCurrentPage, sections, parts, tempoSetting, accentList, countIn, loopChangeCount, loopRepeatLimit, loopMode, tempoStep, minTempo, maxTempo, setBuiltClickTracks, builtClickTracks, setBuiltRhythmTracks, builtRhythmTracks, isPlaying, setIsPlaying, clickTracksWithCountIn, rhythmTracksWithCountIn, convertedSounds, setConvertedSounds, setSections, setParts, setRhythmName, setTempoSetting, setAccentType, setAccentList, setLoopMode, setTempoStep, setMinTempo, setMaxTempo, setLoopChangeCount, setLoopRepeatLimit, setCountIn } = useTrainingContext();
    useEffect(() => {
        loadTrainingSamples(4);
    }, []);

    const handleBuildSoundSource = () => {
        const baseBpms = sections.map(s => s.bpm);
        // テンポ変化のステップ生成（現時点では mode: 'up' のみ）
        const bpmSteps = generateBpmSteps(
            baseBpms, loopMode, tempoStep, minTempo, maxTempo,
            loopChangeCount, loopRepeatLimit
        );
    
        // クリックトラック生成
        const clickTracks: ClickTrackData[][] = bpmSteps.map(stepBpms => {
            const clicks: ClickTrackData[] = [];
            let accentIdx = 0;
    
            stepBpms.forEach((bpm, sectionIdx) => {
                const section = sections[sectionIdx];
                for (let loop = 0; loop < section.loopCount; loop++) {
                    for (let i = 0; i < section.numerator; i++) {
                        clicks.push({
                            bpm,
                            noteValue: section.noteValue,
                            denominator: section.denominator,
                            accent: accentList[accentIdx % accentList.length],
                        });
                        accentIdx++;
                    }
                }
            });
    
            return clicks;
        });
    
        const countInTrack: ClickTrackData[][] | undefined = countIn && loopMode !== 'endless'
            ? clickTracks.map((step) => {
                const countInStep = step.slice(0, sections[0].numerator * sections[0].loopCount);
                if (countInStep.length > 0) {
                    countInStep[0] = {
                        ...countInStep[0],
                        accent: "bell"  // 1拍目だけ bell に変更
                    };
                }
                return countInStep;
            })
            : undefined;

        const rhythmTracks: RhythmPartData[][][] = bpmSteps.map((stepBpms) => {
            return parts.map((part) => {
                const beats = part.beats;
        
                // 各拍ごとにどの小節に属しているかを記録
                const beatSections: { beat: Beat, sectionIdx: number }[] = [];
                let totalBeats = 0;
                sections.forEach((section, sectionIdx) => {
                    const count = section.numerator * section.loopCount;
                    for (let i = 0; i < count; i++) {
                        if (beats[totalBeats]) {
                            beatSections.push({
                                beat: beats[totalBeats],
                                sectionIdx,
                            });
                        }
                        totalBeats++;
                    }
                });
        
                // 除外対象インデックスを記録
                const toExclude = new Set<number>();
                beatSections.forEach((item, idx) => {
                    if (item.beat.n && item.beat.n > 1) {
                        for (let i = 1; i < item.beat.n; i++) {
                            toExclude.add(idx + i);
                        }
                    }
                });
        
                // 有効なビートだけ変換
                const partData: RhythmPartData[] = beatSections
                    .filter((_, idx) => !toExclude.has(idx))
                    .map(({ beat, sectionIdx }) => {
                        const section = sections[sectionIdx];
                        const bpm = stepBpms[sectionIdx] ?? baseBpms[sectionIdx] ?? 120;
                        return {
                            bpm,
                            noteValue: section.noteValue,
                            denominator: section.denominator ?? 1,
                            n: beat.n ?? 1,
                            m: beat.m ?? 1,
                            sound: beat.sound ?? 'kick',
                            volume: beat.volumes ?? 1.0,
                        };
                    });
        
                return partData;
            });
        });

    
        const rhythmSoundSource: RhythmSoundSource = {
            clickTracks,
            rhythmTracks,
            countInTrack,
        };
    
        const results = insertCountInTracks(clickTracks, rhythmTracks, countInTrack, loopChangeCount);
        setBuiltClickTracks(results.clickTracksWithCountIn);
        setBuiltRhythmTracks(results.rhythmTracksWithCountIn);
        console.log('🎵 RhythmSoundSource 完成:', rhythmSoundSource);
        console.log(results);
        const converted = generateConvertedSounds(results.clickTracksWithCountIn, results.rhythmTracksWithCountIn);
        setConvertedSounds(converted);
        console.log("converted:", converted);
    };

    // ページごとの表示切り替え
    switch (currentPage) {
        case 'measure':
            return <TrainingMeasureSetting />;
        case 'part':
            return <TrainingPartSetting />;
        case 'loop':
            return <TrainingLoopSetting />;
        case 'base':
        default:
            return (
                <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-white text-xl font-bold">トレーニングモード設定</h2>
                    <RhythmNameEditor />
                    <ExportImportControls />
                    <button
                        onClick={() => {
                            const confirmed = confirm('⚠️ 本当にすべての設定をリセットしますか？この操作は取り消せません。');
                            if (!confirmed) return;

                            // 初期化処理（TrainingContextの初期状態に戻す）
                            setSections([]);
                            setParts([]);
                            setRhythmName('');
                            setTempoSetting({});
                            setAccentType('normal');
                            setAccentList([]);
                            setLoopMode('endless');
                            setTempoStep(5);
                            setMinTempo(60);
                            setMaxTempo(180);
                            setLoopChangeCount(2);
                            setLoopRepeatLimit(1);
                            setCountIn(false);
                            setBuiltClickTracks([]);
                            setBuiltRhythmTracks([]);
                            setConvertedSounds([]);
                        }}
                        className="bg-gradient-to-br from-red-700 to-black hover:bg-red-800 text-white px-4 py-2 rounded"
                    >
                        ⚠️ すべての設定をリセット
                    </button>
                    <button
                        onClick={() => setCurrentPage('measure')}
                        className="mt-4 bg-gradient-to-br from-blue-600 to-black hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition duration-200"
                    >
                        小節設定へ進む →
                    </button>
                    <button
                        onClick={handleBuildSoundSource}
                        disabled={sections.length === 0 || parts.length === 0}
                        className={`bg-gradient-to-br ${sections.length > 0 && parts.length > 0 ? 'from-green-600' : 'from-gray-600 cursor-not-allowed'} to-black text-white px-4 py-2 rounded hover:bg-blue-700 transition`}
                    >
                        音源を作成する
                    </button>
                    {isPlaying ? (
                      <button
                        onClick={() => stopTrainingRhythm(setIsPlaying)}
                        className="bg-gradient-to-br from-red-600 to-black text-white px-4 py-2 rounded"
                      >
                        停止する
                      </button>
                    ) : (
                      <button
                        onClick={() => playConvertedSounds(convertedSounds!, setIsPlaying)}
                        disabled={convertedSounds.length === 0}
                        className={`bg-gradient-to-br ${convertedSounds.length > 0 ? 'from-blue-600' : 'from-gray-600 cursor-not-allowed'} to-black text-white px-4 py-2 rounded`}
                      >
                        再生する
                      </button>
                    )}
                </div>
            );
    }
};

export default TrainingSetting;
