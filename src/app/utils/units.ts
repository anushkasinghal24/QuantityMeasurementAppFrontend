import { UnitCategory, UnitOption } from '../models';

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    label: 'Length',
    icon: '📏',
    color: 'from-blue-500 to-indigo-600',
    units: [
      { value: 'INCHES',     label: 'Inches (in)' },
      { value: 'FEET',       label: 'Feet (ft)' },
      { value: 'YARD',       label: 'Yards (yd)' },
      { value: 'METER',      label: 'Meters (m)' },
      { value: 'CENTIMETER', label: 'Centimeters (cm)' },
      { value: 'KILOMETER',  label: 'Kilometers (km)' },
      { value: 'MILLIMETER', label: 'Millimeters (mm)' },
      { value: 'MILE',       label: 'Miles (mi)' },
    ],
  },
  {
    id: 'weight',
    label: 'Weight',
    icon: '⚖️',
    color: 'from-amber-500 to-orange-600',
    units: [
      { value: 'GRAM',     label: 'Grams (g)' },
      { value: 'KILOGRAM', label: 'Kilograms (kg)' },
      { value: 'POUND',    label: 'Pounds (lb)' },
      { value: 'OUNCE',    label: 'Ounces (oz)' },
      { value: 'TON',      label: 'Metric Tons' },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    icon: '🌡️',
    color: 'from-rose-500 to-pink-600',
    units: [
      { value: 'CELSIUS',    label: 'Celsius (°C)' },
      { value: 'FAHRENHEIT', label: 'Fahrenheit (°F)' },
      { value: 'KELVIN',     label: 'Kelvin (K)' },
    ],
  },
  {
    id: 'volume',
    label: 'Volume',
    icon: '🧪',
    color: 'from-teal-500 to-cyan-600',
    units: [
      { value: 'MILLILITER', label: 'Milliliters (ml)' },
      { value: 'LITER',      label: 'Liters (L)' },
      { value: 'GALLON',     label: 'Gallons (gal)' },
      { value: 'CUP',        label: 'Cups' },
    ],
  },
];

export const ALL_UNITS: UnitOption[] = UNIT_CATEGORIES.flatMap(c => c.units);

export function getCategoryForUnit(unitValue: string): UnitCategory | undefined {
  return UNIT_CATEGORIES.find(c => c.units.some(u => u.value === unitValue));
}

export function getUnitLabel(value: string): string {
  return ALL_UNITS.find(u => u.value === value)?.label || value;
}
