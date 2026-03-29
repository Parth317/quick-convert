import { useState, useEffect } from 'react';

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export function useExchangeRate(base: string, target: string) {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchRate() {
      if (base === target) {
        setRate(1); setLoading(false); setError(null);
        return;
      }
      setLoading(true); setError(null);
      try {
        const res = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=${target}`);
        if (!res.ok) throw new Error('Failed to fetch rate');
        const data: FrankfurterResponse = await res.json();
        if (active) setRate(data.rates[target]);
      } catch (err) {
        if (active) {
          console.error(err);
          setError('Unavailable');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchRate();
    return () => { active = false; };
  }, [base, target]);

  return { rate, loading, error };
}
