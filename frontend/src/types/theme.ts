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
    primary: '#A3E635',
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
    bg: '#09090B',
    card: '#18181B',
    text: '#FFFFFF',
    muted: '#A1A1AA',
    border: '#27272A',
  },
  {
    id: 'crimson-onyx',
    name: 'Crimson Onyx',
    tagline: 'Heavy Bodybuilding',
    bestFor: 'Powerlifting, heavy compound tracking, and aggressive dark mode.',
    primary: '#F87171',
    secondary: '#F59E0B',
    bg: '#0A0A0A',
    card: '#171717',
    text: '#FFFFFF',
    muted: '#A3A3A3',
    border: '#262626',
  },
  {
    id: 'abyssal-volt',
    name: 'Abyssal Volt',
    tagline: 'Tech Athlete',
    bestFor: 'Deep ocean teal with high-visibility volt green highlights.',
    primary: '#00FF66',
    secondary: '#2DD4BF',
    bg: '#041116',
    card: '#0C2229',
    text: '#F0FDF4',
    muted: '#94A3B8',
    border: '#163944',
  },
  {
    id: 'cyber-violet',
    name: 'Cyber Violet',
    tagline: 'Futuristic Analytics',
    bestFor: 'Modern dashboards, charts, and PR Hall of Fame tracking.',
    primary: '#A78BFA',
    secondary: '#F472B6',
    bg: '#080B14',
    card: '#111625',
    text: '#F9FAFB',
    muted: '#9CA3AF',
    border: '#1E2638',
  },
  {
    id: 'vapor-neon',
    name: 'Vapor Neon',
    tagline: 'Retro Wave Gym',
    bestFor: 'Hot neon pink accent over midnight purple.',
    primary: '#FF2A6D',
    secondary: '#38BDF8',
    bg: '#0F0B1E',
    card: '#1A1433',
    text: '#FFFFFF',
    muted: '#A78BFA',
    border: '#2D2350',
  },
  {
    id: 'nordic-sage',
    name: 'Nordic Sage',
    tagline: 'Calisthenics & Wellness',
    bestFor: 'Organic dark mode, calisthenics, and clean habit tracking.',
    primary: '#34D399',
    secondary: '#FB923C',
    bg: '#0B1210',
    card: '#14211D',
    text: '#F0FDF4',
    muted: '#86EFAC',
    border: '#20332E',
  },
  {
    id: 'clean-light',
    name: 'Clean Light',
    tagline: 'Minimal Day Mode',
    bestFor: 'Outdoor daytime workouts and crisp light mode.',
    primary: '#4F46E5',
    secondary: '#059669',
    bg: '#F1F5F9',
    card: '#FFFFFF',
    text: '#0F172A',
    muted: '#475569',
    border: '#CBD5E1',
    isLight: true,
  },
];

