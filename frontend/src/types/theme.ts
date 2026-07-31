export type ThemeId =
  | 'electric-lime'
  | 'solar-blaze'
  | 'crimson-onyx'
  | 'abyssal-volt'
  | 'cyber-violet'
  | 'vapor-neon'
  | 'nordic-sage'
  | 'clean-light';

export interface ThemeScheme {
  id: ThemeId;
  name: string;
  tagline: string;
  bestFor: string;
  primary: string;
  secondary: string;
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  isLight?: boolean;
}

export const THEME_SCHEMES: ThemeScheme[] = [
  {
    id: 'electric-lime',
    name: 'Electric Lime',
    tagline: 'High-Energy Dark',
    bestFor: 'High-intensity lifting & Gym floor readability.',
    primary: '#CCFF00',
    secondary: '#06B6D4',
    bg: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    muted: '#94A3B8',
    border: '#334155',
  },
  {
    id: 'solar-blaze',
    name: 'Solar Blaze',
    tagline: 'HIIT & CrossFit',
    bestFor: 'High-energy cardio, burn meters, and interval training.',
    primary: '#FF6B00',
    secondary: '#FFD600',
    bg: '#0E0E10',
    card: '#1B1B1E',
    text: '#FFFFFF',
    muted: '#A0A0A6',
    border: '#2E2E33',
  },
  {
    id: 'crimson-onyx',
    name: 'Crimson Onyx',
    tagline: 'Heavy Bodybuilding',
    bestFor: 'Powerlifting, heavy compound tracking, and aggressive dark mode.',
    primary: '#EF4444',
    secondary: '#F59E0B',
    bg: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    muted: '#A3A3A3',
    border: '#333333',
  },
  {
    id: 'abyssal-volt',
    name: 'Abyssal Volt',
    tagline: 'Tech Athlete',
    bestFor: 'Deep ocean teal with high-visibility volt green highlights.',
    primary: '#00FF66',
    secondary: '#2DD4BF',
    bg: '#06181D',
    card: '#0F2930',
    text: '#F0FDF4',
    muted: '#94A3B8',
    border: '#1A3F49',
  },
  {
    id: 'cyber-violet',
    name: 'Cyber Violet',
    tagline: 'Futuristic Analytics',
    bestFor: 'Modern dashboards, charts, and PR Hall of Fame tracking.',
    primary: '#8B5CF6',
    secondary: '#EC4899',
    bg: '#0B0F19',
    card: '#111827',
    text: '#F9FAFB',
    muted: '#9CA3AF',
    border: '#1F2937',
  },
  {
    id: 'vapor-neon',
    name: 'Vapor Neon',
    tagline: 'Retro Wave Gym',
    bestFor: 'Hot neon pink accent over midnight purple.',
    primary: '#FF2A6D',
    secondary: '#05D5FA',
    bg: '#110D24',
    card: '#1D163B',
    text: '#FFFFFF',
    muted: '#A78BFA',
    border: '#342A5C',
  },
  {
    id: 'nordic-sage',
    name: 'Nordic Sage',
    tagline: 'Calisthenics & Wellness',
    bestFor: 'Organic dark mode, calisthenics, and clean habit tracking.',
    primary: '#34D399',
    secondary: '#FB923C',
    bg: '#0F1715',
    card: '#182623',
    text: '#F0FDF4',
    muted: '#86EFAC',
    border: '#233833',
  },
  {
    id: 'clean-light',
    name: 'Clean Light',
    tagline: 'Minimal Day Mode',
    bestFor: 'Outdoor daytime workouts and crisp light mode.',
    primary: '#4F46E5',
    secondary: '#10B981',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    muted: '#64748B',
    border: '#E2E8F0',
    isLight: true,
  },
];
