import { findFund } from './funds';
import { HOLDINGS, HoldingContract, PurchaseBatch } from './holdings';

export interface OvSummary {
  ccy: string; pay: number; paid: number;
  market: number; cost: number; profit: number; ret: number;
}

export interface OvContract {
  fpNo: string; ccy: string;
  setting: string; threshold: string;
  pay: number; paid: number; market: number; cost: number; profit: number; ret: number;
}

export interface OvFund {
  id: string; code: string; name: string;
  txCcy: string; buyCcy: string;
  pay: number; paid: number; market: number; cost: number; profit: number; ret: number;
  contracts: OvContract[];
}

export interface AltOrder {
  id: string; fund: string; code: string;
  ccy: string; fdCcy: string; amount: number;
  payType: string; rdmAmt: number; payRate: number; rdmDay: number;
  limitMode: string; limitVal: number | null;
  date: string; time: string; effectDate: string; status: string;
}

export interface ChgOrder {
  id: string; fund: string; code: string; ccy: string;
  oldPay: string; newPay: string;
  oldDay: string; newDay: string;
  oldLimit: string; newLimit: string;
  effectDate: string; date: string; time: string; status: string;
}

export interface RdmOrder {
  id: string; fund: string; code: string;
  ccy: string; fdCcy: string; unit: string; amount: number;
  date: string; time: string; effectDate: string; status: string;
}

export interface ProfitRecord {
  id: string; fund: string; code: string; fpNo: string;
  ccy: string; redeemDate: string; totalPaid: number;
  paySetting: string; threshold: string;
  cost: number; redeemAmount: number; profit: number; returnRate: number; status: string;
}

export interface DetailTxRecord {
  orderDate: string; orderTime: string; tDate: string; tradeType: string;
  trCcyDesc: string; fdCcyDesc: string; navDesc: string; unitDesc: string;
  exRateDesc: string; amount: number;
}

export interface DetailChgRecord {
  orderDate: string; orderTime: string; tDate: string;
  tradeType: string; status: string;
  orgPayType: string; orgRDMAmt: number; orgPayRate: number;
  payType: string; rdmAmt: number; payRate: number;
  orgRDMDay: number; rdmDay: number;
  orgLimitMode: string; orgLimitVal: number | null;
  limitMode: string; limitVal: number | null;
}

// ── 帳戶總覽「基金 × 交易幣別」分組視圖：由 holdings 即時衍生 ──────────
// 顯示用字串（Pay設定、門檻）與加總皆在此算出；holdings 為唯一資料來源。

const CCY_NAME: Record<string, string> = { TWD: '台幣', USD: '美元', JPY: '日幣' };

function contractSetting(c: HoldingContract): string {
  return c.payMode === 'ratio'
    ? `依比例・${c.annualRate}%・${c.payDay}日`
    : `依金額・${c.payDay}日`;
}

function contractThreshold(c: HoldingContract): string {
  if (c.thresholdMode === 'protect') return `市值守護・跌${Math.abs(c.thresholdValue)}%`;
  if (c.thresholdMode === 'unlock') return `增值啟動・漲${c.thresholdValue}%`;
  return '不設門檻';
}

function toOvContract(c: HoldingContract): OvContract {
  const profit = c.marketValue - c.costBasis;
  return {
    fpNo: c.fpNo,
    ccy: CCY_NAME[c.currencyCode] ?? c.currencyCode,
    setting: contractSetting(c),
    threshold: contractThreshold(c),
    pay: c.monthlyPay,
    paid: c.paidTotal,
    market: c.marketValue,
    cost: c.costBasis,
    profit,
    ret: c.costBasis ? (profit / c.costBasis) * 100 : 0,
  };
}

function buildOvFunds(): OvFund[] {
  const groups: OvFund[] = [];
  for (const c of HOLDINGS) {
    const txCcy = CCY_NAME[c.currencyCode] ?? c.currencyCode;
    let g = groups.find(x => x.code === c.fundId && x.txCcy === txCcy);
    if (!g) {
      const fund = findFund(c.fundId);
      g = {
        id: `${c.fundId}-${c.currencyCode}`,
        code: c.fundId,
        name: fund?.name ?? c.fundId,
        txCcy,
        buyCcy: fund?.pricingCurrency ?? txCcy,
        pay: 0, paid: 0, market: 0, cost: 0, profit: 0, ret: 0,
        contracts: [],
      };
      groups.push(g);
    }
    g.contracts.push(toOvContract(c));
  }
  for (const g of groups) {
    g.pay = g.contracts.reduce((s, c) => s + c.pay, 0);
    g.paid = g.contracts.reduce((s, c) => s + c.paid, 0);
    g.market = g.contracts.reduce((s, c) => s + c.market, 0);
    g.cost = g.contracts.reduce((s, c) => s + c.cost, 0);
    g.profit = g.market - g.cost;
    g.ret = g.cost ? (g.profit / g.cost) * 100 : 0;
  }
  return groups;
}

export const OV_FUNDS: OvFund[] = buildOvFunds();

export const MOCK_ALT_ORDERS: AltOrder[] = [
  { id: 'A20260505001', fund: '貝萊德全球股票收益基金 A2', code: 'AS778899', ccy: 'TWD', fdCcy: 'USD', amount: 300000, payType: 'A', rdmAmt: 2000,  payRate: 0, rdmDay: 15, limitMode: 'neg',  limitVal: -20, date: '2026/05/05', time: '09:12:30', effectDate: '2026/05/07', status: '成功' },
  { id: 'A20260505002', fund: '統一大滿貫台灣平衡基金',       code: 'TA123456', ccy: 'TWD', fdCcy: 'TWD', amount: 100000, payType: 'P', rdmAmt: 810,   payRate: 6, rdmDay: 5,  limitMode: 'none', limitVal: null, date: '2026/05/05', time: '10:05:11', effectDate: '2026/05/07', status: '成功' },
];

export const MOCK_CHG_ORDERS: ChgOrder[] = [
  { id: 'C20260505001', fund: '貝萊德全球股票收益基金 A2', code: 'AS778899', ccy: 'USD', oldPay: '依金額・80', newPay: '依比例・年化 6%', oldDay: '15', newDay: '15', oldLimit: '增值啟動・漲50%', newLimit: '增值啟動・漲30%', effectDate: '2026/05/06', date: '2026/05/05', time: '11:20:18', status: '成功' },
];

export const MOCK_RDM_ORDERS: RdmOrder[] = [
  { id: 'R20260505001', fund: '貝萊德全球股票收益基金 A2', code: 'AS778899', ccy: 'TWD', fdCcy: 'USD', unit: '120.5000', amount: 2000, date: '2026/05/05', time: '13:05:42', effectDate: '2026/05/06', status: '成功' },
];

export const MOCK_PROFITS: ProfitRecord[] = [
  { id: 'hp-001', fund: '貝萊德全球股票收益基金 A2', code: 'AS778899', fpNo: 'FP2024001', ccy: 'TWD', redeemDate: '2026/04/18', totalPaid: 12000, paySetting: '依金額・15日',    threshold: '市值守護・跌20%',  cost: 300000, redeemAmount: 318000, profit:  30000, returnRate:  10.00, status: '已完成' },
  { id: 'hp-002', fund: '貝萊德全球股票收益基金 A2', code: 'AS778899', fpNo: 'FP2024002', ccy: 'USD', redeemDate: '2026/03/22', totalPaid:   240, paySetting: '依金額・15日',    threshold: '增值啟動・漲30%', cost:   8000, redeemAmount:   8420, profit:    660, returnRate:   8.25, status: '已完成' },
  { id: 'hp-003', fund: '統一大滿貫台灣平衡基金',       code: 'TA123456', fpNo: 'FP2025002', ccy: 'TWD', redeemDate: '2026/02/10', totalPaid: 18000, paySetting: '依比例・6%・5日', threshold: '不設門檻',         cost: 150000, redeemAmount: 162000, profit:  30000, returnRate:  20.00, status: '已完成' },
  { id: 'hp-004', fund: '施羅德環球收益基金 A',         code: 'TU778899', fpNo: 'FP2025001', ccy: 'USD', redeemDate: '2025/12/19', totalPaid:   150, paySetting: '依金額・10日',    threshold: '不設門檻',         cost:   5000, redeemAmount:   4860, profit:     10, returnRate:   0.20, status: '已完成' },
  { id: 'hp-005', fund: '貝萊德全球股票收益基金 A2', code: 'AS778899', fpNo: 'FP2023008', ccy: 'TWD', redeemDate: '2025/10/06', totalPaid:  6000, paySetting: '依金額・20日',    threshold: '不設門檻',         cost: 200000, redeemAmount: 188000, profit:  -6000, returnRate:  -3.00, status: '已完成' },
];

// 自由 Pay (R) 與贖回 (RDM) 紀錄 — 手動 mock；申購 (A) 紀錄從 holdings.purchaseBatches 自動衍生
// 設計理由（單一資料源）：A 紀錄本質就是申購批次，避免兩處 mock 不同步
const HAND_MOCK_PAY_REDEEM: Record<string, DetailTxRecord[]> = {
  FP20230901: [
    { orderDate: '2026-04-15', orderTime: '09:00:12', tDate: '2026-04-17', tradeType: 'R',   trCcyDesc: '台幣', fdCcyDesc: '美元', navDesc: '11.8500', unitDesc: '168.7763',    exRateDesc: '32.1050', amount: 2000 },
    { orderDate: '2026-03-15', orderTime: '09:00:07', tDate: '2026-03-17', tradeType: 'R',   trCcyDesc: '台幣', fdCcyDesc: '美元', navDesc: '11.7200', unitDesc: '170.6485',    exRateDesc: '32.0800', amount: 2000 },
    { orderDate: '2026-02-15', orderTime: '09:00:05', tDate: '2026-02-17', tradeType: 'R',   trCcyDesc: '台幣', fdCcyDesc: '美元', navDesc: '11.5800', unitDesc: '172.7115',    exRateDesc: '31.9800', amount: 2000 },
    { orderDate: '2026-01-10', orderTime: '11:42:05', tDate: '2026-01-14', tradeType: 'RDM', trCcyDesc: '台幣', fdCcyDesc: '美元', navDesc: '11.2300', unitDesc: '1,200.0000', exRateDesc: '31.8500', amount: 42800 },
  ],
  FP20240601: [
    { orderDate: '2026-04-15', orderTime: '09:05:42', tDate: '2026-04-17', tradeType: 'R', trCcyDesc: '美元', fdCcyDesc: '美元', navDesc: '11.8500', unitDesc: '6.7511', exRateDesc: '-', amount: 80 },
    { orderDate: '2026-03-15', orderTime: '09:04:18', tDate: '2026-03-17', tradeType: 'R', trCcyDesc: '美元', fdCcyDesc: '美元', navDesc: '11.7200', unitDesc: '6.8259', exRateDesc: '-', amount: 80 },
  ],
  FP20240101: [
    { orderDate: '2026-04-05', orderTime: '09:00:02', tDate: '2026-04-07', tradeType: 'R', trCcyDesc: '台幣', fdCcyDesc: '台幣', navDesc: '16.2045', unitDesc: '49.9861', exRateDesc: '-', amount: 810 },
    { orderDate: '2026-03-05', orderTime: '09:00:02', tDate: '2026-03-07', tradeType: 'R', trCcyDesc: '台幣', fdCcyDesc: '台幣', navDesc: '16.1032', unitDesc: '50.3006', exRateDesc: '-', amount: 810 },
  ],
  FP20250301: [
    { orderDate: '2026-04-10', orderTime: '09:03:22', tDate: '2026-04-14', tradeType: 'R', trCcyDesc: '美元', fdCcyDesc: '美元', navDesc: '13.4200', unitDesc: '7.4516', exRateDesc: '-', amount: 100 },
  ],
  FP20250601: [
    { orderDate: '2026-04-15', orderTime: '09:02:18', tDate: '2026-04-17', tradeType: 'R', trCcyDesc: '台幣', fdCcyDesc: '台幣', navDesc: '18.2500', unitDesc: '328.7671', exRateDesc: '-', amount: 6000 },
  ],
  FP20240801: [
    { orderDate: '2026-04-20', orderTime: '09:06:42', tDate: '2026-04-22', tradeType: 'R', trCcyDesc: '日幣', fdCcyDesc: '日幣', navDesc: '102.5400', unitDesc: '48.7615', exRateDesc: '-', amount: 5000 },
  ],
};

// 把申購批次轉成「申購（A）」交易明細紀錄
function batchToTxRecord(c: HoldingContract, b: PurchaseBatch): DetailTxRecord {
  const fund = findFund(c.fundId);
  const trCcyDesc = CCY_NAME[c.currencyCode] ?? c.currencyCode;
  const fdCcyDesc = fund?.pricingCurrency ?? trCcyDesc;
  const exRate = trCcyDesc !== fdCcyDesc ? '32.0500' : '-'; // 跨幣別才有匯率（mock 簡化用固定值）
  return {
    orderDate: b.batchDate.replace(/\//g, '-'),
    orderTime: b.orderTime,
    tDate: b.tDate.replace(/\//g, '-'),
    tradeType: 'A',
    trCcyDesc,
    fdCcyDesc,
    navDesc: b.nav.toFixed(4),
    unitDesc: b.units.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
    exRateDesc: exRate,
    amount: b.amount,
  };
}

// 合併「自由 Pay/贖回手動 mock」+「申購批次自動衍生」→ 依日期倒序輸出
export const DETAIL_TX_DETAIL: Record<string, DetailTxRecord[]> = (() => {
  const result: Record<string, DetailTxRecord[]> = {};
  for (const c of HOLDINGS) {
    const aFromBatches = c.purchaseBatches.map(b => batchToTxRecord(c, b));
    const others = HAND_MOCK_PAY_REDEEM[c.fpNo] ?? [];
    result[c.fpNo] = [...others, ...aFromBatches]
      .sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  }
  return result;
})();

export const DETAIL_TX_CHANGE: Record<string, DetailChgRecord[]> = {
  FP20230901: [
    { orderDate: '2026-04-30', orderTime: '15:34:21', tDate: '2026-05-04', tradeType: 'AL',  status: '已完成', orgPayType: 'A', orgRDMAmt: 2000, orgPayRate: 0, payType: 'A', rdmAmt: 2500, payRate: 0, orgRDMDay: 15, rdmDay: 15, orgLimitMode: 'neg',  orgLimitVal: -20, limitMode: 'none', limitVal: null },
    { orderDate: '2026-01-12', orderTime: '10:18:06', tDate: '2026-01-14', tradeType: 'D',   status: '已完成', orgPayType: 'A', orgRDMAmt: 2000, orgPayRate: 0, payType: 'A', rdmAmt: 2000, payRate: 0, orgRDMDay: 20, rdmDay: 15, orgLimitMode: 'neg',  orgLimitVal: -20, limitMode: 'neg',  limitVal: -20 },
    { orderDate: '2025-10-02', orderTime: '13:08:49', tDate: '2025-10-06', tradeType: 'TAP', status: '已完成', orgPayType: 'P', orgRDMAmt: 0,    orgPayRate: 8, payType: 'A', rdmAmt: 2000, payRate: 0, orgRDMDay: 20, rdmDay: 20, orgLimitMode: 'none', orgLimitVal: null, limitMode: 'neg',  limitVal: -20 },
  ],
  FP20240601: [
    { orderDate: '2026-03-28', orderTime: '11:22:18', tDate: '2026-04-01', tradeType: 'AL', status: '已完成', orgPayType: 'A', orgRDMAmt: 60, orgPayRate: 0, payType: 'A', rdmAmt: 80, payRate: 0, orgRDMDay: 15, rdmDay: 15, orgLimitMode: 'pos', orgLimitVal: 50, limitMode: 'pos', limitVal: 30 },
    { orderDate: '2025-12-10', orderTime: '09:46:33', tDate: '2025-12-12', tradeType: 'D',  status: '已完成', orgPayType: 'A', orgRDMAmt: 60, orgPayRate: 0, payType: 'A', rdmAmt: 60, payRate: 0, orgRDMDay: 10, rdmDay: 15, orgLimitMode: 'pos', orgLimitVal: 50, limitMode: 'pos', limitVal: 50 },
  ],
  FP20241201: [
    { orderDate: '2026-02-26', orderTime: '14:03:12', tDate: '2026-03-02', tradeType: 'P', status: '已完成', orgPayType: 'P', orgRDMAmt: 0, orgPayRate: 5, payType: 'P', rdmAmt: 0, payRate: 6, orgRDMDay: 5, rdmDay: 5, orgLimitMode: 'none', orgLimitVal: null, limitMode: 'none', limitVal: null },
  ],
  FP20240101: [
    { orderDate: '2026-04-15', orderTime: '10:30:55', tDate: '2026-04-17', tradeType: 'DL', status: '已完成', orgPayType: 'P', orgRDMAmt: 0, orgPayRate: 5, payType: 'P', rdmAmt: 0, payRate: 5, orgRDMDay: 10, rdmDay: 5, orgLimitMode: 'neg', orgLimitVal: -15, limitMode: 'none', limitVal: null },
  ],
  FP20250301: [
    { orderDate: '2026-02-18', orderTime: '14:12:33', tDate: '2026-02-20', tradeType: 'DL', status: '已完成', orgPayType: 'P', orgRDMAmt: 0, orgPayRate: 4, payType: 'P', rdmAmt: 0, payRate: 4, orgRDMDay: 10, rdmDay: 10, orgLimitMode: 'none', orgLimitVal: null, limitMode: 'pos', limitVal: 20 },
  ],
  FP20250601: [
    { orderDate: '2026-03-12', orderTime: '10:08:11', tDate: '2026-03-16', tradeType: 'D', status: '已完成', orgPayType: 'A', orgRDMAmt: 6000, orgPayRate: 0, payType: 'A', rdmAmt: 6000, payRate: 0, orgRDMDay: 10, rdmDay: 15, orgLimitMode: 'neg', orgLimitVal: -20, limitMode: 'neg', limitVal: -20 },
  ],
  FP20240801: [
    { orderDate: '2026-01-08', orderTime: '09:55:20', tDate: '2026-01-12', tradeType: 'AL', status: '已完成', orgPayType: 'A', orgRDMAmt: 4000, orgPayRate: 0, payType: 'A', rdmAmt: 5000, payRate: 0, orgRDMDay: 20, rdmDay: 20, orgLimitMode: 'none', orgLimitVal: null, limitMode: 'none', limitVal: null },
  ],
};
