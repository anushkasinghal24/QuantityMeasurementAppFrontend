import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, FormBuilder, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs';
import { RouterLink } from '@angular/router';
import { HistoryService } from '../../core/services/history.service';
import { AuthService } from '../../core/services/auth.service';
import { ConverterService } from '../../core/services/converter.service';
import { UnitCategoryId } from '../../core/services/unit-converter.service';

type TabId = 'convert' | 'compare' | 'calc';

type ConverterFormValue = {
  category: UnitCategoryId;
  value: number;
  fromUnitId: string;
  toUnitId: string;
};

type CompareOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';
type CalcOperator = '+' | '-' | '*' | '/';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.css'],
})
export class ConverterComponent {
  private formBuilder = inject(FormBuilder);
  private converter = inject(ConverterService);
  private history = inject(HistoryService);
  private auth = inject(AuthService);

  readonly activeTab = signal<TabId>('convert');
  readonly categories = this.converter.categories;
  readonly compareOperators: CompareOperator[] = ['>', '<', '>=', '<=', '==', '!='];
  readonly calcOperators: CalcOperator[] = ['+', '-', '*', '/'];
  readonly isLoggedIn = computed(() => this.auth.loggedIn());
  readonly isGuest = computed(() => !this.isLoggedIn());

  readonly autoSaveMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    category: this.formBuilder.nonNullable.control<UnitCategoryId>('length', { validators: [Validators.required] }),
    value: this.formBuilder.nonNullable.control<number>(1, { validators: [Validators.required, finiteNumberValidator] }),
    fromUnitId: this.formBuilder.nonNullable.control<string>('m', { validators: [Validators.required] }),
    toUnitId: this.formBuilder.nonNullable.control<string>('cm', { validators: [Validators.required] }),
  });

  readonly compareForm = this.formBuilder.nonNullable.group({
    category: this.formBuilder.nonNullable.control<UnitCategoryId>('length', { validators: [Validators.required] }),
    leftValue: this.formBuilder.nonNullable.control<number>(1, { validators: [Validators.required, finiteNumberValidator] }),
    leftUnitId: this.formBuilder.nonNullable.control<string>('km', { validators: [Validators.required] }),
    operator: this.formBuilder.nonNullable.control<'>' | '<' | '>=' | '<=' | '==' | '!='>('>', {
      validators: [Validators.required],
    }),
    rightValue: this.formBuilder.nonNullable.control<number>(500, { validators: [Validators.required, finiteNumberValidator] }),
    rightUnitId: this.formBuilder.nonNullable.control<string>('m', { validators: [Validators.required] }),
  });

  readonly calcForm = this.formBuilder.nonNullable.group({
    category: this.formBuilder.nonNullable.control<UnitCategoryId>('length', { validators: [Validators.required] }),
    leftValue: this.formBuilder.nonNullable.control<number>(5, { validators: [Validators.required, finiteNumberValidator] }),
    leftUnitId: this.formBuilder.nonNullable.control<string>('m', { validators: [Validators.required] }),
    operator: this.formBuilder.nonNullable.control<'+' | '-' | '*' | '/'>('+', { validators: [Validators.required] }),
    rightMode: this.formBuilder.nonNullable.control<'measurement' | 'scalar'>('measurement', {
      validators: [Validators.required],
    }),
    rightValue: this.formBuilder.nonNullable.control<number>(10, { validators: [Validators.required, finiteNumberValidator] }),
    rightUnitId: this.formBuilder.nonNullable.control<string>('cm', { validators: [Validators.required] }),
    outputUnitId: this.formBuilder.nonNullable.control<string>('m', { validators: [Validators.required] }),
  });

  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(
      startWith(undefined),
      map(() => this.form.getRawValue() as ConverterFormValue)
    ),
    { initialValue: this.form.getRawValue() as ConverterFormValue }
  );

  private readonly compareFormValue = toSignal(
    this.compareForm.valueChanges.pipe(
      startWith(undefined),
      map(() => this.compareForm.getRawValue() as {
        category: UnitCategoryId;
        leftValue: number;
        leftUnitId: string;
        operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
        rightValue: number;
        rightUnitId: string;
      })
    ),
    { initialValue: this.compareForm.getRawValue() as any }
  );

  private readonly calcFormValue = toSignal(
    this.calcForm.valueChanges.pipe(
      startWith(undefined),
      map(() => this.calcForm.getRawValue() as {
        category: UnitCategoryId;
        leftValue: number;
        leftUnitId: string;
        operator: '+' | '-' | '*' | '/';
        rightMode: 'measurement' | 'scalar';
        rightValue: number;
        rightUnitId: string;
        outputUnitId: string;
      })
    ),
    { initialValue: this.calcForm.getRawValue() as any }
  );

  readonly units = computed(() => this.converter.getUnits(this.formValue().category));
  readonly compareUnits = computed(() => this.converter.getUnits(this.compareFormValue().category));
  readonly calcUnits = computed(() => this.converter.getUnits(this.calcFormValue().category));
  readonly calcNeedsOutputUnit = computed(() => {
    const op = this.calcFormValue().operator;
    return op === '+' || op === '-';
  });

  readonly result = computed(() => {
    const { category, value, fromUnitId, toUnitId } = this.formValue();
    if (!Number.isFinite(value)) return { ok: false, message: 'Enter a valid number.' } as const;
    return this.converter.convert(category, value, fromUnitId, toUnitId);
  });

  readonly compareResult = computed(() => {
    const { leftValue, leftUnitId, operator, rightValue, rightUnitId } = this.compareFormValue();
    if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) return null;
    const expression = `${leftValue}${leftUnitId} ${operator} ${rightValue}${rightUnitId}`;
    return this.converter.compareExpression(expression);
  });

  readonly calcResult = computed(() => {
    const formValue = this.calcFormValue();
    const { leftValue, leftUnitId, operator, rightMode, rightValue, rightUnitId } = formValue;
    if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) return null;

    const right = rightMode === 'scalar' ? `${rightValue}` : `${rightValue}${rightUnitId}`;
    const expression = `${leftValue}${leftUnitId} ${operator} ${right}`;

    const outputUnitId = this.calcNeedsOutputUnit() ? formValue.outputUnitId : undefined;
    return this.converter.evaluateArithmeticExpression(expression, outputUnitId);
  });

  private lastConvertSignature: string | null = null;
  private lastCompareSignature: string | null = null;
  private lastCalcSignature: string | null = null;

  private convertTimer: ReturnType<typeof setTimeout> | null = null;
  private compareTimer: ReturnType<typeof setTimeout> | null = null;
  private calcTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Prevent auto-saving the initial defaults (opening the page should not create history items).
    this.lastConvertSignature = this.seedConvertSignature();
    this.lastCompareSignature = this.seedCompareSignature();
    this.lastCalcSignature = this.seedCalcSignature();

    effect(
      () => {
        const { operator, rightMode, leftUnitId } = this.calcFormValue();

        if (operator === '+' || operator === '-') {
          if (rightMode !== 'measurement') this.calcForm.controls.rightMode.setValue('measurement');
          this.calcForm.controls.rightUnitId.enable({ emitEvent: false });
          if (!this.calcForm.controls.outputUnitId.value) this.calcForm.controls.outputUnitId.setValue(leftUnitId);
          return;
        }

        if (operator === '*') {
          if (rightMode !== 'scalar') this.calcForm.controls.rightMode.setValue('scalar');
          this.calcForm.controls.rightUnitId.disable({ emitEvent: false });
          return;
        }

        // Division supports scalar or unit÷unit ratios.
        if (rightMode === 'measurement') this.calcForm.controls.rightUnitId.enable({ emitEvent: false });
        else this.calcForm.controls.rightUnitId.disable({ emitEvent: false });
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      if (this.activeTab() !== 'convert') return;
      if (!this.form.dirty) return;
      const formValue = this.formValue();
      const result = this.result();
      if (!result.ok) return;

      const signature = JSON.stringify({
        kind: 'convert',
        category: formValue.category,
        value: formValue.value,
        fromUnitId: formValue.fromUnitId,
        toUnitId: formValue.toUnitId,
        result: result.value,
      });

      if (signature === this.lastConvertSignature) return;
      this.lastConvertSignature = signature;

      if (this.convertTimer) globalThis.clearTimeout(this.convertTimer);
      this.convertTimer = globalThis.setTimeout(() => {
        if (signature !== this.lastConvertSignature) return;
        this.history.addConversion({
          category: formValue.category,
          value: formValue.value,
          fromUnitId: formValue.fromUnitId,
          toUnitId: formValue.toUnitId,
          result: result.value,
        });
        this.setAutoSaveMessage();
      }, 450);
    });

    effect(() => {
      if (this.activeTab() !== 'compare') return;
      if (!this.compareForm.dirty) return;
      const formValue = this.compareFormValue();
      const expression = `${formValue.leftValue}${formValue.leftUnitId} ${formValue.operator} ${formValue.rightValue}${formValue.rightUnitId}`;
      const compare = this.compareResult();
      if (!expression.trim()) return;
      if (!compare?.ok) return;

      const signature = JSON.stringify({
        kind: 'compare',
        expression,
        result: compare.result,
        category: formValue.category,
      });

      if (signature === this.lastCompareSignature) return;
      this.lastCompareSignature = signature;

      if (this.compareTimer) globalThis.clearTimeout(this.compareTimer);
      this.compareTimer = globalThis.setTimeout(() => {
        if (signature !== this.lastCompareSignature) return;
        this.history.addComparison({
          category: formValue.category,
          expression,
          operator: formValue.operator,
          result: compare.result,
        });
        this.setAutoSaveMessage();
      }, 650);
    });

    effect(() => {
      if (this.activeTab() !== 'calc') return;
      if (!this.calcForm.dirty) return;
      const formValue = this.calcFormValue();
      const right = formValue.rightMode === 'scalar' ? `${formValue.rightValue}` : `${formValue.rightValue}${formValue.rightUnitId}`;
      const expression = `${formValue.leftValue}${formValue.leftUnitId} ${formValue.operator} ${right}`.trim();
      const calc = this.calcResult();
      if (!expression) return;
      if (!calc?.ok) return;

      const signature = JSON.stringify({
        kind: 'calc',
        category: formValue.category,
        outputUnitId: formValue.outputUnitId,
        expression,
        value: calc.value,
        unitId: calc.unitId,
      });

      if (signature === this.lastCalcSignature) return;
      this.lastCalcSignature = signature;

      if (this.calcTimer) globalThis.clearTimeout(this.calcTimer);
      this.calcTimer = globalThis.setTimeout(() => {
        if (signature !== this.lastCalcSignature) return;
        this.history.addCalculation({
          category: formValue.category,
          expression,
          result: calc.value,
          resultUnitId: calc.unitId,
        });
        this.setAutoSaveMessage();
      }, 650);
    });
  }

  onCategoryChange() {
    const category = this.form.getRawValue().category;
    const defaults = this.converter.getDefaultUnits(category);
    this.form.patchValue({ fromUnitId: defaults.fromUnitId, toUnitId: defaults.toUnitId });
  }

  onCompareCategoryChange() {
    const category = this.compareForm.getRawValue().category;
    const defaults = this.converter.getDefaultUnits(category);
    this.compareForm.patchValue({ leftUnitId: defaults.fromUnitId, rightUnitId: defaults.toUnitId });
  }

  swapUnits() {
    const { fromUnitId, toUnitId, value } = this.form.getRawValue();
    const res = this.result();
    this.form.patchValue({
      fromUnitId: toUnitId,
      toUnitId: fromUnitId,
      value: res.ok && Number.isFinite(res.value) ? res.value : value,
    });
  }

  onCalcCategoryChange() {
    const category = this.calcForm.getRawValue().category;
    const defaults = this.converter.getDefaultUnits(category);
    this.calcForm.patchValue({
      leftUnitId: defaults.fromUnitId,
      rightUnitId: defaults.toUnitId,
      outputUnitId: defaults.fromUnitId,
    });
  }

  private setAutoSaveMessage() {
    const base = this.isLoggedIn() ? 'Auto-saved to your history.' : 'Saved for this device (syncs after login).';
    this.autoSaveMessage.set(base);
    globalThis.setTimeout(() => {
      if (this.autoSaveMessage() === base) this.autoSaveMessage.set(null);
    }, 2000);
  }

  private seedConvertSignature(): string | null {
    const formValue = this.form.getRawValue() as ConverterFormValue;
    const res = this.converter.convert(formValue.category, formValue.value, formValue.fromUnitId, formValue.toUnitId);
    if (!res.ok) return null;
    return JSON.stringify({
      kind: 'convert',
      category: formValue.category,
      value: formValue.value,
      fromUnitId: formValue.fromUnitId,
      toUnitId: formValue.toUnitId,
      result: res.value,
    });
  }

  private seedCompareSignature(): string | null {
    const formValue = this.compareForm.getRawValue() as any;
    if (!Number.isFinite(formValue.leftValue) || !Number.isFinite(formValue.rightValue)) return null;
    const expression = `${formValue.leftValue}${formValue.leftUnitId} ${formValue.operator} ${formValue.rightValue}${formValue.rightUnitId}`;
    const res = this.converter.compareExpression(expression);
    if (!res.ok) return null;
    return JSON.stringify({ kind: 'compare', expression, result: res.result, category: formValue.category });
  }

  private seedCalcSignature(): string | null {
    const formValue = this.calcForm.getRawValue() as any;
    if (!Number.isFinite(formValue.leftValue) || !Number.isFinite(formValue.rightValue)) return null;
    const right = formValue.rightMode === 'scalar' ? `${formValue.rightValue}` : `${formValue.rightValue}${formValue.rightUnitId}`;
    const expression = `${formValue.leftValue}${formValue.leftUnitId} ${formValue.operator} ${right}`.trim();
    const outputUnitId = formValue.operator === '+' || formValue.operator === '-' ? formValue.outputUnitId : undefined;
    const res = this.converter.evaluateArithmeticExpression(expression, outputUnitId);
    if (!res.ok) return null;
    return JSON.stringify({
      kind: 'calc',
      category: formValue.category,
      outputUnitId: formValue.outputUnitId,
      expression,
      value: res.value,
      unitId: res.unitId,
    });
  }
}

function finiteNumberValidator(control: AbstractControl<number>): ValidationErrors | null {
  return Number.isFinite(control.value) ? null : { finite: true };
}
