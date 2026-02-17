import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import HomeScreen from './components/HomeScreen';
import ResultsScreen from './components/ResultsScreen';
import { generatePalette } from './utils/colorLogic';

function App() {
  const [motherColor, setMotherColor] = useState('#EC4899'); // Pink-500 default
  const [screen, setScreen] = useState('home');
  const [paletteData, setPaletteData] = useState(null);

  const handleGenerate = () => {
    const data = generatePalette(motherColor);
    setPaletteData(data);
    setScreen('results');
  };

  const handleRegenerate = () => {
    const data = generatePalette(motherColor);
    setPaletteData(data);
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {screen === 'home' ? (
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
            />
          </motion.div>
        ) : (
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
      </AnimatePresence>
    </Layout>
  );
}

export default App;
