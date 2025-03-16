import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { MisinformationHeatmap } from './components/MisinformationHeatmap';
import { GameEducation } from './components/GameEducation';
import { CollaborativeFactChecking } from './components/CollaborativeFactChecking';

function App() {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showFactChecking, setShowFactChecking] = useState(false);

  const handleFeatureClick = (feature: string) => {
    if (feature === "Misinformation Heatmap") {
      setShowHeatmap(true);
    } else if (feature === "Gamified Education") {
      setShowGame(true);
    } else if (feature === "Collaborative Fact-Checking") {
      setShowFactChecking(true);
    }
  };

  if (showHeatmap) {
    return <MisinformationHeatmap onClose={() => setShowHeatmap(false)} />;
  }

  if (showGame) {
    return <GameEducation onClose={() => setShowGame(false)} />;
  }

  if (showFactChecking) {
    return <CollaborativeFactChecking onClose={() => setShowFactChecking(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingPage onFeatureClick={handleFeatureClick} />
    </div>
  );
}

export default App; 