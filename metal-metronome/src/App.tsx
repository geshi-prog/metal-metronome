import './App.css'
import { useAppContext } from '@/contexts/AppContext';
import RhythmModePage from '@/features/rhythmMode/RhythmModePage';
import TrainingModePage from '@/features/trainingMode/TrainingModePage';
import { RhythmProvider } from '@/contexts/RhythmContext';
import { TrainingProvider } from '@/contexts/TrainingContext';

const App: React.FC = () => {
  const { mode } = useAppContext();
  return (
    <RhythmProvider>
      <TrainingProvider>
        {mode === 'rhythm' ? <RhythmModePage /> : <TrainingModePage />}
      </TrainingProvider>
    </RhythmProvider>
  );
};

export default App
