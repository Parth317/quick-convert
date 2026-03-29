import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedPair {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  addedAt: number;
}

const STORAGE_KEY = '@quickconvert_saved_pairs';

export function useSavedPairs() {
  const [savedPairs, setSavedPairs] = useState<SavedPair[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadPairs = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null && mounted) {
          setSavedPairs(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load pairs', e);
      } finally {
        if (mounted) setIsLoaded(true);
      }
    };
    loadPairs();
    return () => { mounted = false; };
  }, []);

  const togglePair = async (base: string, target: string) => {
    const id = `${base}-${target}`;
    try {
      setSavedPairs(prev => {
        const exists = prev.some(p => p.id === id);
        let updated;
        if (exists) {
          updated = prev.filter(p => p.id !== id);
        } else {
          const newPair: SavedPair = { id, baseCurrency: base, targetCurrency: target, addedAt: Date.now() };
          updated = [newPair, ...prev];
        }
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(e => console.error(e));
        return updated;
      });
    } catch (e) {
      console.error('Failed to save pairs', e);
    }
  };

  const isSaved = (base: string, target: string) => {
    return savedPairs.some(p => p.id === `${base}-${target}`);
  };

  return { savedPairs, togglePair, isSaved, isLoaded };
}
