import React, { useState, useEffect } from 'react';
import { Settings, Language } from '../types';
import { ALPHABETS, WORD_LISTS } from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard } from './Keyboard';
import { RotateCcw, ArrowLeft } from 'lucide-react';

interface LearningModuleProps {
  settings: Settings;
  onExit: () => void;
}

export const LearningModule: React.FC<LearningModuleProps> = ({ settings, onExit }) => {
  const [items, setItems] = useState<string[]>([]);
  const [level, setLevel] = useState<'letters' | 'words'>('letters');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordProgress, setWordProgress] = useState('');
  const [activeKey, setActiveKey] = useState<string>('');
  const [marginOffset, setMarginOffset] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateContent = () => {
      if (level === 'letters') {
        const chars = ALPHABETS[settings.language] || ALPHABETS.en;
        return [...chars, ...chars].sort(() => Math.random() - 0.5).slice(0, 30);
      } else {
        const langWords = WORD_LISTS[settings.language] || WORD_LISTS.en;
        return [...langWords].sort(() => Math.random() - 0.5).slice(0, 15);
      }
    };
    setItems(generateContent());
    setCurrentIndex(0);
    setWordProgress('');
    setMarginOffset(0);
  }, [settings.language, level]);

  useEffect(() => {
    if (containerRef.current) {
      const children = Array.from(containerRef.current.children) as HTMLElement[];
      const activeEl = children[currentIndex];
      if (activeEl) {
        // Collect all unique offsets of the lines
        const uniqueOffsets = Array.from(new Set(children.map(c => c.offsetTop))).sort((a, b) => a - b);
        const activeOffset = activeEl.offsetTop;
        const activeLineIndex = uniqueOffsets.indexOf(activeOffset);

        // Scroll so that the active line occupies the second visible line position
        if (activeLineIndex >= 2) {
          const scrollTargetY = uniqueOffsets[activeLineIndex - 1];
          setMarginOffset(-scrollTargetY);
        } else {
          setMarginOffset(0);
        }
      }
    }
  }, [currentIndex, items, level]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveKey(e.key);
      const target = items[currentIndex];
      
      if (e.key === 'Escape') {
        onExit();
        return;
      }

      if (e.key === 'Enter' && currentIndex === items.length) {
        reset();
        return;
      }

      if (currentIndex >= items.length) return;

      if (level === 'letters') {
        if (e.key.toLowerCase() === target.toLowerCase()) {
          setCurrentIndex(prev => prev + 1);
        }
      } else {
        // Word handling
        const currentCharNeeded = target[wordProgress.length];
        if (e.key.toLowerCase() === currentCharNeeded.toLowerCase()) {
          const newProgress = wordProgress + currentCharNeeded;
          if (newProgress.length === target.length) {
            setWordProgress('');
            setCurrentIndex(prev => prev + 1);
          } else {
            setWordProgress(newProgress);
          }
        } else if (e.key === 'Backspace') {
          setWordProgress(prev => prev.slice(0, -1));
        }
      }
    };

    const handleKeyUp = () => setActiveKey('');

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [items, currentIndex, level, wordProgress]);

  const reset = () => {
    setCurrentIndex(0);
    setWordProgress('');
    const generateContent = () => {
      if (level === 'letters') {
        const chars = ALPHABETS[settings.language] || ALPHABETS.en;
        return [...chars, ...chars].sort(() => Math.random() - 0.5).slice(0, 30);
      } else {
        const langWords = WORD_LISTS[settings.language] || WORD_LISTS.en;
        return [...langWords].sort(() => Math.random() - 0.5).slice(0, 15);
      }
    };
    setItems(generateContent());
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
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-black/20" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8">
          <button 
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-bold uppercase">Back</span>
          </button>
          
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button 
              onClick={() => { setLevel('letters'); setWordProgress(''); }}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                level === 'letters' ? "bg-theme-color text-black" : "text-white/40 hover:text-white"
              )}
            >
              Letters
            </button>
            <button 
              onClick={() => { setLevel('words'); setWordProgress(''); }}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                level === 'words' ? "bg-theme-color text-black" : "text-white/40 hover:text-white"
              )}
            >
              Words
            </button>
          </div>

          <div className="w-24" />
        </div>

        <div className="w-full p-12 joyful-card mb-8 flex flex-col items-center min-h-[350px] justify-center overflow-hidden">
          <div className="text-white/60 uppercase text-xs font-black tracking-[0.3em] mb-12 drop-shadow-sm">
            Target: {level === 'letters' ? 'Character' : 'Word'}
          </div>
          
          <div className="relative h-[180px] overflow-hidden w-full flex justify-center">
            <div 
              ref={containerRef}
              className="flex flex-wrap justify-center gap-6 max-w-2xl transition-all duration-300"
              style={{ marginTop: `${marginOffset}px` }}
            >
              {items.map((item, idx) => {
              const isPassed = idx < currentIndex;
              const isActive = idx === currentIndex;
              
              return (
                <motion.div 
                  key={idx}
                  initial={false}
                  animate={{
                    scale: 1,
                    opacity: isPassed ? 0.2 : 1,
                    y: 0
                  }}
                  className={cn(
                    "relative flex items-center justify-center rounded-2xl border-2 font-bold transition-all duration-300",
                    level === 'letters' ? "w-16 h-16 text-3xl" : "px-8 py-3 text-2xl",
                    isActive ? "border-theme-color bg-theme-color/10 text-theme-color shadow-[0_0_30px_rgba(var(--theme-rgb),0.3)]" : "border-white/10 bg-white/5 text-white/40",
                    isPassed && "border-white/5 bg-transparent",
                    settings.fontFamily === 'Rainbow' && "font-rainbow"
                  )}
                >
                  {level === 'letters' ? (
                    <>
                      {item === ' ' ? '␣' : item}
                      {isActive && (
                        <motion.div 
                          layoutId="caret-learn"
                          className="absolute top-0 bottom-0 -left-[3px] w-[4px] bg-theme-color shadow-[0_0_15px_var(--theme-color)] caret-blink rounded-full"
                          initial={false}
                        />
                      )}
                    </>
                  ) : (
                    <div className="relative flex">
                      {item.split('').map((char, charIdx) => {
                        const isCharTyped = wordProgress.length > charIdx;
                        const isCharActive = wordProgress.length === charIdx;
                        return (
                          <span key={charIdx} className={cn("relative", isCharTyped ? "text-theme-color" : "text-white/40")}>
                            {char}
                            {isActive && isCharActive && (
                              <motion.div 
                                layoutId="caret-learn"
                                className="absolute top-0 bottom-0 -left-[3px] w-[4px] bg-theme-color shadow-[0_0_15px_var(--theme-color)] caret-blink rounded-full"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            )}
                          </span>
                        );
                      })}
                      {isActive && wordProgress.length === item.length && (
                        <motion.div 
                          layoutId="caret-learn"
                          className="absolute top-0 bottom-0 -right-[3px] w-[4px] bg-theme-color shadow-[0_0_15px_var(--theme-color)] caret-blink rounded-full"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          </div>

          {currentIndex === items.length && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex flex-col items-center gap-6"
            >
              <div className="text-4xl font-black text-theme-color tracking-tighter">SUCCESS!</div>
              <button 
                onClick={reset}
                className="flex items-center gap-2 px-10 py-4 bg-theme-color text-black font-black uppercase rounded-2xl hover:scale-105 transition-transform"
              >
                <RotateCcw className="w-5 h-5" />
                Next Level
              </button>
            </motion.div>
          )}
        </div>

        {settings.showKeyboard && (
          <Keyboard 
            activeKey={activeKey} 
            targetKey={
              currentIndex < items.length 
                ? (level === 'letters' ? items[currentIndex] : items[currentIndex][wordProgress.length]) 
                : undefined
            }
            language={settings.language} 
            themeColor={settings.themeColor} 
          />
        )}
      </div>
    </div>
  );
};
