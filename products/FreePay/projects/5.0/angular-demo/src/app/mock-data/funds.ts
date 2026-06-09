// 基金宇宙（fund universe）
// 全 demo 唯一的「基金身分」來源：名稱、境內外、計價幣別、可申購幣別、最低申購額、類型／區域／品牌、各期績效。
// 持有資料、選擇基金頁、申購流程一律以 fundId 引用此處，不再各自重複存基金資料。

export interface FundCurrency {
  currency: string;       // 中文幣別名，如 '台幣'
  currencyCode: string;   // 'TWD'
  minPurchase: number;    // 該幣別首次申購最低金額（spec §升級一）
}

export type FundCategory = '股票型' | '平衡型' | '債券型' | '貨幣型' | '其他';
export type FundRegion = '大洋洲' | '中東非洲' | '北美洲' | '全球' | '亞洲' | '拉丁美洲' | '非洲' | '新興市場' | '新興歐洲' | '歐洲';

export interface FundPerf {
  m3: number;             // 近 3 個月（%）
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
  group: string;                  // 基金組別（基金選擇頁篩選用）
  lipper: number;                 // 理柏總回報評級（1–5，5 為最佳）
  nav: number;                    // 最新淨值
  navDate: string;                // 淨值日期
  navChange: number;              // 日漲跌（淨值變動金額）
  navChangePct: number;           // 日漲跌幅（%）
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
    nav: 12.45, navDate: '2026/06/03', navChange: 0.03, navChangePct: 0.24,
    group: '新台幣平衡混合型',
    lipper: 3,
    domicile: '境內', pricingCurrency: '台幣', risk: 'RR3',
    currencies: [{ currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD }],
    category: '平衡型', region: '亞洲', brand: '統一',
    perf: { m3: 4.20, m6: 8.52, y1: 14.20, y2: 26.80, y3: 38.40, y5: 52.30 },
    stdDev: 10.40,
    yearRoi: [12.5, -8.2, 18.6, 16.4, 14.2],
    yearMaxDrop: [-12.4, -18.6, -9.2, -8.4, -7.2],
  },
  {
    fundId: 'TA654321',
    name: '統一全球多元資產基金',
    nav: 15.80, navDate: '2026/06/03', navChange: 0.06, navChangePct: 0.38,
    group: '其他平衡混合型',
    lipper: 4,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR4',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '平衡型', region: '全球', brand: '統一',
    perf: { m3: 6.80, m6: 12.30, y1: 19.80, y2: 32.50, y3: 46.20, y5: 68.40 },
    stdDev: 12.80,
    yearRoi: [16.2, -12.4, 22.8, 18.6, 19.8],
    yearMaxDrop: [-14.2, -22.6, -10.4, -9.2, -8.6],
  },
  {
    fundId: 'TA987654',
    name: '統一日本動力基金',
    nav: 18.32, navDate: '2026/06/03', navChange: -0.11, navChangePct: -0.60,
    group: '日本股票',
    lipper: 4,
    domicile: '境外', pricingCurrency: '日圓', risk: 'RR4',
    currencies: [{ currency: '日圓', currencyCode: 'JPY', minPurchase: MIN_JPY }],
    category: '股票型', region: '亞洲', brand: '統一',
    perf: { m3: 5.40, m6: 9.85, y1: 22.40, y2: 35.60, y3: 48.20, y5: 74.50 },
    stdDev: 18.20,
    yearRoi: [22.4, -16.8, 28.4, 18.2, 22.4],
    yearMaxDrop: [-16.8, -24.2, -12.6, -10.8, -9.4],
  },
  {
    fundId: 'TA112233',
    name: '統一台灣高股息基金',
    nav: 22.16, navDate: '2026/06/03', navChange: 0.18, navChangePct: 0.82,
    group: '台灣股票',
    lipper: 5,
    domicile: '境內', pricingCurrency: '台幣', risk: 'RR3',
    currencies: [{ currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD }],
    category: '股票型', region: '亞洲', brand: '統一',
    perf: { m3: 3.60, m6: 6.40, y1: 16.80, y2: 28.40, y3: 42.60, y5: 58.20 },
    stdDev: 14.60,
    yearRoi: [18.6, -6.4, 16.2, 14.8, 16.8],
    yearMaxDrop: [-15.2, -16.4, -8.6, -7.4, -6.8],
  },
  {
    fundId: 'TA445566',
    name: '統一全球創新科技基金',
    nav: 35.74, navDate: '2026/06/03', navChange: 0.42, navChangePct: 1.19,
    group: '資訊科技股票',
    lipper: 5,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR5',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '全球', brand: '統一',
    perf: { m3: 8.60, m6: 15.72, y1: 32.40, y2: 58.60, y3: 82.40, y5: 124.80 },
    stdDev: 24.80,
    yearRoi: [38.6, -28.4, 42.6, 28.4, 32.4],
    yearMaxDrop: [-22.4, -34.6, -16.2, -14.8, -12.6],
  },
  {
    fundId: 'TA778899',
    name: '統一亞洲機會基金',
    nav: 14.05, navDate: '2026/06/03', navChange: -0.08, navChangePct: -0.57,
    group: '亞太區股票',
    lipper: 3,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR4',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '亞洲', brand: '統一',
    perf: { m3: 6.20, m6: 11.08, y1: 22.60, y2: 38.40, y3: 52.80, y5: 72.40 },
    stdDev: 18.40,
    yearRoi: [24.6, -14.8, 22.4, 18.6, 22.6],
    yearMaxDrop: [-18.6, -22.4, -12.8, -10.6, -9.2],
  },
  {
    fundId: 'AL200001',
    name: '安聯台灣科技基金',
    nav: 28.90, navDate: '2026/06/03', navChange: 0.35, navChangePct: 1.23,
    group: '台灣股票',
    lipper: 5,
    domicile: '境內', pricingCurrency: '台幣', risk: 'RR5',
    currencies: [{ currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD }],
    category: '股票型', region: '亞洲', brand: '安聯',
    perf: { m3: 10.20, m6: 18.40, y1: 36.80, y2: 62.40, y3: 88.60, y5: 132.80 },
    stdDev: 26.40,
    yearRoi: [42.6, -32.4, 46.8, 32.6, 36.8],
    yearMaxDrop: [-24.6, -36.8, -18.4, -16.2, -14.4],
  },
  {
    fundId: 'BR200002',
    name: '貝萊德世界礦業基金 A2',
    nav: 9.62, navDate: '2026/06/03', navChange: -0.14, navChangePct: -1.43,
    group: '材料股票',
    lipper: 2,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR5',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '全球', brand: '貝萊德',
    perf: { m3: 7.80, m6: 14.20, y1: 26.80, y2: 42.60, y3: 38.40, y5: 68.40 },
    stdDev: 28.60,
    yearRoi: [32.4, -22.6, 18.4, -6.8, 26.8],
    yearMaxDrop: [-26.4, -32.8, -22.4, -20.6, -16.8],
  },
  {
    fundId: 'JP200003',
    name: '摩根環球債券基金',
    nav: 11.28, navDate: '2026/06/03', navChange: 0.02, navChangePct: 0.18,
    group: '環球債券 美元',
    lipper: 3,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR2',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '債券型', region: '全球', brand: '摩根',
    perf: { m3: 1.80, m6: 3.20, y1: 5.80, y2: 9.40, y3: 12.60, y5: 18.40 },
    stdDev: 5.20,
    yearRoi: [4.8, -2.4, 5.6, 4.2, 5.8],
    yearMaxDrop: [-4.2, -6.8, -3.4, -2.8, -2.2],
  },
  {
    fundId: 'GS200004',
    name: '高盛新興市場股票基金',
    nav: 13.47, navDate: '2026/06/03', navChange: -0.06, navChangePct: -0.44,
    group: '環球新興市場股票',
    lipper: 2,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR5',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '中東非洲', brand: '高盛',
    perf: { m3: 7.40, m6: 13.60, y1: 24.80, y2: 38.40, y3: 46.80, y5: 62.40 },
    stdDev: 22.40,
    yearRoi: [28.6, -18.4, 22.6, 12.4, 24.8],
    yearMaxDrop: [-20.8, -28.6, -14.6, -12.4, -10.8],
  },
  {
    fundId: 'AB200005',
    name: '聯博美國收益基金 A 級',
    nav: 10.85, navDate: '2026/06/03', navChange: 0.01, navChangePct: 0.09,
    group: '美元企業債券',
    lipper: 4,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR3',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '債券型', region: '北美洲', brand: '聯博',
    perf: { m3: 2.40, m6: 4.60, y1: 8.40, y2: 14.20, y3: 18.60, y5: 26.40 },
    stdDev: 6.80,
    yearRoi: [6.4, -3.8, 7.2, 5.8, 8.4],
    yearMaxDrop: [-5.4, -8.2, -4.2, -3.6, -3.0],
  },
  {
    fundId: 'NM200006',
    name: '野村貨幣市場基金',
    nav: 10.01, navDate: '2026/06/03', navChange: 0.01, navChangePct: 0.10,
    group: '新台幣貨幣市場',
    lipper: 3,
    domicile: '境內', pricingCurrency: '台幣', risk: 'RR1',
    currencies: [{ currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD }],
    category: '貨幣型', region: '亞洲', brand: '野村',
    perf: { m3: 0.40, m6: 0.80, y1: 1.60, y2: 3.20, y3: 4.80, y5: 7.20 },
    stdDev: 0.40,
    yearRoi: [1.2, 1.0, 1.4, 1.5, 1.6],
    yearMaxDrop: [-0.4, -0.6, -0.3, -0.2, -0.2],
  },
  {
    fundId: 'BR300001',
    name: '貝萊德歐洲價值型基金 A2 歐元',
    nav: 16.73, navDate: '2026/06/03', navChange: 0.09, navChangePct: 0.54,
    group: '歐洲股票',
    lipper: 4,
    domicile: '境外', pricingCurrency: '歐元', risk: 'RR4',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '歐元', currencyCode: 'EUR', minPurchase: MIN_EUR },
    ],
    category: '股票型', region: '全球', brand: '貝萊德',
    perf: { m3: 3.80, m6: 7.20, y1: 13.60, y2: 22.40, y3: 32.80, y5: 48.60 },
    stdDev: 14.20,
    yearRoi: [14.6, -9.8, 16.4, 12.8, 13.6],
    yearMaxDrop: [-12.8, -18.4, -10.2, -8.6, -7.4],
  },
  {
    fundId: 'AL300002',
    name: '安聯南非黃金與礦業基金 A 南非幣',
    nav: 7.88, navDate: '2026/06/03', navChange: -0.21, navChangePct: -2.59,
    group: '黃金及貴金屬股票',
    lipper: 1,
    domicile: '境外', pricingCurrency: '南非幣', risk: 'RR5',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '南非幣', currencyCode: 'ZAR', minPurchase: MIN_ZAR },
    ],
    category: '股票型', region: '中東非洲', brand: '安聯',
    perf: { m3: 9.20, m6: 16.40, y1: 28.60, y2: 42.80, y3: 38.60, y5: 62.40 },
    stdDev: 24.60,
    yearRoi: [32.4, -22.8, 18.6, -8.4, 28.6],
    yearMaxDrop: [-24.8, -32.4, -18.6, -16.4, -14.2],
  },
  {
    fundId: 'JP300003',
    name: '摩根人民幣高收益債券基金 A 人民幣',
    nav: 9.95, navDate: '2026/06/03', navChange: -0.03, navChangePct: -0.30,
    group: '環球新興市場當地貨幣債券',
    lipper: 3,
    domicile: '境外', pricingCurrency: '人民幣', risk: 'RR3',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '人民幣', currencyCode: 'CNY', minPurchase: MIN_CNY },
    ],
    category: '債券型', region: '亞洲', brand: '摩根',
    perf: { m3: 2.20, m6: 4.20, y1: 7.80, y2: 12.40, y3: 16.80, y5: 22.40 },
    stdDev: 6.40,
    yearRoi: [6.2, -3.4, 6.8, 5.4, 7.8],
    yearMaxDrop: [-5.6, -7.4, -3.8, -3.2, -2.6],
  },
  {
    fundId: 'TA300004',
    name: '統一台灣美元優選基金 A 美元',
    nav: 11.42, navDate: '2026/06/03', navChange: 0.04, navChangePct: 0.35,
    group: '美元債券',
    lipper: 4,
    domicile: '境內', pricingCurrency: '美元', risk: 'RR3',
    currencies: [
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '債券型', region: '亞洲', brand: '統一',
    perf: { m3: 2.00, m6: 3.80, y1: 6.80, y2: 11.40, y3: 14.80, y5: 20.60 },
    stdDev: 5.80,
    yearRoi: [5.4, -2.8, 6.2, 4.8, 6.8],
    yearMaxDrop: [-4.6, -6.8, -3.2, -2.6, -2.2],
  },
  {
    fundId: 'FD100001',
    name: '富達美國成長基金 A 美元',
    nav: 12345.6789, navDate: '2026/06/03', navChange: -23.4567, navChangePct: -0.19,   // 長淨值樣本：驗證千分位＋4位小數版面不破版
    group: '美國股票',
    lipper: 5,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR4',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '北美洲', brand: '富達',
    perf: { m3: 8.20, m6: 14.80, y1: 30.20, y2: 52.40, y3: 78.60, y5: 142.30 },
    stdDev: 22.80,
    yearRoi: [38.6, -28.4, 42.8, 24.6, 30.2],
    yearMaxDrop: [-18.4, -28.6, -12.8, -10.2, -8.6],
  },
  {
    fundId: 'SC200002',
    name: '施羅德環球氣候變化基金 A 美元',
    nav: 18.94, navDate: '2026/06/03', navChange: -0.12, navChangePct: -0.63,
    group: '環球股票',
    lipper: 4,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR4',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '全球', brand: '施羅德',
    perf: { m3: 5.20, m6: 9.40, y1: 18.60, y2: 32.80, y3: 46.20, y5: 78.40 },
    stdDev: 18.60,
    yearRoi: [26.4, -18.6, 24.8, 12.4, 18.6],
    yearMaxDrop: [-16.2, -24.8, -14.6, -10.8, -8.4],
  },
  {
    fundId: 'IV300003',
    name: '景順亞洲動力基金 A 美元',
    nav: 25.62, navDate: '2026/06/03', navChange: 0.38, navChangePct: 1.51,
    group: '亞太區股票',
    lipper: 4,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR5',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '亞洲', brand: '景順',
    perf: { m3: 6.40, m6: 11.20, y1: 22.40, y2: 38.60, y3: 52.80, y5: 88.60 },
    stdDev: 20.40,
    yearRoi: [30.2, -22.4, 28.6, 16.8, 22.4],
    yearMaxDrop: [-20.4, -28.6, -16.8, -12.4, -10.6],
  },
  {
    fundId: 'JP400004',
    name: '摩根歐洲動力基金 A 歐元',
    nav: 31.05, navDate: '2026/06/03', navChange: 0.14, navChangePct: 0.45,
    group: '歐洲股票',
    lipper: 4,
    domicile: '境外', pricingCurrency: '歐元', risk: 'RR4',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '歐元', currencyCode: 'EUR', minPurchase: MIN_EUR },
    ],
    category: '股票型', region: '歐洲', brand: '摩根',
    perf: { m3: 4.20, m6: 7.80, y1: 16.20, y2: 28.40, y3: 40.60, y5: 64.80 },
    stdDev: 17.20,
    yearRoi: [22.8, -16.4, 20.6, 10.8, 16.2],
    yearMaxDrop: [-14.6, -22.8, -12.4, -9.6, -7.8],
  },
  {
    fundId: 'BR500005',
    name: '貝萊德拉丁美洲基金 A2 美元',
    nav: 8.46, navDate: '2026/06/03', navChange: -0.18, navChangePct: -2.08,
    group: '拉丁美洲新興市場股票',
    lipper: 2,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR5',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '拉丁美洲', brand: '貝萊德',
    perf: { m3: 3.40, m6: 6.20, y1: 12.80, y2: 18.60, y3: 22.40, y5: 32.80 },
    stdDev: 26.80,
    yearRoi: [28.6, -32.4, 16.8, -6.2, 12.8],
    yearMaxDrop: [-28.6, -36.4, -22.8, -18.6, -16.2],
  },
  {
    fundId: 'AB600006',
    name: '聯博全球高收益債券基金 AT 美元',
    nav: 13.28, navDate: '2026/06/03', navChange: 0.03, navChangePct: 0.23,
    group: '美元非投資等級 (高收益) 債券',
    lipper: 3,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR3',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '債券型', region: '全球', brand: '聯博',
    perf: { m3: 2.40, m6: 4.20, y1: 8.60, y2: 14.80, y3: 18.40, y5: 28.60 },
    stdDev: 8.40,
    yearRoi: [12.6, -8.4, 10.8, 6.2, 8.6],
    yearMaxDrop: [-8.4, -12.6, -6.8, -4.6, -3.8],
  },
  {
    fundId: 'FT700007',
    name: '富蘭克林坦伯頓新興市場基金 A 美元',
    nav: 16.74, navDate: '2026/06/03', navChange: 0.22, navChangePct: 1.33,
    group: '環球新興市場股票',
    lipper: 3,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR5',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '新興市場', brand: '富蘭克林坦伯頓',
    perf: { m3: 5.80, m6: 10.40, y1: 20.80, y2: 34.60, y3: 48.20, y5: 76.40 },
    stdDev: 21.60,
    yearRoi: [28.4, -20.6, 26.8, 14.2, 20.8],
    yearMaxDrop: [-20.6, -28.4, -16.2, -12.8, -10.4],
  },
  {
    fundId: 'UB800008',
    name: '瑞銀全球科技基金 A 美元',
    nav: 38.92, navDate: '2026/06/03', navChange: 0.64, navChangePct: 1.67,
    group: '資訊科技股票',
    lipper: 5,
    domicile: '境外', pricingCurrency: '美元', risk: 'RR4',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
      { currency: '美元', currencyCode: 'USD', minPurchase: MIN_USD },
    ],
    category: '股票型', region: '全球', brand: '瑞銀',
    perf: { m3: 9.00, m6: 16.20, y1: 32.80, y2: 56.40, y3: 82.60, y5: 148.20 },
    stdDev: 24.20,
    yearRoi: [42.8, -30.6, 46.2, 26.8, 32.8],
    yearMaxDrop: [-20.8, -30.6, -14.2, -11.6, -9.4],
  },
  {
    fundId: 'TA800009',
    name: '統一台灣中小基金',
    nav: 26.38, navDate: '2026/06/03', navChange: 0.42, navChangePct: 1.62,
    group: '台灣中小型股票',
    lipper: 4,
    domicile: '境內', pricingCurrency: '台幣', risk: 'RR4',
    currencies: [
      { currency: '台幣', currencyCode: 'TWD', minPurchase: MIN_TWD },
    ],
    category: '股票型', region: '亞洲', brand: '統一',
    perf: { m3: 7.60, m6: 13.60, y1: 26.80, y2: 44.20, y3: 62.40, y5: 98.60 },
    stdDev: 19.80,
    yearRoi: [34.2, -24.6, 30.8, 18.4, 26.8],
    yearMaxDrop: [-18.6, -26.8, -14.2, -10.8, -8.6],
  },
];

export function findFund(fundId: string): Fund | undefined {
  return FUNDS.find(f => f.fundId === fundId);
}

// 篩選選項常數（用於選擇基金頁的篩選列）
export const FUND_CATEGORIES: FundCategory[] = ['股票型', '平衡型', '債券型', '貨幣型', '其他'];
export const FUND_REGIONS: FundRegion[] = ['大洋洲', '中東非洲', '北美洲', '全球', '亞洲', '拉丁美洲', '非洲', '新興市場', '新興歐洲', '歐洲'];

// 理柏總回報評級（基金選擇頁篩選用）：1–5，5 為最佳
export const LIPPER_RATINGS = [1, 2, 3, 4, 5];
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
// 基金組別（5.0 spec §基金選擇頁新增）
// 完整清單；即使 demo 資料暫無對應基金，也保留篩選標籤（同計價幣別做法）。
export const FUND_GROUPS = [
  '環球股票', '美國股票', '台灣股票', '資訊科技股票', '美元平衡混合型 - 美國', '新台幣靈活混合型', '環球新興市場強勢貨幣債券',
  '黃金及貴金屬股票', '能源股票', '醫療保健股票', '生物科技股票', '材料股票', '主題股票 - 天然資源', '主題股票 - 水資源',
  '主題股票 - 替代性能源', '主題股票 - 農業企業', '主題股票 - 基礎設施', '非必需消費品股票', '金融股票', '電訊服務股票', '美國房地產股票',
  '環球房地產股票', '歐洲房地產股票', '亞洲太平洋房地產股票', '產業股票', '台灣中小型股票', '大中華股票', '美國中小型股票',
  '美國收益股票', '環球中小型股票', '環球收益股票', '中國股票', '中國中小型股票', '越南股票', '日本股票', '日本中小型股票', '印度股票',
  '印度中小型股票', '巴西股票', '泰國股票', '南韓股票', '印度尼西亞股票', '香港股票', '新加坡股票', '澳洲股票', '意大利股票',
  '英國股票', '德國股票', '瑞士股票', '歐洲股票', '歐洲(除英國)股票', '歐洲中小型股票', '歐洲收益股票', '北歐股票', '環球新興市場股票',
  '環球新興市場中小型股票', '拉丁美洲新興市場股票', '歐洲新興市場股票', '亞洲新興市場股票', '其他新興市場股票', '亞太區股票',
  '亞太區(除日本)股票', '亞太區中小型股票', '東協股票', '邊境市場股票', '伊比利亞半島股票', '美元債券', '歐元平衡混合型 - 環球',
  '美元平衡混合型 - 環球', '美元靈活混合型 - 環球', '歐元靈活混合型 - 環球', '美元進取混合型', '新台幣平衡混合型', '新台幣進取混合型',
  '新台幣保守混合型', '其他平衡混合型', '其他靈活混合型', '環球宏觀另類投資', '多種策略另類投資', '其他目標期限',
  '目標期限歐元混合型2030', '目標期限歐元混合型2025', '美元保守混合型', '歐元靈活混合型 - 歐洲', '港元平衡混合型',
  '歐元平衡混合型 - 歐洲', '歐元進取混合型 - 環球', '美元企業債券', '亞太區強勢貨幣債券', '環球新興市場當地貨幣債券', '環球債券 美元',
  '環球企業債券 美元', '歐元債券', '其他債券', '美元抵押債券', '環球通脹掛鈎債券', '環球債券 歐元', '環球債券 (當地貨幣)',
  '環球企業債券 (當地貨幣)', '美元短期債券', '環球新興市場企業債券', '環球可轉換債券', '其他新興市場債券', '印度盧比債券',
  '亞太區當地貨幣債券', '南非蘭特債券', '環球短期債券', '歐洲債券', '美元政府債券', '參與放款基金', '美元通脹掛鈎債券',
  '絕對回報債券 美元', '日圓債券', '歐元企業債券', '環球企業債券 歐元', '其他可轉換債券', '美元中期債券', '歐元短期債券',
  '歐洲可轉換債券', '歐洲貨幣聯盟政府債券', '環球債券 英鎊', '環球債券 瑞士法郎', '美元貨幣市場', '新台幣貨幣市場', '人民幣貨幣市場',
  '歐元貨幣市場', '英鎊貨幣市場', '主題股票 - 電動汽車及未來移動', '目標期限美元債券', '目標期限新台幣債券', '印尼盧比債券',
  '其他房地產股票', '其他股票', '美元地方政府債券', '美元非投資等級 (高收益) 債券', '美元靈活混合型 - 美國',
  '歐元非投資等級 (高收益) 債券', '歐洲非投資等級 (高收益) 債券', '環球伊斯蘭債券 美元', '環球非投資等級 (高收益) 債券 (當地貨幣)',
  '環球非投資等級 (高收益) 債券 美元', '環球非投資等級 (高收益) 債券 歐元'
];

// 計價幣別（5.0 spec §基金選擇頁新增）
// 固定呈現完整清單與順序；即使 demo 資料暫無對應基金，也保留篩選標籤。
export const FUND_PRICING_CCY = [
  '台幣', '美元', '南非幣', '澳幣', '人民幣', '歐元', '日圓',
  '加幣', '英鎊', '紐幣', '港幣', '新加坡幣', '瑞士法郎', '瑞典幣'
];

export const PRICING_CCY_DOMESTIC = FUND_PRICING_CCY;
export const PRICING_CCY_FOREIGN = FUND_PRICING_CCY;

export function pricingCurrenciesByDomiciles(domiciles: Array<'境內' | '境外'>): string[] {
  const showDomestic = domiciles.length === 0 || domiciles.includes('境內');
  const showForeign = domiciles.length === 0 || domiciles.includes('境外');
  const merged: string[] = [];
  if (showDomestic) PRICING_CCY_DOMESTIC.forEach(c => merged.includes(c) || merged.push(c));
  if (showForeign) PRICING_CCY_FOREIGN.forEach(c => merged.includes(c) || merged.push(c));
  return merged;
}
