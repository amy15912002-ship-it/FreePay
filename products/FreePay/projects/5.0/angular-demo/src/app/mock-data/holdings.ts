// 持有資料（holdings）
// 用戶目前持有的自由 Pay 合約。每筆掛 fundId 引用 funds.ts。
// 帳戶總覽、加碼／異動／贖回流程一律從此處取得合約資料 —— 單一來源。
// 5.0 起：同基金同幣別僅一筆契約（依平台通規 §9.4）；多幣別仍可並存。
// 顯示用的衍生值（profit、ret、Pay設定字串等）不存於此，由各畫面即時算出。

export type PayMode = 'amount' | 'ratio';
export type ThresholdMode = 'none' | 'protect' | 'unlock';

// 申購批次
// 一筆契約底下的每一次申購／加碼都是一個批次；交易明細的 tradeType='A' 紀錄從此衍生
export interface PurchaseBatch {
  batchId: string;          // 唯一識別，建議 'B<fpNo>-<序號>'
  batchDate: string;        // 申購／加碼委託日 'YYYY/MM/DD'
  orderTime: string;        // 委託時間 'HH:mm:ss'，供交易明細顯示
  tDate: string;            // 成交日 'YYYY/MM/DD'
  amount: number;           // 批次申購金額（交易幣別）
  units: number;            // 批次申購單位數
  nav: number;              // 成交淨值
  isPayTouched: boolean;    // FIFO 下被 Pay 涵蓋過為 true；僅供顯示與計算，不影響指定批次贖回可選性
  remainUnits: number;      // 剩餘可贖回單位（被 Pay 觸及後扣減；未觸及時 = units）
  paidAmount: number;       // 該批次已 Pay 出金額（交易幣別）；FIFO 下早期批次優先累積
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
  thresholdValue: number;    // protect：70–100；unlock：101–200；none：0
  costBasis: number;         // 累積投入成本（= 所有批次 amount 加總）
  marketValue: number;       // 約當市值
  paidTotal: number;         // 已 Pay 累計金額
  status: string;            // 交易狀態：'Y' | 'P' | 'A' | 'B' | 'W'
  payRateAlert?: boolean;    // mock：贖回成交後年化提領率 > 15%（帳總契約提醒 A，spec §7.1）
  payPaused?: boolean;       // mock：觸發門檻暫停 Pay 中（帳總契約提醒 B，spec §7.1）；文案依 thresholdMode 區分
  purchaseBatches: PurchaseBatch[]; // 申購批次清單（依日期排序，第一筆為首次申購）
}

export const HOLDINGS: HoldingContract[] = [
  {
    // FP20240101 為「單一可選批次」示範：僅 1 筆 remainUnits > 0，贖回設定頁不顯示「指定」
    fpNo: 'FP20240101', fundId: 'TA123456', currencyCode: 'TWD',
    startDate: '2024/01/01', payMode: 'amount', monthlyPay: 5000, annualRate: 0, payDay: 15,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 220000, marketValue: 40000, paidTotal: 180000, status: 'Y', payRateAlert: true,
    purchaseBatches: [
      // 首次申購：完全消耗
      { batchId: 'BFP20240101-1', batchDate: '2024/01/01', orderTime: '13:25:00', tDate: '2024/01/03',
        amount: 120000, units: 8000, nav: 15.0, isPayTouched: true, remainUnits: 0, paidAmount: 120000 },
      // 加碼：FIFO 下接續消耗（部分），仍有剩餘單位數；但可選批次僅 1 筆，故不顯示指定贖回
      { batchId: 'BFP20240101-2', batchDate: '2024/09/12', orderTime: '10:42:30', tDate: '2024/09/16',
        amount: 100000, units: 6250, nav: 16.0, isPayTouched: true, remainUnits: 2500, paidAmount: 60000 },
    ],
  },
  {
    fpNo: 'FP20230901', fundId: 'TA654321', currencyCode: 'TWD',
    startDate: '2023/09/01', payMode: 'ratio', monthlyPay: 1600, annualRate: 6, payDay: 6,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 320000, marketValue: 380000, paidTotal: 180000, status: 'Y',
    purchaseBatches: [
      { batchId: 'BFP20230901-1', batchDate: '2023/09/01', orderTime: '10:30:00', tDate: '2023/09/05',
        amount: 200000, units: 19047.6190, nav: 10.5, isPayTouched: true, remainUnits: 9523.8095, paidAmount: 180000 },
      { batchId: 'BFP20230901-2', batchDate: '2024/03/15', orderTime: '14:20:33', tDate: '2024/03/19',
        amount: 120000, units: 11428.5714, nav: 10.5, isPayTouched: false, remainUnits: 11428.5714, paidAmount: 0 },
    ],
  },
  {
    // FP20240601 為指定批次贖回主要示範契約：首次 + 多次加碼，共 4 個批次
    fpNo: 'FP20240601', fundId: 'TA654321', currencyCode: 'USD',
    startDate: '2024/06/01', payMode: 'amount', monthlyPay: 200, annualRate: 0, payDay: 15,
    thresholdMode: 'unlock', thresholdValue: 130,
    costBasis: 4000, marketValue: 4750, paidTotal: 1670, status: 'Y', payPaused: true,
    purchaseBatches: [
      // 首次申購：已被 Pay 觸及且剩餘單位數為 0，不顯示於指定批次清單
      { batchId: 'BFP20240601-1', batchDate: '2024/06/01', orderTime: '14:22:10', tDate: '2024/06/05',
        amount: 1000, units: 95.2381, nav: 10.5, isPayTouched: true, remainUnits: 0, paidAmount: 1050 },
      // 加碼 1：已被 Pay 觸及但仍有剩餘單位數，可指定贖回
      { batchId: 'BFP20240601-2', batchDate: '2024/08/15', orderTime: '09:33:12', tDate: '2024/08/19',
        amount: 1200, units: 109.0909, nav: 11.0, isPayTouched: true, remainUnits: 52.4, paidAmount: 620 },
      // 加碼 2：仍有剩餘單位數，可指定贖回
      { batchId: 'BFP20240601-3', batchDate: '2024/10/20', orderTime: '11:08:45', tDate: '2024/10/22',
        amount: 1000, units: 88.9680, nav: 11.24, isPayTouched: false, remainUnits: 88.9680, paidAmount: 0 },
      // 加碼 3：30 天內申購（用於短線交易示意）→ 可單獨贖回
      { batchId: 'BFP20240601-4', batchDate: '2026/05/15', orderTime: '10:15:30', tDate: '2026/05/19',
        amount: 800, units: 69.5652, nav: 11.50, isPayTouched: false, remainUnits: 69.5652, paidAmount: 0 },
    ],
  },
  {
    fpNo: 'FP20250601', fundId: 'TA778899', currencyCode: 'TWD',
    startDate: '2025/06/01', payMode: 'amount', monthlyPay: 6000, annualRate: 0, payDay: 15,
    thresholdMode: 'protect', thresholdValue: 80,
    costBasis: 280000, marketValue: 212000, paidTotal: 54000, status: 'Y', payPaused: true,
    purchaseBatches: [
      { batchId: 'BFP20250601-1', batchDate: '2025/06/01', orderTime: '10:30:00', tDate: '2025/06/04',
        amount: 180000, units: 10112.3596, nav: 17.8, isPayTouched: true, remainUnits: 7078.6517, paidAmount: 54000 },
      { batchId: 'BFP20250601-2', batchDate: '2026/01/20', orderTime: '11:08:42', tDate: '2026/01/22',
        amount: 100000, units: 5347.5936, nav: 18.7, isPayTouched: false, remainUnits: 5347.5936, paidAmount: 0 },
    ],
  },
  {
    fpNo: 'FP20240801', fundId: 'TA987654', currencyCode: 'JPY',
    startDate: '2024/08/01', payMode: 'amount', monthlyPay: 5000, annualRate: 0, payDay: 20,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 1300000, marketValue: 1444000, paidTotal: 45000, status: 'Y',
    purchaseBatches: [
      { batchId: 'BFP20240801-1', batchDate: '2024/08/01', orderTime: '11:18:29', tDate: '2024/08/05',
        amount: 500000, units: 5094.2435, nav: 98.15, isPayTouched: true, remainUnits: 4636.4915, paidAmount: 45000 },
      { batchId: 'BFP20240801-2', batchDate: '2025/02/14', orderTime: '09:42:11', tDate: '2025/02/18',
        amount: 500000, units: 4878.0488, nav: 102.5, isPayTouched: false, remainUnits: 4878.0488, paidAmount: 0 },
      { batchId: 'BFP20240801-3', batchDate: '2025/12/05', orderTime: '13:55:02', tDate: '2025/12/09',
        amount: 300000, units: 2752.2936, nav: 109.0, isPayTouched: false, remainUnits: 2752.2936, paidAmount: 0 },
    ],
  },
  {
    // FP20261201 為「無可指定批次」示範：所有批次 remainUnits = 0，贖回設定頁不顯示「指定」
    fpNo: 'FP20261201', fundId: 'TA800009', currencyCode: 'TWD',
    startDate: '2025/03/10', payMode: 'amount', monthlyPay: 3000, annualRate: 0, payDay: 10,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 160000, marketValue: 0, paidTotal: 160000, status: 'Y',
    purchaseBatches: [
      { batchId: 'BFP20261201-1', batchDate: '2025/03/10', orderTime: '10:18:22', tDate: '2025/03/12',
        amount: 100000, units: 3790.7506, nav: 26.38, isPayTouched: true, remainUnits: 0, paidAmount: 100000 },
      { batchId: 'BFP20261201-2', batchDate: '2025/10/15', orderTime: '11:42:08', tDate: '2025/10/17',
        amount: 60000, units: 2274.4503, nav: 26.38, isPayTouched: true, remainUnits: 0, paidAmount: 60000 },
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

// 某契約可指定贖回的批次（剩餘單位數 > 0）
export function selectableBatchesOf(fpNo: string): PurchaseBatch[] {
  return batchesOf(fpNo).filter(b => b.remainUnits > 0);
}
