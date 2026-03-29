export const CURRENCIES: Record<string, { name: string, flag: string }> = {
  USD: { name: 'United States Dollar', flag: '🇺🇸' },
  EUR: { name: 'Euro', flag: '🇪🇺' },
  GBP: { name: 'British Pound', flag: '🇬🇧' },
  JPY: { name: 'Japanese Yen', flag: '🇯🇵' },
  AUD: { name: 'Australian Dollar', flag: '🇦🇺' },
  CAD: { name: 'Canadian Dollar', flag: '🇨🇦' },
  CHF: { name: 'Swiss Franc', flag: '🇨🇭' },
  CNY: { name: 'Chinese Renminbi Yuan', flag: '🇨🇳' },
  INR: { name: 'Indian Rupee', flag: '🇮🇳' },
  BRL: { name: 'Brazilian Real', flag: '🇧🇷' },
  MXN: { name: 'Mexican Peso', flag: '🇲🇽' },
  ZAR: { name: 'South African Rand', flag: '🇿🇦' },
  NZD: { name: 'New Zealand Dollar', flag: '🇳🇿' },
  SEK: { name: 'Swedish Krona', flag: '🇸🇪' },
  SGD: { name: 'Singapore Dollar', flag: '🇸🇬' },
  HKD: { name: 'Hong Kong Dollar', flag: '🇭🇰' },
  NOK: { name: 'Norwegian Krone', flag: '🇳🇴' },
  KRW: { name: 'South Korean Won', flag: '🇰🇷' },
  TRY: { name: 'Turkish Lira', flag: '🇹🇷' },
  RUB: { name: 'Russian Ruble', flag: '🇷🇺' },
  DKK: { name: 'Danish Krone', flag: '🇩🇰' },
  PLN: { name: 'Polish Złoty', flag: '🇵🇱' },
  IDR: { name: 'Indonesian Rupiah', flag: '🇮🇩' },
  CZK: { name: 'Czech Koruna', flag: '🇨🇿' },
  HUF: { name: 'Hungarian Forint', flag: '🇭🇺' },
  ILS: { name: 'Israeli New Sheqel', flag: '🇮🇱' },
  PHP: { name: 'Philippine Peso', flag: '🇵🇭' },
  MYR: { name: 'Malaysian Ringgit', flag: '🇲🇾' },
  RON: { name: 'Romanian Leu', flag: '🇷🇴' },
  ISK: { name: 'Icelandic Króna', flag: '🇮🇸' },
  BGN: { name: 'Bulgarian Lev', flag: '🇧🇬' },
  THB: { name: 'Thai Baht', flag: '🇹🇭' }
};

export const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

export const ALL_CURRENCY_CODES = Object.keys(CURRENCIES).sort();
