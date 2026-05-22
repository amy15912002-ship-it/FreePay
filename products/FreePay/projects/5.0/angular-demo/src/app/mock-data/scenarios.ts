import { EntryMode } from './flow-context';

export type PayMode = 'amount' | 'ratio';
export type ThresholdMode = 'none' | 'protect' | 'unlock';

export interface CurrencyOption {
  currency: string;
  currencyCode: string;
}

export interface Contract {
  fpNo: string;
  name: string;
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

export const DEMO_SCENARIOS: DemoScenarioLink[] = [
  { id: 1, label: '單幣別・無既有', mode: 'new', fundId: 'TA112233' },
  { id: 2, label: '單幣別・有既有', mode: 'new', fundId: 'TA123456' },
  { id: 3, label: '多幣別・無既有', mode: 'new', fundId: 'TA445566' },
  { id: 4, label: '多幣別・單幣有既有', mode: 'new', fundId: 'TA778899' },
  { id: 5, label: '多幣別・雙幣有既有', mode: 'new', fundId: 'TA654321' },
];
