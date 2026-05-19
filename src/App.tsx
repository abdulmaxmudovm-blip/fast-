/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { TypingGame } from './components/TypingGame';
import { LearningModule } from './components/LearningModule';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Settings } from './types';

const DEFAULT_SETTINGS: Settings = {
  fontFamily: 'Montserrat',
  fontSize: 16,
  themeColor: '#ec4899', // vibrant pink
  fontColor: '#ffffff',
  backgroundImage: null,
  language: 'uz',
  duration: 60,
  showKeyboard: true
};

export default function App() {
  const [settings, setSettings] = useLocalStorage<Settings>('fast-write-settings', DEFAULT_SETTINGS);
  const [isLearningMode, setIsLearningMode] = useState(false);

  return (
    <div className="min-h-screen">
      {isLearningMode ? (
        <LearningModule 
          settings={settings} 
          onExit={() => setIsLearningMode(false)} 
        />
      ) : (
        <TypingGame 
          settings={settings} 
          setSettings={setSettings} 
          isLearningMode={isLearningMode}
          setIsLearningMode={setIsLearningMode}
        />
      )}
    </div>
  );
}

