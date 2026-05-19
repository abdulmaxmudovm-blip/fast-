import React from 'react';
import { cn } from '../lib/utils';

interface KeyboardProps {
  activeKey?: string;
  targetKey?: string;
  language: string;
  themeColor: string;
}

const ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Space']
];

export const Keyboard: React.FC<KeyboardProps> = ({ activeKey, targetKey, themeColor }) => {
  const getKeyLabel = (key: string) => {
    if (key === 'Space') return ' ';
    return key;
  };

  return (
    <div className="flex flex-col gap-1 p-4 bg-black/20 rounded-xl backdrop-blur-sm border border-white/10 max-w-2xl mx-auto w-full select-none">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((key, keyIndex) => {
            const isActive = activeKey?.toLowerCase() === key.toLowerCase() || 
                           (key === 'Space' && activeKey === ' ') ||
                           (key === 'Backspace' && activeKey === 'Backspace');
            
            const isTarget = targetKey?.toLowerCase() === key.toLowerCase() ||
                            (key === 'Space' && targetKey === ' ') ||
                            (key === 'Backspace' && targetKey === 'Backspace');

            return (
              <div
                key={`${rowIndex}-${keyIndex}`}
                className={cn(
                  "h-10 flex items-center justify-center rounded text-[10px] uppercase font-medium transition-all duration-75 border",
                  key === 'Space' ? "w-48" : 
                  key === 'Backspace' ? "w-16" :
                  key === 'Tab' || key === '\\' ? "w-12" :
                  key === 'CapsLock' || key === 'Enter' ? "w-14" :
                  key === 'Shift' ? "w-20" : "w-10",
                  isActive 
                    ? "bg-theme-color text-black scale-95 shadow-[0_0_20px_rgba(255,255,255,0.4)] border-white/40" 
                    : isTarget
                    ? "bg-theme-color/20 text-theme-color border-theme-color shadow-[0_0_15px_rgba(var(--theme-rgb),0.2)] animate-pulse"
                    : "bg-white/5 text-white/30 border-white/5"
                )}
                style={{
                  backgroundColor: isActive ? 'var(--theme-color)' : undefined,
                  color: isActive ? '#000' : undefined,
                  boxShadow: isActive ? `0 0 25px ${themeColor}aa` : undefined
                }}
              >
                {key === 'Backspace' ? '←' : 
                 key === 'Enter' ? '↵' : 
                 key === 'Space' ? '' : key}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
