import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CurrencyPair {
  base: string;
  target: string;
}

export interface StoreState {
  baseCurrency: string;
  targetCurrency: string;
  baseAmount: string;
  targetAmount: string;
  exchangeRates: Record<string, number>;
  savedPairs: CurrencyPair[];
  
  setBaseCurrency: (currency: string) => void;
  setTargetCurrency: (currency: string) => void;
  setBaseAmount: (amount: string) => void;
  fetchRates: () => Promise<void>;
  addSavedPair: (pair: CurrencyPair) => void;
  removeSavedPair: (pair: CurrencyPair) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      baseCurrency: 'USD',
      targetCurrency: 'EUR',
      baseAmount: '1.00',
      targetAmount: '0.00',
      exchangeRates: {},
      savedPairs: [],

      setBaseCurrency: (currency) => {
        set({ baseCurrency: currency });
        get().fetchRates();
      },
      setTargetCurrency: (currency) => {
        set({ targetCurrency: currency });
        const { baseAmount, exchangeRates } = get();
        if (exchangeRates[currency]) {
          const numAmount = parseFloat(baseAmount || '0');
          const target = numAmount * exchangeRates[currency];
          set({ targetAmount: target.toFixed(2) });
        }
      },
      setBaseAmount: (amount) => {
        set({ baseAmount: amount });
        const { targetCurrency, exchangeRates } = get();
        const numAmount = parseFloat(amount || '0');
        if (exchangeRates[targetCurrency] && !isNaN(numAmount)) {
          const target = numAmount * exchangeRates[targetCurrency];
          set({ targetAmount: target.toFixed(2) });
        } else {
          set({ targetAmount: '0.00' });
        }
      },
      fetchRates: async () => {
        const { baseCurrency, targetCurrency, baseAmount } = get();
        try {
          const res = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);
          const data = await res.json();
          if (data && data.rates) {
            const rates = data.rates;
            rates[baseCurrency] = 1.0;
            const targetRate = rates[targetCurrency] || 1.0;
            const numAmount = parseFloat(baseAmount || '0');
            const target = numAmount * targetRate;
            
            set({ 
              exchangeRates: rates,
              targetAmount: target.toFixed(2)
            });
          }
        } catch (error) {
          console.error('Failed to fetch rates', error);
        }
      },
      addSavedPair: (pair) => {
        const { savedPairs } = get();
        if (!savedPairs.some(p => p.base === pair.base && p.target === pair.target)) {
          set({ savedPairs: [...savedPairs, pair] });
        }
      },
      removeSavedPair: (pair) => {
        const { savedPairs } = get();
        set({ 
          savedPairs: savedPairs.filter(p => !(p.base === pair.base && p.target === pair.target)) 
        });
      }
    }),
    {
      name: 'quickconvert-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ savedPairs: state.savedPairs }),
    }
  )
);
