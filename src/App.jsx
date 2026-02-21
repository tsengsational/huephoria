import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import HomeScreen from './components/HomeScreen';
import ResultsScreen from './components/ResultsScreen';
import SavedPalettes from './components/SavedPalettes';
import { generatePalette, getRandomVibrantColor, resolveColorInfo } from './utils/colorLogic';

function App() {
  const [motherColor, setMotherColor] = useState(getRandomVibrantColor());
  const [mode, setMode] = useState('vibrant');
  const [screen, setScreen] = useState('home');
  const [paletteData, setPaletteData] = useState(null);

  const handleGenerate = () => {
    const data = generatePalette(motherColor, mode);
    setPaletteData(data);
    setScreen('results');
  };

  const handleRegenerate = () => {
    const newColor = getRandomVibrantColor();
    setMotherColor(newColor);
    const data = generatePalette(newColor, mode);
    setPaletteData(data);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    const data = generatePalette(motherColor, newMode);
    setPaletteData(data);
  };

  const handleUpdatePaletteColor = (type, index, newHex) => {
    if (!paletteData) return;

    const updatedColor = resolveColorInfo(newHex);
    let newPaletteData = { ...paletteData };

    if (type === 'matrix') {
      const [r, c] = index;
      const oldHex = newPaletteData.matrix[r][c].hex;

      // Update matrix
      newPaletteData.matrix = [...newPaletteData.matrix];
      newPaletteData.matrix[r] = [...newPaletteData.matrix[r]];
      newPaletteData.matrix[r][c] = updatedColor;

      // Sync featured if it was a reference
      newPaletteData.featured = newPaletteData.featured.map(f => f.hex === oldHex ? updatedColor : f);
    } else if (type === 'featured') {
      const oldHex = newPaletteData.featured[index].hex;

      // Update featured
      newPaletteData.featured = [...newPaletteData.featured];
      newPaletteData.featured[index] = updatedColor;

      // Sync matrix
      newPaletteData.matrix = newPaletteData.matrix.map(row =>
        row.map(cell => cell.hex === oldHex ? updatedColor : cell)
      );
    }

    setPaletteData(newPaletteData);
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
              onSelect={handleSelectSaved}
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
              currentMode={mode}
              onRegenerate={handleRegenerate}
              onModeChange={handleModeChange}
              onUpdateColor={handleUpdatePaletteColor}
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
