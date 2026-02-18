import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import HomeScreen from './components/HomeScreen';
import ResultsScreen from './components/ResultsScreen';
import SavedPalettes from './components/SavedPalettes';
import { generatePalette } from './utils/colorLogic';

function App() {
  const [motherColor, setMotherColor] = useState('#EC4899'); // Pink-500 default
  const [mode, setMode] = useState('vibrant');
  const [screen, setScreen] = useState('home');
  const [paletteData, setPaletteData] = useState(null);

  const handleGenerate = () => {
    const data = generatePalette(motherColor, mode);
    setPaletteData(data);
    setScreen('results');
  };

  const handleRegenerate = () => {
    const data = generatePalette(motherColor, mode);
    setPaletteData(data);
  };

  const handleSelectSaved = (data) => {
    // Re-chunk the matrix if it's flat (from Firestore)
    let reconstructedData = { ...data };
    if (data.matrix && data.matrix.length === 36 && !Array.isArray(data.matrix[0])) {
      const chunked = [];
      for (let i = 0; i < data.matrix.length; i += 9) {
        chunked.push(data.matrix.slice(i, i + 9));
      }
      reconstructedData.matrix = chunked;
    }
    setPaletteData(reconstructedData);
    setScreen('results');
  };

  return (
    <Layout onNavigateSaved={() => setScreen('saved')}>
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex-1 flex flex-col"
          >
            <HomeScreen
              motherColor={motherColor}
              setMotherColor={setMotherColor}
              onGenerate={handleGenerate}
              mode={mode}
              setMode={setMode}
            />
          </motion.div>
        )}

        {screen === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex-1 flex flex-col"
          >
            <ResultsScreen
              paletteData={paletteData}
              onRegenerate={handleRegenerate}
              onBack={() => setScreen('home')}
            />
          </motion.div>
        )}

        {screen === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full flex-1 flex flex-col"
          >
            <SavedPalettes
              onBack={() => setScreen('home')}
              onSelect={handleSelectSaved}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default App;
