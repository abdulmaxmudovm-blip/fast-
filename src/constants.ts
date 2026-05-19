import { Language } from './types';

export const THEME_COLORS = [
  '#18181b', '#0ea5e9', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#71717a'
];

export const FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
  'Oswald', 'Source Code Pro', 'JetBrains Mono', 'Ubuntu', 'Playfair Display',
  'Merriweather', 'Nunito', 'PT Sans', 'Raleway', 'Fira Code',
  'Space Mono', 'Inconsolata', 'Courier Prime', 'Special Elite', 'Anonymous Pro',
  'Rainbow'
];

export const DURATIONS = [15, 30, 60, 120];

export const WORD_LISTS: Record<Language, string[]> = {
  en: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'],
  uz: ['va', 'bilan', 'uchun', 'ham', 'bu', 'u', 'men', 'sen', 'biz', 'siz', 'ular', 'bir', 'bor', 'yo\'q', 'o\'sha', 'shunday', 'lekin', 'ammo', 'agar', 'chunki', 'shuningdek', 'faqat', 'yana', 'hamma', 'hamma narsa', 'inson', 'hayot', 'vaqt', 'kun', 'yil', 'ish', 'yaxshi', 'yomon', 'katta', 'kichik', 'yangi', 'eski', 'o\'zbekiston', 'toshkent', 'ona', 'bola', 'kitob', 'maktab', 'ilm', 'bilim', 'dunyo', 'quyosh', 'oy'],
  ru: ['и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'как', 'а', 'то', 'все', 'она', 'так', 'его', 'но', 'да', 'ты', 'к', 'ко', 'у', 'же', 'вы', 'за', 'бы', 'по', 'только', 'ее', 'мне', 'раз', 'где', 'меня', 'было', 'быть', 'тоже', 'из', 'от', 'этого', 'тебе', 'когда', 'даже', 'ну', 'вдруг', 'через', 'если'],
  es: ['y', 'el', 'la', 'que', 'en', 'un', 'una', 'ser', 'es', 'a', 'por', 'con', 'no', 'del', 'los', 'las', 'me', 'mi', 'su', 'este', 'esta', 'se', 'todo', 'todos', 'si', 'para', 'como', 'cuando', 'donde', 'pero', 'mas', 'muy', 'esta', 'estos', 'esas', 'esto', 'otro', 'otra', 'bien', 'solo', 'tenia', 'hubo', 'ahora', 'despues']
};

export const ALPHABETS: Record<Language, string[]> = {
  en: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  uz: 'abcdefghijklmnopqrstovxyz\u0027'.split(''), // Basic latin alphabet
  ru: 'йцукенгшщзхъфывапролджэячсмитьбю'.split(''),
  es: 'abcdefghijklmnñopqrstuvwxyz'.split('')
};
