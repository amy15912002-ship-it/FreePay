export type PayMode = 'amount' | 'ratio';

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
  threshold: string;
  marketValue: number;
  costBasis: number;
}

export interface ScenarioData {
  id: number;
  label: string;
  fundId: string;
  fundName: string;
  tscd: string;
  availableCurrencies: CurrencyOption[];
  risk: string;
  hasExistingContracts: boolean;
  contracts: Contract[];
  // entryOnly：僅作為帳戶總覽加碼等入口的路由目標，不列入 demo 情境列
  entryOnly?: boolean;
  // 完成頁靜態 mock 資料
  firstRdmDate: string;
  bank: string;
  acc: string;
}

export const SCENARIOS: ScenarioData[] = [
  {
    id: 1,
    label: '1 單幣別・無既有',
    fundId: 'TA123456',
    fundName: '統一大滿貫多重資產平衡證券投資信託基金 A 類型 台幣 不配息',
    tscd: '境內',
    availableCurrencies: [{ currency: '台幣', currencyCode: 'TWD' }],
    risk: 'RR3',
    hasExistingContracts: false,
    contracts: [],
    firstRdmDate: '2026/06/15',
    bank: '台灣銀行',
    acc: '0123456789012'
  },
  {
    id: 2,
    label: '2 單幣別・有既有',
    fundId: 'TA123456',
    fundName: '統一大滿貫多重資產平衡證券投資信託基金 A 類型 台幣 不配息',
    tscd: '境內',
    availableCurrencies: [{ currency: '台幣', currencyCode: 'TWD' }],
    risk: 'RR3',
    hasExistingContracts: true,
    contracts: [
      {
        fpNo: 'FP20240101',
        name: '20240101',
        currencyCode: 'TWD',
        startDate: '2024/01/01',
        monthlyPay: 5000,
        payMode: 'amount',
        annualRate: 6,
        threshold: '不設門檻',
        marketValue: 138000,
        costBasis: 120000
      }
    ],
    firstRdmDate: '2026/06/15',
    bank: '台灣銀行',
    acc: '0123456789012'
  },
  {
    id: 3,
    label: '3 多幣別・無既有',
    fundId: 'TA654321',
    fundName: '統一全球多元資產基金',
    tscd: '境外',
    availableCurrencies: [
      { currency: '台幣', currencyCode: 'TWD' },
      { currency: '美元', currencyCode: 'USD' }
    ],
    risk: 'RR4',
    hasExistingContracts: false,
    contracts: [],
    firstRdmDate: '2026/06/15',
    bank: '台灣銀行',
    acc: '0123456789012'
  },
  {
    id: 4,
    label: '4 多幣別・單幣有既有',
    fundId: 'TA654321',
    fundName: '統一全球多元資產基金',
    tscd: '境外',
    availableCurrencies: [
      { currency: '台幣', currencyCode: 'TWD' },
      { currency: '美元', currencyCode: 'USD' }
    ],
    risk: 'RR4',
    hasExistingContracts: true,
    contracts: [
      {
        fpNo: 'FP20230601',
        name: '20230601',
        currencyCode: 'TWD',
        startDate: '2023/06/01',
        monthlyPay: 8000,
        payMode: 'amount',
        annualRate: 8,
        threshold: '不設門檻',
        marketValue: 285000,
        costBasis: 240000
      },
      {
        fpNo: 'FP20240301',
        name: '20240301',
        currencyCode: 'TWD',
        startDate: '2024/03/01',
        monthlyPay: 5000,
        payMode: 'amount',
        annualRate: 6,
        threshold: '市值守護・跌20% 停Pay',
        marketValue: 138000,
        costBasis: 120000
      },
      {
        fpNo: 'FP20250101',
        name: '20250101',
        currencyCode: 'TWD',
        startDate: '2025/01/01',
        monthlyPay: 3000,
        payMode: 'ratio',
        annualRate: 4,
        threshold: '不設門檻',
        marketValue: 102000,
        costBasis: 100000
      }
    ],
    firstRdmDate: '2026/06/15',
    bank: '台灣銀行',
    acc: '0123456789012'
  },
  {
    id: 5,
    label: '5 多幣別・雙幣有既有',
    fundId: 'TA654321',
    fundName: '統一全球多元資產基金',
    tscd: '境外',
    availableCurrencies: [
      { currency: '台幣', currencyCode: 'TWD' },
      { currency: '美元', currencyCode: 'USD' }
    ],
    risk: 'RR4',
    hasExistingContracts: true,
    contracts: [
      {
        fpNo: 'FP20230901',
        name: '20230901',
        currencyCode: 'TWD',
        startDate: '2023/09/01',
        monthlyPay: 10000,
        payMode: 'amount',
        annualRate: 9,
        threshold: '不設門檻',
        marketValue: 380000,
        costBasis: 320000
      },
      {
        fpNo: 'FP20241201',
        name: '20241201',
        currencyCode: 'TWD',
        startDate: '2024/12/01',
        monthlyPay: 4000,
        payMode: 'amount',
        annualRate: 5,
        threshold: '市值守護・跌20% 停Pay',
        marketValue: 95000,
        costBasis: 96000
      },
      {
        fpNo: 'FP20240601',
        name: '20240601',
        currencyCode: 'USD',
        startDate: '2024/06/01',
        monthlyPay: 200,
        payMode: 'amount',
        annualRate: 7,
        threshold: '不設門檻',
        marketValue: 3800,
        costBasis: 3200
      },
      {
        fpNo: 'FP20250301',
        name: '20250301',
        currencyCode: 'USD',
        startDate: '2025/03/01',
        monthlyPay: 100,
        payMode: 'ratio',
        annualRate: 4,
        threshold: '增值啟動・漲20% 啟動',
        marketValue: 2100,
        costBasis: 2000
      }
    ],
    firstRdmDate: '2026/06/15',
    bank: '台灣銀行',
    acc: '0123456789012'
  },
  {
    id: 6,
    label: '6 日幣・有既有',
    fundId: 'TA987654',
    fundName: '統一日本動力基金',
    tscd: '境外',
    availableCurrencies: [{ currency: '日幣', currencyCode: 'JPY' }],
    risk: 'RR4',
    hasExistingContracts: true,
    entryOnly: true,
    contracts: [
      {
        fpNo: 'FP20240801',
        name: '20240801',
        currencyCode: 'JPY',
        startDate: '2024/08/01',
        monthlyPay: 5000,
        payMode: 'amount',
        annualRate: 12,
        threshold: '不設門檻',
        marketValue: 560000,
        costBasis: 500000
      }
    ],
    firstRdmDate: '2026/06/15',
    bank: '台灣銀行',
    acc: '0123456789012'
  }
];
