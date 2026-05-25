// 持有資料（holdings）
// 用戶目前持有的自由 Pay 合約。每筆掛 fundId 引用 funds.ts。
// 帳戶總覽、加碼／異動／贖回流程一律從此處取得合約資料 —— 單一來源。
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
  alias: string;             // 用戶自訂名稱（預設為委託日 YYYYMMDD）
  startDate: string;         // 申購委託日 'YYYY/MM/DD'（= 第一個批次的 batchDate）
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
    fpNo: 'FP20240101', fundId: 'TA123456', currencyCode: 'TWD', alias: '20240101',
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
    fpNo: 'FP20230901', fundId: 'TA654321', currencyCode: 'TWD', alias: '20230901',
    startDate: '2023/09/01', payMode: 'amount', monthlyPay: 10000, annualRate: 0, payDay: 10,
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
    fpNo: 'FP20241201', fundId: 'TA654321', currencyCode: 'TWD', alias: '20241201',
    startDate: '2024/12/01', payMode: 'amount', monthlyPay: 4000, annualRate: 0, payDay: 5,
    thresholdMode: 'protect', thresholdValue: -20,
    costBasis: 96000, marketValue: 95000, paidTotal: 24000, status: 'Y',
    purchaseBatches: [
      { batchId: 'BFP20241201-1', batchDate: '2024/12/01', orderTime: '10:18:03', tDate: '2024/12/05',
        amount: 96000, units: 8123.6512, nav: 11.82, isPayTouched: true, remainUnits: 6092.7384 },
    ],
  },
  {
    // FP20240601 為「申購批次層贖回」主要示範契約：首次 + 兩次加碼，共 3 個批次
    fpNo: 'FP20240601', fundId: 'TA654321', currencyCode: 'USD', alias: '20240601',
    startDate: '2024/06/01', payMode: 'amount', monthlyPay: 200, annualRate: 0, payDay: 15,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 3200, marketValue: 3800, paidTotal: 2400, status: 'Y',
    purchaseBatches: [
      // 首次申購：已被 Pay 觸及（部分消耗）→ 不可單獨贖回
      { batchId: 'BFP20240601-1', batchDate: '2024/06/01', orderTime: '14:22:10', tDate: '2024/06/05',
        amount: 1000, units: 95.2381, nav: 10.5, isPayTouched: true, remainUnits: 30.5 },
      // 加碼 1：尚未被 Pay 觸及 → 可單獨贖回
      { batchId: 'BFP20240601-2', batchDate: '2024/08/15', orderTime: '09:33:12', tDate: '2024/08/19',
        amount: 1200, units: 109.0909, nav: 11.0, isPayTouched: false, remainUnits: 109.0909 },
      // 加碼 2：尚未被 Pay 觸及 → 可單獨贖回
      { batchId: 'BFP20240601-3', batchDate: '2024/10/20', orderTime: '11:08:45', tDate: '2024/10/22',
        amount: 1000, units: 88.9680, nav: 11.24, isPayTouched: false, remainUnits: 88.9680 },
    ],
  },
  {
    // 同基金、同幣別、同委託日的第二筆 → alias 自動附加 -2 後綴（spec §預設名稱規則）
    fpNo: 'FP20240601B', fundId: 'TA654321', currencyCode: 'USD', alias: '20240601-2',
    startDate: '2024/06/01', payMode: 'ratio', monthlyPay: 80, annualRate: 5, payDay: 20,
    thresholdMode: 'protect', thresholdValue: -15,
    costBasis: 1800, marketValue: 2050, paidTotal: 720, status: 'Y',
    purchaseBatches: [
      { batchId: 'BFP20240601B-1', batchDate: '2024/06/01', orderTime: '14:35:22', tDate: '2024/06/05',
        amount: 1800, units: 171.4286, nav: 10.5, isPayTouched: true, remainUnits: 102.3, },
    ],
  },
  {
    fpNo: 'FP20250301', fundId: 'TA654321', currencyCode: 'USD', alias: '20250301',
    startDate: '2025/03/01', payMode: 'ratio', monthlyPay: 100, annualRate: 4, payDay: 10,
    thresholdMode: 'unlock', thresholdValue: 20,
    costBasis: 3500, marketValue: 3680, paidTotal: 900, status: 'Y',
    purchaseBatches: [
      // 首次申購：已被 Pay 觸及
      { batchId: 'BFP20250301-1', batchDate: '2025/03/01', orderTime: '13:10:08', tDate: '2025/03/05',
        amount: 2000, units: 155.2795, nav: 12.88, isPayTouched: true, remainUnits: 85.5 },
      // 加碼：尚未被 Pay 觸及 → 可單獨贖回
      { batchId: 'BFP20250301-2', batchDate: '2025/11/08', orderTime: '14:25:18', tDate: '2025/11/12',
        amount: 1500, units: 113.3787, nav: 13.23, isPayTouched: false, remainUnits: 113.3787 },
    ],
  },
  {
    fpNo: 'FP20250601', fundId: 'TA778899', currencyCode: 'TWD', alias: '20250601',
    startDate: '2025/06/01', payMode: 'amount', monthlyPay: 6000, annualRate: 0, payDay: 15,
    thresholdMode: 'protect', thresholdValue: -20,
    costBasis: 280000, marketValue: 308000, paidTotal: 54000, status: 'Y',
    purchaseBatches: [
      // 首次申購：已被 Pay 觸及
      { batchId: 'BFP20250601-1', batchDate: '2025/06/01', orderTime: '10:30:00', tDate: '2025/06/04',
        amount: 180000, units: 10112.3596, nav: 17.8, isPayTouched: true, remainUnits: 7078.6517 },
      // 加碼：尚未被 Pay 觸及 → 可單獨贖回
      { batchId: 'BFP20250601-2', batchDate: '2026/01/20', orderTime: '11:08:42', tDate: '2026/01/22',
        amount: 100000, units: 5347.5936, nav: 18.7, isPayTouched: false, remainUnits: 5347.5936 },
    ],
  },
  {
    fpNo: 'FP20240801', fundId: 'TA987654', currencyCode: 'JPY', alias: '20240801',
    startDate: '2024/08/01', payMode: 'amount', monthlyPay: 5000, annualRate: 0, payDay: 20,
    thresholdMode: 'none', thresholdValue: 0,
    costBasis: 1300000, marketValue: 1444000, paidTotal: 45000, status: 'Y',
    purchaseBatches: [
      // 首次申購：已被 Pay 觸及
      { batchId: 'BFP20240801-1', batchDate: '2024/08/01', orderTime: '11:18:29', tDate: '2024/08/05',
        amount: 500000, units: 5094.2435, nav: 98.15, isPayTouched: true, remainUnits: 4636.4915 },
      // 加碼 1：尚未被 Pay 觸及 → 可單獨贖回
      { batchId: 'BFP20240801-2', batchDate: '2025/02/14', orderTime: '09:42:11', tDate: '2025/02/18',
        amount: 500000, units: 4878.0488, nav: 102.5, isPayTouched: false, remainUnits: 4878.0488 },
      // 加碼 2：尚未被 Pay 觸及 → 可單獨贖回
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
