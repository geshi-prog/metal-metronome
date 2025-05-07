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
let rhythmParts: Tone.Part[] = [];
let tempoPart: Tone.Part | null = null;

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
    const secondsPerBeat = 60 / bpm;

    if (tempoPart) {
        tempoPart.dispose();
    }

    const events: [number, number][] = Array.from({ length: numerator }, (_, i) => [
        i * secondsPerBeat,
        i,
    ]);

    tempoPart = new Tone.Part((time, step) => {
        playTempoClick(accents[step], time);
        Tone.Draw.schedule(() => setCurrentAccentStep(step), time);
    }, events);

    tempoPart.loop = true;
    tempoPart.loopEnd = secondsPerBeat * numerator;
    tempoPart.start(0);

    rhythmParts.push(tempoPart);
};

/**
 * リズム音のループ（m連符など）
 */
export const startRhythmLoop = (
    bpm: number,
    rhythmUnits: { n: number; m: number }[],
    muteStates: boolean[],
    partCount: number,
    setCurrentRhythmSteps: (steps: number[]) => void
) => {
    const secondsPerBeat = 60 / bpm;
    const stepPositions = Array(partCount).fill(0);

    for (let partIndex = 0; partIndex < partCount; partIndex++) {
        const { n, m } = rhythmUnits[partIndex];
        const loopEnd = secondsPerBeat * n;
        const interval = loopEnd / m;

        const events: [number, () => void][] = [];

        for (let i = 0; i < m; i++) {
            const time = i * interval;
            events.push([
                time,
                () => {
                    playBeat(partIndex, muteStates[partIndex]);
                    stepPositions[partIndex] = i;
                    setCurrentRhythmSteps([...stepPositions]);
                }
            ]);
        }

        const part = new Tone.Part((time, callback) => {
            Tone.Draw.schedule(() => callback(), time);
        }, events);

        part.loop = true;
        part.loopEnd = loopEnd;
        part.start(0);

        rhythmParts.push(part);
    }

    // Transport はループしないようにして、
    // 各 Part に任せる
    Tone.Transport.loop = false;
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
    startRhythmLoop(bpm, rhythmUnits, muteStates, partCount, setCurrentRhythmSteps);
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

    for (const part of rhythmParts) {
        part.dispose(); // Tone.Part の後始末
    }
    rhythmParts = [];

    Tone.Transport.stop();
};
