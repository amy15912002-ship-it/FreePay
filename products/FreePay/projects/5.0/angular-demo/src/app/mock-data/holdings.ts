// 持有資料（holdings）
// 用戶目前持有的自由 Pay 合約。每筆掛 fundId 引用 funds.ts。
// 帳戶總覽、加碼／異動／贖回流程一律從此處取得合約資料 —— 單一來源。
// 5.0 起：同基金同幣別僅一筆契約（依平台通規 §9.4）；多幣別仍可並存。
// 顯示用的衍生值（profit、ret、Pay設定字串等）不存於此，由各畫面即時算出。

export type PayMode = 'amount' | 'ratio';
export type ThresholdMode = 'none' | 'protect' | 'unlock';

// 申購批次（升級四：申購批次層贖回）
// 一筆契約底下的每一次申購／加碼都是一個批次；交易明細的 tradeType='A' 紀錄從此衍生
export interface PurchaseBatch {
  batchId: string;          // 唯一識別，建議 'B<fpNo>-<序號>'
  batchDate: string;        // 申購／加碼委託日 'YYYY/MM/DD'
  orderTime: string;        // 委託時間 'HH:mm:ss'，供交易明細顯示
  tDate: string;            // 成交日 'YYYY/MM/DD'
  amount: number;           // 批次申購金額（交易幣別）
  units: number;            // 批次申購單位數
  nav: number;              // 成交淨值
  isPayTouched: boolean;    // FIFO 下被 Pay 涵蓋過為 true → 該批次不可單獨贖回
  remainUnits: number;      // 剩餘可贖回單位（被 Pay 觸及後扣減；未觸及時 = units）
}

export interface HoldingContract {
  fpNo: string;
  fundId: string;            // → funds.ts
  currencyCode: string;      // 交易幣別：'TWD' | 'USD' | 'JPY'
  startDate: string;         // 首次申購委託日 'YYYY/MM/DD'（= 第一個批次的 batchDate）
  payMode: PayMode;
  monthlyPay: number;        // 目前每月 Pay 金額
  annualRate: number;        // 依比例模式的年化比例（%）；依金額模式為 0
  payDay: number;            // 自由 Pay 基準日（1–31）
  thresholdMode: ThresholdMode;
  thresholdValue: number;    // protect：負值（-X）；unlock：正值（+Y）；none：0
  costBasis: number;         // 累積投入成本（= 所有批次 amount 加總）
  marketValue: number;       // 約當市值
  paidTotal: number;         // 已 Pay 累計金額
  status: string;            // 交易狀態：'Y' | 'P' | 'A' | 'B' | 'W'
  purchaseBatches: PurchaseBatch[]; // 申購批次清單（依日期排序，第一筆為首次申購）
}

export const HOLDINGS: HoldingContract[] = [
  {
    fpNo: 'FP20240101', fundId: 'TA123456', currencyCode: 'TWD',
    startDate: '2024/01/01', payMode: 'amount', monthlyPay: 5000, annualRate: 0, payDay: 15,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 220000, marketValue: 245000, paidTotal: 70000, status: 'Y',
    purchaseBatches: [
      // 首次申購：已被 Pay 觸及
      { batchId: 'BFP20240101-1', batchDate: '2024/01/01', orderTime: '13:25:00', tDate: '2024/01/03',
        amount: 120000, units: 8000, nav: 15.0, isPayTouched: true, remainUnits: 3200 },
      // 加碼：尚未被 Pay 觸及 → 可單獨贖回
      { batchId: 'BFP20240101-2', batchDate: '2024/09/12', orderTime: '10:42:30', tDate: '2024/09/16',
        amount: 100000, units: 6250, nav: 16.0, isPayTouched: false, remainUnits: 6250 },
    ],
  },
  {
    fpNo: 'FP20230901', fundId: 'TA654321', currencyCode: 'TWD',
    startDate: '2023/09/01', payMode: 'ratio', monthlyPay: 1600, annualRate: 6, payDay: 6,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 320000, marketValue: 380000, paidTotal: 180000, status: 'Y',
    purchaseBatches: [
      { batchId: 'BFP20230901-1', batchDate: '2023/09/01', orderTime: '10:30:00', tDate: '2023/09/05',
        amount: 200000, units: 19047.6190, nav: 10.5, isPayTouched: true, remainUnits: 9523.8095 },
      { batchId: 'BFP20230901-2', batchDate: '2024/03/15', orderTime: '14:20:33', tDate: '2024/03/19',
        amount: 120000, units: 11428.5714, nav: 10.5, isPayTouched: false, remainUnits: 11428.5714 },
    ],
  },
  {
    // FP20240601 為「申購批次層贖回」主要示範契約：首次 + 兩次加碼，共 3 個批次
    fpNo: 'FP20240601', fundId: 'TA654321', currencyCode: 'USD',
    startDate: '2024/06/01', payMode: 'amount', monthlyPay: 200, annualRate: 0, payDay: 15,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 4000, marketValue: 4750, paidTotal: 2400, status: 'Y',
    purchaseBatches: [
      // 首次申購：已被 Pay 觸及（完全消耗）→ 不可單獨贖回
      { batchId: 'BFP20240601-1', batchDate: '2024/06/01', orderTime: '14:22:10', tDate: '2024/06/05',
        amount: 1000, units: 95.2381, nav: 10.5, isPayTouched: true, remainUnits: 0 },
      // 加碼 1：已被 Pay 觸及（部分消耗）→ 不可單獨贖回
      { batchId: 'BFP20240601-2', batchDate: '2024/08/15', orderTime: '09:33:12', tDate: '2024/08/19',
        amount: 1200, units: 109.0909, nav: 11.0, isPayTouched: true, remainUnits: 52.4 },
      // 加碼 2：尚未被 Pay 觸及 → 可單獨贖回
      { batchId: 'BFP20240601-3', batchDate: '2024/10/20', orderTime: '11:08:45', tDate: '2024/10/22',
        amount: 1000, units: 88.9680, nav: 11.24, isPayTouched: false, remainUnits: 88.9680 },
      // 加碼 3：尚未被 Pay 觸及 → 可單獨贖回
      { batchId: 'BFP20240601-4', batchDate: '2025/02/18', orderTime: '10:15:30', tDate: '2025/02/20',
        amount: 800, units: 69.5652, nav: 11.50, isPayTouched: false, remainUnits: 69.5652 },
    ],
  },
  {
    fpNo: 'FP20250601', fundId: 'TA778899', currencyCode: 'TWD',
    startDate: '2025/06/01', payMode: 'amount', monthlyPay: 6000, annualRate: 0, payDay: 15,
    thresholdMode: 'protect', thresholdValue: -20,
    costBasis: 280000, marketValue: 308000, paidTotal: 54000, status: 'Y',
    purchaseBatches: [
      { batchId: 'BFP20250601-1', batchDate: '2025/06/01', orderTime: '10:30:00', tDate: '2025/06/04',
        amount: 180000, units: 10112.3596, nav: 17.8, isPayTouched: true, remainUnits: 7078.6517 },
      { batchId: 'BFP20250601-2', batchDate: '2026/01/20', orderTime: '11:08:42', tDate: '2026/01/22',
        amount: 100000, units: 5347.5936, nav: 18.7, isPayTouched: false, remainUnits: 5347.5936 },
    ],
  },
  {
    fpNo: 'FP20240801', fundId: 'TA987654', currencyCode: 'JPY',
    startDate: '2024/08/01', payMode: 'amount', monthlyPay: 5000, annualRate: 0, payDay: 20,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 1300000, marketValue: 1444000, paidTotal: 45000, status: 'Y',
    purchaseBatches: [
      { batchId: 'BFP20240801-1', batchDate: '2024/08/01', orderTime: '11:18:29', tDate: '2024/08/05',
        amount: 500000, units: 5094.2435, nav: 98.15, isPayTouched: true, remainUnits: 4636.4915 },
      { batchId: 'BFP20240801-2', batchDate: '2025/02/14', orderTime: '09:42:11', tDate: '2025/02/18',
        amount: 500000, units: 4878.0488, nav: 102.5, isPayTouched: false, remainUnits: 4878.0488 },
      { batchId: 'BFP20240801-3', batchDate: '2025/12/05', orderTime: '13:55:02', tDate: '2025/12/09',
        amount: 300000, units: 2752.2936, nav: 109.0, isPayTouched: false, remainUnits: 2752.2936 },
    ],
  },
];

// 某基金的既有合約
export function holdingsOfFund(fundId: string): HoldingContract[] {
  return HOLDINGS.filter(c => c.fundId === fundId);
}

// 某契約的批次清單
export function batchesOf(fpNo: string): PurchaseBatch[] {
  return HOLDINGS.find(c => c.fpNo === fpNo)?.purchaseBatches ?? [];
}

// 某契約可單獨贖回的批次（尚未被 Pay 觸及）
export function selectableBatchesOf(fpNo: string): PurchaseBatch[] {
  return batchesOf(fpNo).filter(b => !b.isPayTouched);
}
