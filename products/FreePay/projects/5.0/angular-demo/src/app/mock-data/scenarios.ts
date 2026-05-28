import { EntryMode } from './flow-context';

export type PayMode = 'amount' | 'ratio';
export type ThresholdMode = 'none' | 'protect' | 'unlock';

export interface CurrencyOption {
  currency: string;
  currencyCode: string;
}

export interface Contract {
  fpNo: string;
  currencyCode: string;
  startDate: string;
  monthlyPay: number;
  payMode: PayMode;
  annualRate: number;
  payDay: number;
  thresholdMode: ThresholdMode;
  thresholdValue: number;
  threshold: string;
  marketValue: number;
  costBasis: number;
  paidTotal: number;
}

export interface ScenarioData {
  id: number;
  label: string;
  fundId: string;
  fundName: string;
  tscd: string;
  fundCurrency: string;
  fundCurrencyCode: string;
  availableCurrencies: CurrencyOption[];
  risk: string;
  hasExistingContracts: boolean;
  contracts: Contract[];
  firstRdmDate: string;
  bank: string;
  acc: string;
}

export interface DemoScenarioLink {
  id: number;
  label: string;
  mode: EntryMode;
  fundId: string;
  contractFpNo?: string;
}

// 5.0 起：移除多契約規格，加碼／新申購由系統依「該幣別是否有既有契約」自動判斷
// 情境精簡為「單幣別」與「多幣別」兩種
export const DEMO_SCENARIOS: DemoScenarioLink[] = [
  { id: 1, label: '單幣別', mode: 'new', fundId: 'TA112233' },
  { id: 2, label: '多幣別', mode: 'new', fundId: 'TA445566' },
];
