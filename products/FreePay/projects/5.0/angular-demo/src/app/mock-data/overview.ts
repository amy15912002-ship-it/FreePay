export interface OvSummary {
  ccy: string; pay: string; paid: string;
  market: string; cost: string; profit: string; ret: string;
}

export interface OvContract {
  fpNo: string; alias: string; ccy: string;
  setting: string; threshold: string;
  pay: string; paid: string; market: string; cost: string; profit: string; ret: string;
}

export interface OvFund {
  id: string; code: string; name: string;
  txCcy: string; buyCcy: string;
  pay: string; paid: string; market: string; cost: string; profit: string; ret: string;
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
  id: string; fund: string; code: string; fpNo: string; alias: string;
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

export const OV_SUMMARIES: OvSummary[] = [
  { ccy: '台幣', pay: '5,040', paid: '30,000', market: '680,000', cost: '650,000', profit: '30,000',  ret: '5.30%'  },
  { ccy: '美元', pay: '80',    paid: '240',    market: '8,420',   cost: '8,000',   profit: '420',     ret: '8.25%'  },
  { ccy: '歐元', pay: '60',    paid: '120',    market: '6,180',   cost: '6,300',   profit: '-120',    ret: '-1.90%' },
];

export const OV_FUNDS: OvFund[] = [
  {
    id: 'as778899-tw', code: 'AS778899', name: '貝萊德全球股票收益基金 A2',
    txCcy: '美元', buyCcy: '台幣',
    pay: '3,500', paid: '12,000', market: '518,000', cost: '500,000', profit: '18,000', ret: '10.03%',
    contracts: [
      { fpNo: 'FP2024001', alias: '20240315', ccy: '台幣', setting: '依金額・15日', threshold: '市值守護・跌20%',  pay: '2,000', paid: '12,000', market: '318,000', cost: '300,000', profit: '18,000', ret: '10.03%' },
      { fpNo: 'FP2024003', alias: '20240315-2', ccy: '台幣', setting: '依金額・20日', threshold: '不設門檻',       pay: '1,500', paid: '0',      market: '200,000', cost: '200,000', profit: '-',      ret: '-'      },
    ]
  },
  {
    id: 'as778899-us', code: 'AS778899', name: '貝萊德全球股票收益基金 A2',
    txCcy: '美元', buyCcy: '美元',
    pay: '80', paid: '240', market: '8,420', cost: '8,000', profit: '420', ret: '8.25%',
    contracts: [
      { fpNo: 'FP2024002', alias: '20240315', ccy: '美元', setting: '依金額・15日', threshold: '增值啟動・漲30%', pay: '80', paid: '240', market: '8,420', cost: '8,000', profit: '420', ret: '8.25%' },
    ]
  },
  {
    id: 'ta123456-tw', code: 'TA123456', name: '統一大滿貫台灣平衡基金',
    txCcy: '台幣', buyCcy: '台幣',
    pay: '810', paid: '18,000', market: '162,000', cost: '150,000', profit: '12,000', ret: '13.40%',
    contracts: [
      { fpNo: 'FP2025002', alias: '20250101', ccy: '台幣', setting: '依比例・6%・5日', threshold: '不設門檻', pay: '810', paid: '18,000', market: '162,000', cost: '150,000', profit: '12,000', ret: '13.40%' },
    ]
  },
];

export const MOCK_ALT_ORDERS: AltOrder[] = [
  { id: 'A20260505001', fund: '貝萊德全球股票收益基金 A2', code: 'AS778899', ccy: 'TWD', fdCcy: 'USD', amount: 300000, payType: 'A', rdmAmt: 2000,  payRate: 0, rdmDay: 15, limitMode: 'neg',  limitVal: -20, date: '2026/05/05', time: '09:12:30', effectDate: '2026/05/07', status: '成功' },
  { id: 'A20260505002', fund: '統一大滿貫台灣平衡基金',       code: 'TA123456', ccy: 'TWD', fdCcy: 'TWD', amount: 100000, payType: 'P', rdmAmt: 810,   payRate: 6, rdmDay: 5,  limitMode: 'none', limitVal: null, date: '2026/05/05', time: '10:05:11', effectDate: '2026/05/07', status: '成功' },
];

export const MOCK_CHG_ORDERS: ChgOrder[] = [
  { id: 'C20260505001', fund: '貝萊德全球股票收益基金 A2', code: 'AS778899', ccy: 'USD', oldPay: '美元 80', newPay: '美元 100', oldDay: '15', newDay: '15', oldLimit: '增值啟動・漲50%', newLimit: '增值啟動・漲30%', effectDate: '2026/05/06', date: '2026/05/05', time: '11:20:18', status: '成功' },
];

export const MOCK_RDM_ORDERS: RdmOrder[] = [
  { id: 'R20260505001', fund: '貝萊德全球股票收益基金 A2', code: 'AS778899', ccy: 'TWD', fdCcy: 'USD', unit: '120.5000', amount: 2000, date: '2026/05/05', time: '13:05:42', effectDate: '2026/05/06', status: '已送出' },
];

export const MOCK_PROFITS: ProfitRecord[] = [
  { id: 'hp-001', fund: '貝萊德全球股票收益基金 A2', code: 'AS778899', fpNo: 'FP2024001', alias: '20240315',   ccy: 'TWD', redeemDate: '2026/04/18', totalPaid: 12000, paySetting: '依金額・15日',    threshold: '市值守護・跌20%',  cost: 300000, redeemAmount: 318000, profit:  30000, returnRate:  10.00, status: '已完成' },
  { id: 'hp-002', fund: '貝萊德全球股票收益基金 A2', code: 'AS778899', fpNo: 'FP2024002', alias: '20240315',   ccy: 'USD', redeemDate: '2026/03/22', totalPaid:   240, paySetting: '依金額・15日',    threshold: '增值啟動・漲30%', cost:   8000, redeemAmount:   8420, profit:    660, returnRate:   8.25, status: '已完成' },
  { id: 'hp-003', fund: '統一大滿貫台灣平衡基金',       code: 'TA123456', fpNo: 'FP2025002', alias: '20250101',   ccy: 'TWD', redeemDate: '2026/02/10', totalPaid: 18000, paySetting: '依比例・6%・5日', threshold: '不設門檻',         cost: 150000, redeemAmount: 162000, profit:  30000, returnRate:  20.00, status: '已完成' },
  { id: 'hp-004', fund: '施羅德環球收益基金 A',         code: 'TU778899', fpNo: 'FP2025001', alias: '20250318',   ccy: 'USD', redeemDate: '2025/12/19', totalPaid:   150, paySetting: '依金額・10日',    threshold: '不設門檻',         cost:   5000, redeemAmount:   4860, profit:     10, returnRate:   0.20, status: '已完成' },
  { id: 'hp-005', fund: '貝萊德全球股票收益基金 A2', code: 'AS778899', fpNo: 'FP2023008', alias: '20231201',   ccy: 'TWD', redeemDate: '2025/10/06', totalPaid:  6000, paySetting: '依金額・20日',    threshold: '不設門檻',         cost: 200000, redeemAmount: 188000, profit:  -6000, returnRate:  -3.00, status: '已完成' },
];

export const DETAIL_TX_DETAIL: Record<string, DetailTxRecord[]> = {
  FP2024001: [
    { orderDate: '2026-04-15', orderTime: '09:00:12', tDate: '2026-04-17', tradeType: 'R',   trCcyDesc: '台幣', fdCcyDesc: '美元', navDesc: '11.8500', unitDesc: '168.7763',    exRateDesc: '32.1050', amount: 2000 },
    { orderDate: '2026-03-15', orderTime: '09:00:07', tDate: '2026-03-17', tradeType: 'R',   trCcyDesc: '台幣', fdCcyDesc: '美元', navDesc: '11.7200', unitDesc: '170.6485',    exRateDesc: '32.0800', amount: 2000 },
    { orderDate: '2026-02-15', orderTime: '09:00:05', tDate: '2026-02-17', tradeType: 'R',   trCcyDesc: '台幣', fdCcyDesc: '美元', navDesc: '11.5800', unitDesc: '172.7115',    exRateDesc: '31.9800', amount: 2000 },
    { orderDate: '2026-01-10', orderTime: '11:42:05', tDate: '2026-01-14', tradeType: 'RDM', trCcyDesc: '台幣', fdCcyDesc: '美元', navDesc: '11.2300', unitDesc: '1,200.0000', exRateDesc: '31.8500', amount: 42800 },
    { orderDate: '2024-03-15', orderTime: '14:20:33', tDate: '2024-03-19', tradeType: 'A',   trCcyDesc: '台幣', fdCcyDesc: '美元', navDesc: '10.5000', unitDesc: '28,571.4286', exRateDesc: '31.4500', amount: 300000 },
  ],
  FP2024002: [
    { orderDate: '2026-04-15', orderTime: '09:05:42', tDate: '2026-04-17', tradeType: 'R', trCcyDesc: '美元', fdCcyDesc: '美元', navDesc: '11.8500', unitDesc: '6.7511',    exRateDesc: '-', amount: 80 },
    { orderDate: '2026-03-15', orderTime: '09:04:18', tDate: '2026-03-17', tradeType: 'R', trCcyDesc: '美元', fdCcyDesc: '美元', navDesc: '11.7200', unitDesc: '6.8259',    exRateDesc: '-', amount: 80 },
    { orderDate: '2024-03-15', orderTime: '14:22:10', tDate: '2024-03-19', tradeType: 'A', trCcyDesc: '美元', fdCcyDesc: '美元', navDesc: '10.5000', unitDesc: '761.9048',  exRateDesc: '-', amount: 8000 },
  ],
  FP2024003: [
    { orderDate: '2026-05-02', orderTime: '10:18:03', tDate: '2026-05-06', tradeType: 'A', trCcyDesc: '台幣', fdCcyDesc: '美元', navDesc: '-', unitDesc: '-', exRateDesc: '-', amount: 200000 },
  ],
  FP2025002: [
    { orderDate: '2026-04-05', orderTime: '09:00:02', tDate: '2026-04-07', tradeType: 'R', trCcyDesc: '台幣', fdCcyDesc: '台幣', navDesc: '16.2045', unitDesc: '49.9861',     exRateDesc: '-', amount: 810 },
    { orderDate: '2026-03-05', orderTime: '09:00:02', tDate: '2026-03-07', tradeType: 'R', trCcyDesc: '台幣', fdCcyDesc: '台幣', navDesc: '16.1032', unitDesc: '50.3006',     exRateDesc: '-', amount: 810 },
    { orderDate: '2025-01-01', orderTime: '13:25:00', tDate: '2025-01-03', tradeType: 'A', trCcyDesc: '台幣', fdCcyDesc: '台幣', navDesc: '15.0000', unitDesc: '26,800.0000', exRateDesc: '-', amount: 402000 },
  ],
};

export const DETAIL_TX_CHANGE: Record<string, DetailChgRecord[]> = {
  FP2024001: [
    { orderDate: '2026-04-30', orderTime: '15:34:21', tDate: '2026-05-04', tradeType: 'AL',  status: '已完成', orgPayType: 'A', orgRDMAmt: 2000, orgPayRate: 0, payType: 'A', rdmAmt: 2500, payRate: 0, orgRDMDay: 15, rdmDay: 15, orgLimitMode: 'neg',  orgLimitVal: -20, limitMode: 'none', limitVal: null },
    { orderDate: '2026-01-12', orderTime: '10:18:06', tDate: '2026-01-14', tradeType: 'D',   status: '已完成', orgPayType: 'A', orgRDMAmt: 2000, orgPayRate: 0, payType: 'A', rdmAmt: 2000, payRate: 0, orgRDMDay: 20, rdmDay: 15, orgLimitMode: 'neg',  orgLimitVal: -20, limitMode: 'neg',  limitVal: -20 },
    { orderDate: '2025-10-02', orderTime: '13:08:49', tDate: '2025-10-06', tradeType: 'TAP', status: '已完成', orgPayType: 'P', orgRDMAmt: 0,    orgPayRate: 8, payType: 'A', rdmAmt: 2000, payRate: 0, orgRDMDay: 20, rdmDay: 20, orgLimitMode: 'none', orgLimitVal: null, limitMode: 'neg',  limitVal: -20 },
  ],
  FP2024002: [
    { orderDate: '2026-03-28', orderTime: '11:22:18', tDate: '2026-04-01', tradeType: 'AL', status: '已完成', orgPayType: 'A', orgRDMAmt: 60, orgPayRate: 0, payType: 'A', rdmAmt: 80, payRate: 0, orgRDMDay: 15, rdmDay: 15, orgLimitMode: 'pos', orgLimitVal: 50, limitMode: 'pos', limitVal: 30 },
    { orderDate: '2025-12-10', orderTime: '09:46:33', tDate: '2025-12-12', tradeType: 'D',  status: '已完成', orgPayType: 'A', orgRDMAmt: 60, orgPayRate: 0, payType: 'A', rdmAmt: 60, payRate: 0, orgRDMDay: 10, rdmDay: 15, orgLimitMode: 'pos', orgLimitVal: 50, limitMode: 'pos', limitVal: 50 },
  ],
  FP2024003: [
    { orderDate: '2026-02-26', orderTime: '14:03:12', tDate: '2026-03-02', tradeType: 'P', status: '已完成', orgPayType: 'P', orgRDMAmt: 0, orgPayRate: 5, payType: 'P', rdmAmt: 0, payRate: 6, orgRDMDay: 5, rdmDay: 5, orgLimitMode: 'none', orgLimitVal: null, limitMode: 'none', limitVal: null },
  ],
  FP2025002: [
    { orderDate: '2026-04-15', orderTime: '10:30:55', tDate: '2026-04-17', tradeType: 'DL', status: '已完成', orgPayType: 'P', orgRDMAmt: 0, orgPayRate: 5, payType: 'P', rdmAmt: 0, payRate: 5, orgRDMDay: 10, rdmDay: 5, orgLimitMode: 'neg', orgLimitVal: -15, limitMode: 'none', limitVal: null },
  ],
};
