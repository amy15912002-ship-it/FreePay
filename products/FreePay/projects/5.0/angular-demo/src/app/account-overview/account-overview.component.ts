import { Component } from '@angular/core';
import { SCENARIOS } from '../mock-data/scenarios';
import {
  OV_SUMMARIES, OV_FUNDS, MOCK_ALT_ORDERS, MOCK_CHG_ORDERS, MOCK_RDM_ORDERS, MOCK_PROFITS,
  AltOrder, ProfitRecord, DetailTxRecord, DetailChgRecord, DETAIL_TX_DETAIL, DETAIL_TX_CHANGE
} from '../mock-data/overview';

type OvTab = 'overview' | 'order' | 'profit';
type OrderFilter = 'all' | 'alt' | 'chg' | 'rdm';
type ProfitPeriod = '3M' | '6M' | '1Y' | 'ALL';
type ProfitCcy = 'all' | 'TWD' | 'USD';
type DetailTab = 'tx' | 'chg';
type DetailTxType = 'all' | 'A' | 'R';
type DetailChgType = 'all' | 'TAP' | 'AL' | 'P' | 'D' | 'DL';
type DetailTimeType = '3M' | '6M' | '1Y' | 'ALL';

const REFERENCE_DATE = new Date('2026-05-12T00:00:00');

@Component({
  selector: 'fp-account-overview',
  templateUrl: './account-overview.component.html',
  styleUrls: ['./account-overview.component.scss']
})
export class AccountOverviewComponent {
  readonly scenarios = SCENARIOS;
  readonly summaries = OV_SUMMARIES;
  readonly funds = OV_FUNDS;
  readonly altOrders = MOCK_ALT_ORDERS;
  readonly chgOrders = MOCK_CHG_ORDERS;
  readonly rdmOrders = MOCK_RDM_ORDERS;
  readonly allProfits = MOCK_PROFITS;

  activeTab: OvTab = 'overview';
  orderFilter: OrderFilter = 'all';
  profitPeriod: ProfitPeriod = '6M';
  profitCcy: ProfitCcy = 'all';

  expandedFunds = new Set<string>();
  selectedOrders = new Set<string>();
  cancelPwd = '';
  cancelPwdVisible = false;

  detailFpNo: string | null = null;
  detailTab: DetailTab = 'tx';
  detailTxType: DetailTxType = 'all';
  detailChgType: DetailChgType = 'all';
  detailTimeType: DetailTimeType = '6M';

  // ── Fund expand/collapse ──

  toggleFund(id: string): void {
    this.expandedFunds.has(id) ? this.expandedFunds.delete(id) : this.expandedFunds.add(id);
  }

  isFundExpanded(id: string): boolean {
    return this.expandedFunds.has(id);
  }

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
    const end = REFERENCE_DATE;
    const start = new Date(end);
    if (this.profitPeriod === '3M') start.setMonth(start.getMonth() - 3);
    else if (this.profitPeriod === '6M') start.setMonth(start.getMonth() - 6);
    else if (this.profitPeriod === '1Y') start.setFullYear(start.getFullYear() - 1);
    else start.setFullYear(2000);

    return this.allProfits.filter(item => {
      const d = new Date(item.redeemDate.replace(/\//g, '-') + 'T00:00:00');
      const ccyOk = this.profitCcy === 'all' || item.ccy === this.profitCcy;
      return ccyOk && d >= start && d <= end;
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

  rateClass(val: string): string {
    const n = parseFloat(String(val || '').replace(/[,%]/g, ''));
    if (!isFinite(n) || n === 0) return '';
    return n > 0 ? 'val-up' : 'val-down';
  }

  numClass(val: number): string {
    return val > 0 ? 'val-up' : val < 0 ? 'val-down' : '';
  }

  fmtN(n: number): string { return Number(n || 0).toLocaleString('en-US'); }

  fmtSigned(n: number): string {
    return `${n < 0 ? '-' : ''}${Math.abs(n).toLocaleString('en-US')}`;
  }

  fmtRate(n: number): string {
    return `${n < 0 ? '-' : ''}${Math.abs(n).toFixed(2)}%`;
  }

  ccyText(code: string): string {
    return code === 'TWD' ? '台幣' : code === 'USD' ? '美元' : code;
  }

  fmtOrderMoney(ccy: string, amount: number): string {
    return `${this.ccyText(ccy)} ${Number(amount || 0).toLocaleString('en-US')}`;
  }

  fmtOrderPaySetting(item: AltOrder): string {
    if (item.payType === 'P') return `依比例・${item.payRate}%・${item.rdmDay}日`;
    return `依金額・${this.fmtOrderMoney(item.ccy, item.rdmAmt)}・${item.rdmDay}日`;
  }

  fmtLimitMode(limitMode: string, limitVal: number | null): string {
    if (limitMode === 'neg') return `市值守護・跌${Math.abs(limitVal ?? 0)}%`;
    if (limitMode === 'pos') return `增值啟動・漲${limitVal ?? 0}%`;
    return '不設門檻';
  }

  onAction(action: string, fpNo: string): void {
    alert(`${action}（${fpNo}）Demo 示意`);
  }

  // ── Detail modal ──

  openDetail(fpNo: string): void {
    this.detailFpNo = fpNo;
    this.detailTab = 'tx';
    this.detailTxType = 'all';
    this.detailChgType = 'all';
    this.detailTimeType = '6M';
  }

  closeDetail(): void {
    this.detailFpNo = null;
  }

  onDetailTabChange(index: number): void {
    this.detailTab = index === 0 ? 'tx' : 'chg';
  }

  get detailTxRecords(): DetailTxRecord[] {
    if (!this.detailFpNo) return [];
    const all = DETAIL_TX_DETAIL[this.detailFpNo] ?? [];
    const end = REFERENCE_DATE;
    const start = new Date(end);
    if (this.detailTimeType === '3M') start.setMonth(start.getMonth() - 3);
    else if (this.detailTimeType === '6M') start.setMonth(start.getMonth() - 6);
    else if (this.detailTimeType === '1Y') start.setFullYear(start.getFullYear() - 1);
    else start.setFullYear(2000);
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

  fmtDetailAmt(ccy: string, amount: number): string {
    return `${ccy} ${Number(amount).toLocaleString('en-US')}`;
  }

  txTypeText(t: string): string {
    return t === 'A' ? '申購' : t === 'R' ? '自由Pay' : t;
  }

  chgTypeText(t: string): string {
    const map: Record<string, string> = {
      TAP: 'Pay方式', AL: 'Pay金額', P: 'Pay比例', D: '扣款日期', DL: '停Pay門檻'
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
