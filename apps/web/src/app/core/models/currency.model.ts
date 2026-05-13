export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export interface ConversionRequest {
  amount: number;
  date: string;
  sourceCurrency: string;
  targetCurrency: string;
}

export interface ConversionResult {
  amount: number;
  convertedAmount: number;
  date: string;
  rate: number;
  sourceCurrency: string;
  targetCurrency: string;
}

export interface ConversionHistoryItem extends ConversionResult {
  id: string;
  sourceCurrencyName: string;
  targetCurrencyName: string;
  timestamp: string;
}
