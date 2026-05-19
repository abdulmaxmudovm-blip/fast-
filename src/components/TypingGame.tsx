import React, { useState, useEffect, useRef } from 'react';
import { Settings, GameState, Language } from '../types';
import { WORD_LISTS, DURATIONS, FONTS } from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon, RotateCcw, Keyboard as KeyboardIcon, Languages, Type, Palette, Image as ImageIcon, GraduationCap } from 'lucide-react';
import { Keyboard } from './Keyboard';

interface TypingGameProps {
  settings: Settings;
  setSettings: (s: Settings) => void;
  isLearningMode: boolean;
  setIsLearningMode: (l: boolean) => void;
}

export const TypingGame: React.FC<TypingGameProps> = ({ settings, setSettings, isLearningMode, setIsLearningMode }) => {
  const [words, setWords] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    isStarted: false,
    isFinished: false,
    timeLeft: settings.duration,
    wpm: 0,
    accuracy: 0,
    correctChars: 0,
    totalChars: 0,
    rawWpm: 0
  });
  const [activeKey, setActiveKey] = useState<string>('');
  const [marginOffset, setMarginOffset] = useState(0);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (wordsContainerRef.current) {
      const activeWordEl = wordsContainerRef.current.children[activeWordIndex] as HTMLElement;
      if (activeWordEl) {
        const wordTop = activeWordEl.offsetTop;
        // Shift if the word is not on the first row (offset > 24 roughly)
        if (wordTop > 40) {
          setMarginOffset(-(wordTop - 40));
        } else {
          setMarginOffset(0);
        }
      }
    }
  }, [activeWordIndex, words]);

  const generateWords = (lang: Language) => {
    const list = WORD_LISTS[lang];
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setWords(shuffled.slice(0, 100));
  };

  useEffect(() => {
    generateWords(settings.language);
  }, [settings.language]);

  useEffect(() => {
    if (gameState.isStarted && gameState.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (gameState.timeLeft === 0) {
      finishGame();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.isStarted, gameState.timeLeft]);

  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState(prev => ({
      ...prev,
      isStarted: false,
      isFinished: true,
      wpm: Math.round((prev.correctChars / 5) / (settings.duration / 60)),
      accuracy: prev.totalChars > 0 ? Math.round((prev.correctChars / prev.totalChars) * 100) : 0
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState.isFinished) return;

    const value = e.target.value;
    setUserInput(value);

    if (!gameState.isStarted) {
      setGameState(prev => ({ ...prev, isStarted: true }));
    }

    const currentWord = words[activeWordIndex];
    
    // If space is pressed
    if (value.endsWith(' ')) {
      const typedWord = value.trim();
      if (typedWord === currentWord) {
        setGameState(prev => ({
          ...prev,
          correctChars: prev.correctChars + currentWord.length + 1,
          totalChars: prev.totalChars + currentWord.length + 1
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          totalChars: prev.totalChars + currentWord.length + 1
        }));
      }
      setActiveWordIndex(prev => prev + 1);
      setUserInput('');

      if (activeWordIndex === words.length - 2) {
        generateWords(settings.language);
      }
      return;
    }

    // Live accuracy check for partial word
    // (This is handled by the rendering phase)
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setActiveKey(e.key);
    
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      resetGame();
    }
    
    if (e.key === 'Escape') {
      setShowSettings(prev => !prev);
    }
  };

  const handleKeyUp = () => {
    setActiveKey('');
  };

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    generateWords(settings.language);
    setUserInput('');
    setActiveWordIndex(0);
    setGameState({
      isStarted: false,
      isFinished: false,
      timeLeft: settings.duration,
      wpm: 0,
      accuracy: 0,
      correctChars: 0,
      totalChars: 0,
      rawWpm: 0
    });
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (!showSettings) {
      inputRef.current?.focus();
    }
  }, [showSettings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, backgroundImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-1000 relative overflow-hidden",
        !settings.backgroundImage && "bg-vibrant"
      )}
      style={{
        backgroundColor: settings.backgroundImage ? undefined : settings.themeColor,
        backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: settings.fontFamily,
        color: settings.fontColor
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      {/* Header */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between mb-4 mt-4">
        <div className="flex items-center gap-2">
          <Type className="w-6 h-6 text-theme-color" style={{ color: 'var(--theme-color)' }} />
          <h1 className="text-xl font-black tracking-tighter uppercase italic opacity-80">Fast Write</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-2xl border border-white/20 text-xs shadow-2xl transition-all hover:bg-white/15">
          <div className="flex gap-2.5 mr-3">
            {['#ec4899', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#ffffff'].map(color => (
              <button 
                key={color}
                onClick={() => setSettings({...settings, themeColor: color})}
                className={cn(
                  "w-4 h-4 rounded-full border-2 border-white/40 transition-all hover:scale-125 shadow-sm active:scale-95",
                  settings.themeColor === color && "ring-2 ring-white scale-125 ring-offset-2 ring-offset-black/40"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="w-[1px] h-4 bg-white/20" />
          <button 
            onClick={() => setShowSettings(true)} 
            className="hover:text-theme-color transition-all flex items-center gap-1.5 font-bold uppercase tracking-wider group"
          >
            <SettingsIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
            <span>Set</span>
          </button>
          <div className="w-[1px] h-4 bg-white/20" />
          <button 
            onClick={() => setIsLearningMode(!isLearningMode)} 
            className="hover:text-theme-color transition-all flex items-center gap-1.5 font-bold uppercase tracking-wider group"
          >
            <GraduationCap className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Learn</span>
          </button>
          <div className="w-[1px] h-4 bg-white/20" />
          <div className="flex gap-4">
            {DURATIONS.map(d => (
              <button 
                key={d} 
                onClick={() => {
                  setSettings({ ...settings, duration: d });
                  resetGame();
                }}
                className={cn(
                  "px-1.5 transition-all font-black tracking-tighter hover:scale-110", 
                  settings.duration === d ? "text-theme-color" : "text-white/30 hover:text-white"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 w-full max-w-4xl flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!gameState.isFinished ? (
            <motion.div 
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <div className="w-full mb-4 flex justify-between items-end px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Your Progress</span>
                  <div className="h-1.5 w-48 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-theme-color"
                      initial={{ width: 0 }}
                      animate={{ width: `${(activeWordIndex / words.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-5xl font-black text-theme-color tabular-nums drop-shadow-xl">
                  {gameState.timeLeft}<span className="text-xl opacity-50 ml-1">s</span>
                </div>
              </div>

              <div className="relative w-full p-12 joyful-card mb-12">
                <input
                  ref={inputRef}
                  type="text"
                  className="absolute opacity-0 cursor-default"
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  autoFocus
                />
                
                <div className="relative h-[140px] overflow-hidden w-full">
                  <div 
                    ref={wordsContainerRef}
                    className="flex flex-wrap gap-x-6 gap-y-6 text-3xl leading-tight select-none font-medium text-center justify-center transition-all duration-300"
                    style={{
                      marginTop: `${marginOffset}px`
                    }}
                  >
                    {words.map((word, wIdx) => {
                      const isActive = wIdx === activeWordIndex;
                      const isTyped = wIdx < activeWordIndex;
                      
                      // Show only relevant words to keep 3 rows feeling
                      // Calculating row visibility
                      return (
                        <span key={wIdx} className={cn("relative transition-all duration-300 flex items-center h-10", isActive ? "text-white scale-105 drop-shadow-md" : "text-white/20")}>
                          {word.split('').map((char, cIdx) => {
                            let charColor = "";
                            if (isActive && cIdx < userInput.length) {
                              charColor = userInput[cIdx] === char ? "text-theme-color" : "text-red-500 underline underline-offset-4 decoration-2";
                            } else if (isTyped) {
                              charColor = "text-white/80";
                            }

                            return (
                              <span key={cIdx} className={cn("relative inline-block transition-colors duration-150", settings.fontFamily === 'Rainbow' ? 'font-rainbow' : charColor)}>
                                {char}
                                {isActive && cIdx === userInput.length && (
                                  <motion.div 
                                    layoutId="caret"
                                    className="absolute top-0 bottom-0 -left-[3px] w-[4px] bg-theme-color shadow-[0_0_15px_var(--theme-color)] caret-blink rounded-full"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                  />
                                )}
                              </span>
                            );
                          })}
                          {isActive && userInput.length === word.length && (
                            <motion.div 
                              layoutId="caret"
                              className="absolute top-0 bottom-0 -right-[3px] w-[4px] bg-theme-color shadow-[0_0_15px_var(--theme-color)] caret-blink rounded-full"
                              initial={false}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {settings.showKeyboard && <Keyboard activeKey={activeKey} language={settings.language} themeColor={settings.themeColor} />}
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-8 bg-black/60 p-12 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl"
            >
              <div className="flex gap-12">
                <div className="text-center">
                  <div className="text-white/50 uppercase text-sm font-bold tracking-widest mb-1">WPM</div>
                  <div className="text-7xl font-black text-theme-color">{gameState.wpm}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/50 uppercase text-sm font-bold tracking-widest mb-1">Accuracy</div>
                  <div className="text-7xl font-black text-theme-color">{gameState.accuracy}%</div>
                </div>
              </div>
              <button 
                onClick={resetGame}
                className="flex items-center gap-2 px-8 py-3 bg-theme-color text-black font-bold uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key === 'Enter' || e.key === 'Tab') {
                setShowSettings(false);
              }
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <SettingsIcon className="w-6 h-6 text-theme-color" />
                  Customization
                </h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <RotateCcw className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
                {/* Language */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">
                    <Languages className="w-3 h-3" /> Language
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['en', 'uz', 'ru', 'es'] as Language[]).map(lang => (
                      <button 
                        key={lang}
                        onClick={() => setSettings({...settings, language: lang})}
                        className={cn("px-4 py-2 rounded-lg border text-sm transition-all", settings.language === lang ? "border-theme-color bg-theme-color/10 text-theme-color" : "border-white/5 bg-white/5 hover:bg-white/10")}
                      >
                        {lang === 'en' ? 'English' : lang === 'uz' ? 'O\'zbek' : lang === 'ru' ? 'Русский' : 'Español'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fonts */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">
                    <Type className="w-3 h-3" /> Font Family
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {FONTS.map(f => (
                      <button 
                        key={f}
                        onClick={() => setSettings({...settings, fontFamily: f})}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm text-left transition-all",
                          settings.fontFamily === f ? "border-theme-color bg-theme-color/10 text-theme-color" : "border-white/5 bg-white/5 hover:bg-white/10 text-white/60"
                        )}
                        style={{ fontFamily: f }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Theme Color
                  </label>
                  <input 
                    type="color" 
                    value={settings.themeColor}
                    onChange={(e) => setSettings({...settings, themeColor: e.target.value})}
                    className="w-full h-10 bg-transparent cursor-pointer rounded-lg overflow-hidden"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Font Color
                  </label>
                  <input 
                    type="color" 
                    value={settings.fontColor}
                    onChange={(e) => setSettings({...settings, fontColor: e.target.value})}
                    className="w-full h-10 bg-transparent cursor-pointer rounded-lg overflow-hidden"
                  />
                </div>

                {/* Background Image */}
                <div className="col-span-1 md:col-span-2 space-y-3">
                  <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Background Image
                  </label>
                  <div className="flex gap-4">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden" 
                      id="bg-upload"
                    />
                    <label 
                      htmlFor="bg-upload"
                      className="cursor-pointer px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm flex-1 text-center"
                    >
                      Choose Image
                    </label>
                    {settings.backgroundImage && (
                      <button 
                        onClick={() => setSettings({...settings, backgroundImage: null})}
                        className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-8 py-3 bg-theme-color text-black font-bold rounded-xl"
                >
                  Save & Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --theme-color: ${settings.themeColor};
          --font-color: ${settings.fontColor};
        }
      `}} />
    </div>
  );
};
