import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { CurrencyService } from './currency.service';
import {
  ConversionResult,
  CurrencyOption,
} from './interfaces/currency-api.interface';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('currencies')
  getCurrencies(): Promise<CurrencyOption[]> {
    return this.currencyService.getCurrencies();
  }

  @Post('convert')
  convert(@Body() dto: ConvertCurrencyDto): Promise<ConversionResult> {
    return this.currencyService.convert(dto);
  }
}
