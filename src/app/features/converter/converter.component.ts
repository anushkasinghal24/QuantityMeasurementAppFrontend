import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs';
import { ConversionHistoryService } from '../../core/services/conversion-history.service';
import { UnitCategoryId, UnitConverterService } from '../../core/services/unit-converter.service';

type TabId = 'convert' | 'compare' | 'calc';

type ConverterFormValue = {
  category: UnitCategoryId;
  value: number;
  fromUnitId: string;
  toUnitId: string;
};

type CompareFormValue = { expression: string };

type CalcFormValue = {
  category: UnitCategoryId;
  outputUnitId: string;
  expression: string;
};

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.css'],
})
export class ConverterComponent {
  private formBuilder = inject(FormBuilder);
  private converter = inject(UnitConverterService);
  private history = inject(ConversionHistoryService);

  readonly activeTab = signal<TabId>('convert');
  readonly categories = this.converter.categories;

  readonly form = this.formBuilder.nonNullable.group({
    category: this.formBuilder.nonNullable.control<UnitCategoryId>('length', { validators: [Validators.required] }),
    value: this.formBuilder.nonNullable.control<number>(1, { validators: [Validators.required] }),
    fromUnitId: this.formBuilder.nonNullable.control<string>('m', { validators: [Validators.required] }),
    toUnitId: this.formBuilder.nonNullable.control<string>('cm', { validators: [Validators.required] }),
  });

  readonly compareForm = this.formBuilder.nonNullable.group({
    expression: this.formBuilder.nonNullable.control<string>('1km > 500m', { validators: [Validators.required] }),
  });

  readonly calcForm = this.formBuilder.nonNullable.group({
    category: this.formBuilder.nonNullable.control<UnitCategoryId>('length', { validators: [Validators.required] }),
    outputUnitId: this.formBuilder.nonNullable.control<string>('m', { validators: [Validators.required] }),
    expression: this.formBuilder.nonNullable.control<string>('5m + 10cm', { validators: [Validators.required] }),
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
      map(() => this.compareForm.getRawValue() as CompareFormValue)
    ),
    { initialValue: this.compareForm.getRawValue() as CompareFormValue }
  );

  private readonly calcFormValue = toSignal(
    this.calcForm.valueChanges.pipe(
      startWith(undefined),
      map(() => this.calcForm.getRawValue() as CalcFormValue)
    ),
    { initialValue: this.calcForm.getRawValue() as CalcFormValue }
  );

  readonly units = computed(() => this.converter.getUnits(this.formValue().category));
  readonly calcUnits = computed(() => this.converter.getUnits(this.calcFormValue().category));

  readonly result = computed(() => {
    const { category, value, fromUnitId, toUnitId } = this.formValue();
    return this.converter.convert(category, value, fromUnitId, toUnitId);
  });

  readonly compareResult = computed(() => {
    const expression = this.compareFormValue().expression;
    if (!expression.trim()) return null;
    return this.converter.compareExpression(expression);
  });

  readonly calcResult = computed(() => {
    const { expression, outputUnitId } = this.calcFormValue();
    if (!expression.trim()) return null;
    return this.converter.evaluateArithmeticExpression(expression, outputUnitId);
  });

  onCategoryChange() {
    const category = this.form.getRawValue().category;
    const defaults = this.converter.getDefaultUnits(category);
    this.form.patchValue({ fromUnitId: defaults.fromUnitId, toUnitId: defaults.toUnitId });
  }

  onCalcCategoryChange() {
    const category = this.calcForm.getRawValue().category;
    const defaults = this.converter.getDefaultUnits(category);
    this.calcForm.patchValue({ outputUnitId: defaults.fromUnitId });
  }

  saveConversion() {
    const current = this.form.getRawValue() as ConverterFormValue;
    const result = this.result();
    if (!result.ok) return;

    this.history.addConversion({
      category: current.category,
      value: current.value,
      fromUnitId: current.fromUnitId,
      toUnitId: current.toUnitId,
      result: result.value,
    });
  }

  saveComparison() {
    const compare = this.compareResult();
    if (!compare?.ok) return;

    const expression = (this.compareForm.getRawValue() as CompareFormValue).expression.trim();
    const operatorMatch = expression.match(/(>=|<=|==|!=|>|<)/);
    const operator = (operatorMatch?.[1] as '>' | '<' | '>=' | '<=' | '==' | '!=') ?? '==';

    this.history.addComparison({
      category: compare.left.category,
      expression,
      operator,
      result: compare.result,
    });
  }

  saveCalculation() {
    const calc = this.calcResult();
    if (!calc?.ok) return;

    const current = this.calcForm.getRawValue() as CalcFormValue;
    this.history.addCalculation({
      category: current.category,
      expression: current.expression.trim(),
      result: calc.value,
      resultUnitId: calc.unitId,
    });
  }
}

