/**
 * ファイル名：src/lib/rhythmLogic.ts
 * 目的：リズム再生に必要な数値ロジック・タイミング計算を行うユーティリティ
 *
 * 機能概要：
 * - BPM／音価から1拍の長さ（ms）を算出
 * - 円周上の点配置座標を計算
 * - 各拍・各音符のタイミング／強弱→音量の変換
 *
 * 今後の拡張予定：
 * - 自動テンポ変化（チェンジアップ／往復）
 * - 表示密度チェックによる描画最適化
 */

import * as Tone from 'tone';

let rhythmEvents: number[] = [];

const clickHighPlayer = new Tone.Player('/sounds/click_high.wav').toDestination();
const clickPlayer = new Tone.Player('/sounds/click.wav').toDestination();
const clickLowPlayer = new Tone.Player('/sounds/click_low.wav').toDestination();
const kickPlayer = new Tone.Player('/sounds/kick.wav').toDestination();

export const loadSamples = async () => {
    await Tone.loaded();
};

export const playBeat = (index: number, isMuted: boolean, time?: number) => {
    if (!isMuted) {
        kickPlayer.start(time);
    }
};

export const playTempoClick = (accent: 'strong' | 'normal' | 'weak' | 'none', time?: number) => {
    switch (accent) {
        case 'strong': clickHighPlayer.start(time); break;
        case 'normal': clickPlayer.start(time); break;
        case 'weak': clickLowPlayer.start(time); break;
        case 'none': break;
    }
};

const getNoteSymbol = (val: "quarter" | "eighth" | "dotted-eighth") => {
    switch (val) {
        case 'quarter': return '4n';
        case 'eighth': return '8n';
        case 'dotted-eighth': return '8t';
        default: return '4n';
    }
};

/**
 * テンポ（拍）のループ処理
 */
export const startTempoLoop = (
    bpm: number,
    noteValue: "quarter" | "eighth" | "dotted-eighth",
    accents: ('strong' | 'normal' | 'weak' | 'none')[],
    setCurrentAccentStep: (step: number) => void,
    numerator: number
) => {
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.loop = true;
    Tone.Transport.loopEnd = getNoteSymbol(noteValue); // 1拍ずつ繰り返す

    let step = numerator - 1;

    const noteSymbol = getNoteSymbol(noteValue);

    const tempoEvent = Tone.Transport.scheduleRepeat((time) => {
        Tone.Draw.schedule(() => {
            setCurrentAccentStep(step);
        }, time);
        playTempoClick(accents[step], time);
        step = (step + 1) % numerator;
    }, noteSymbol);

    rhythmEvents.push(tempoEvent);
};

/**
 * リズム音のループ（m連符など）
 */
export const startRhythmLoop = (
    bpm: number,
    rhythmUnits: { n: number; m: number }[],
    muteStates: boolean[],
    partCount: number,
    numerator: number,
    noteValue: "quarter" | "eighth" | "dotted-eighth",
    setCurrentRhythmSteps: (steps: number[]) => void
) => {
    const secondsPerBeat = 60 / bpm;
    const loopDuration = secondsPerBeat * numerator;

    const loopEvent = Tone.Transport.scheduleRepeat((loopStartTime) => {
        for (let partIndex = 0; partIndex < partCount; partIndex++) {
            const { n, m } = rhythmUnits[partIndex];
            const total = secondsPerBeat * n;
            const interval = total / m;

            // loopDurationにnが何回入るかを求める
            const repetitions = Math.floor(loopDuration / total);

            for (let r = 0; r < repetitions; r++) {
                const offsetBase = r * total;
                for (let i = 0; i < m; i++) {
                    const offset = offsetBase + i * interval;
                    const scheduledTime = loopStartTime + offset;
                    playBeat(partIndex, muteStates[partIndex], scheduledTime);
                }
            }
        }
    }, loopDuration);

    rhythmEvents.push(loopEvent);

    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = loopDuration;
};

/**
 * 再生開始
 */
export const startAllLoops = (
    bpm: number,
    noteValue: "quarter" | "eighth" | "dotted-eighth",
    accents: ('strong' | 'normal' | 'weak' | 'none')[],
    setCurrentAccentStep: (step: number) => void,
    muteStates: boolean[],
    partCount: number,
    numerator: number,
    rhythmUnits: { n: number; m: number }[],
    setCurrentRhythmSteps: (steps: number[]) => void
) => {
    startTempoLoop(bpm, noteValue, accents, setCurrentAccentStep, numerator);
    startRhythmLoop(bpm, rhythmUnits, muteStates, partCount, numerator, noteValue, setCurrentRhythmSteps);
    Tone.Transport.start();
};

/**
 * 停止とイベント解除
 */
export const stopAllLoops = () => {
    for (const id of rhythmEvents) {
        Tone.Transport.clear(id);
    }
    rhythmEvents = [];

    Tone.Transport.stop();
};
