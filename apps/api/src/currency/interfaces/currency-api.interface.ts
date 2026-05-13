export interface FreeCurrencyEnvelope<TData> {
  data: TData;
}

export interface FreeCurrencyDefinition {
  code: string;
  decimal_digits: number;
  name: string;
  name_plural: string;
  rounding: number;
  symbol: string;
  symbol_native: string;
}

export type FreeCurrencyMap = Record<string, FreeCurrencyDefinition>;

export type RateMap = Record<string, number>;

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export interface ConversionResult {
  amount: number;
  convertedAmount: number;
  date: string;
  rate: number;
  sourceCurrency: string;
  targetCurrency: string;
}
