import React, { createContext, useContext, useState } from 'react';

type ModeType = 'rhythm' | 'training';

type AppContextType = {
    mode: ModeType;
    setMode: (mode: ModeType) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('AppContext must be used within AppProvider');
    return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ModeType>('rhythm');

    return (
        <AppContext.Provider value={{ mode, setMode }}>
            {children}
        </AppContext.Provider>
    );
};
