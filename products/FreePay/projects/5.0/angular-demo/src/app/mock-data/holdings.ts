// 持有資料（holdings）
// 用戶目前持有的自由 Pay 合約。每筆掛 fundId 引用 funds.ts。
// 帳戶總覽、加碼／異動／贖回流程一律從此處取得合約資料 —— 單一來源。
// 顯示用的衍生值（profit、ret、Pay設定字串等）不存於此，由各畫面即時算出。

export type PayMode = 'amount' | 'ratio';
export type ThresholdMode = 'none' | 'protect' | 'unlock';

export interface HoldingContract {
  fpNo: string;
  fundId: string;            // → funds.ts
  currencyCode: string;      // 交易幣別：'TWD' | 'USD' | 'JPY'
  alias: string;             // 用戶自訂名稱（預設為委託日 YYYYMMDD）
  startDate: string;         // 申購委託日 'YYYY/MM/DD'
  payMode: PayMode;
  monthlyPay: number;        // 目前每月 Pay 金額
  annualRate: number;        // 依比例模式的年化比例（%）；依金額模式為 0
  payDay: number;            // 自由 Pay 基準日（1–31）
  thresholdMode: ThresholdMode;
  thresholdValue: number;    // protect：負值（-X）；unlock：正值（+Y）；none：0
  costBasis: number;         // 累積投入成本
  marketValue: number;       // 約當市值
  paidTotal: number;         // 已 Pay 累計金額
  status: string;            // 交易狀態：'Y' | 'P' | 'A' | 'B' | 'W'
}

export const HOLDINGS: HoldingContract[] = [
  {
    fpNo: 'FP20240101', fundId: 'TA123456', currencyCode: 'TWD', alias: '20240101',
    startDate: '2024/01/01', payMode: 'amount', monthlyPay: 5000, annualRate: 0, payDay: 15,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 120000, marketValue: 138000, paidTotal: 70000, status: 'Y',
  },
  {
    fpNo: 'FP20230901', fundId: 'TA654321', currencyCode: 'TWD', alias: '20230901',
    startDate: '2023/09/01', payMode: 'amount', monthlyPay: 10000, annualRate: 0, payDay: 10,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 320000, marketValue: 380000, paidTotal: 180000, status: 'Y',
  },
  {
    fpNo: 'FP20241201', fundId: 'TA654321', currencyCode: 'TWD', alias: '20241201',
    startDate: '2024/12/01', payMode: 'amount', monthlyPay: 4000, annualRate: 0, payDay: 5,
    thresholdMode: 'protect', thresholdValue: -20,
    costBasis: 96000, marketValue: 95000, paidTotal: 24000, status: 'Y',
  },
  {
    fpNo: 'FP20240601', fundId: 'TA654321', currencyCode: 'USD', alias: '20240601',
    startDate: '2024/06/01', payMode: 'amount', monthlyPay: 200, annualRate: 0, payDay: 15,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 3200, marketValue: 3800, paidTotal: 2400, status: 'Y',
  },
  {
    fpNo: 'FP20250301', fundId: 'TA654321', currencyCode: 'USD', alias: '20250301',
    startDate: '2025/03/01', payMode: 'ratio', monthlyPay: 100, annualRate: 4, payDay: 10,
    thresholdMode: 'unlock', thresholdValue: 20,
    costBasis: 2000, marketValue: 2100, paidTotal: 900, status: 'Y',
  },
  {
    fpNo: 'FP20250601', fundId: 'TA778899', currencyCode: 'TWD', alias: '20250601',
    startDate: '2025/06/01', payMode: 'amount', monthlyPay: 6000, annualRate: 0, payDay: 15,
    thresholdMode: 'protect', thresholdValue: -20,
    costBasis: 180000, marketValue: 196000, paidTotal: 54000, status: 'Y',
  },
  {
    fpNo: 'FP20240801', fundId: 'TA987654', currencyCode: 'JPY', alias: '20240801',
    startDate: '2024/08/01', payMode: 'amount', monthlyPay: 5000, annualRate: 0, payDay: 20,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 500000, marketValue: 560000, paidTotal: 45000, status: 'Y',
  },
];

// 某基金的既有合約
export function holdingsOfFund(fundId: string): HoldingContract[] {
  return HOLDINGS.filter(c => c.fundId === fundId);
}
