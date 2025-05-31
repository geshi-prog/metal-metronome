// src/contexts/TrainingContext.tsx

import React, { createContext, useContext, useState } from 'react';
import { Section, Part, TempoSetting, TrainingPage, AccentType, TempoChangeMode, RhythmSoundSource, ClickTrackData, RhythmPartData } from '@/types/training';

type ConvertedSound = {
    bpm: number;
    noteValue: 'quarter' | 'eighth'; // 拡張可
    denominator: number;
    n: number;
    m: number;
    sound: string;
    volume: number;
};

type TrainingContextType = {
    sections: Section[];
    setSections: (s: Section[]) => void;
    parts: Part[];
    setParts: (p: Part[]) => void;
    currentSectionIndex: number;
    setCurrentSectionIndex: (i: number) => void;
    currentBeatIndex: number;
    setCurrentBeatIndex: (i: number) => void;
    isPlaying: boolean;
    setIsPlaying: (b: boolean) => void;
    rhythmName: string;
    setRhythmName: (name: string) => void;
    tempoSetting: TempoSetting;
    setTempoSetting: (setting: TempoSetting) => void;
    currentPage: TrainingPage;
    setCurrentPage: (p: TrainingPage) => void;
    accentType: AccentType;
    setAccentType: (p: AccentType) => void;
    accentList: AccentType[];
    setAccentList: (a: AccentType[]) => void;
    loopMode: TempoChangeMode;
    setLoopMode: (mode: TempoChangeMode) => void;
    tempoStep: number;
    setTempoStep: (step: number) => void;
    minTempo: number;
    setMinTempo: (min: number) => void;
    maxTempo: number;
    setMaxTempo: (max: number) => void;
    loopChangeCount: number;
    setLoopChangeCount: (count: number) => void;
    loopRepeatLimit: number;
    setLoopRepeatLimit: (limit: number) => void;
    countIn: boolean;
    setCountIn: (b: boolean) => void;
    soundSource: RhythmSoundSource | null;
    setSoundSource: (s: RhythmSoundSource | null) => void;
    builtClickTracks: ClickTrackData[][] | null;
    setBuiltClickTracks: (data: ClickTrackData[][] | null) => void;
    builtRhythmTracks: RhythmPartData[][][] | null;
    setBuiltRhythmTracks: (data: RhythmPartData[][][] | null) => void;
    convertedSounds: ConvertedSound[][][];
    setConvertedSounds: (s: ConvertedSound[][][]) => void;
};

const TrainingContext = createContext<TrainingContextType | null>(null);

export const useTrainingContext = () => {
    const ctx = useContext(TrainingContext);
    if (!ctx) throw new Error('TrainingContext must be used within TrainingProvider');
    return ctx;
};

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sections, setSections] = useState<Section[]>([]);
    const [parts, setParts] = useState<Part[]>([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [rhythmName, setRhythmName] = useState('リズム名');
    const [tempoSetting, setTempoSetting] = useState<TempoSetting>({
        loopCountPerStep: 2,
        tempoStep: 5,
        minTempo: 60,
        maxTempo: 180,
        mode: 'endless',
        includeCountIn: false,
    });
    const [currentPage, setCurrentPage] = useState<TrainingPage>('base');
    const [accentType, setAccentType] = useState('normal');
    const [accentList, setAccentList] = useState<AccentType[]>([]);
    const [loopMode, setLoopMode] = useState<TempoChangeMode>('endless');
    const [tempoStep, setTempoStep] = useState<number>(5);
    const [minTempo, setMinTempo] = useState<number>(60);
    const [maxTempo, setMaxTempo] = useState<number>(180);
    const [loopChangeCount, setLoopChangeCount] = useState<number>(1);
    const [loopRepeatLimit, setLoopRepeatLimit] = useState<number>(1);
    const [countIn, setCountIn] = useState<boolean>(false);
    const [soundSource, setSoundSource] = useState<RhythmSoundSource | null>(null);
    const [builtClickTracks, setBuiltClickTracks] = useState<ClickTrackData[][] | null>(null);
    const [builtRhythmTracks, setBuiltRhythmTracks] = useState<RhythmPartData[][][] | null>(null);
    const [convertedSounds, setConvertedSounds] = useState<ConvertedSound[][][]>([]);

    return (
        <TrainingContext.Provider value={{
            sections,
            setSections,
            parts,
            setParts,
            currentSectionIndex,
            setCurrentSectionIndex,
            currentBeatIndex,
            setCurrentBeatIndex,
            isPlaying,
            setIsPlaying,
            rhythmName,
            setRhythmName,
            tempoSetting,
            setTempoSetting,
            currentPage,
            setCurrentPage,
            accentType,
            setAccentType,
            accentList,
            setAccentList,
            loopMode,
            setLoopMode,
            tempoStep,
            setTempoStep,
            minTempo,
            setMinTempo,
            maxTempo,
            setMaxTempo,
            loopChangeCount,
            setLoopChangeCount,
            loopRepeatLimit,
            setLoopRepeatLimit,
            countIn,
            setCountIn,
            soundSource,
            setSoundSource,
            builtClickTracks,
            setBuiltClickTracks,
            builtRhythmTracks,
            setBuiltRhythmTracks,
            convertedSounds,
            setConvertedSounds,
        }}>
            {children}
        </TrainingContext.Provider>
    );
};
