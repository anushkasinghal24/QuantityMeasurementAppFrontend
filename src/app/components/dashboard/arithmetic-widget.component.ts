// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { NgFor, NgIf, NgClass } from '@angular/common';
// import { firstValueFrom } from 'rxjs';
// import { ApiService } from '../../services/api.service';
// import { AuthService } from '../../services/auth.service';
// import { ToastService } from '../../services/toast.service';
// import { UNIT_CATEGORIES } from '../../models/units';
// import { Output, EventEmitter } from '@angular/core';

// const DUAL_OPS = [
//   { id: 'add',      label: 'Add',      symbol: '+', desc: 'Add two quantities' },
//   { id: 'subtract', label: 'Subtract', symbol: '−', desc: 'Subtract Q2 from Q1' },
//   { id: 'compare',  label: 'Compare',  symbol: '?', desc: 'Check which is larger' },
// ];
// const SCALAR_OPS = [
//   { id: 'multiply', label: 'Multiply', symbol: '×', desc: 'Multiply by a number' },
//   { id: 'divide',   label: 'Divide',   symbol: '÷', desc: 'Divide by a number' },
// ];
// const ALL_OPS = [...DUAL_OPS, ...SCALAR_OPS];

// @Component({
//   selector: 'app-arithmetic-widget',
//   standalone: true,
//   imports: [FormsModule, NgFor, NgIf, NgClass],
//   template: `
// <div class="card widget-card">
//   <!-- Operation selector -->
//   <div class="ops-row">
//     <button *ngFor="let op of allOps" (click)="selectedOp=op.id;result=null"
//             class="op-btn" [ngClass]="{'active': selectedOp===op.id}">
//       <span class="op-sym">{{op.symbol}}</span>
//       <span class="op-label">{{op.label}}</span>
//     </button>
//   </div>

//   <!-- Description -->
//   <p class="op-desc">{{currentOp?.desc}}</p>

//   <!-- Category -->
//   <div class="field-group">
//     <label class="label">Category</label>
//     <div class="cat-tabs">
//       <button *ngFor="let cat of categories" class="cat-btn" [ngClass]="{'active': selectedCat===cat.id}"
//               (click)="handleCategoryChange(cat.id)">{{cat.icon}} {{cat.label}}</button>
//     </div>
//   </div>

//   <!-- Q1 -->
//   <div class="inputs-grid">
//     <div class="field-group">
//       <label class="label">Value 1</label>
//       <input type="number" class="input-field" [(ngModel)]="value1" placeholder="e.g. 10">
//     </div>
//     <div class="field-group">
//       <label class="label">Unit 1</label>
//       <select class="select-field" [(ngModel)]="unit1">
//         <option *ngFor="let u of currentUnits" [value]="u.value">{{u.label}}</option>
//       </select>
//     </div>
//   </div>

//   <!-- Q2 / Scalar -->
//   <ng-container *ngIf="isDualOp">
//     <div class="inputs-grid">
//       <div class="field-group">
//         <label class="label">Value 2</label>
//         <input type="number" class="input-field" [(ngModel)]="value2" placeholder="e.g. 5">
//       </div>
//       <div class="field-group">
//         <label class="label">Unit 2</label>
//         <select class="select-field" [(ngModel)]="unit2">
//           <option *ngFor="let u of currentUnits" [value]="u.value">{{u.label}}</option>
//         </select>
//       </div>
//     </div>
//   </ng-container>

//   <ng-container *ngIf="isScalarOp">
//     <div class="field-group">
//       <label class="label">{{selectedOp==='multiply' ? 'Multiply by' : 'Divide by'}}</label>
//       <input type="number" class="input-field" [(ngModel)]="scalar" placeholder="e.g. 3">
//     </div>
//   </ng-container>

//   <!-- Result unit (for add/subtract) -->
//   <ng-container *ngIf="selectedOp==='add' || selectedOp==='subtract'">
//     <div class="field-group">
//       <label class="label">Result Unit</label>
//       <select class="select-field" [(ngModel)]="resultUnit">
//         <option *ngFor="let u of currentUnits" [value]="u.value">{{u.label}}</option>
//       </select>
//     </div>
//   </ng-container>

//   <button class="btn-primary" (click)="handleSubmit()" [disabled]="loading">
//     <span *ngIf="loading" class="animate-spin">⟳</span>
//     {{loading ? 'Calculating…' : 'Calculate'}}
//   </button>

//   <!-- Result -->
//   <div *ngIf="result !== null" class="result-box result-pop">
//     <p class="result-label">Result</p>
//     <ng-container *ngIf="selectedOp==='compare'; else numResult">
//       <p class="compare-result">{{result?.message || result?.result || result}}</p>
//     </ng-container>
//     <ng-template #numResult>
//       <div class="result-value">
//         <span class="result-num">{{formatNum(result?.result ?? result)}}</span>
//         <span class="result-unit">{{getResultUnitLabel()}}</span>
//       </div>
//     </ng-template>
//     <p *ngIf="auth.isAuthenticated && selectedOp!=='compare'" class="result-saved">✓ Saved to history</p>
//   </div>
// </div>
//   `,
//   styles: [`
//     .widget-card{padding:24px;display:flex;flex-direction:column;gap:16px;}
//     .ops-row{display:flex;flex-wrap:wrap;gap:8px;}
//     .op-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;border:1.5px solid var(--border);cursor:pointer;font-family:inherit;font-size:0.85rem;font-weight:500;background:var(--bg-secondary);color:var(--text-secondary);transition:all 0.2s;}
//     .op-btn:hover{border-color:var(--brand-400);color:var(--brand-600);}
//     .op-btn.active{background:var(--brand-600);border-color:var(--brand-600);color:#fff;}
//     .op-sym{font-weight:700;font-size:1rem;}
//     .op-label{font-size:0.82rem;}
//     .op-desc{font-size:0.82rem;color:var(--text-secondary);padding:4px 0;}
//     .cat-tabs{display:flex;flex-wrap:wrap;gap:6px;}
//     .cat-btn{display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:8px;border:none;cursor:pointer;font-size:0.8rem;font-weight:500;background:var(--bg-secondary);color:var(--text-secondary);transition:all 0.2s;font-family:inherit;}
//     .cat-btn.active{background:var(--brand-500);color:#fff;}
//     .field-group{display:flex;flex-direction:column;gap:6px;}
//     .inputs-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
//     .result-box{border-radius:14px;padding:18px;background:linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.04));border:1.5px solid rgba(99,102,241,0.2);}
//     .result-label{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-secondary);font-weight:600;margin-bottom:8px;}
//     .result-value{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;}
//     .result-num{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:1.8rem;color:var(--text-primary);}
//     .result-unit{color:var(--brand-600);font-weight:600;}
//     .compare-result{font-size:1rem;font-weight:600;color:var(--text-primary);line-height:1.5;}
//     .result-saved{font-size:0.75rem;color:#22c55e;margin-top:8px;}
//     .animate-spin{display:inline-block;}
//   `]
// })
// export class ArithmeticWidgetComponent {
//   @Output() operationDone = new EventEmitter<void>();

//   categories = UNIT_CATEGORIES;
//   allOps = ALL_OPS;
//   selectedOp = 'add';
//   selectedCat = 'length';
//   value1 = '';
//   unit1 = 'FEET';
//   value2 = '';
//   unit2 = 'INCHES';
//   scalar = '';
//   resultUnit = 'FEET';
//   result: any = null;
//   loading = false;

//   constructor(
//     public auth: AuthService,
//     private api: ApiService,
//     private toast: ToastService
//   ) {}

//   get isDualOp() { return DUAL_OPS.some(o => o.id === this.selectedOp); }
//   get isScalarOp() { return SCALAR_OPS.some(o => o.id === this.selectedOp); }
//   get currentOp() { return ALL_OPS.find(o => o.id === this.selectedOp); }
//   get currentUnits() { return UNIT_CATEGORIES.find(c => c.id === this.selectedCat)?.units || []; }

//   handleCategoryChange(catId: string) {
//     this.selectedCat = catId;
//     const cat = UNIT_CATEGORIES.find(c => c.id === catId);
//     if (cat?.units.length >= 2) {
//       this.unit1 = cat.units[0].value;
//       this.unit2 = cat.units[1].value;
//       this.resultUnit = cat.units[0].value;
//     }
//     this.result = null;
//   }

//   formatNum(n: any): string {
//     if (typeof n === 'number') return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
//     return String(n ?? '');
//   }

//   getResultUnitLabel(): string {
//     return this.currentUnits.find(u => u.value === this.resultUnit)?.label || this.resultUnit;
//   }

//   async handleSubmit() {
//     const v1 = Number(this.value1);
//     const v2 = Number(this.value2);
//     const sc = Number(this.scalar);

//     if (!this.value1 || isNaN(v1)) { this.toast.error('Enter a valid first value'); return; }
//     if (this.isDualOp && (!this.value2 || isNaN(v2))) { this.toast.error('Enter a valid second value'); return; }
//     if (this.isScalarOp && (!this.scalar || isNaN(sc))) { this.toast.error('Enter a valid number'); return; }

//     this.loading = true;
//     this.result = null;
//     try {
//       let data: any;
//       switch (this.selectedOp) {
//         case 'add':      data = await firstValueFrom(this.api.add({ value1: v1, unit1: this.unit1, value2: v2, unit2: this.unit2, resultUnit: this.resultUnit })); break;
//         case 'subtract': data = await firstValueFrom(this.api.subtract({ value1: v1, unit1: this.unit1, value2: v2, unit2: this.unit2, resultUnit: this.resultUnit })); break;
//         case 'compare':  data = await firstValueFrom(this.api.compare({ value1: v1, unit1: this.unit1, value2: v2, unit2: this.unit2 })); break;
//         case 'multiply': data = await firstValueFrom(this.api.multiply({ value1: v1, unit1: this.unit1, scalar: sc })); break;
//         case 'divide':   data = await firstValueFrom(this.api.divide({ value1: v1, unit1: this.unit1, scalar: sc })); break;
//         default: throw new Error('Unknown operation');
//       }
//       this.result = data;

//       if (this.auth.isAuthenticated && this.auth.user && this.selectedOp !== 'compare') {
//         const cat = UNIT_CATEGORIES.find(c => c.id === this.selectedCat);
//         firstValueFrom(this.api.saveHistory({
//           username: this.auth.user.username,
//           operation: this.selectedOp.toUpperCase(),
//           fromUnit: this.unit1,
//           toUnit: this.isDualOp ? this.unit2 : 'SCALAR',
//           inputValue: v1,
//           result: String(data.result),
//           measurementType: cat?.label?.toUpperCase() || 'UNKNOWN',
//         })).catch(() => {});
//         this.operationDone.emit();
//       }
//     } catch (err: any) {
//       this.toast.error(err?.error?.error || 'Operation failed');
//     } finally {
//       this.loading = false;
//     }
//   }
// }


import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UNIT_CATEGORIES } from '../../models/units';
import { Output, EventEmitter } from '@angular/core';

const DUAL_OPS = [
  { id: 'add',      label: 'Add',      symbol: '+', desc: 'Add two quantities' },
  { id: 'subtract', label: 'Subtract', symbol: '−', desc: 'Subtract Q2 from Q1' },
  { id: 'compare',  label: 'Compare',  symbol: '?', desc: 'Check which is larger' },
];
const SCALAR_OPS = [
  { id: 'multiply', label: 'Multiply', symbol: '×', desc: 'Multiply by a number' },
  { id: 'divide',   label: 'Divide',   symbol: '÷', desc: 'Divide by a number' },
];
const ALL_OPS = [...DUAL_OPS, ...SCALAR_OPS];

@Component({
  selector: 'app-arithmetic-widget',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, NgClass],
  template: `
<div class="card widget-card">
  <div class="ops-row">
    <button *ngFor="let op of allOps" (click)="selectedOp=op.id;result=null"
            class="op-btn" [ngClass]="{'active': selectedOp===op.id}">
      <span class="op-sym">{{op.symbol}}</span>
      <span class="op-label">{{op.label}}</span>
    </button>
  </div>

  <p class="op-desc">{{currentOp?.desc}}</p>

  <div class="field-group">
    <label class="label">Category</label>
    <div class="cat-tabs">
      <button *ngFor="let cat of categories" class="cat-btn" [ngClass]="{'active': selectedCat===cat.id}"
              (click)="handleCategoryChange(cat.id)">{{cat.icon}} {{cat.label}}</button>
    </div>
  </div>

  <div class="inputs-grid">
    <div class="field-group">
      <label class="label">Value 1</label>
      <input type="number" class="input-field" [(ngModel)]="value1" placeholder="e.g. 10">
    </div>
    <div class="field-group">
      <label class="label">Unit 1</label>
      <select class="select-field" [(ngModel)]="unit1">
        <option *ngFor="let u of currentUnits" [value]="u.value">{{u.label}}</option>
      </select>
    </div>
  </div>

  <ng-container *ngIf="isDualOp">
    <div class="inputs-grid">
      <div class="field-group">
        <label class="label">Value 2</label>
        <input type="number" class="input-field" [(ngModel)]="value2" placeholder="e.g. 5">
      </div>
      <div class="field-group">
        <label class="label">Unit 2</label>
        <select class="select-field" [(ngModel)]="unit2">
          <option *ngFor="let u of currentUnits" [value]="u.value">{{u.label}}</option>
        </select>
      </div>
    </div>
  </ng-container>

  <ng-container *ngIf="isScalarOp">
    <div class="field-group">
      <label class="label">{{selectedOp==='multiply' ? 'Multiply by' : 'Divide by'}}</label>
      <input type="number" class="input-field" [(ngModel)]="scalar" placeholder="e.g. 3">
    </div>
  </ng-container>

  <ng-container *ngIf="selectedOp==='add' || selectedOp==='subtract'">
    <div class="field-group">
      <label class="label">Result Unit</label>
      <select class="select-field" [(ngModel)]="resultUnit">
        <option *ngFor="let u of currentUnits" [value]="u.value">{{u.label}}</option>
      </select>
    </div>
  </ng-container>

  <button class="btn-primary" (click)="handleSubmit()" [disabled]="loading">
    <span *ngIf="loading" class="animate-spin">⟳</span>
    {{loading ? 'Calculating…' : 'Calculate'}}
  </button>

  <div *ngIf="result !== null" class="result-box result-pop">
    <p class="result-label">Result</p>
    <ng-container *ngIf="selectedOp==='compare'; else numResult">
      <p class="compare-result">{{result?.message || result?.result || result}}</p>
    </ng-container>
    <ng-template #numResult>
      <div class="result-value">
        <span class="result-num">{{formatNum(result?.result ?? result)}}</span>
        <span class="result-unit">{{getResultUnitLabel()}}</span>
      </div>
    </ng-template>
    <p *ngIf="auth.isAuthenticated" class="result-saved">✓ Saved to history</p>
  </div>
</div>
  `,
  styles: [`
    .widget-card{padding:24px;display:flex;flex-direction:column;gap:16px;}
    .ops-row{display:flex;flex-wrap:wrap;gap:8px;}
    .op-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;border:1.5px solid var(--border);cursor:pointer;font-family:inherit;font-size:0.85rem;font-weight:500;background:var(--bg-secondary);color:var(--text-secondary);transition:all 0.2s;}
    .op-btn:hover{border-color:var(--brand-400);color:var(--brand-600);}
    .op-btn.active{background:var(--brand-600);border-color:var(--brand-600);color:#fff;}
    .op-sym{font-weight:700;font-size:1rem;}
    .op-label{font-size:0.82rem;}
    .op-desc{font-size:0.82rem;color:var(--text-secondary);padding:4px 0;}
    .cat-tabs{display:flex;flex-wrap:wrap;gap:6px;}
    .cat-btn{display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:8px;border:none;cursor:pointer;font-size:0.8rem;font-weight:500;background:var(--bg-secondary);color:var(--text-secondary);transition:all 0.2s;font-family:inherit;}
    .cat-btn.active{background:var(--brand-500);color:#fff;}
    .field-group{display:flex;flex-direction:column;gap:6px;}
    .inputs-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .result-box{border-radius:14px;padding:18px;background:linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.04));border:1.5px solid rgba(99,102,241,0.2);}
    .result-label{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-secondary);font-weight:600;margin-bottom:8px;}
    .result-value{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;}
    .result-num{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:1.8rem;color:var(--text-primary);}
    .result-unit{color:var(--brand-600);font-weight:600;}
    .compare-result{font-size:1rem;font-weight:600;color:var(--text-primary);line-height:1.5;}
    .result-saved{font-size:0.75rem;color:#22c55e;margin-top:8px;}
    .animate-spin{display:inline-block;}
  `]
})
export class ArithmeticWidgetComponent {
  @Output() operationDone = new EventEmitter<void>();

  categories = UNIT_CATEGORIES;
  allOps = ALL_OPS;
  selectedOp = 'add';
  selectedCat = 'length';
  value1 = '';
  unit1 = 'FEET';
  value2 = '';
  unit2 = 'INCHES';
  scalar = '';
  resultUnit = 'FEET';
  result: any = null;
  loading = false;

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private toast: ToastService
  ) {}

  get isDualOp() { return DUAL_OPS.some(o => o.id === this.selectedOp); }
  get isScalarOp() { return SCALAR_OPS.some(o => o.id === this.selectedOp); }
  get currentOp() { return ALL_OPS.find(o => o.id === this.selectedOp); }
  get currentUnits() { return UNIT_CATEGORIES.find(c => c.id === this.selectedCat)?.units || []; }

  handleCategoryChange(catId: string) {
    this.selectedCat = catId;
    const cat = UNIT_CATEGORIES.find(c => c.id === catId);

    // ✅ FIX APPLIED HERE
    if (cat && cat.units && cat.units.length >= 2) {
      this.unit1 = cat.units[0].value;
      this.unit2 = cat.units[1].value;
      this.resultUnit = cat.units[0].value;
    }

    this.result = null;
  }

  formatNum(n: any): string {
    if (typeof n === 'number') return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
    return String(n ?? '');
  }

  getResultUnitLabel(): string {
    return this.currentUnits.find(u => u.value === this.resultUnit)?.label || this.resultUnit;
  }

  async handleSubmit() {
    const v1 = Number(this.value1);
    const v2 = Number(this.value2);
    const sc = Number(this.scalar);

    if (!this.value1 || isNaN(v1)) { this.toast.error('Enter a valid first value'); return; }
    if (this.isDualOp && (!this.value2 || isNaN(v2))) { this.toast.error('Enter a valid second value'); return; }
    if (this.isScalarOp && (!this.scalar || isNaN(sc))) { this.toast.error('Enter a valid number'); return; }

    this.loading = true;
    this.result = null;
    try {
      let data: any;
      switch (this.selectedOp) {
        case 'add':      data = await firstValueFrom(this.api.add({ value1: v1, unit1: this.unit1, value2: v2, unit2: this.unit2, resultUnit: this.resultUnit })); break;
        case 'subtract': data = await firstValueFrom(this.api.subtract({ value1: v1, unit1: this.unit1, value2: v2, unit2: this.unit2, resultUnit: this.resultUnit })); break;
        case 'compare':  data = await firstValueFrom(this.api.compare({ value1: v1, unit1: this.unit1, value2: v2, unit2: this.unit2 })); break;
        case 'multiply': data = await firstValueFrom(this.api.multiply({ value1: v1, unit1: this.unit1, scalar: sc })); break;
        case 'divide':   data = await firstValueFrom(this.api.divide({ value1: v1, unit1: this.unit1, scalar: sc })); break;
        default: throw new Error('Unknown operation');
      }
      this.result = data;

      if (this.auth.isAuthenticated && this.auth.user) {
        const cat = UNIT_CATEGORIES.find(c => c.id === this.selectedCat);
        await firstValueFrom(this.api.saveHistory({
          username: this.auth.user.username,
          operation: this.selectedOp.toUpperCase(),
          fromUnit: this.unit1,
          toUnit: this.isDualOp ? this.unit2 : 'SCALAR',
          inputValue: v1,
          value2: this.isDualOp ? v2 : sc,
          result: String(data.result),
          measurementType: cat?.label?.toUpperCase() || 'UNKNOWN',
        })).catch(() => {});
      }
      this.operationDone.emit();
    } catch (err: any) {
      this.toast.error(err?.error?.error || 'Operation failed');
    } finally {
      this.loading = false;
    }
  }
}
