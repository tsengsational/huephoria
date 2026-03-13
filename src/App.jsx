import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import HomeScreen from './components/HomeScreen';
import ResultsScreen from './components/ResultsScreen';
import SavedPalettes from './components/SavedPalettes';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import StaticPage from './components/StaticPage';
import { generatePalette, getRandomVibrantColor, resolveColorInfo } from './utils/colorLogic';
import { AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [motherColor, setMotherColor] = useState(getRandomVibrantColor());
  const [mode, setMode] = useState('vibrant');
  const [paletteData, setPaletteData] = useState(null);

  useEffect(() => {
    // Initialize AdMob if on native platform
    if (Capacitor.isNativePlatform()) {
      AdMob.initialize({
        initializeForTesting: true,
      });
    }
  }, []);

  const handleGenerate = () => {
    const data = generatePalette(motherColor, mode);
    setPaletteData(data);
    navigate('/results');
  };

  const handleRegenerate = (lockedSlots = {}) => {
    if (!paletteData) return;

    let rootHex = paletteData.featured[0].hex;

    if (!lockedSlots[0]) {
      rootHex = getRandomVibrantColor();
      setMotherColor(rootHex);
    }

    const newData = generatePalette(rootHex, mode);

    const mergedFeatured = newData.featured.map((f, i) => {
      return lockedSlots[i] ? paletteData.featured[i] : f;
    });

    setPaletteData({
      ...newData,
      featured: mergedFeatured
    });
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

      newPaletteData.matrix = [...newPaletteData.matrix];
      newPaletteData.matrix[r] = [...newPaletteData.matrix[r]];
      newPaletteData.matrix[r][c] = updatedColor;

      newPaletteData.featured = newPaletteData.featured.map(f => f.hex === oldHex ? updatedColor : f);
    } else if (type === 'featured') {
      const oldHex = newPaletteData.featured[index].hex;

      newPaletteData.featured = [...newPaletteData.featured];
      newPaletteData.featured[index] = updatedColor;

      newPaletteData.matrix = newPaletteData.matrix.map(row =>
        row.map(cell => cell.hex === oldHex ? updatedColor : cell)
      );
    }

    setPaletteData(newPaletteData);
  };

  const handleSelectSaved = (data) => {
    let reconstructedData = { ...data };
    if (data.matrix && data.matrix.length === 36 && !Array.isArray(data.matrix[0])) {
      const chunked = [];
      for (let i = 0; i < data.matrix.length; i += 9) {
        chunked.push(data.matrix.slice(i, i + 9));
      }
      reconstructedData.matrix = chunked;
    }
    setPaletteData(reconstructedData);
    navigate('/results');
  };

  return (
    <Layout 
      onNavigateSaved={() => navigate('/saved')} 
      onNavigateBlog={() => navigate('/blog')}
      onNavigateHome={() => navigate('/')}
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
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
          } />

          <Route path="/results" element={
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
                onBack={() => navigate('/')}
              />
            </motion.div>
          } />

          <Route path="/saved" element={
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full flex-1 flex flex-col"
            >
              <SavedPalettes
                onBack={() => navigate('/')}
                onSelect={handleSelectSaved}
              />
            </motion.div>
          } />

          <Route path="/blog" element={
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex-1 flex flex-col"
            >
              <BlogList 
                onSelectPost={(slug) => navigate(`/blog/${slug}`)}
                onBack={() => navigate('/')}
              />
            </motion.div>
          } />

          <Route path="/blog/:slug" element={
            <motion.div
              key="blogPost"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="w-full flex-1 flex flex-col"
            >
              <BlogPost onBack={() => navigate('/blog')} />
            </motion.div>
          } />
          
          {/* Static Pages */}
          <Route path="/:pageId" element={
            <motion.div
              key="staticPage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex-1 flex flex-col"
            >
              <StaticPage />
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default App;
