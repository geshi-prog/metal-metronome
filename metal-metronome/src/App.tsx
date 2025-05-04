import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import RhythmModePage from '@/features/rhythmMode/RhythmModePage';
import { RhythmProvider } from '@/contexts/RhythmContext';

const App: React.FC = () => {
  return (
    <RhythmProvider>
      <RhythmModePage />
    </RhythmProvider>
  );
};

export default App
