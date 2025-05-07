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

let tempoLoopId: NodeJS.Timeout | null = null;

// サウンドを定義
const clickHighPlayer = new Tone.Player('/sounds/click_high.wav').toDestination();
const clickPlayer = new Tone.Player('/sounds/click.wav').toDestination();
const clickLowPlayer = new Tone.Player('/sounds/click_low.wav').toDestination();
const kickPlayer = new Tone.Player('/sounds/kick.wav').toDestination();

export const loadSamples = async () => {
    await Tone.loaded();
};

/**
 * 1音だけ鳴らす
 */
export const playBeat = (index: number, isMuted: boolean, time?: number) => {
    if (!isMuted) {
        kickPlayer.start(time);
    }
};

export const playTempoClick = (accent: 'strong' | 'normal' | 'weak' | 'none', time?: number) => {

    switch (accent) {
        case 'strong':
            clickHighPlayer.start(time);
            break;
        case "normal":
            clickPlayer.start(time);
            break;
        case 'weak':
            clickLowPlayer.start(time);
            break;
        case "none":
            // 無音：なにもしない
            break;
    }
};

export const startTempoLoop = (
    bpm: number,
    noteValue: "quarter" | "eighth" | "dotted-eighth",
    accents: ('strong' | 'normal' | 'weak' | 'none')[],
    setCurrentAccentStep: (step: number) => void,
    muteStates: boolean[],
    partCount: number,
    numerator: number
) => {
    const getNoteSymbol = (val: typeof noteValue) => {
        switch (val) {
            case 'quarter': return '4n';
            case 'eighth': return '8n';
            case 'dotted-eighth': return '8t';
            default: return '4n';
        }
    };

    Tone.Transport.cancel(); // 以前のスケジュールをクリア
    Tone.Transport.bpm.value = bpm;

    let step = numerator -1 ;

    const noteSymbol = getNoteSymbol(noteValue);

    tempoLoopId = Tone.Transport.scheduleRepeat((time) => {
        Tone.Draw.schedule(() => {
            setCurrentAccentStep(step);
            playTempoClick(accents[step], time);
            for (let partIndex = 0; partIndex < partCount; partIndex++) {
                playBeat(step, muteStates[partIndex], time);
            }
        }, time);

        step = (step + 1) % numerator;
    }, noteSymbol);

    Tone.Transport.start();
};

export const stopTempoLoop = () => {
    if (tempoLoopId !== null) {
        Tone.Transport.clear(tempoLoopId);
        tempoLoopId = null;
    }
    Tone.Transport.stop();
};
