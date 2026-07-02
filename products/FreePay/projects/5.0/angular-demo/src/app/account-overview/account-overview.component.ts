import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  OV_FUNDS, MOCK_ALT_ORDERS, MOCK_CHG_ORDERS, MOCK_RDM_ORDERS, MOCK_PROFITS, ALL_CHANGE_LOGS,
  OvSummary, OvFund, OvContract, AltOrder, ProfitRecord, DetailTxRecord, DetailChgRecord, ChangeLogRecord, DETAIL_TX_DETAIL
} from '../mock-data/overview';

type OvTab = 'overview' | 'order' | 'profit' | 'change';
type OrderFilter = 'all' | 'alt' | 'chg' | 'rdm';
type DetailTxType = 'all' | 'A' | 'R' | 'RDM';
type DetailTimeType = '3M' | '6M' | '1Y' | 'YTD' | 'ALL' | 'CUSTOM';
type ChangeSortKey = 'code' | 'effectDate' | 'ccy' | 'tradeType' | 'before' | 'after';
type FundSortKey = 'name' | 'ccy' | 'market' | 'profit' | 'retWith' | 'pay' | 'cost' | 'paid' | 'retWithout';
type SettingsEditView = 'single' | 'expanded';
type ExpandedSettingStep = 'edit' | 'confirm' | 'done';
type PayEditMode = 'amount' | 'ratio';
type ThresholdEditMode = 'none' | 'protect' | 'unlock';

interface SettingDraft {
  fpNo: string;
  payActive: boolean;
  payMode: PayEditMode;
  monthlyPay: number;
  annualRate: number;
  payDay: number;
  thresholdMode: ThresholdEditMode;
  thresholdValue: number;
}

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
  readonly changeLogs = ALL_CHANGE_LOGS;
  readonly dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly protectThresholdOptions = [95, 90, 80];
  readonly unlockThresholdOptions = [105, 110, 120];
  readonly expandedSettingSteps = [
    { key: 'edit' as ExpandedSettingStep, label: '設定' },
    { key: 'confirm' as ExpandedSettingStep, label: '確認' },
    { key: 'done' as ExpandedSettingStep, label: '完成' },
  ];
  changeSearch = '';
  changeView: 'history' | 'settings' = 'settings';
  settingsEditView: SettingsEditView = 'single';
  expandedSettingStep: ExpandedSettingStep = 'edit';
  expandedSettingAgreedTerms = false;
  expandedSettingPwd = '';
  expandedSettingPwdVisible = false;
  changeSortKey: ChangeSortKey = 'effectDate';
  changeSortDesc = true;

  // 明細排序（桌機表頭 + 手機面板）；預設 null = 首次交易日自然序（陣列舊→新）
  fundSortKey: FundSortKey | null = null;
  fundSortDesc = true;

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
      if (tab === 'overview' || tab === 'order' || tab === 'profit' || tab === 'change') {
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

  get overviewNotes(): string[] {
    return [
      '約當市值 = 單位數 × 最新淨值 × 參考匯率，僅供參考，實際金額以基金公司回覆為準。',
      '投資組合損益與報酬率為試算資料，若資料不符，仍以交易平台與集保紀錄為準。',
      '觸發門檻依 Pay 出基準日前一日最新市值判斷；市值守護為低於門檻暫停 Pay 出，增值啟動為超過門檻開始 Pay 出。'
    ];
  }

  get orderNotes(): string[] {
    return [
      '當日申購、加碼委託可於 13:00 前取消；逾時則視為次一營業日交易。',
      '當日異動、贖回委託可於 14:00 前取消；逾時則視為次一營業日交易。',
      '委託狀態以交易平台實際處理結果為準。'
    ];
  }

  get profitNotes(): string[] {
    return [
      '已實現損益為已完成贖回或 Pay 出交易後之試算結果。',
      '含 Pay 報酬率已納入已 Pay 金額；不含 Pay 報酬率僅以贖回金額計算。',
      '外幣交易可能受匯率影響，實際損益仍以交易確認書與平台紀錄為準。'
    ];
  }

  expandedFundRows = new Set<string>();
  expandedSettingRows = new Set<string>();
  settingDrafts: Record<string, SettingDraft> = {};
  selectedOrders = new Set<string>();
  cancelPwd = '';
  cancelPwdVisible = false;

  detailFpNo: string | null = null;
  detailTxType: DetailTxType = 'all';
  detailTimeType: DetailTimeType = 'ALL';
  detailCustomStart: Date | null = null;
  detailCustomEnd: Date | null = null;

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

  // ── Profit ──

  get profitSummaryByCcy(): Array<{ ccy: string; paid: number; redeem: number; cost: number; profit: number; rate: number }> {
    const grouped = new Map<string, { ccy: string; paid: number; redeem: number; cost: number; profit: number; rate: number }>();
    for (const row of this.allProfits) {
      const item = grouped.get(row.ccy) ?? { ccy: this.ccyText(row.ccy), paid: 0, redeem: 0, cost: 0, profit: 0, rate: 0 };
      item.paid += row.totalPaid;
      item.redeem += row.redeemAmount;
      item.cost += row.cost;
      item.profit += row.profit;
      item.rate = item.cost ? (item.profit / item.cost) * 100 : 0;
      grouped.set(row.ccy, item);
    }
    return Array.from(grouped.values());
  }

  // 已實現損益外層：每契約一行（一基金一交易幣一契約），依贖回日倒序
  get profitRows(): ProfitRecord[] {
    return [...this.allProfits].sort((a, b) => b.redeemDate.localeCompare(a.redeemDate));
  }

  expandedProfitRows = new Set<string>();

  isProfitExpanded(id: string): boolean {
    return this.expandedProfitRows.has(id);
  }

  toggleProfitRow(id: string): void {
    this.expandedProfitRows.has(id) ? this.expandedProfitRows.delete(id) : this.expandedProfitRows.add(id);
  }

  // 設定調整：可異動契約（庫存>0），聚焦設定欄位
  get settingsFunds(): OvFund[] {
    return this.funds.filter(f => f.contracts[0] && f.contracts[0].marketUnits > 0);
  }

  get modifiedSettingDrafts(): Array<{ fund: OvFund; draft: SettingDraft; contract: OvContract }> {
    const rows: Array<{ fund: OvFund; draft: SettingDraft; contract: OvContract }> = [];
    for (const fund of this.settingsFunds) {
      const contract = fund.contracts[0];
      const draft = this.settingDraftOf(contract);
      if (this.isSettingDraftModified(contract, draft)) rows.push({ fund, draft, contract });
    }
    return rows;
  }

  get modifiedSettingCount(): number {
    return this.modifiedSettingDrafts.length;
  }

  get hasInvalidSettingDraft(): boolean {
    return Object.values(this.settingDrafts).some(draft => this.settingDraftError(draft) !== '');
  }

  get canSubmitExpandedSettings(): boolean {
    return this.modifiedSettingCount > 0 && !this.hasInvalidSettingDraft;
  }

  get expandedSettingSubmitDisabled(): boolean {
    return this.modifiedSettingCount === 0 || !this.expandedSettingAgreedTerms || this.expandedSettingPwd.trim() === '';
  }

  get expandedSettingSubmitHint(): string {
    if (!this.expandedSettingAgreedTerms) return '請勾選同意服務條款';
    if (this.expandedSettingPwd.trim() === '') return '請輸入交易密碼';
    return '';
  }

  get expandedSettingStepIndex(): number {
    return this.expandedSettingSteps.findIndex(step => step.key === this.expandedSettingStep);
  }

  get expandedSettingLastStepIndex(): number {
    return this.expandedSettingSteps.length - 1;
  }

  isSettingExpanded(id: string): boolean {
    return this.expandedSettingRows.has(id);
  }

  get allSettingRowsExpanded(): boolean {
    return this.settingsFunds.length > 0 && this.settingsFunds.every(fund => this.expandedSettingRows.has(fund.id));
  }

  toggleSettingRow(id: string): void {
    this.expandedSettingRows.has(id) ? this.expandedSettingRows.delete(id) : this.expandedSettingRows.add(id);
  }

  toggleAllSettingRows(): void {
    this.expandedSettingRows = this.allSettingRowsExpanded
      ? new Set<string>()
      : new Set(this.settingsFunds.map(fund => fund.id));
  }

  settingDraftOf(contract: OvContract): SettingDraft {
    if (!this.settingDrafts[contract.fpNo]) {
      this.settingDrafts[contract.fpNo] = this.buildSettingDraft(contract);
    }
    return this.settingDrafts[contract.fpNo];
  }

  resetSettingDraft(contract: OvContract): void {
    this.settingDrafts[contract.fpNo] = this.buildSettingDraft(contract);
  }

  clearAllSettingDrafts(): void {
    this.settingDrafts = {};
  }

  setDraftPayMode(draft: SettingDraft, mode: PayEditMode): void {
    draft.payMode = mode;
    draft.payActive = true;
  }

  setDraftThresholdMode(draft: SettingDraft, mode: ThresholdEditMode): void {
    draft.thresholdMode = mode;
    if (mode === 'protect' && (draft.thresholdValue < 70 || draft.thresholdValue > 100)) draft.thresholdValue = 80;
    if (mode === 'unlock' && (draft.thresholdValue < 101 || draft.thresholdValue > 200)) draft.thresholdValue = 110;
  }

  toggleDraftThreshold(draft: SettingDraft, enabled: boolean): void {
    this.setDraftThresholdMode(draft, enabled ? 'protect' : 'none');
  }

  pickDraftDate(draft: SettingDraft, day: number): void {
    draft.payDay = day;
  }

  setDraftThresholdValue(draft: SettingDraft, value: number): void {
    draft.thresholdValue = value;
  }

  selectDraftCustomThreshold(draft: SettingDraft): void {
    if (draft.thresholdMode === 'protect') draft.thresholdValue = 70;
    if (draft.thresholdMode === 'unlock') draft.thresholdValue = 101;
  }

  draftThresholdCustomActive(draft: SettingDraft): boolean {
    if (draft.thresholdMode === 'protect') return !this.protectThresholdOptions.includes(Number(draft.thresholdValue));
    if (draft.thresholdMode === 'unlock') return !this.unlockThresholdOptions.includes(Number(draft.thresholdValue));
    return false;
  }

  draftRatioSliderProgress(draft: SettingDraft): number {
    const ratio = Math.min(15, Math.max(1, Number(draft.annualRate || 1)));
    return ((ratio - 1) / 14) * 100;
  }

  settingDraftError(draft: SettingDraft): string {
    return this.settingMonthlyPayError(draft)
      || this.settingAnnualRateError(draft)
      || this.settingPayDayError(draft)
      || this.settingThresholdError(draft);
  }

  settingMonthlyPayError(draft: SettingDraft): string {
    if (!draft.payActive || draft.payMode !== 'amount') return '';
    return !Number.isFinite(Number(draft.monthlyPay)) || Number(draft.monthlyPay) < 1
      ? '請輸入月 Pay 金額'
      : '';
  }

  settingAnnualRateError(draft: SettingDraft): string {
    if (!draft.payActive || draft.payMode !== 'ratio') return '';
    return !Number.isFinite(Number(draft.annualRate)) || Number(draft.annualRate) < 1 || Number(draft.annualRate) > 15
      ? '年化 Pay 比例需為 1%–15%'
      : '';
  }

  settingPayDayError(draft: SettingDraft): string {
    if (!draft.payActive) return '';
    return !Number.isFinite(Number(draft.payDay)) || Number(draft.payDay) < 1 || Number(draft.payDay) > 31
      ? '基準日需為 1–31 日'
      : '';
  }

  settingThresholdError(draft: SettingDraft): string {
    if (!draft.payActive) return '';
    if (draft.thresholdMode === 'protect' && (Number(draft.thresholdValue) < 70 || Number(draft.thresholdValue) > 100)) {
      return '市值守護門檻需為 70%–100%';
    }
    if (draft.thresholdMode === 'unlock' && (Number(draft.thresholdValue) < 101 || Number(draft.thresholdValue) > 200)) {
      return '增值啟動門檻需為 101%–200%';
    }
    return '';
  }

  isSettingDraftModified(contract: OvContract, draft: SettingDraft = this.settingDraftOf(contract)): boolean {
    return this.expandedSettingSummary(contract) !== this.draftSettingSummary(draft)
      || contract.threshold !== this.draftThresholdSummary(draft);
  }

  expandedSettingSummary(contract: OvContract): string {
    return `${this.payMethodText(contract)}・${this.fmtN(contract.pay)}・${this.payDayText(contract)}`;
  }

  draftSettingSummary(draft: SettingDraft): string {
    if (!draft.payActive) return '暫停';
    const method = draft.payMode === 'ratio' ? `依比例 ${this.fmtRate(Number(draft.annualRate))}` : '依金額';
    const value = draft.payMode === 'ratio' ? this.estimatedMonthlyPay(draft) : this.fmtN(Number(draft.monthlyPay));
    return `${method}・${value}・${Number(draft.payDay)}日`;
  }

  draftThresholdSummary(draft: SettingDraft): string {
    if (draft.thresholdMode === 'protect') return `市值低於投入成本 ${this.fmtRate(Number(draft.thresholdValue))} 暫停Pay出`;
    if (draft.thresholdMode === 'unlock') return `市值超過成本 ${this.fmtRate(Number(draft.thresholdValue))} 開始Pay出`;
    return '不設門檻';
  }

  estimatedMonthlyPay(draft: SettingDraft): string {
    const fund = this.settingsFunds.find(f => f.contracts[0]?.fpNo === draft.fpNo);
    const cost = fund?.contracts[0]?.cost ?? 0;
    const amount = Math.round(cost * Number(draft.annualRate || 0) / 100 / 12);
    return this.fmtN(amount);
  }

  openExpandedSettingsConfirm(): void {
    if (!this.canSubmitExpandedSettings) return;
    this.expandedSettingStep = 'confirm';
    this.expandedSettingAgreedTerms = false;
    this.expandedSettingPwd = '';
    this.expandedSettingPwdVisible = false;
  }

  backToExpandedSettingEdit(): void {
    this.expandedSettingStep = 'edit';
  }

  submitExpandedSettings(): void {
    if (this.expandedSettingSubmitDisabled) return;
    this.expandedSettingStep = 'done';
  }

  queryTrade(): void {
    this.activeTab = 'order';
    this.orderFilter = 'chg';
  }

  resetExpandedSettingFlow(): void {
    this.expandedSettingStep = 'edit';
    this.expandedSettingAgreedTerms = false;
    this.expandedSettingPwd = '';
    this.expandedSettingPwdVisible = false;
    this.clearAllSettingDrafts();
  }

  setExpandedSettingStep(step: ExpandedSettingStep): void {
    if (step === 'edit') {
      this.backToExpandedSettingEdit();
      return;
    }
    if (step === 'confirm' && this.canSubmitExpandedSettings) {
      this.openExpandedSettingsConfirm();
    }
  }

  onExpandedSettingStepperChange(index: number): void {
    const step = this.expandedSettingSteps[index];
    if (!step) return;
    this.setExpandedSettingStep(step.key);
  }

  trackExpandedSettingStep(_: number, step: { key: ExpandedSettingStep }): string {
    return step.key;
  }

  settingChangeItems(contract: OvContract, draft: SettingDraft): Array<{ label: string; before: string; after: string }> {
    const original = this.buildSettingDraft(contract);
    const items: Array<{ label: string; before: string; after: string }> = [];
    if (original.payActive !== draft.payActive) {
      items.push({ label: 'Pay 出狀態', before: this.payActiveText(original.payActive), after: this.payActiveText(draft.payActive) });
    }
    if (!draft.payActive) return items;
    if (original.payMode !== draft.payMode) {
      items.push({ label: 'Pay 出方式', before: this.payEditModeText(original.payMode), after: this.payEditModeText(draft.payMode) });
    }
    if (draft.payMode === 'amount' && Number(original.monthlyPay) !== Number(draft.monthlyPay)) {
      items.push({ label: '每月 Pay 金額', before: this.fmtN(original.monthlyPay), after: this.fmtN(Number(draft.monthlyPay)) });
    }
    if (draft.payMode === 'ratio' && Number(original.annualRate) !== Number(draft.annualRate)) {
      items.push({ label: '年化 Pay 比例', before: this.fmtRate(original.annualRate), after: this.fmtRate(Number(draft.annualRate)) });
    }
    if (Number(original.payDay) !== Number(draft.payDay)) {
      items.push({ label: '自由 Pay 基準日', before: `${original.payDay}日`, after: `${Number(draft.payDay)}日` });
    }
    if (original.thresholdMode !== draft.thresholdMode) {
      items.push({ label: '觸發門檻', before: this.thresholdEditModeText(original.thresholdMode), after: this.thresholdEditModeText(draft.thresholdMode) });
    }
    if (draft.thresholdMode !== 'none' && Number(original.thresholdValue) !== Number(draft.thresholdValue)) {
      items.push({ label: this.thresholdEditModeText(draft.thresholdMode), before: this.fmtRate(original.thresholdValue), after: this.fmtRate(Number(draft.thresholdValue)) });
    }
    return items;
  }

  private payActiveText(active: boolean): string {
    return active ? '啟用' : '停用';
  }

  private payEditModeText(mode: PayEditMode): string {
    return mode === 'ratio' ? '依比例' : '依金額';
  }

  private thresholdEditModeText(mode: ThresholdEditMode): string {
    if (mode === 'protect') return '市值守護';
    if (mode === 'unlock') return '增值啟動';
    return '不設門檻';
  }

  // ── 異動紀錄：基金搜尋 + 每欄排序 ──
  get filteredChangeLogs(): ChangeLogRecord[] {
    const kw = this.changeSearch.trim().toLowerCase();
    const arr = kw
      ? this.changeLogs.filter(r => r.fund.toLowerCase().includes(kw) || r.code.toLowerCase().includes(kw))
      : this.changeLogs;
    const dir = this.changeSortDesc ? -1 : 1;
    return [...arr].sort((a, b) =>
      this.changeFieldValue(a, this.changeSortKey).localeCompare(this.changeFieldValue(b, this.changeSortKey)) * dir
    );
  }

  setChangeSort(key: ChangeSortKey): void {
    if (this.changeSortKey === key) this.changeSortDesc = !this.changeSortDesc;
    else { this.changeSortKey = key; this.changeSortDesc = true; }
  }

  // 手機版卡片折疊：收合僅顯示代碼／名稱／生效日，點卡片展開其餘欄位
  expandedChangeRows = new Set<string>();
  isChangeExpanded(id: string): boolean { return this.expandedChangeRows.has(id); }
  toggleChangeRow(id: string): void {
    this.expandedChangeRows.has(id) ? this.expandedChangeRows.delete(id) : this.expandedChangeRows.add(id);
  }

  changeSortIcon(key: ChangeSortKey): string {
    return this.changeSortKey === key && !this.changeSortDesc ? 'bi-caret-up-fill' : 'bi-caret-down-fill';
  }

  // ── 明細：每欄排序（桌機表頭點擊；同 key 再點切換升降）──
  get sortedFunds(): OvFund[] {
    if (!this.fundSortKey) return this.funds;
    const key = this.fundSortKey;
    const dir = this.fundSortDesc ? -1 : 1;
    return [...this.funds].sort((a, b) => {
      const va = this.fundFieldValue(a, key);
      const vb = this.fundFieldValue(b, key);
      return (typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb))) * dir;
    });
  }

  setFundSort(key: FundSortKey): void {
    if (this.fundSortKey === key) this.fundSortDesc = !this.fundSortDesc;
    else { this.fundSortKey = key; this.fundSortDesc = true; }
  }

  fundSortIcon(key: FundSortKey): string {
    return this.fundSortKey === key && !this.fundSortDesc ? 'bi-caret-up-fill' : 'bi-caret-down-fill';
  }

  private fundFieldValue(f: OvFund, key: FundSortKey): number | string {
    switch (key) {
      case 'name':       return f.name;
      case 'ccy':        return f.txCcy;
      case 'market':     return f.market;
      case 'profit':     return f.profit;
      case 'retWith':    return this.returnWithPay(f);
      case 'pay':        return f.pay;
      case 'cost':       return f.cost;
      case 'paid':       return f.paid;
      case 'retWithout': return this.returnWithoutPay(f);
    }
  }

  // 明細手機排序面板（複用全域 .ds-sort-* 殼）
  fundSortPanelOpen = false;
  pendingFundSortKey: FundSortKey = 'market';
  pendingFundSortDesc = true;
  readonly fundSortOptions: { key: FundSortKey; label: string }[] = [
    { key: 'name', label: '基金名稱' },
    { key: 'ccy', label: '交易/計價幣別' },
    { key: 'market', label: '約當市值' },
    { key: 'profit', label: '持有損益' },
    { key: 'retWith', label: '含 Pay 報酬率' },
    { key: 'pay', label: '月 Pay 金額' },
    { key: 'cost', label: '投入成本' },
    { key: 'paid', label: '已 Pay 金額' },
    { key: 'retWithout', label: '不含 Pay 報酬率' },
  ];

  openFundSortPanel(): void {
    this.pendingFundSortKey = this.fundSortKey ?? 'market';
    this.pendingFundSortDesc = this.fundSortDesc;
    this.fundSortPanelOpen = true;
  }
  closeFundSortPanel(): void { this.fundSortPanelOpen = false; }
  selectPendingFundSort(key: FundSortKey): void {
    if (this.pendingFundSortKey === key) this.pendingFundSortDesc = !this.pendingFundSortDesc;
    else { this.pendingFundSortKey = key; this.pendingFundSortDesc = true; }
  }
  togglePendingFundSortDir(): void { this.pendingFundSortDesc = !this.pendingFundSortDesc; }
  applyFundSort(): void {
    this.fundSortKey = this.pendingFundSortKey;
    this.fundSortDesc = this.pendingFundSortDesc;
    this.fundSortPanelOpen = false;
  }
  trackByFundSortKey(_: number, opt: { key: FundSortKey }): string { return opt.key; }

  private changeFieldValue(r: ChangeLogRecord, key: ChangeSortKey): string {
    switch (key) {
      case 'code':       return r.code;
      case 'effectDate': return r.tDate;
      case 'ccy':        return r.ccy;
      case 'tradeType':  return this.chgTypeText(r.tradeType);
      case 'before':     return this.fmtChgBefore(r);
      case 'after':      return this.fmtChgAfter(r);
    }
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

  // ── 契約提醒（spec §7.1）：月 Pay 金額旁，點 icon 展開文案 ──
  openAlertFunds = new Set<string>();

  isAlertOpen(id: string): boolean {
    return this.openAlertFunds.has(id);
  }

  toggleAlert(id: string): void {
    const isOpen = this.openAlertFunds.has(id);
    this.openAlertFunds.clear();          // 一次只開一個
    if (!isOpen) this.openAlertFunds.add(id);
  }

  // 點浮層以外任意處自動關閉（.ov-alert 內點擊已 stopPropagation，不會觸發此處）
  @HostListener('document:click')
  closeAlertsOnOutsideClick(): void {
    if (this.openAlertFunds.size) this.openAlertFunds.clear();
  }

  // 契約提醒（spec §7.1）：靜態 mock，建構時一次算好，避免每次變更偵測重建陣列
  private readonly contractAlertMap = new Map<string, string[]>(
    this.funds.map(f => [f.id, this.buildContractAlerts(f.contracts[0])])
  );

  hasContractAlert(f: OvFund): boolean {
    return this.alertsOf(f.id).length > 0;
  }

  alertsOf(id: string): string[] {
    return this.contractAlertMap.get(id) ?? [];
  }

  private buildContractAlerts(c: OvContract): string[] {
    const msgs: string[] = [];
    if (c.payRateAlert) {
      const rate = c.cost ? (c.pay * 12 / c.cost) * 100 : 0;
      msgs.push(`此契約年化提領率達 ${this.fmtRate(rate)}，高於 15%，建議調整 Pay 金額。`);
    }
    if (c.payPaused) {
      msgs.push(c.payPausedMode === 'unlock'
        ? '未達增值啟動門檻，本月暫停 Pay。'
        : '市值守護已觸發，本月暫停 Pay。');
    }
    return msgs;
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

  // 百分比：千分位、最多 2 位、不補零（平台通規 §4.4）
  fmtRate(n: number): string {
    return `${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
  }

  ccyText(code: string): string {
    const names: Record<string, string> = { TWD: '台幣', USD: '美元', JPY: '日圓' };
    return names[code] ?? code;
  }

  fmtOrderPaySetting(item: AltOrder): string {
    if (item.payType === 'P') return `依比例・${this.fmtRate(item.payRate)}・${item.rdmDay}日`;
    return `依金額・${this.fmtN(item.rdmAmt)}・${item.rdmDay}日`;
  }

  fmtOrderPayMethod(item: AltOrder): string {
    if (item.payType === 'P') return `依比例 ${this.fmtRate(item.payRate)}`;
    return `依金額 ${this.fmtN(item.rdmAmt)}`;
  }

  fmtOrderPayDay(item: AltOrder): string {
    return `每月 ${item.rdmDay} 日`;
  }

  fmtLimitMode(limitMode: string, limitVal: number | null): string {
    if (limitMode === 'protect') return `市值低於投入成本 ${this.fmtRate(limitVal ?? 0)} 暫停Pay出`;
    if (limitMode === 'unlock') return `市值超過成本 ${this.fmtRate(limitVal ?? 0)} 開始Pay出`;
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
    this.detailTimeType = 'ALL';
    this.detailCustomStart = null;
    this.detailCustomEnd = null;
  }

  closeDetail(): void {
    this.detailFpNo = null;
  }

  get detailFund(): { name: string; code: string; txCcy: string } | null {
    if (!this.detailFpNo) return null;
    const held = this.funds.find(f => f.contracts.some(c => c.fpNo === this.detailFpNo));
    if (held) return held;
    // 已實現損益契約（已贖回、不在持倉）：fallback 到損益資料
    const p = this.allProfits.find(r => r.fpNo === this.detailFpNo);
    return p ? { name: p.fund, code: p.code, txCcy: this.ccyText(p.ccy) } : null;
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
    return t === 'A' ? '申購' : t === 'R' ? 'Pay出' : t === 'RDM' ? '贖回' : t;
  }

  chgTypeText(t: string): string {
    const map: Record<string, string> = {
      TAP: 'Pay方式', AL: 'Pay金額', P: 'Pay比例', D: '扣款日期', DL: '觸發門檻'
    };
    return map[t] ?? t;
  }

  private fmtPayType(type: string, amt: number, rate: number): string {
    return type === 'P' ? `依比例・${this.fmtRate(rate)}` : `依金額・${this.fmtN(amt)}`;
  }

  fmtChgBefore(r: DetailChgRecord): string {
    switch (r.tradeType) {
      case 'TAP': return this.fmtPayType(r.orgPayType, r.orgRDMAmt, r.orgPayRate);
      case 'AL':  return this.fmtN(r.orgRDMAmt);
      case 'P':   return this.fmtRate(r.orgPayRate);
      case 'D':   return `${r.orgRDMDay}日`;
      case 'DL':  return this.fmtLimitMode(r.orgLimitMode, r.orgLimitVal);
      default:    return '-';
    }
  }

  fmtChgAfter(r: DetailChgRecord): string {
    switch (r.tradeType) {
      case 'TAP': return this.fmtPayType(r.payType, r.rdmAmt, r.payRate);
      case 'AL':  return this.fmtN(r.rdmAmt);
      case 'P':   return this.fmtRate(r.payRate);
      case 'D':   return `${r.rdmDay}日`;
      case 'DL':  return this.fmtLimitMode(r.limitMode, r.limitVal);
      default:    return '-';
    }
  }

  private buildSettingDraft(contract: OvContract): SettingDraft {
    const payMode: PayEditMode = contract.setting.includes('依比例') ? 'ratio' : 'amount';
    const rateMatch = contract.setting.match(/(\d+(?:\.\d+)?)%/);
    const dayMatch = contract.setting.match(/(\d+)日/);
    const thresholdMatch = contract.threshold.match(/(\d+(?:\.\d+)?)%/);
    const thresholdMode: ThresholdEditMode = contract.threshold.includes('市值低於')
      ? 'protect'
      : contract.threshold.includes('市值超過')
        ? 'unlock'
        : 'none';

    return {
      fpNo: contract.fpNo,
      payActive: true,
      payMode,
      monthlyPay: contract.pay,
      annualRate: payMode === 'ratio' ? Number(rateMatch?.[1] ?? 1) : 1,
      payDay: Number(dayMatch?.[1] ?? 15),
      thresholdMode,
      thresholdValue: thresholdMode === 'none' ? 0 : Number(thresholdMatch?.[1] ?? (thresholdMode === 'protect' ? 80 : 110)),
    };
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
  trackByFund(_: number, item: { id: string }): string { return item.id; }
  trackByCode(_: number, item: { code: string; fund: string }): string { return item.code + item.fund; }
}
