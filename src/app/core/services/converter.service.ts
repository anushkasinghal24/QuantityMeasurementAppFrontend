import { Injectable, inject } from '@angular/core';
import {
  ArithmeticResult,
  CompareResult,
  ConvertResult,
  UnitCategoryId,
  UnitConverterService,
  UnitId,
  UnitOption,
} from './unit-converter.service';

@Injectable({ providedIn: 'root' })
export class ConverterService {
  private units = inject(UnitConverterService);

  get categories(): Array<{ id: UnitCategoryId; label: string }> {
    return this.units.categories;
  }

  getUnits(category: UnitCategoryId): UnitOption[] {
    return this.units.getUnits(category);
  }

  getDefaultUnits(category: UnitCategoryId): { fromUnitId: UnitId; toUnitId: UnitId } {
    return this.units.getDefaultUnits(category);
  }

  convert(category: UnitCategoryId, value: number, fromUnitId: UnitId, toUnitId: UnitId): ConvertResult {
    return this.units.convert(category, value, fromUnitId, toUnitId);
  }

  compareExpression(input: string): CompareResult {
    return this.units.compareExpression(input);
  }

  evaluateArithmeticExpression(input: string, outputUnitId?: UnitId): ArithmeticResult {
    return this.units.evaluateArithmeticExpression(input, outputUnitId);
  }

  formatUnitLabel(unitId: UnitId): string {
    return this.units.formatUnitLabel(unitId);
  }
}

