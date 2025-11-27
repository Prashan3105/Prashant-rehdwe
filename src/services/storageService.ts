
import { PlayerProgress } from '../types';
import { INITIAL_PROGRESS } from '../constants';

const STORAGE_KEY = 'chromaflow_save_v1';

export const saveProgress = (progress: PlayerProgress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
};

export const loadProgress = (): PlayerProgress => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...INITIAL_PROGRESS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load progress", e);
  }
  return INITIAL_PROGRESS;
};
    