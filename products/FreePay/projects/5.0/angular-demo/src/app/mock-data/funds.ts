// 基金宇宙（fund universe）
// 全 demo 唯一的「基金身分」來源：名稱、境內外、計價幣別、可申購幣別、最低申購額、類型／區域／品牌、各期績效。
// 持有資料、選擇基金頁、申購流程一律以 fundId 引用此處，不再各自重複存基金資料。

export interface FundCurrency {
  currency: string;       // 中文幣別名，如 '台幣'
  currencyCode: string;   // 'TWD'
  minPurchase: number;    // 該幣別首次申購最低金額（spec §升級一）
}

export type FundCategory = '股票型' | '平衡型' | '債券型' | '貨幣型' | '其他';
export type FundRegion = '台灣' | '亞洲' | '北美洲' | '中東非洲' | '大洋洲' | '全球';

export interface FundPerf {
  m6: number;             // 近 6 個月（%）
  y1: number;             // 近 1 年
  y2: number;             // 近 2 年
  y3: number;             // 近 3 年
  y5: number;             // 近 5 年
}

export interface Fund {
  fundId: string;
  name: string;
  domicile: '境內' | '境外';
  pricingCurrency: string;
  risk: string;                   // RR1–RR5
  currencies: FundCurrency[];
  category: FundCategory;
  region: FundRegion;
  brand: string;                  // 基金品牌（基金公司）
  perf: FundPerf;                 // 績效表現 tab
  stdDev: number;                 // 1 年年化標準差
  yearRoi: number[];              // 年度報酬率（5 年）：[2021, 2022, 2023, 2024, 2025]
  yearMaxDrop: number[];          // 年度最大跌幅（5 年）：[2021, 2022, 2023, 2024, 2025]
}

const MIN_TWD = 100000;
const MIN_USD = 3500;
const MIN_JPY = 500000;
const MIN_EUR = 3000;
const MIN_ZAR = 50000;
const MIN_CNY = 30000;

export const FUNDS: Fund[] = [
  {
    fundId: 'TA123456',
    name: '統一大滿貫多重資產平衡證券投資信託基金 A 類型 台幣 不配息',
    domicile: '境內', pricingCurrency: '台幣', risk: 'RR3',
    currencies: [{ currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD }],
    category: '平衡型', region: '亞洲', brand: '統一',
    perf: { m6: 8.52, y1: 14.20, y2: 26.80, y3: 38.40, y5: 52.30 },
    stdDev: 10.40,
    yearRoi: [12.5, -8.2, 18.6, 16.4, 14.2],
    yearMaxDrop: [-12.4, -18.6, -9.2, -8.4, -7.2],
  },
  {
    fundId: 'TA654321',
    name: '統一全球多元資產基金',
    domicile: '境外', pricingCurrency: '美元', risk: 'RR4',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '平衡型', region: '全球', brand: '統一',
    perf: { m6: 12.30, y1: 19.80, y2: 32.50, y3: 46.20, y5: 68.40 },
    stdDev: 12.80,
    yearRoi: [16.2, -12.4, 22.8, 18.6, 19.8],
    yearMaxDrop: [-14.2, -22.6, -10.4, -9.2, -8.6],
  },
  {
    fundId: 'TA987654',
    name: '統一日本動力基金',
    domicile: '境外', pricingCurrency: '日幣', risk: 'RR4',
    currencies: [{ currency: '日幣', currencyCode: 'JPY', minPurchase: MIN_JPY }],
    category: '股票型', region: '亞洲', brand: '統一',
    perf: { m6: 9.85, y1: 22.40, y2: 35.60, y3: 48.20, y5: 74.50 },
    stdDev: 18.20,
    yearRoi: [22.4, -16.8, 28.4, 18.2, 22.4],
    yearMaxDrop: [-16.8, -24.2, -12.6, -10.8, -9.4],
  },
  {
    fundId: 'TA112233',
    name: '統一台灣高股息基金',
    domicile: '境內', pricingCurrency: '台幣', risk: 'RR3',
    currencies: [{ currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD }],
    category: '股票型', region: '亞洲', brand: '統一',
    perf: { m6: 6.40, y1: 16.80, y2: 28.40, y3: 42.60, y5: 58.20 },
    stdDev: 14.60,
    yearRoi: [18.6, -6.4, 16.2, 14.8, 16.8],
    yearMaxDrop: [-15.2, -16.4, -8.6, -7.4, -6.8],
  },
  {
    fundId: 'TA445566',
    name: '統一全球創新科技基金',
    domicile: '境外', pricingCurrency: '美元', risk: 'RR5',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '全球', brand: '統一',
    perf: { m6: 15.72, y1: 32.40, y2: 58.60, y3: 82.40, y5: 124.80 },
    stdDev: 24.80,
    yearRoi: [38.6, -28.4, 42.6, 28.4, 32.4],
    yearMaxDrop: [-22.4, -34.6, -16.2, -14.8, -12.6],
  },
  {
    fundId: 'TA778899',
    name: '統一亞洲機會基金',
    domicile: '境外', pricingCurrency: '美元', risk: 'RR4',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '亞洲', brand: '統一',
    perf: { m6: 11.08, y1: 22.60, y2: 38.40, y3: 52.80, y5: 72.40 },
    stdDev: 18.40,
    yearRoi: [24.6, -14.8, 22.4, 18.6, 22.6],
    yearMaxDrop: [-18.6, -22.4, -12.8, -10.6, -9.2],
  },
  {
    fundId: 'AL200001',
    name: '安聯台灣科技基金',
    domicile: '境內', pricingCurrency: '台幣', risk: 'RR5',
    currencies: [{ currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD }],
    category: '股票型', region: '亞洲', brand: '安聯',
    perf: { m6: 18.40, y1: 36.80, y2: 62.40, y3: 88.60, y5: 132.80 },
    stdDev: 26.40,
    yearRoi: [42.6, -32.4, 46.8, 32.6, 36.8],
    yearMaxDrop: [-24.6, -36.8, -18.4, -16.2, -14.4],
  },
  {
    fundId: 'BR200002',
    name: '貝萊德世界礦業基金 A2',
    domicile: '境外', pricingCurrency: '美元', risk: 'RR5',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '全球', brand: '貝萊德',
    perf: { m6: 14.20, y1: 26.80, y2: 42.60, y3: 38.40, y5: 68.40 },
    stdDev: 28.60,
    yearRoi: [32.4, -22.6, 18.4, -6.8, 26.8],
    yearMaxDrop: [-26.4, -32.8, -22.4, -20.6, -16.8],
  },
  {
    fundId: 'JP200003',
    name: '摩根環球債券基金',
    domicile: '境外', pricingCurrency: '美元', risk: 'RR2',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '債券型', region: '全球', brand: '摩根',
    perf: { m6: 3.20, y1: 5.80, y2: 9.40, y3: 12.60, y5: 18.40 },
    stdDev: 5.20,
    yearRoi: [4.8, -2.4, 5.6, 4.2, 5.8],
    yearMaxDrop: [-4.2, -6.8, -3.4, -2.8, -2.2],
  },
  {
    fundId: 'GS200004',
    name: '高盛新興市場股票基金',
    domicile: '境外', pricingCurrency: '美元', risk: 'RR5',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '中東非洲', brand: '高盛',
    perf: { m6: 13.60, y1: 24.80, y2: 38.40, y3: 46.80, y5: 62.40 },
    stdDev: 22.40,
    yearRoi: [28.6, -18.4, 22.6, 12.4, 24.8],
    yearMaxDrop: [-20.8, -28.6, -14.6, -12.4, -10.8],
  },
  {
    fundId: 'AB200005',
    name: '聯博美國收益基金 A 級',
    domicile: '境外', pricingCurrency: '美元', risk: 'RR3',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '債券型', region: '北美洲', brand: '聯博',
    perf: { m6: 4.60, y1: 8.40, y2: 14.20, y3: 18.60, y5: 26.40 },
    stdDev: 6.80,
    yearRoi: [6.4, -3.8, 7.2, 5.8, 8.4],
    yearMaxDrop: [-5.4, -8.2, -4.2, -3.6, -3.0],
  },
  {
    fundId: 'NM200006',
    name: '野村貨幣市場基金',
    domicile: '境內', pricingCurrency: '台幣', risk: 'RR1',
    currencies: [{ currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD }],
    category: '貨幣型', region: '亞洲', brand: '野村',
    perf: { m6: 0.80, y1: 1.60, y2: 3.20, y3: 4.80, y5: 7.20 },
    stdDev: 0.40,
    yearRoi: [1.2, 1.0, 1.4, 1.5, 1.6],
    yearMaxDrop: [-0.4, -0.6, -0.3, -0.2, -0.2],
  },
  {
    fundId: 'BR300001',
    name: '貝萊德歐洲價值型基金 A2 歐元',
    domicile: '境外', pricingCurrency: '歐元', risk: 'RR4',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '歐元', currencyCode: 'EUR', minPurchase: MIN_EUR },
    ],
    category: '股票型', region: '全球', brand: '貝萊德',
    perf: { m6: 7.20, y1: 13.60, y2: 22.40, y3: 32.80, y5: 48.60 },
    stdDev: 14.20,
    yearRoi: [14.6, -9.8, 16.4, 12.8, 13.6],
    yearMaxDrop: [-12.8, -18.4, -10.2, -8.6, -7.4],
  },
  {
    fundId: 'AL300002',
    name: '安聯南非黃金與礦業基金 A 南非幣',
    domicile: '境外', pricingCurrency: '南非幣', risk: 'RR5',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '南非幣', currencyCode: 'ZAR', minPurchase: MIN_ZAR },
    ],
    category: '股票型', region: '中東非洲', brand: '安聯',
    perf: { m6: 16.40, y1: 28.60, y2: 42.80, y3: 38.60, y5: 62.40 },
    stdDev: 24.60,
    yearRoi: [32.4, -22.8, 18.6, -8.4, 28.6],
    yearMaxDrop: [-24.8, -32.4, -18.6, -16.4, -14.2],
  },
  {
    fundId: 'JP300003',
    name: '摩根人民幣高收益債券基金 A 人民幣',
    domicile: '境外', pricingCurrency: '人民幣', risk: 'RR3',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '人民幣', currencyCode: 'CNY', minPurchase: MIN_CNY },
    ],
    category: '債券型', region: '亞洲', brand: '摩根',
    perf: { m6: 4.20, y1: 7.80, y2: 12.40, y3: 16.80, y5: 22.40 },
    stdDev: 6.40,
    yearRoi: [6.2, -3.4, 6.8, 5.4, 7.8],
    yearMaxDrop: [-5.6, -7.4, -3.8, -3.2, -2.6],
  },
  {
    fundId: 'TA300004',
    name: '統一台灣美元優選基金 A 美元',
    domicile: '境內', pricingCurrency: '美元', risk: 'RR3',
    currencies: [
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '債券型', region: '台灣', brand: '統一',
    perf: { m6: 3.80, y1: 6.80, y2: 11.40, y3: 14.80, y5: 20.60 },
    stdDev: 5.80,
    yearRoi: [5.4, -2.8, 6.2, 4.8, 6.8],
    yearMaxDrop: [-4.6, -6.8, -3.2, -2.6, -2.2],
  },
];

export function findFund(fundId: string): Fund | undefined {
  return FUNDS.find(f => f.fundId === fundId);
}

// 篩選選項常數（用於選擇基金頁的篩選列）
export const FUND_CATEGORIES: FundCategory[] = ['股票型', '平衡型', '債券型', '貨幣型', '其他'];
export const FUND_REGIONS: FundRegion[] = ['台灣', '亞洲', '北美洲', '中東非洲', '大洋洲', '全球'];
export const FUND_BRANDS = [
  '安聯', '貝萊德', '摩根', '高盛', '聯博', '富達', '富蘭克林坦伯頓', '野村', '摩根士丹利',
  '中國信託', '復華', 'DWS', 'GAM', 'GAM Star', 'KBI', 'M&G', 'MFS全盛', 'PGIM', 'PIMCO品浩',
  '大華銀', '元大', '天利', '木星', '台中銀', '台新', '永豐', '玉山', '兆豐', '先機',
  '合庫', '安本', '安盛', '百達', '宏利', '尚渤', '東方匯理', '法巴', '法盛', '威廉博萊',
  '施羅德', '柏瑞', '美盛', '首源', '晉達', '紐約梅隆', '國泰', '第一金', '統一', '荷寶',
  '凱基', '凱敏雅克', '富邦', '富蘭克林華美', '惠理基金', '普徠仕', '景順', '華南永昌',
  '街口', '愛德蒙(法國)', '新加坡大華', '瑞士隆奧', '瑞萬通博', '瑞銀', '瑞聯UBAM',
  '群益', '資本', '路博邁', '歐義銳榮', '聯邦投信', '駿利亨德森', '瀚亞', '羅素', '匯豐'
];
// 計價幣別（5.0 spec §基金選擇頁新增）
// 境內與境外的可選計價幣別不同，需依「境別篩選的當前狀態」動態切換選項。
// 當境別篩選為「全部」（或同時勾選境內＋境外）時，合併呈現所有選項。
export const PRICING_CCY_DOMESTIC = ['台幣', '美元'];
export const PRICING_CCY_FOREIGN = ['台幣', '美元', '日幣', '歐元', '南非幣', '人民幣'];

export function pricingCurrenciesByDomiciles(domiciles: Array<'境內' | '境外'>): string[] {
  const showDomestic = domiciles.length === 0 || domiciles.includes('境內');
  const showForeign = domiciles.length === 0 || domiciles.includes('境外');
  const merged: string[] = [];
  if (showDomestic) PRICING_CCY_DOMESTIC.forEach(c => merged.includes(c) || merged.push(c));
  if (showForeign) PRICING_CCY_FOREIGN.forEach(c => merged.includes(c) || merged.push(c));
  return merged;
}

// 向後相容：合併版（不分境別）— 預留給其他模組需要全清單時使用
export const FUND_PRICING_CCY = pricingCurrenciesByDomiciles([]);
