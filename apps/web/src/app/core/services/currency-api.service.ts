import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConversionRequest, ConversionResult, CurrencyOption } from '../models/currency.model';

@Injectable({ providedIn: 'root' })
export class CurrencyApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getCurrencies(): Observable<CurrencyOption[]> {
    return this.http.get<CurrencyOption[]>(`${this.apiUrl}/currency/currencies`);
  }

  convert(request: ConversionRequest): Observable<ConversionResult> {
    return this.http.post<ConversionResult>(`${this.apiUrl}/currency/convert`, request);
  }
}
