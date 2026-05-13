import { Injectable, signal } from '@angular/core';
import { ConversionHistoryItem, ConversionResult, CurrencyOption } from '../models/currency.model';

const STORAGE_KEY = 'currency-converter.history.v1';
const MAX_HISTORY_ITEMS = 12;

@Injectable({ providedIn: 'root' })
export class ConversionHistoryService {
  private readonly historyState = signal<ConversionHistoryItem[]>(readHistory());

  readonly history = this.historyState.asReadonly();

  addConversion(result: ConversionResult, currencies: CurrencyOption[]): void {
    const item: ConversionHistoryItem = {
      ...result,
      id: createId(),
      sourceCurrencyName: currencyNameFor(result.sourceCurrency, currencies),
      targetCurrencyName: currencyNameFor(result.targetCurrency, currencies),
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [item, ...this.historyState()].slice(0, MAX_HISTORY_ITEMS);
    this.historyState.set(nextHistory);
    writeHistory(nextHistory);
  }

  clear(): void {
    this.historyState.set([]);
    writeHistory([]);
  }
}

function currencyNameFor(code: string, currencies: CurrencyOption[]): string {
  return currencies.find((currency) => currency.code === code)?.name ?? code;
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readHistory(): ConversionHistoryItem[] {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    return rawValue ? (JSON.parse(rawValue) as ConversionHistoryItem[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(history: ConversionHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Persisting history is best-effort; conversion itself should never fail because storage is unavailable.
  }
}
