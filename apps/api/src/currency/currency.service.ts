import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import {
  ConversionResult,
  CurrencyOption,
  FreeCurrencyEnvelope,
  FreeCurrencyMap,
  RateMap,
} from './interfaces/currency-api.interface';

const DEFAULT_API_URL = 'https://api.freecurrencyapi.com/v1';
const REQUEST_TIMEOUT_MS = 10_000;

@Injectable()
export class CurrencyService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FREECURRENCY_API_KEY') ?? '';
    this.apiUrl =
      this.configService.get<string>('FREECURRENCY_API_URL') ?? DEFAULT_API_URL;
  }

  async getCurrencies(): Promise<CurrencyOption[]> {
    const response =
      await this.request<FreeCurrencyEnvelope<FreeCurrencyMap>>('/currencies');

    return Object.values(response.data)
      .map((currency) => ({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  async convert(dto: ConvertCurrencyDto): Promise<ConversionResult> {
    const date = dto.date ?? getTodayIsoDate();

    if (!isValidIsoDate(date)) {
      throw new BadRequestException('Date must be a valid calendar date.');
    }

    if (isFutureDate(date)) {
      throw new BadRequestException('Historical date cannot be in the future.');
    }

    if (dto.sourceCurrency === dto.targetCurrency) {
      return {
        amount: dto.amount,
        convertedAmount: dto.amount,
        date,
        rate: 1,
        sourceCurrency: dto.sourceCurrency,
        targetCurrency: dto.targetCurrency,
      };
    }

    const rates = await this.getRatesForDate(
      date,
      dto.sourceCurrency,
      dto.targetCurrency,
    );
    const rate = rates[dto.targetCurrency];

    if (typeof rate !== 'number') {
      throw new BadGatewayException(
        'Currency provider did not return the requested rate.',
      );
    }

    return {
      amount: dto.amount,
      convertedAmount: roundCurrency(dto.amount * rate),
      date,
      rate,
      sourceCurrency: dto.sourceCurrency,
      targetCurrency: dto.targetCurrency,
    };
  }

  private async getRatesForDate(
    date: string,
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<RateMap> {
    if (date === getTodayIsoDate()) {
      const response = await this.request<FreeCurrencyEnvelope<RateMap>>(
        '/latest',
        {
          base_currency: sourceCurrency,
          currencies: targetCurrency,
        },
      );

      return response.data;
    }

    const response = await this.request<
      FreeCurrencyEnvelope<Record<string, RateMap>>
    >('/historical', {
      base_currency: sourceCurrency,
      currencies: targetCurrency,
      date,
    });

    const rates = response.data[date];

    if (!rates) {
      throw new BadGatewayException(
        'Currency provider did not return data for the selected date.',
      );
    }

    return rates;
  }

  private async request<TResponse>(
    path: string,
    params: Record<string, string> = {},
  ): Promise<TResponse> {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'Currency API key is not configured.',
      );
    }

    const url = new URL(`${this.apiUrl}${path}`);
    url.searchParams.set('apikey', this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const payload = (await response.json()) as unknown;

      if (!response.ok) {
        throw new BadGatewayException(
          extractProviderMessage(payload) ??
            'Currency provider request failed.',
        );
      }

      return payload as TResponse;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'Currency provider is temporarily unavailable.',
      );
    }
  }
}

function extractProviderMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  return typeof record['message'] === 'string' ? record['message'] : undefined;
}

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function isValidIsoDate(date: string): boolean {
  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date
  );
}

function isFutureDate(date: string): boolean {
  return date > getTodayIsoDate();
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
