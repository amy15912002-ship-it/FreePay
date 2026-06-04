import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  OV_FUNDS, MOCK_ALT_ORDERS, MOCK_CHG_ORDERS, MOCK_RDM_ORDERS, MOCK_PROFITS,
  OvSummary, OvFund, OvContract, AltOrder, ProfitRecord, DetailTxRecord, DetailChgRecord, DETAIL_TX_DETAIL, DETAIL_TX_CHANGE
} from '../mock-data/overview';

type OvTab = 'overview' | 'order' | 'profit';
type OrderFilter = 'all' | 'alt' | 'chg' | 'rdm';
type ProfitPeriod = '3M' | '6M' | '1Y' | 'YTD' | 'ALL' | 'CUSTOM';
type DetailTxType = 'all' | 'A' | 'R' | 'RDM';
type DetailChgType = 'all' | 'TAP' | 'AL' | 'P' | 'D' | 'DL';
type DetailTimeType = '3M' | '6M' | '1Y' | 'YTD' | 'ALL' | 'CUSTOM';

const REFERENCE_DATE = new Date('2026-05-12T00:00:00');

@Component({
  selector: 'fp-account-overview',
  templateUrl: './account-overview.component.html',
  styleUrls: ['./account-overview.component.scss']
})
export class AccountOverviewComponent implements OnInit, OnDestroy {
  readonly funds = OV_FUNDS;
  readonly altOrders = MOCK_ALT_ORDERS;
  readonly chgOrders = MOCK_CHG_ORDERS;
  readonly rdmOrders = MOCK_RDM_ORDERS;
  readonly allProfits = MOCK_PROFITS;

  sumCardIndex = 0;
  summaryDemoMode: 'multi' | 'single' = 'multi';

  private routeSub?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.queryParamMap.subscribe(query => {
      const tab = query.get('tab');
      if (tab === 'overview' || tab === 'order' || tab === 'profit') {
        this.activeTab = tab;
      }
      const order = query.get('order');
      if (order === 'all' || order === 'alt' || order === 'chg' || order === 'rdm') {
        this.orderFilter = order;
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  // 總覽摘要：由持有明細（funds）依交易幣別即時彙總，不另存一份
  get summaries(): OvSummary[] {
    const groups: OvSummary[] = [];
    for (const f of this.funds) {
      let g = groups.find(x => x.ccy === f.txCcy);
      if (!g) {
        g = { ccy: f.txCcy, pay: 0, paid: 0, market: 0, cost: 0, profit: 0, ret: 0 };
        groups.push(g);
      }
      g.pay += f.pay;
      g.paid += f.paid;
      g.market += f.market;
      g.cost += f.cost;
      g.profit += f.profit;
    }
    for (const g of groups) {
      g.ret = g.cost ? (g.profit / g.cost) * 100 : 0;
    }
    return groups;
  }

  get displaySummaries(): OvSummary[] {
    return this.summaryDemoMode === 'single' ? this.summaries.slice(0, 1) : this.summaries;
  }

  onSumScroll(el: HTMLElement): void {
    const index = Math.round(el.scrollLeft / el.clientWidth);
    this.sumCardIndex = Math.min(index, this.displaySummaries.length - 1);
  }

  activeTab: OvTab = 'overview';
  orderFilter: OrderFilter = 'all';
  profitPeriod: ProfitPeriod = '6M';
  profitCustomStart: Date | null = null;
  profitCustomEnd: Date | null = null;

  expandedFundRows = new Set<string>();
  selectedOrders = new Set<string>();
  cancelPwd = '';
  cancelPwdVisible = false;

  detailFpNo: string | null = null;
  detailTxType: DetailTxType = 'all';
  detailChgType: DetailChgType = 'all';
  detailTimeType: DetailTimeType = 'ALL';
  detailCustomStart: Date | null = null;
  detailCustomEnd: Date | null = null;
  marketInfoFund: OvFund | null = null;

  // ── Order filters ──

  get showAlt(): boolean { return this.orderFilter === 'all' || this.orderFilter === 'alt'; }
  get showChg(): boolean { return this.orderFilter === 'all' || this.orderFilter === 'chg'; }
  get showRdm(): boolean { return this.orderFilter === 'all' || this.orderFilter === 'rdm'; }

  // ── Order selection ──

  toggleOrder(id: string): void {
    this.selectedOrders.has(id) ? this.selectedOrders.delete(id) : this.selectedOrders.add(id);
  }

  isOrderSelected(id: string): boolean { return this.selectedOrders.has(id); }

  get selectedCount(): number { return this.selectedOrders.size; }

  get cancelDisabled(): boolean { return this.selectedCount === 0 || this.cancelPwd.trim() === ''; }

  submitCancel(): void {
    alert(`已送出 ${this.selectedCount} 筆取消委託（Demo 示意）`);
    this.selectedOrders.clear();
    this.cancelPwd = '';
  }

  // ── Profit filters ──

  get filteredProfits(): ProfitRecord[] {
    let start: Date, end: Date;
    if (this.profitPeriod === 'CUSTOM') {
      start = this.profitCustomStart ? this.startOfDay(this.profitCustomStart) : new Date(2000, 0, 1);
      end   = this.profitCustomEnd   ? this.endOfDay(this.profitCustomEnd) : REFERENCE_DATE;
    } else {
      end = REFERENCE_DATE;
      start = new Date(end);
      if (this.profitPeriod === '3M') start.setMonth(start.getMonth() - 3);
      else if (this.profitPeriod === '6M') start.setMonth(start.getMonth() - 6);
      else if (this.profitPeriod === '1Y') start.setFullYear(start.getFullYear() - 1);
      else if (this.profitPeriod === 'YTD') start = new Date(end.getFullYear(), 0, 1);
      else start.setFullYear(2000);
    }

    return this.allProfits.filter(item => {
      const d = new Date(item.redeemDate.replace(/\//g, '-') + 'T00:00:00');
      return d >= start && d <= end;
    });
  }

  get profitSummaryByCcy(): Array<{ ccy: string; paid: number; redeem: number; cost: number; profit: number; rate: number }> {
    return ['TWD', 'USD']
      .map(ccy => {
        const list = this.filteredProfits.filter(r => r.ccy === ccy);
        if (!list.length) return null;
        const cost   = list.reduce((s, r) => s + r.cost, 0);
        const redeem = list.reduce((s, r) => s + r.redeemAmount, 0);
        const paid   = list.reduce((s, r) => s + r.totalPaid, 0);
        const profit = list.reduce((s, r) => s + r.profit, 0);
        return { ccy: ccy === 'TWD' ? '台幣' : '美元', paid, redeem, cost, profit, rate: cost ? (profit / cost) * 100 : 0 };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }

  get profitGroupedByFund(): Array<{ code: string; fund: string; rows: ProfitRecord[] }> {
    const groups: Array<{ code: string; fund: string; rows: ProfitRecord[] }> = [];
    for (const item of this.filteredProfits) {
      let g = groups.find(g => g.code === item.code && g.fund === item.fund);
      if (!g) { g = { code: item.code, fund: item.fund, rows: [] }; groups.push(g); }
      g.rows.push(item);
    }
    return groups;
  }

  // ── Helpers ──

  ccyAccent(ccy: string): string {
    if (ccy === '台幣') return 'ccy-accent--primary';
    if (ccy === '美元') return 'ccy-accent--secondary';
    return 'ccy-accent--tertiary';
  }

  numClass(val: number): string {
    return val > 0 ? 'val-up' : val < 0 ? 'val-down' : '';
  }

  isFundExpanded(id: string): boolean {
    return this.expandedFundRows.has(id);
  }

  toggleFund(id: string): void {
    this.expandedFundRows.has(id) ? this.expandedFundRows.delete(id) : this.expandedFundRows.add(id);
  }

  returnWithPay(item: Pick<OvFund, 'cost' | 'profit' | 'paid'>): number {
    return item.cost ? ((item.profit + item.paid) / item.cost) * 100 : 0;
  }

  returnWithoutPay(item: Pick<OvFund, 'ret'>): number {
    return item.ret;
  }

  // 已實現損益：不含 Pay 報酬率 = (贖回金額 − 投入成本) / 投入成本 × 100
  profitReturnNoPay(item: Pick<ProfitRecord, 'cost' | 'redeemAmount'>): number {
    return item.cost ? ((item.redeemAmount - item.cost) / item.cost) * 100 : 0;
  }

  payMethodText(contract: OvContract): string {
    const [method, value] = contract.setting.split('・');
    return method === '依比例' && value ? `${method} ${value}` : method || contract.setting;
  }

  payDayText(contract: OvContract): string {
    const day = contract.setting.split('・').find(part => part.endsWith('日'));
    return day ?? '-';
  }

  fmtN(n: number): string { return Number(n || 0).toLocaleString('en-US'); }

  fmtSigned(n: number): string {
    return `${n < 0 ? '-' : ''}${Math.abs(n).toLocaleString('en-US')}`;
  }

  fmtRate(n: number): string {
    return `${n < 0 ? '-' : ''}${Math.abs(n).toFixed(2)}%`;
  }

  fmtUnits(n: number): string {
    return Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 4 });
  }

  fmtDecimal(n: number): string {
    return Number(n || 0).toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  }

  openMarketInfo(fund: OvFund | null, event?: Event): void {
    event?.stopPropagation();
    this.marketInfoFund = fund;
  }

  closeMarketInfo(): void {
    this.marketInfoFund = null;
  }

  get marketInfoContract(): OvContract | null {
    return this.marketInfoFund?.contracts[0] ?? null;
  }

  ccyText(code: string): string {
    const names: Record<string, string> = { TWD: '台幣', USD: '美元', JPY: '日幣' };
    return names[code] ?? code;
  }

  fmtOrderPaySetting(item: AltOrder): string {
    if (item.payType === 'P') return `依比例・${item.payRate}%・${item.rdmDay}日`;
    return `依金額・${Number(item.rdmAmt || 0).toLocaleString('en-US')}・${item.rdmDay}日`;
  }

  fmtOrderPayMethod(item: AltOrder): string {
    if (item.payType === 'P') return `依比例 ${item.payRate}%`;
    return `依金額 ${Number(item.rdmAmt || 0).toLocaleString('en-US')}`;
  }

  fmtOrderPayDay(item: AltOrder): string {
    return `每月 ${item.rdmDay} 日`;
  }

  fmtLimitMode(limitMode: string, limitVal: number | null): string {
    if (limitMode === 'protect') return `市值守護・低於投入成本 ${limitVal ?? 0}% 暫停`;
    if (limitMode === 'unlock') return `增值啟動・達投入成本 ${limitVal ?? 0}% 才 Pay`;
    return '不設門檻';
  }

  onAction(action: string, fpNo: string): void {
    const mode = action === '加碼' ? 'addOn' : action === '異動' ? 'modify' : action === '贖回' ? 'redeem' : null;
    if (mode) {
      const fund = this.funds.find(f => f.contracts.some(c => c.fpNo === fpNo));
      if (fund) {
        this.router.navigate(['/demo/flow'], { queryParams: { mode, fundId: fund.code, fpNo } });
        return;
      }
    }
    alert(`${action}（${fpNo}）Demo 示意`);
  }

  // ── Detail modal ──

  openDetail(fpNo: string): void {
    this.detailFpNo = fpNo;
    this.detailTxType = 'all';
    this.detailChgType = 'all';
    this.detailTimeType = 'ALL';
    this.detailCustomStart = null;
    this.detailCustomEnd = null;
  }

  closeDetail(): void {
    this.detailFpNo = null;
  }

  get detailFund() {
    if (!this.detailFpNo) return null;
    return this.funds.find(f => f.contracts.some(c => c.fpNo === this.detailFpNo)) ?? null;
  }

  get detailPanelTitle(): string {
    return this.detailFund?.name ?? '交易明細';
  }

  get detailPanelMeta(): string {
    const fund = this.detailFund;
    if (!fund) return this.detailFpNo ? `契約號 ${this.detailFpNo}` : '';
    return `${fund.code}・${fund.txCcy}`;
  }

  get detailTxRecords(): DetailTxRecord[] {
    if (!this.detailFpNo) return [];
    const all = DETAIL_TX_DETAIL[this.detailFpNo] ?? [];
    let start: Date, end: Date;
    if (this.detailTimeType === 'CUSTOM') {
      start = this.detailCustomStart ? this.startOfDay(this.detailCustomStart) : new Date(2000, 0, 1);
      end   = this.detailCustomEnd   ? this.endOfDay(this.detailCustomEnd) : REFERENCE_DATE;
    } else {
      end = REFERENCE_DATE;
      start = new Date(end);
      if (this.detailTimeType === '3M') start.setMonth(start.getMonth() - 3);
      else if (this.detailTimeType === '6M') start.setMonth(start.getMonth() - 6);
      else if (this.detailTimeType === '1Y') start.setFullYear(start.getFullYear() - 1);
      else if (this.detailTimeType === 'YTD') start = new Date(end.getFullYear(), 0, 1);
      else start.setFullYear(2000);
    }
    return all.filter(r => {
      const d = new Date(r.orderDate + 'T00:00:00');
      const typeOk = this.detailTxType === 'all' || r.tradeType === this.detailTxType;
      return typeOk && d >= start && d <= end;
    });
  }

  get detailChgRecords(): DetailChgRecord[] {
    if (!this.detailFpNo) return [];
    const all = DETAIL_TX_CHANGE[this.detailFpNo] ?? [];
    return all.filter(r => this.detailChgType === 'all' || r.tradeType === this.detailChgType);
  }

  fmtDate(d: string): string {
    return d.replace(/-/g, '/');
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  txTypeText(t: string): string {
    return t === 'A' ? '申購' : t === 'R' ? '自由Pay' : t === 'RDM' ? '贖回' : t;
  }

  chgTypeText(t: string): string {
    const map: Record<string, string> = {
      TAP: 'Pay方式', AL: 'Pay金額', P: 'Pay比例', D: '扣款日期', DL: '觸發門檻'
    };
    return map[t] ?? t;
  }

  private fmtPayType(type: string, amt: number, rate: number): string {
    return type === 'P' ? `依比例・${rate}%` : `依金額・${Number(amt).toLocaleString('en-US')}`;
  }

  fmtChgBefore(r: DetailChgRecord): string {
    switch (r.tradeType) {
      case 'TAP': return this.fmtPayType(r.orgPayType, r.orgRDMAmt, r.orgPayRate);
      case 'AL':  return Number(r.orgRDMAmt).toLocaleString('en-US');
      case 'P':   return `${r.orgPayRate}%`;
      case 'D':   return `${r.orgRDMDay}日`;
      case 'DL':  return this.fmtLimitMode(r.orgLimitMode, r.orgLimitVal);
      default:    return '-';
    }
  }

  fmtChgAfter(r: DetailChgRecord): string {
    switch (r.tradeType) {
      case 'TAP': return this.fmtPayType(r.payType, r.rdmAmt, r.payRate);
      case 'AL':  return Number(r.rdmAmt).toLocaleString('en-US');
      case 'P':   return `${r.payRate}%`;
      case 'D':   return `${r.rdmDay}日`;
      case 'DL':  return this.fmtLimitMode(r.limitMode, r.limitVal);
      default:    return '-';
    }
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
  trackByFund(_: number, item: { id: string }): string { return item.id; }
  trackByCode(_: number, item: { code: string; fund: string }): string { return item.code + item.fund; }
}
