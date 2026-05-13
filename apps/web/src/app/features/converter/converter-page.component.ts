import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize, startWith } from 'rxjs';
import { ApiError } from '../../core/interceptors/api-error.interceptor';
import { ConversionRequest, ConversionResult, CurrencyOption } from '../../core/models/currency.model';
import { ConversionHistoryService } from '../../core/services/conversion-history.service';
import { CurrencyApiService } from '../../core/services/currency-api.service';
import { SelectOnFocusDirective } from '../../shared/directives/select-on-focus.directive';
import { LoadingSkeletonComponent } from '../../shared/ui/loading-skeleton/loading-skeleton.component';
import { StatusMessageComponent } from '../../shared/ui/status-message/status-message.component';

@Component({
  selector: 'app-converter-page',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    LoadingSkeletonComponent,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
    SelectOnFocusDirective,
    StatusMessageComponent,
  ],
  templateUrl: './converter-page.component.html',
  styleUrl: './converter-page.component.scss',
})
export class ConverterPageComponent {
  private readonly currencyApi = inject(CurrencyApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly historyService = inject(ConversionHistoryService);

  protected readonly today = getTodayIsoDate();
  protected readonly currencies = signal<CurrencyOption[]>([]);
  protected readonly conversion = signal<ConversionResult | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isConverting = signal(false);
  protected readonly isLoadingCurrencies = signal(true);
  protected readonly history = this.historyService.history;

  protected readonly form = this.formBuilder.nonNullable.group({
    amount: [100, [Validators.required, Validators.min(0.01)]],
    date: [this.today, [Validators.required]],
    sourceCurrency: ['USD', [Validators.required]],
    targetCurrency: ['EUR', [Validators.required]],
  });

  private readonly selectedSourceCurrency = toSignal(
    this.form.controls.sourceCurrency.valueChanges.pipe(startWith(this.form.controls.sourceCurrency.value)),
    { initialValue: this.form.controls.sourceCurrency.value },
  );
  private readonly selectedTargetCurrency = toSignal(
    this.form.controls.targetCurrency.valueChanges.pipe(startWith(this.form.controls.targetCurrency.value)),
    { initialValue: this.form.controls.targetCurrency.value },
  );

  protected readonly sourceCurrencyLabel = computed(() => this.currencyLabel(this.selectedSourceCurrency()));
  protected readonly targetCurrencyLabel = computed(() => this.currencyLabel(this.selectedTargetCurrency()));

  constructor() {
    this.loadCurrencies();
  }

  protected convert(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.getRawValue() satisfies ConversionRequest;
    this.errorMessage.set(null);
    this.isConverting.set(true);

    this.currencyApi
      .convert(request)
      .pipe(
        finalize(() => this.isConverting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.conversion.set(result);
          this.historyService.addConversion(result, this.currencies());
        },
        error: (error: unknown) => this.errorMessage.set(getErrorMessage(error)),
      });
  }

  protected clearHistory(): void {
    this.historyService.clear();
  }

  protected retryCurrencies(): void {
    this.loadCurrencies();
  }

  protected swapCurrencies(): void {
    const { sourceCurrency, targetCurrency } = this.form.getRawValue();

    this.form.patchValue({
      sourceCurrency: targetCurrency,
      targetCurrency: sourceCurrency,
    });
  }

  protected currencyLabel(code: string): string {
    const currency = this.currencies().find((item) => item.code === code);
    return currency ? `${currency.code} - ${currency.name}` : code;
  }

  private loadCurrencies(): void {
    this.isLoadingCurrencies.set(true);
    this.errorMessage.set(null);

    this.currencyApi
      .getCurrencies()
      .pipe(
        finalize(() => this.isLoadingCurrencies.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (currencies) => {
          this.currencies.set(currencies);
          this.applyCurrencyDefaults(currencies);
        },
        error: (error: unknown) => this.errorMessage.set(getErrorMessage(error)),
      });
  }

  private applyCurrencyDefaults(currencies: CurrencyOption[]): void {
    const hasUsd = currencies.some((currency) => currency.code === 'USD');
    const hasEur = currencies.some((currency) => currency.code === 'EUR');

    this.form.patchValue({
      sourceCurrency: hasUsd ? 'USD' : (currencies[0]?.code ?? ''),
      targetCurrency: hasEur ? 'EUR' : (currencies[1]?.code ?? currencies[0]?.code ?? ''),
    });
  }
}

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getErrorMessage(error: unknown): string {
  const maybeApiError = error as Partial<ApiError>;

  return typeof maybeApiError.message === 'string'
    ? maybeApiError.message
    : 'Unable to complete the request. Please try again.';
}
