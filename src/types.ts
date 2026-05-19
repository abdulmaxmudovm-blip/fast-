export type Language = 'uz' | 'ru' | 'en' | 'es';

export interface Settings {
  fontFamily: string;
  fontSize: number;
  themeColor: string;
  fontColor: string;
  backgroundImage: string | null;
  language: Language;
  duration: number; // in seconds
  showKeyboard: boolean;
}

export interface GameState {
  isStarted: boolean;
  isFinished: boolean;
  timeLeft: number;
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  rawWpm: number;
}
