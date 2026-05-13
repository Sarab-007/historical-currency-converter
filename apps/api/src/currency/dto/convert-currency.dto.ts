import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, Matches, Min } from 'class-validator';

export class ConvertCurrencyDto {
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 6 },
    { message: 'Amount must be a valid number.' },
  )
  @Min(0.01, { message: 'Amount must be greater than zero.' })
  amount!: number;

  @Transform(({ value }) => String(value).trim().toUpperCase())
  @Matches(/^[A-Z]{3}$/, {
    message: 'Source currency must be a valid ISO 4217 code.',
  })
  sourceCurrency!: string;

  @Transform(({ value }) => String(value).trim().toUpperCase())
  @Matches(/^[A-Z]{3}$/, {
    message: 'Target currency must be a valid ISO 4217 code.',
  })
  targetCurrency!: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must use YYYY-MM-DD format.',
  })
  date?: string;
}
