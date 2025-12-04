export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: MoodType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  aiReflection?: string; // Optional AI generated insight
}

export enum MoodType {
  Happy = 'happy',
  Calm = 'calm',
  Neutral = 'neutral',
  Sad = 'sad',
  Stressed = 'stressed',
  Excited = 'excited'
}

export type ViewState = 'AUTH' | 'DASHBOARD' | 'EDITOR';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}