import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { Subject, firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UNIT_CATEGORIES, getCategoryForUnit } from '../../models/units';

@Component({
  selector: 'app-converter-widget',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgFor, NgIf, NgClass],
  template: `
<div class="card widget-card">
  <!-- Category tabs -->
  <div class="cat-tabs">
    <button *ngFor="let cat of categories" (click)="selectCategory(cat.id)"
            [ngClass]="{'active': selectedCat === cat.id}" class="cat-btn">
      {{cat.icon}} {{cat.label}}
    </button>
  </div>

  <!-- Value input -->
  <div class="field-group">
    <label class="label">Enter value</label>
    <div class="inp-wrap">
      <input type="number" class="input-field mono" placeholder="e.g. 100"
             [value]="inputValue" (input)="onValueInput($event)">
      <button *ngIf="inputValue" class="clear-btn" (click)="handleReset()" title="Clear">↺</button>
    </div>
  </div>

  <!-- Unit selectors -->
  <div class="units-row">
    <div class="unit-col">
      <label class="label">From</label>
      <select class="select-field" [(ngModel)]="fromUnit" (ngModelChange)="onUnitChange()" [ngModelOptions]="{standalone: true}">
        <option *ngFor="let u of currentUnits" [value]="u.value">{{u.label}}</option>
      </select>
    </div>
    <button class="swap-btn" (click)="handleSwap()" title="Swap units">⇄</button>
    <div class="unit-col">
      <label class="label">To</label>
      <select class="select-field" [(ngModel)]="toUnit" (ngModelChange)="onUnitChange()" [ngModelOptions]="{standalone: true}">
        <option *ngFor="let u of currentUnits" [value]="u.value">{{u.label}}</option>
      </select>
    </div>
  </div>

  <!-- Result box -->
  <div class="result-box" [ngClass]="{'has-result': result !== null}">
    <div *ngIf="loading" class="result-loading">
      <span class="animate-spin">⟳</span> Converting…
    </div>
    <div *ngIf="!loading && result !== null" class="result-pop result-content">
      <p class="result-label">Result</p>
      <div class="result-value">
        <span class="result-num">{{formatNum(result)}}</span>
        <span class="result-unit">{{toUnitLabel}}</span>
      </div>
      <p class="result-eq">{{inputValue}} {{fromUnitLabel}} = {{formatNum(result)}} {{toUnitLabel}}</p>
      <p *ngIf="auth.isAuthenticated" class="result-saved">✓ Saved to your history</p>
    </div>
    <div *ngIf="!loading && result === null" class="result-placeholder">
      Enter a value above to see the result
    </div>
  </div>
</div>
  `,
  styles: [`
    .widget-card { padding:24px;display:flex;flex-direction:column;gap:20px; }
    .cat-tabs { display:flex;flex-wrap:wrap;gap:8px; }
    .cat-btn { display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:10px;border:none;cursor:pointer;font-size:0.85rem;font-weight:500;background:var(--bg-secondary);color:var(--text-secondary);transition:all 0.2s;font-family:inherit; }
    .cat-btn:hover { background:var(--brand-50);color:var(--brand-600); }
    .cat-btn.active { background:var(--brand-600);color:#fff;box-shadow:0 0 0 3px rgba(99,102,241,0.2); }
    .dark .cat-btn.active { box-shadow:none; }
    .field-group { display:flex;flex-direction:column; }
    .inp-wrap { position:relative; }
    .input-field.mono { font-family:'JetBrains Mono',monospace;font-size:1.05rem; }
    .clear-btn { position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-secondary);font-size:1.1rem;transition:color 0.15s; }
    .clear-btn:hover { color:var(--text-primary); }
    .units-row { display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:end; }
    .unit-col { display:flex;flex-direction:column; }
    .swap-btn { width:40px;height:40px;border-radius:12px;background:var(--bg-secondary);border:1px solid var(--border);cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;color:var(--brand-600);transition:all 0.2s;margin-bottom:1px; }
    .swap-btn:hover { background:var(--brand-50);transform:scale(1.1); }
    .swap-btn:active { transform:scale(0.95); }
    .result-box { border-radius:16px;padding:20px;border:1.5px dashed var(--border);background:var(--bg-secondary);transition:all 0.3s;min-height:90px;display:flex;align-items:center;justify-content:center; }
    .result-box.has-result { background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.04));border-style:solid;border-color:rgba(99,102,241,0.25); }
    .result-loading { display:flex;align-items:center;gap:8px;color:var(--brand-600);font-size:0.9rem; }
    .result-content { width:100%; }
    .result-label { font-size:0.7rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-secondary);font-weight:600;margin-bottom:6px; }
    .result-value { display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px; }
    .result-num { font-family:'JetBrains Mono',monospace;font-weight:700;font-size:2rem;color:var(--text-primary); }
    .result-unit { color:var(--brand-600);font-weight:600;font-size:1rem; }
    .result-eq { font-size:0.82rem;color:var(--text-secondary); }
    .result-saved { font-size:0.75rem;color:#22c55e;margin-top:6px; }
    .result-placeholder { color:var(--text-secondary);font-size:0.875rem;text-align:center; }
    .animate-spin { display:inline-block; }
  `]
})
export class ConverterWidgetComponent implements OnInit, OnDestroy {
  @Output() conversionDone = new EventEmitter<void>();

  categories = UNIT_CATEGORIES;
  selectedCat = 'length';
  inputValue = '';
  fromUnit = 'FEET';
  toUnit = 'METER';
  result: number | null = null;
  loading = false;

  private valueChange$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.valueChange$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      const n = Number(val);
      if (val && !isNaN(n) && n !== 0) {
        this.doConvert(n, this.fromUnit, this.toUnit);
      } else {
        this.result = null;
      }
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  get currentUnits() {
    return UNIT_CATEGORIES.find(c => c.id === this.selectedCat)?.units || [];
  }

  get fromUnitLabel(): string {
    return this.currentUnits.find(u => u.value === this.fromUnit)?.label || this.fromUnit;
  }
  get toUnitLabel(): string {
    return this.currentUnits.find(u => u.value === this.toUnit)?.label || this.toUnit;
  }

  selectCategory(id: string) {
    this.selectedCat = id;
    const cat = UNIT_CATEGORIES.find(c => c.id === id);
    if (cat && cat.units.length >= 2) {
      this.fromUnit = cat.units[0].value;
      this.toUnit   = cat.units[1].value;
      this.result   = null;
    }
  }

  onValueInput(event: Event) {
    this.inputValue = (event.target as HTMLInputElement).value;
    this.valueChange$.next(this.inputValue);
  }

  onUnitChange() {
    const n = Number(this.inputValue);
    if (this.inputValue && !isNaN(n) && n !== 0) {
      this.doConvert(n, this.fromUnit, this.toUnit);
    }
  }

  handleSwap() {
    [this.fromUnit, this.toUnit] = [this.toUnit, this.fromUnit];
    this.result = null;
    const n = Number(this.inputValue);
    if (this.inputValue && !isNaN(n)) this.doConvert(n, this.fromUnit, this.toUnit);
  }

  handleReset() { this.inputValue = ''; this.result = null; }

  formatNum(n: number | string): string {
    if (typeof n === 'number') return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
    return String(n);
  }

  private async doConvert(val: number, from: string, to: string) {
    this.loading = true;
    try {

      const data = await firstValueFrom(this.api.convert({ value: val, fromUnit: from, toUnit: to }));
      const res = typeof data === 'object' ? data.result : data;
      this.result = res;

      if (this.auth.isAuthenticated && this.auth.user) {
        const cat = getCategoryForUnit(from);
        firstValueFrom(this.api.saveHistory({
          username: this.auth.user.username,
          operation: 'CONVERT',
          fromUnit: from,
          toUnit: to,
          inputValue: val,
          result: res,
          measurementType: cat?.label?.toUpperCase() || 'UNKNOWN',
        })).catch(() => {});
        this.conversionDone.emit();
      }
    } catch (err: any) {
      this.toast.error(err?.error?.error || 'Conversion failed');
      this.result = null;
    } finally {
      this.loading = false;
    }
  }
}
