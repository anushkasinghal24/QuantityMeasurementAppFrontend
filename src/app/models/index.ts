export interface User {
  id?: string;
  username: string;
  email?: string;
  role?: string;
  provider?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  username?: string;
  email?: string;
  role?: string;
  provider?: string;
  id?: string;
  createdAt?: string;
}

export interface HistoryItem {
  id?: string;
  username?: string;
  operation?: string;
  fromUnit?: string;
  toUnit?: string;
  inputValue?: number;
  value2?: number;
  result?: string | number;
  measurementType?: string;
  createdAt?: string;
}

export interface ConvertRequest {
  value: number;
  fromUnit: string;
  toUnit: string;
}

export interface ArithmeticRequest {
  value1: number;
  unit1: string;
  value2?: number;
  unit2?: string;
  resultUnit?: string;
  scalar?: number;
}

export interface UnitCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  units: UnitOption[];
}

export interface UnitOption {
  value: string;
  label: string;
}
