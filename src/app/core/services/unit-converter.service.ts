import { Injectable } from '@angular/core';

export type UnitCategoryId = 'length' | 'mass' | 'temperature' | 'volume';
export type UnitId = string;

export type UnitOption = { id: UnitId; label: string };

export type Measurement = {
  value: number;
  unitId: UnitId;
  category: UnitCategoryId;
};

export type ConvertResult =
  | { ok: true; value: number }
  | { ok: false; message: string };

export type CompareOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';
export type CompareResult =
  | { ok: true; result: boolean; left: Measurement; right: Measurement }
  | { ok: false; message: string };

export type ArithmeticOperator = '+' | '-' | '*' | '/';
export type ArithmeticResult =
  | { ok: true; value: number; unitId: UnitId | null; category: UnitCategoryId | null }
  | { ok: false; message: string };

type LinearUnitDef = {
  kind: 'linear';
  id: UnitId;
  category: Exclude<UnitCategoryId, 'temperature'>;
  label: string;
  toBaseFactor: number;
};

type TemperatureUnitDef = {
  kind: 'temperature';
  id: UnitId;
  category: 'temperature';
  label: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
};

type UnitDef = LinearUnitDef | TemperatureUnitDef;

@Injectable({ providedIn: 'root' })
export class UnitConverterService {
  readonly categories: Array<{ id: UnitCategoryId; label: string }> = [
    { id: 'length', label: 'Length' },
    { id: 'mass', label: 'Mass' },
    { id: 'temperature', label: 'Temperature' },
    { id: 'volume', label: 'Volume' },
  ];

  private readonly unitDefs: UnitDef[] = [
    // Length (base: meter)
    { kind: 'linear', category: 'length', id: 'mm', label: 'Millimeters (mm)', toBaseFactor: 0.001 },
    { kind: 'linear', category: 'length', id: 'cm', label: 'Centimeters (cm)', toBaseFactor: 0.01 },
    { kind: 'linear', category: 'length', id: 'm', label: 'Meters (m)', toBaseFactor: 1 },
    { kind: 'linear', category: 'length', id: 'km', label: 'Kilometers (km)', toBaseFactor: 1000 },
    { kind: 'linear', category: 'length', id: 'in', label: 'Inches (in)', toBaseFactor: 0.0254 },
    { kind: 'linear', category: 'length', id: 'ft', label: 'Feet (ft)', toBaseFactor: 0.3048 },
    { kind: 'linear', category: 'length', id: 'yd', label: 'Yards (yd)', toBaseFactor: 0.9144 },
    { kind: 'linear', category: 'length', id: 'mi', label: 'Miles (mi)', toBaseFactor: 1609.344 },

    // Mass (base: kilogram)
    { kind: 'linear', category: 'mass', id: 'mg', label: 'Milligrams (mg)', toBaseFactor: 0.000001 },
    { kind: 'linear', category: 'mass', id: 'g', label: 'Grams (g)', toBaseFactor: 0.001 },
    { kind: 'linear', category: 'mass', id: 'kg', label: 'Kilograms (kg)', toBaseFactor: 1 },
    { kind: 'linear', category: 'mass', id: 'oz', label: 'Ounces (oz)', toBaseFactor: 0.028349523125 },
    { kind: 'linear', category: 'mass', id: 'lb', label: 'Pounds (lb)', toBaseFactor: 0.45359237 },

    // Temperature (base: Celsius)
    {
      kind: 'temperature',
      category: 'temperature',
      id: 'c',
      label: 'Celsius (°C)',
      toBase: value => value,
      fromBase: value => value,
    },
    {
      kind: 'temperature',
      category: 'temperature',
      id: 'f',
      label: 'Fahrenheit (°F)',
      toBase: value => (value - 32) * (5 / 9),
      fromBase: value => value * (9 / 5) + 32,
    },
    {
      kind: 'temperature',
      category: 'temperature',
      id: 'k',
      label: 'Kelvin (K)',
      toBase: value => value - 273.15,
      fromBase: value => value + 273.15,
    },

    // Volume (base: liter)
    { kind: 'linear', category: 'volume', id: 'ml', label: 'Milliliters (mL)', toBaseFactor: 0.001 },
    { kind: 'linear', category: 'volume', id: 'l', label: 'Liters (L)', toBaseFactor: 1 },
    { kind: 'linear', category: 'volume', id: 'm3', label: 'Cubic meters (m³)', toBaseFactor: 1000 },
    { kind: 'linear', category: 'volume', id: 'cm3', label: 'Cubic centimeters (cm³)', toBaseFactor: 0.001 },
    { kind: 'linear', category: 'volume', id: 'ft3', label: 'Cubic feet (ft³)', toBaseFactor: 28.316846592 },
    { kind: 'linear', category: 'volume', id: 'gal', label: 'US gallons (gal)', toBaseFactor: 3.785411784 },
  ];

  private readonly unitDefById = new Map<UnitId, UnitDef>(this.unitDefs.map(def => [def.id, def] as const));

  private readonly unitAliases = new Map<string, UnitId>([
    // Temperature aliases
    ['°c', 'c'],
    ['celsius', 'c'],
    ['celcius', 'c'],
    ['°f', 'f'],
    ['fahrenheit', 'f'],
    ['kelvin', 'k'],
    // Volume
    ['litre', 'l'],
    ['liter', 'l'],
    ['liters', 'l'],
    ['litres', 'l'],
    ['milliliter', 'ml'],
    ['millilitre', 'ml'],
    ['milliliters', 'ml'],
    ['millilitres', 'ml'],
    // Length
    ['meter', 'm'],
    ['metre', 'm'],
    ['meters', 'm'],
    ['metres', 'm'],
    ['kilometer', 'km'],
    ['kilometre', 'km'],
    ['kilometers', 'km'],
    ['kilometres', 'km'],
    ['centimeter', 'cm'],
    ['centimetre', 'cm'],
    ['centimeters', 'cm'],
    ['centimetres', 'cm'],
    ['millimeter', 'mm'],
    ['millimetre', 'mm'],
    ['millimeters', 'mm'],
    ['millimetres', 'mm'],
    // Mass
    ['gram', 'g'],
    ['grams', 'g'],
    ['kilogram', 'kg'],
    ['kilograms', 'kg'],
    ['pound', 'lb'],
    ['pounds', 'lb'],
    ['ounce', 'oz'],
    ['ounces', 'oz'],
  ]);

  getUnits(category: UnitCategoryId): UnitOption[] {
    return this.unitDefs
      .filter(def => def.category === category)
      .map(def => ({ id: def.id, label: def.label }));
  }

  getDefaultUnits(category: UnitCategoryId): { fromUnitId: UnitId; toUnitId: UnitId } {
    const units = this.getUnits(category);
    const fromUnitId = units[0]?.id ?? '';
    const toUnitId = units[1]?.id ?? fromUnitId;
    return { fromUnitId, toUnitId };
  }

  convert(category: UnitCategoryId, value: number, fromUnitId: UnitId, toUnitId: UnitId): ConvertResult {
    if (!Number.isFinite(value)) return { ok: false, message: 'Enter a valid number.' };
    if (fromUnitId === toUnitId) return { ok: true, value: round(value) };

    const fromDef = this.unitDefById.get(fromUnitId);
    const toDef = this.unitDefById.get(toUnitId);
    if (!fromDef || !toDef) return { ok: false, message: 'Unknown unit.' };
    if (fromDef.category !== category || toDef.category !== category) return { ok: false, message: 'Unit category mismatch.' };

    const base = this.toBase(value, fromDef);
    return { ok: true, value: round(this.fromBase(base, toDef)) };
  }

  compareExpression(expression: string): CompareResult {
    const parsed = parseBinaryExpression(expression, ['>=', '<=', '==', '!=', '>', '<'] as const);
    if (!parsed) return { ok: false, message: 'Use a comparison like: 1 km > 500 m' };

    const left = this.parseMeasurement(parsed.left);
    const right = this.parseMeasurement(parsed.right);
    if (!left.ok) return left;
    if (!right.ok) return right;
    if (left.measurement.category !== right.measurement.category) {
      return { ok: false, message: 'Both sides must be from the same category.' };
    }

    const leftBase = this.toBase(left.measurement.value, this.unitDefById.get(left.measurement.unitId)!);
    const rightBase = this.toBase(right.measurement.value, this.unitDefById.get(right.measurement.unitId)!);

    const result = compareNumbers(leftBase, rightBase, parsed.operator);
    return { ok: true, result, left: left.measurement, right: right.measurement };
  }

  evaluateArithmeticExpression(expression: string, outputUnitId?: UnitId): ArithmeticResult {
    const parsed = parseBinaryExpression(expression, ['+', '-', '*', '/'] as const);
    if (!parsed) return { ok: false, message: 'Use an expression like: 5m + 10cm or 5m * 2' };

    const left = this.parseValueOrMeasurement(parsed.left);
    const right = this.parseValueOrMeasurement(parsed.right);
    if (!left.ok) return left;
    if (!right.ok) return right;

    const operator = parsed.operator;

    if (operator === '+' || operator === '-') {
      if (!left.measurement || !right.measurement) {
        return { ok: false, message: 'Add/subtract requires units on both sides.' };
      }
      if (left.measurement.category !== right.measurement.category) {
        return { ok: false, message: 'Both sides must be from the same category.' };
      }

      const baseLeft = this.toBase(left.measurement.value, this.unitDefById.get(left.measurement.unitId)!);
      const baseRight = this.toBase(right.measurement.value, this.unitDefById.get(right.measurement.unitId)!);
      const baseResult = operator === '+' ? baseLeft + baseRight : baseLeft - baseRight;

      const category = left.measurement.category;
      const unitId = this.resolveOutputUnit(category, outputUnitId) ?? left.measurement.unitId;
      const def = this.unitDefById.get(unitId);
      if (!def || def.category !== category) return { ok: false, message: 'Choose a valid output unit.' };

      return { ok: true, value: round(this.fromBase(baseResult, def)), unitId, category };
    }

    if (operator === '*' || operator === '/') {
      const leftIsMeasurement = Boolean(left.measurement);
      const rightIsMeasurement = Boolean(right.measurement);

      if (leftIsMeasurement && rightIsMeasurement) {
        if (operator === '/' && left.measurement!.category === right.measurement!.category) {
          const baseLeft = this.toBase(left.measurement!.value, this.unitDefById.get(left.measurement!.unitId)!);
          const baseRight = this.toBase(right.measurement!.value, this.unitDefById.get(right.measurement!.unitId)!);
          if (baseRight === 0) return { ok: false, message: 'Division by zero.' };
          return { ok: true, value: round(baseLeft / baseRight), unitId: null, category: null };
        }
        return { ok: false, message: 'Multiply/divide supports unit × scalar (or unit ÷ unit for ratios).' };
      }

      if (!leftIsMeasurement && !rightIsMeasurement) {
        if (operator === '/' && right.value === 0) return { ok: false, message: 'Division by zero.' };
        const value = operator === '*' ? left.value * right.value : left.value / right.value;
        return { ok: true, value: round(value), unitId: null, category: null };
      }

      const measurement = left.measurement ?? right.measurement!;
      const scalar = left.measurement ? right.value : left.value;
      if (operator === '/' && scalar === 0) return { ok: false, message: 'Division by zero.' };

      const resultValue = operator === '*' ? measurement.value * scalar : measurement.value / scalar;
      return { ok: true, value: round(resultValue), unitId: measurement.unitId, category: measurement.category };
    }

    return { ok: false, message: 'Unsupported operation.' };
  }

  parseMeasurement(input: string): { ok: true; measurement: Measurement } | { ok: false; message: string } {
    const trimmed = input.trim();
    const match = trimmed.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?)\s*([^\s]+)$/i);
    if (!match) return { ok: false, message: `Could not read "${input}". Use a value + unit (e.g., 10cm).` };

    const value = Number(match[1]);
    if (!Number.isFinite(value)) return { ok: false, message: 'Enter a valid number.' };

    const unitId = this.normalizeUnitId(match[2]);
    const def = this.unitDefById.get(unitId);
    if (!def) return { ok: false, message: `Unknown unit "${match[2]}".` };

    return { ok: true, measurement: { value, unitId: def.id, category: def.category } };
  }

  formatUnitLabel(unitId: UnitId): string {
    const def = this.unitDefById.get(unitId);
    return def?.label ?? unitId;
  }

  private parseValueOrMeasurement(input: string):
    | { ok: true; value: number; measurement: Measurement | null }
    | { ok: false; message: string } {
    const trimmed = input.trim();
    const asMeasurement = this.parseMeasurement(trimmed);
    if (asMeasurement.ok) return { ok: true, value: asMeasurement.measurement.value, measurement: asMeasurement.measurement };

    const value = Number(trimmed);
    if (!Number.isFinite(value)) return { ok: false, message: `Could not read "${input}". Use a number (or number+unit).` };
    return { ok: true, value, measurement: null };
  }

  private normalizeUnitId(raw: string): UnitId {
    const normalized = raw.trim().toLowerCase();
    return this.unitAliases.get(normalized) ?? normalized;
  }

  private resolveOutputUnit(category: UnitCategoryId, outputUnitId?: UnitId): UnitId | null {
    if (!outputUnitId) return null;
    const normalized = this.normalizeUnitId(outputUnitId);
    const def = this.unitDefById.get(normalized);
    if (!def || def.category !== category) return null;
    return def.id;
  }

  private toBase(value: number, def: UnitDef): number {
    if (def.kind === 'temperature') return def.toBase(value);
    return value * def.toBaseFactor;
  }

  private fromBase(value: number, def: UnitDef): number {
    if (def.kind === 'temperature') return def.fromBase(value);
    return value / def.toBaseFactor;
  }
}

function round(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function compareNumbers(left: number, right: number, operator: CompareOperator): boolean {
  switch (operator) {
    case '>':
      return left > right;
    case '<':
      return left < right;
    case '>=':
      return left >= right;
    case '<=':
      return left <= right;
    case '==':
      return left === right;
    case '!=':
      return left !== right;
  }
}

function parseBinaryExpression<const Ops extends readonly string[]>(
  input: string,
  operators: Ops
): { left: string; operator: Ops[number]; right: string } | null {
  const trimmed = input.trim();
  for (const operator of operators) {
    let startIndex = 0;
    while (true) {
      const index = trimmed.indexOf(operator, startIndex);
      if (index === -1) break;
      startIndex = index + operator.length;

      if (index <= 0) continue;
      if ((operator === '+' || operator === '-') && isExponentSign(trimmed, index)) continue;

      const left = trimmed.slice(0, index).trim();
      const right = trimmed.slice(index + operator.length).trim();
      if (!left || !right) continue;

      return { left, operator, right };
    }
  }
  return null;
}

function isExponentSign(input: string, operatorIndex: number): boolean {
  const prev = input[operatorIndex - 1];
  if (prev !== 'e' && prev !== 'E') return false;
  const next = input[operatorIndex + 1];
  if (!next) return false;
  return next >= '0' && next <= '9';
}
