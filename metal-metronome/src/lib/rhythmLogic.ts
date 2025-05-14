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

let rhythmParts: Tone.Part[] = [];
let tempoPart: Tone.Part | null = null;

const SOUND_FILES: { [key: string]: string } = {
    kick: 'sounds/kick.wav',
    kick_sub: 'sounds/kick_sub.wav',
    snare: 'sounds/snare.wav',
    snare_ghost: 'sounds/snare_ghost.wav',
    snare_rim: 'sounds/snare_rim.wav',
    tom_high1: 'sounds/tom_high1.wav',
    tom_high2: 'sounds/tom_high2.wav',
    tom_mid1: 'sounds/tom_mid1.wav',
    tom_mid2: 'sounds/tom_mid2.wav',
    tom_low1: 'sounds/tom_low1.wav',
    tom_low2: 'sounds/tom_low2.wav',
    hihat_closed: 'sounds/hihat_closed.wav',
    hihat_open: 'sounds/hihat_open.wav',
    hihat_pedal: 'sounds/hihat_pedal.wav',
    crash1: 'sounds/crash1.wav',
    crash2: 'sounds/crash2.wav',
    ride_bell: 'sounds/ride_bell.wav',
    ride_crash: 'sounds/ride_crash.wav',
    ride_tip: 'sounds/ride_tip.wav',
    china: 'sounds/china.wav',
    splash: 'sounds/splash.wav',
    bell: 'sounds/bell.wav',
    click: 'sounds/click.wav',
    click_high: 'sounds/click_high.wav',
    // 追加したい音があればここに追加
};

const beatPlayers: { [key: string]: Tone.Player[] } = {};

export const loadSamples = async (partCount: number = 4) => {
    await Tone.loaded();
    for (const soundName in SOUND_FILES) {
        beatPlayers[soundName] = [];
        for (let i = 0; i < partCount + 1; i++) {
            beatPlayers[soundName][i] = new Tone.Player(SOUND_FILES[soundName]).toDestination();
        }
    }
};

export const playBeat = (index: number, isMuted: boolean, time?: number, volume?: number = 1.0, partSounds?: string[], accentLevels?: ('strong' | 'normal' | 'weak' | 'none')[], count: number) => {
    const sound = partSounds?.[index];

    if (sound === 'tempo') {
        const accent = accentLevels?.[count];
        // ⬅️ テンポパネルの場合：アクセントで分岐
        const player =
            accent === 'strong' ? beatPlayers['click_high']?.[index]
            : accent === 'normal' ? beatPlayers['click']?.[index]
            : beatPlayers['click']?.[index];

        if (!isMuted && player) {
            player.volume.value = Tone.gainToDb(volume);
            player.start(time);
        }
    } else {
        // ⬅️ 通常のリズムパネル
        const player = beatPlayers[sound]?.[index];
        if (!isMuted && player) {
            player.volume.value = Tone.gainToDb(volume);
            player.start(time);
        }
    }
};

const getSecondsPerBeat = (
    bpm: number,
    denominator: 1 | 2 | 4 | 8 | 16,
    noteValue: "quarter" | "eighth" | "dotted-eighth"
): number => {
    const noteBase = noteValue === "quarter" ? 4
                    : noteValue === "eighth" ? 8
                    : 8 * 3 / 2; // dotted-eighth = 8分音符 * 1.5 → 基準は 8 * 2 / 3

    const beatsPerWholeNote = noteBase / denominator;
    return (60 / bpm) * beatsPerWholeNote;
};

/**
 * テンポ（拍）のループ処理
 */
export const startTempoLoop = (
    bpm: number,
    noteValue: "quarter" | "eighth" | "dotted-eighth",
    setCurrentAccentStep: (step: number) => void,
    numerator: number,
    denominator: 1 | 2 | 4 | 8 | 16
) => {
    const secondsPerBeat = getSecondsPerBeat(bpm, denominator, noteValue);

    if (tempoPart) {
        tempoPart.dispose();
    }

    const events: [number, number][] = Array.from({ length: numerator }, (_, i) => [
        i * secondsPerBeat,
        i,
    ]);

    tempoPart = new Tone.Part((time, step) => {
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
    setCurrentRhythmSteps: (steps: number[]) => void,
    rhythmVolumes: number[][],
    noteValue: "quarter" | "eighth" | "dotted-eighth",
    denominator: 1 | 2 | 4 | 8 | 16,
    partSounds: string[],
    accentLevels: (AccentType[] | null)[]
) => {
    const secondsPerBeat = getSecondsPerBeat(bpm, denominator, noteValue);
    const stepPositions = Array(partCount).fill(0);

    for (let partIndex = 0; partIndex < partCount; partIndex++) {
        const accents = accentLevels[partIndex];
        const { n, m } = rhythmUnits[partIndex];
        const loopEnd = secondsPerBeat * n;
        const interval = loopEnd / m;

        const events: [number, () => void][] = [];

        for (let i = 0; i < m; i++) {
            const time = i * interval;
            const volume = rhythmVolumes?.[partIndex]?.[i] ?? 1.0;
            events.push([
                time,
                () => {
                    playBeat(partIndex, muteStates[partIndex], undefined, volume, partSounds, accents, i);
                    const rhythmIndex = partIndex - 1;
                    stepPositions[rhythmIndex] = i;
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
    setCurrentRhythmSteps: (steps: number[]) => void,
    rhythmVolumes: number[][],
    denominator: 1 | 2 | 4 | 8 | 16,
    partSounds: string[]
) => {
    const now = Tone.now();
    const secondsPerBeat = getSecondsPerBeat(bpm, denominator, noteValue);

    // テンポを0番目として統一処理に追加
    const tempoUnit = { n: numerator, m: numerator };
    const tempoVolumes = accents.map(a =>
        a === 'strong' ? 1.0 : a === 'normal' ? 0.7 : a === 'weak' ? 0.3 : 0
    );
    startTempoLoop(bpm, noteValue, setCurrentAccentStep, numerator, denominator);
    startRhythmLoop(
        bpm,
        [tempoUnit, ...rhythmUnits],
        [false, ...muteStates],
        partCount + 1,
        setCurrentRhythmSteps,
        [tempoVolumes, ...rhythmVolumes],
        noteValue,
        denominator,
        ['tempo', ...partSounds],
        [accents, ...Array(partCount).fill(null)]
    );

    // アクセントのステップを更新（視覚化用）
    let accentStep = 0;
    const accentLoop = new Tone.Loop((time) => {
        setCurrentAccentStep(accentStep);
        accentStep = (accentStep + 1) % numerator;
    }, secondsPerBeat);

    accentLoop.start(0);
    rhythmParts.push(accentLoop);

    Tone.Transport.start(now);
};

/**
 * 停止とイベント解除
 */
export const stopAllLoops = () => {
    for (const part of rhythmParts) {
        part.dispose(); // Tone.Part の後始末
    }
    rhythmParts = [];

    Tone.Transport.stop();
};
