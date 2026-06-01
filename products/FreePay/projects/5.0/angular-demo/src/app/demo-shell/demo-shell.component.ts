import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Contract, CurrencyOption, DEMO_SCENARIOS, ScenarioData } from '../mock-data/scenarios';
import { findFund, Fund } from '../mock-data/funds';
import { HoldingContract, holdingsOfFund, PurchaseBatch, batchesOf } from '../mock-data/holdings';
import { FlowContext, isEntryMode } from '../mock-data/flow-context';

type DemoStep = 'settings' | 'confirm' | 'done';
type PayMode = 'amount' | 'ratio';
type ThresholdMode = 'protect' | 'unlock';
type PurchaseMode = 'addOn' | 'new' | null;
// 升級四：贖回方式（兩層 UI 第一層）
type RedeemMode = 'all' | 'batch' | null;

const DEFAULT_DEMO_SCENARIO = DEMO_SCENARIOS[0];
// Demo 固定參考日：避免短線判斷依賴系統時間（過 30 天後示意會失效）
const DEMO_TODAY = '2026/05/29';
const FUND_CURRENCY_CODE_MAP: Record<string, string> = {
  '台幣': 'TWD',
  '美元': 'USD',
  '日幣': 'JPY'
};

// 金額門檻表（spec.md §升級一）
//   new   = 首次申購最低（FreePay 特規）
//   addOn = 加碼最低（同平台通規 §9.1）
const MIN_AMOUNT_TABLE: Record<string, { new: number; addOn: number; name: string }> = {
  TWD: { new: 100000, addOn: 3000,  name: '台幣' },
  USD: { new: 3500,   addOn: 100,   name: '美元' },
  EUR: { new: 3000,   addOn: 100,   name: '歐元' },
  GBP: { new: 3000,   addOn: 100,   name: '英鎊' },
  CHF: { new: 3000,   addOn: 100,   name: '瑞士法郎' },
  AUD: { new: 5000,   addOn: 150,   name: '澳幣' },
  NZD: { new: 5000,   addOn: 150,   name: '紐幣' },
  CAD: { new: 5000,   addOn: 150,   name: '加幣' },
  SGD: { new: 5000,   addOn: 150,   name: '新幣' },
  CNY: { new: 30000,  addOn: 1000,  name: '人民幣' },
  HKD: { new: 30000,  addOn: 1000,  name: '港幣' },
  SEK: { new: 30000,  addOn: 1000,  name: '瑞典幣' },
  ZAR: { new: 50000,  addOn: 1500,  name: '南非幣' },
  JPY: { new: 500000, addOn: 10000, name: '日幣' }
};

@Component({
  selector: 'fp-demo-shell',
  templateUrl: './demo-shell.component.html',
  styleUrls: ['./demo-shell.component.scss']
})
export class DemoShellComponent implements OnInit, OnDestroy {
  scenario: ScenarioData | null = null;
  activeStep: DemoStep = 'settings';
  payMode: PayMode = 'amount';
  thresholdEnabled = false;
  thresholdMode: ThresholdMode = 'protect';
  thresholdValue = -20;
  payActive = true;
  agreedTerms = false;
  pwd = '';
  pwdVisible = false;
  payModeHintOpen = false;
  dateHintOpen = false;
  selectedContract: Contract | null = null;
  selectedCurrency: CurrencyOption | null = null;
  thresholdCustomActive = false;
  // 升級四：贖回兩層 UI 狀態
  redeemMode: RedeemMode = null;
  selectedBatchIds = new Set<string>();
  // 升級四方案 D：用戶明確確認接受月 Pay 自動調整
  acknowledgePayAdjustment = false;
  private addOnDirect = false;
  private flowContext: FlowContext = { mode: 'new', fundId: DEFAULT_DEMO_SCENARIO.fundId };

  readonly dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly protectThresholdOptions = [-5, -10, -15, -20];
  readonly unlockPresetThresholdOptions = [5, 10, 20];

  readonly form = this.fb.group({
    amount: [100000, this.numericAmountValidators(100000)],
    monthlyPay: [null as number | string | null, this.numericAmountValidators(1)],
    ratio: [null as number | null, [Validators.required, Validators.min(1), Validators.max(15)]],
    day: [15, [Validators.required]],
    thresholdCustom: [20, [
      Validators.required,
      Validators.min(1),
      Validators.max(100),
      Validators.pattern(/^[1-9][0-9]*$/)
    ]]
  });

  private routeSub?: Subscription;
  private amountSub?: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.applyPayModeValidators();
    this.amountSub = this.form.controls.amount.valueChanges.subscribe(() => {
      this.form.controls.monthlyPay.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.queryParamMap.subscribe(query => {
      const modeParam = query.get('mode');
      const fundIdParam = query.get('fundId');
      const fpNoParam = query.get('fpNo') ?? query.get('contractFpNo') ?? undefined;
      const ctx: FlowContext = {
        mode: isEntryMode(modeParam) ? modeParam : 'new',
        fundId: fundIdParam || DEFAULT_DEMO_SCENARIO.fundId,
        contractFpNo: fpNoParam
      };
      this.loadFlow(ctx);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.amountSub?.unsubscribe();
  }

  private loadFlow(ctx: FlowContext): void {
    const fund = findFund(ctx.fundId) ?? findFund(DEFAULT_DEMO_SCENARIO.fundId);
    if (!fund) return;

    this.flowContext = ctx;
    this.scenario = this.buildScenarioFromContext(ctx, fund, holdingsOfFund(fund.fundId));
    const addonContract = ctx.contractFpNo
      ? this.scenario.contracts.find(c => c.fpNo === ctx.contractFpNo) ?? null
      : null;
    this.addOnDirect = (ctx.mode === 'addOn' || ctx.mode === 'modify' || ctx.mode === 'redeem') && addonContract !== null;
    this.selectedCurrency = this.scenario.availableCurrencies[0] ?? null;

    if (this.addOnDirect && addonContract) {
      // 帳戶總覽指定契約直入：鎖定該筆契約，直接進設定/異動/贖回頁
      this.selectedContract = addonContract;
      this.selectedCurrency = this.scenario.availableCurrencies
        .find(c => c.currencyCode === addonContract.currencyCode) ?? this.selectedCurrency;
    } else {
      // 申購：一律直接進設定頁；多幣別時頂部切換器處理幣別選擇
      this.syncSelectedContractForCurrency();
    }
    // 無可選批次的贖回直接進確認頁（設定頁無事可做）
    this.activeStep = this.isRedeemMode && !this.hasSelectableBatch ? 'confirm' : 'settings';
    this.resetFormState();
    this.applySettingsForMode();
  }

  private buildScenarioFromContext(ctx: FlowContext, fund: Fund, holdings: HoldingContract[]): ScenarioData {
    const link = DEMO_SCENARIOS.find(item => item.mode === ctx.mode && item.fundId === fund.fundId)
      ?? DEMO_SCENARIOS.find(item => item.fundId === fund.fundId)
      ?? DEFAULT_DEMO_SCENARIO;
    return {
      id: link.id,
      label: link.label,
      fundId: fund.fundId,
      fundName: fund.name,
      tscd: fund.domicile,
      fundCurrency: fund.pricingCurrency,
      fundCurrencyCode: FUND_CURRENCY_CODE_MAP[fund.pricingCurrency] ?? 'TWD',
      availableCurrencies: fund.currencies.map(c => ({ currency: c.currency, currencyCode: c.currencyCode })),
      risk: fund.risk,
      hasExistingContracts: holdings.length > 0,
      contracts: holdings.map(c => this.toScenarioContract(c)),
      firstRdmDate: '2026/06/15',
      bank: '台新銀行',
      acc: '0123456789012'
    };
  }

  private toScenarioContract(c: HoldingContract): Contract {
    return {
      fpNo: c.fpNo,
      currencyCode: c.currencyCode,
      startDate: c.startDate,
      monthlyPay: c.monthlyPay,
      payMode: c.payMode,
      annualRate: c.annualRate || (c.costBasis ? Math.round((c.monthlyPay * 12 / c.costBasis) * 100) : 0),
      payDay: c.payDay,
      thresholdMode: c.thresholdMode,
      thresholdValue: c.thresholdValue,
      threshold: this.contractThresholdText(c),
      marketValue: c.marketValue,
      costBasis: c.costBasis,
      paidTotal: c.paidTotal
    };
  }

  private contractThresholdText(c: HoldingContract): string {
    if (c.thresholdMode === 'protect') return `市值守護・跌${Math.abs(c.thresholdValue)}%`;
    if (c.thresholdMode === 'unlock') return `增值啟動・漲${c.thresholdValue}%`;
    return '不設門檻';
  }

  get isAddOnMode(): boolean {
    // 5.0 起：模式由「該幣別是否有既有契約」自動判斷
    if (this.flowContext.mode === 'addOn') return true;
    if (this.flowContext.mode === 'modify' || this.flowContext.mode === 'redeem') return false;
    return this.hasContractForSelectedCurrency;
  }

  get isModifyMode(): boolean {
    return this.flowContext.mode === 'modify';
  }

  get isRedeemMode(): boolean {
    return this.flowContext.mode === 'redeem';
  }

  get isMultiCurrency(): boolean {
    return (this.scenario?.availableCurrencies.length ?? 0) > 1;
  }

  get contractForSelectedCurrency(): Contract | null {
    // 5.0 起：同基金同幣別僅一筆契約
    return (this.scenario?.contracts ?? []).find(c => c.currencyCode === this.selectedCurrency?.currencyCode) ?? null;
  }

  get hasContractForSelectedCurrency(): boolean {
    return this.contractForSelectedCurrency !== null;
  }

  // 無可選批次的贖回 → 設定頁無任何可操作項（指定贖回不可行動），跳過設定頁直接進確認
  get redeemSkipsSettings(): boolean {
    return this.isRedeemMode && !this.hasSelectableBatch;
  }

  get steps(): Array<{ key: DemoStep; label: string; description: string }> {
    if (this.isRedeemMode) {
      if (this.redeemSkipsSettings) {
        return [
          { key: 'confirm', label: '確認送出', description: '確認試算與送出' },
          { key: 'done', label: '完成', description: '委託完成' }
        ];
      }
      return [
        { key: 'settings', label: '贖回設定', description: '選擇贖回方式' },
        { key: 'confirm', label: '確認送出', description: '確認試算與送出' },
        { key: 'done', label: '完成', description: '委託完成' }
      ];
    }
    return [
      { key: 'settings', label: '申購設定', description: '金額、Pay 設定' },
      { key: 'confirm', label: '確認送出', description: '確認摘要並送出' },
      { key: 'done', label: '完成', description: '委託完成' }
    ];
  }

  get stepIndex(): number {
    return this.steps.findIndex(step => step.key === this.activeStep);
  }

  get lastStepIndex(): number {
    return this.steps.length - 1;
  }

  get amountSectionTitle(): string {
    return this.isAddOnMode ? '加碼金額' : '單筆申購金額';
  }

  get transactionTypeLabel(): string {
    if (this.isRedeemMode) return '贖回';
    if (this.isModifyMode) return '異動設定';
    return this.isAddOnMode ? '加碼' : '新申購';
  }

  get minAmount(): number {
    const code = this.selectedCurrency?.currencyCode ?? 'TWD';
    const row = MIN_AMOUNT_TABLE[code] ?? MIN_AMOUNT_TABLE['TWD'];
    return this.isAddOnMode ? row.addOn : row.new;
  }

  get minAmountCurrencyName(): string {
    const code = this.selectedCurrency?.currencyCode ?? 'TWD';
    return (MIN_AMOUNT_TABLE[code] ?? MIN_AMOUNT_TABLE['TWD']).name;
  }

  get minAmountHint(): string {
    const formatted = `${this.minAmountCurrencyName} ${this.minAmount.toLocaleString('en-US')}`;
    return this.isAddOnMode ? `最低加碼 ${formatted}` : `最低申購 ${formatted}`;
  }

  get minAmountErrorMsg(): string {
    const formatted = `${this.minAmountCurrencyName} ${this.minAmount.toLocaleString('en-US')}`;
    return this.isAddOnMode ? `加碼金額不可低於 ${formatted}` : `申購金額不可低於 ${formatted}`;
  }

  get amount(): number {
    return Number(this.form.controls.amount.value || 0);
  }

  get monthlyPay(): number {
    if (this.payMode === 'ratio') {
      return Math.round((this.amount * Number(this.form.controls.ratio.value || 0)) / 100 / 12);
    }
    return Number(this.form.controls.monthlyPay.value || 0);
  }

  get hasPayInput(): boolean {
    const value: unknown = this.payMode === 'ratio'
      ? this.form.controls.ratio.value
      : this.form.controls.monthlyPay.value;
    return value !== null && value !== undefined && String(value).trim() !== '';
  }

  get annualRate(): number {
    return this.amount > 0 ? (this.monthlyPay * 12 / this.amount) * 100 : 0;
  }

  get thresholdText(): string {
    if (!this.thresholdEnabled) return '不設門檻';
    if (this.thresholdValue < 0) return `市值守護・跌${Math.abs(this.thresholdValue)}% 停 Pay`;
    return `增值啟動・漲${this.thresholdValue}% 啟動`;
  }

  get thresholdPreviewPrefix(): string {
    return this.thresholdMode === 'protect' ? '低於' : '首次達';
  }

  get thresholdPreviewSuffix(): string {
    return this.thresholdMode === 'protect' ? '時，暫停 Pay 出' : '時，啟動 Pay 出';
  }

  get thresholdPreviewAmount(): number {
    const rate = this.thresholdValue / 100;
    return Math.round(this.amount * (1 + rate));
  }

  get thresholdPreviewHint(): string {
    return `以投入成本 ${this.formatMoney(this.amount)}、門檻 ${Math.abs(this.thresholdValue)}% 估算`;
  }

  get showThresholdPreview(): boolean {
    return !this.thresholdCustomActive || this.form.controls.thresholdCustom.valid;
  }

  get selectedDay(): number {
    return Number(this.form.controls.day.value || 15);
  }

  get showLongDateHint(): boolean {
    return this.selectedDay >= 29;
  }

  get longDateHintText(): string {
    return `若當月無 ${this.selectedDay} 日，自動遞延至下個營業日執行。`;
  }

  get submitDisabled(): boolean {
    return !this.agreedTerms || this.pwd.trim() === '';
  }

  get redeemNav(): number {
    const fundCode = this.scenario?.fundCurrencyCode ?? 'TWD';
    if (fundCode === 'USD') return 11.85;
    if (fundCode === 'JPY') return 16850;
    return 16.2045;
  }

  get redeemExchangeRate(): number {
    const fundCode = this.scenario?.fundCurrencyCode ?? 'TWD';
    const tradeCode = this.selectedContract?.currencyCode ?? this.selectedCurrency?.currencyCode ?? 'TWD';
    if (fundCode === tradeCode) return 1;
    if (fundCode === 'USD' && tradeCode === 'TWD') return 32.105;
    if (fundCode === 'JPY' && tradeCode === 'TWD') return 0.215;
    return 1;
  }

  get redeemStockUnits(): number {
    const marketValue = this.selectedContract?.marketValue ?? 0;
    const unitPrice = this.redeemNav * this.redeemExchangeRate;
    return unitPrice > 0 ? marketValue / unitPrice : 0;
  }

  get redeemOrderingUnits(): number {
    return this.selectedContract?.fpNo === 'FP20241201' ? 12.3456 : 0;
  }

  // 升級四：依贖回模式切換單位數計算
  // all 模式 → 沿用契約整體可贖單位
  // batch 模式 → 已選批次的 remainUnits 合計
  get redeemUnits(): number {
    if (this.redeemMode === 'batch') {
      return this.selectedBatches.reduce((s, b) => s + b.remainUnits, 0);
    }
    return Math.max(this.redeemStockUnits - this.redeemOrderingUnits, 0);
  }

  // 升級四：依贖回模式切換參考金額計算
  // batch 模式直接用 remainUnits × 淨值 × 匯率（精確對應批次）
  get redeemReferenceAmount(): number {
    if (this.redeemMode === 'batch') {
      return Math.round(this.redeemUnits * this.redeemNav * this.redeemExchangeRate);
    }
    const stockUnits = this.redeemStockUnits;
    const marketValue = this.selectedContract?.marketValue ?? 0;
    return stockUnits > 0 ? Math.round((this.redeemUnits / stockUnits) * marketValue) : marketValue;
  }

  // 單一批次的贖回參考金額：依剩餘單位數計算（完全領完 → 自然為 0）
  batchReferenceAmount(batch: PurchaseBatch): number {
    return Math.round(batch.remainUnits * this.redeemNav * this.redeemExchangeRate);
  }

  // 含 Pay 報酬率：(剩餘市值 + 已 Pay 金額 − 申購金額) / 申購金額 × 100
  batchReturnRate(batch: PurchaseBatch): number {
    if (batch.amount <= 0) return 0;
    const remainValue = batch.remainUnits * this.redeemNav * this.redeemExchangeRate;
    return ((remainValue + batch.paidAmount - batch.amount) / batch.amount) * 100;
  }

  // 短線交易判定：自成交日起 30 天內 → 短線（使用 tDate 與 demo 固定參考日，避免時區漂移與真實系統時間污染）
  isShortTerm(batch: PurchaseBatch): boolean {
    // slash 格式被瀏覽器當 local 解析（避免 ISO '-' 強制 UTC 漂移）
    const tradeDate = new Date(batch.tDate);
    const today = new Date(DEMO_TODAY);
    const days = (today.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days < 30;
  }

  // 升級四：含 Pay 報酬率 — 公式與 batchReturnRate 一致 (剩餘市值 + 已 Pay - 投入成本) / 投入成本
  get redeemReferenceReturnRate(): number {
    if (this.redeemMode === 'batch') {
      const totalAmount = this.selectedBatches.reduce((s, b) => s + b.amount, 0);
      if (totalAmount <= 0) return 0;
      const totalRemainValue = this.selectedBatches.reduce(
        (s, b) => s + b.remainUnits * this.redeemNav * this.redeemExchangeRate, 0
      );
      const totalPaid = this.selectedBatches.reduce((s, b) => s + b.paidAmount, 0);
      return ((totalRemainValue + totalPaid - totalAmount) / totalAmount) * 100;
    }
    const costBasis = this.selectedContract?.costBasis ?? 0;
    if (costBasis <= 0) return 0;
    const paidTotal = this.selectedContract?.paidTotal ?? 0;
    return ((this.redeemReferenceAmount + paidTotal - costBasis) / costBasis) * 100;
  }

  get postRedeemCostBasis(): number {
    const costBasis = this.selectedContract?.costBasis ?? 0;
    if (this.redeemMode !== 'batch') return 0;
    const redeemCost = this.selectedBatches.reduce((s, b) => s + b.amount, 0);
    return Math.max(costBasis - redeemCost, 0);
  }

  get postRedeemAnnualRate(): number {
    const monthlyPay = this.selectedContract?.monthlyPay ?? 0;
    const costBasis = this.postRedeemCostBasis;
    return costBasis > 0 ? (monthlyPay * 12 / costBasis) * 100 : 0;
  }

  get showRedeemPayAdjustmentNotice(): boolean {
    return this.redeemMode === 'batch'
      && this.selectedBatches.length > 0
      && this.selectedContract?.payMode === 'amount'
      && this.postRedeemAnnualRate > 15;
  }

  // 升級四方案 D：貼上限 15%（剩餘成本 × 0.15 ÷ 12，無條件捨去）
  get suggestedMonthlyPay(): number {
    return Math.floor(this.postRedeemCostBasis * 0.15 / 12);
  }

  // ── 升級四：申購批次層贖回 ──────────────────────────────

  get batches(): PurchaseBatch[] {
    return this.selectedContract ? batchesOf(this.selectedContract.fpNo) : [];
  }

  get selectableBatches(): PurchaseBatch[] {
    return this.batches.filter(b => !b.isPayTouched);
  }

  get hasSelectableBatch(): boolean {
    return this.selectableBatches.length > 0;
  }

  get selectedBatches(): PurchaseBatch[] {
    return this.batches.filter(b => this.selectedBatchIds.has(b.batchId));
  }

  get hasSelectedBatch(): boolean {
    return this.selectedBatchIds.size > 0;
  }

  get allSelectableSelected(): boolean {
    return this.hasSelectableBatch && this.selectableBatches.every(b => this.selectedBatchIds.has(b.batchId));
  }

  isBatchSelected(batchId: string): boolean {
    return this.selectedBatchIds.has(batchId);
  }

  setRedeemMode(mode: RedeemMode): void {
    if (mode === 'batch' && !this.hasSelectableBatch) return;
    this.redeemMode = mode;
    if (mode !== 'batch') this.selectedBatchIds.clear();
    this.acknowledgePayAdjustment = false;
  }

  toggleBatch(batch: PurchaseBatch): void {
    if (batch.isPayTouched) return;
    if (this.selectedBatchIds.has(batch.batchId)) {
      this.selectedBatchIds.delete(batch.batchId);
    } else {
      this.selectedBatchIds.add(batch.batchId);
    }
    this.acknowledgePayAdjustment = false;
  }

  toggleAllSelectableBatches(): void {
    if (this.allSelectableSelected) {
      this.selectedBatchIds.clear();
    } else {
      this.selectableBatches.forEach(b => this.selectedBatchIds.add(b.batchId));
    }
    this.acknowledgePayAdjustment = false;
  }

  get redeemNavDate(): string {
    return '2026/05/12';
  }

  get actionDisabled(): boolean {
    if (this.activeStep === 'confirm') return this.submitDisabled;
    if (this.isRedeemMode && this.activeStep === 'settings') {
      if (!this.selectedContract) return true;
      // 升級四：贖回方式必選；若選 batch 模式須至少勾 1 筆批次
      if (!this.redeemMode) return true;
      if (this.redeemMode === 'batch' && !this.hasSelectedBatch) return true;
      // 升級四方案 D：年化超標時，未明確勾選接受月 Pay 調整 → 阻擋
      if (this.showRedeemPayAdjustmentNotice && !this.acknowledgePayAdjustment) return true;
    }
    return false;
  }

  get primaryActionLabel(): string {
    return this.activeStep === 'confirm' ? '確認送出' : '下一步';
  }

  get primaryActionIsSubmit(): boolean {
    return this.activeStep === 'confirm';
  }

  setStep(step: DemoStep): void {
    const targetIndex = this.steps.findIndex(item => item.key === step);
    if (targetIndex <= this.stepIndex || this.activeStep === 'done') {
      this.activeStep = step;
    }
  }

  onStepperSelectionChange(index: number): void {
    const step = this.steps[index];
    if (!step) return;
    this.setStep(step.key);
  }

  selectCurrency(currencyCode: string): void {
    this.selectedCurrency = this.scenario?.availableCurrencies.find(c => c.currencyCode === currencyCode) ?? null;
    // 5.0 起：幣別切換器整合到設定頁；切換後即時更新該幣別契約狀態（決定加碼/新申購模式）
    this.syncSelectedContractForCurrency();
    // 幣別改變後，門檻與金額單位都會跟著變，強制重設為新幣別的最低值
    this.form.controls.amount.setValue(this.minAmount);
    this.applySettingsForMode();
  }

  setPayMode(mode: PayMode): void {
    this.payMode = mode;
    if (mode === 'ratio' && this.form.controls.ratio.value === null) {
      this.form.controls.ratio.setValue(1);
    }
    this.applyPayModeValidators();
  }

  togglePayActive(enabled: boolean): void {
    this.payActive = enabled;
    if (!enabled) {
      this.toggleThreshold(false);
      this.form.controls.monthlyPay.clearValidators();
      this.form.controls.ratio.clearValidators();
      this.form.controls.monthlyPay.updateValueAndValidity({ emitEvent: false });
      this.form.controls.ratio.updateValueAndValidity({ emitEvent: false });
    } else {
      this.applyPayModeValidators();
    }
  }

  next(): void {
    if (this.activeStep === 'settings') {
      if (this.isRedeemMode) {
        if (this.actionDisabled) return;
        this.activeStep = 'confirm';
        return;
      }
      this.form.markAllAsTouched();
      if (this.form.invalid) return;
      this.activeStep = 'confirm';
      return;
    }
    if (this.activeStep === 'confirm') {
      if (this.submitDisabled) return;
      this.activeStep = 'done';
    }
  }

  previous(): void {
    if (this.activeStep === 'confirm') {
      // 無可選批次贖回沒有設定頁 → 上一步直接回帳戶總覽
      if (this.redeemSkipsSettings) {
        this.goOverview();
        return;
      }
      this.activeStep = 'settings';
      return;
    }
    if (this.activeStep === 'settings') {
      if (this.flowContext.mode === 'new') {
        this.router.navigate(['/demo/search']);
      } else {
        this.goOverview();
      }
    }
  }

  queryTrade(): void {
    this.router.navigate(['/demo/overview'], { queryParams: { tab: 'order', order: this.isRedeemMode ? 'rdm' : 'all' } });
  }

  goOverview(): void {
    this.router.navigate(['/demo/overview']);
  }

  reset(): void {
    this.loadFlow(this.flowContext);
  }

  pickDate(day: number): void {
    this.form.controls.day.setValue(day);
  }

  toggleHint(type: 'payMode' | 'date'): void {
    if (type === 'payMode') {
      this.payModeHintOpen = !this.payModeHintOpen;
    } else {
      this.dateHintOpen = !this.dateHintOpen;
    }
  }

  toggleThreshold(enabled: boolean): void {
    this.thresholdEnabled = this.payActive && enabled;
    if (!this.thresholdEnabled) {
      this.resetThresholdState();
    }
  }

  setThresholdMode(mode: ThresholdMode): void {
    this.thresholdMode = mode;
    this.thresholdCustomActive = false;
    this.thresholdValue = mode === 'protect' ? -20 : 20;
    this.resetThresholdCustomControl();
  }

  setThresholdValue(value: number): void {
    this.thresholdCustomActive = this.thresholdMode === 'unlock' && !this.unlockPresetThresholdOptions.includes(value);
    this.thresholdValue = value;
    if (!this.thresholdCustomActive) {
      this.resetThresholdCustomControl();
    }
  }

  selectCustomThreshold(): void {
    this.thresholdCustomActive = true;
    const control = this.form.controls.thresholdCustom;
    if (control.invalid) {
      control.setValue(20);
      control.markAsPristine();
      control.markAsUntouched();
    }
    this.thresholdValue = Number(control.value || 20);
  }

  setCustomUnlockValue(value: number | string | null): void {
    const raw = String(value ?? '').trim();
    const parsed = Number(raw);
    if (/^[1-9][0-9]*$/.test(raw) && parsed >= 1 && parsed <= 100) {
      this.thresholdValue = parsed;
    }
  }

  currencyName(code?: string | null): string {
    const key = code ?? this.selectedCurrency?.currencyCode ?? 'TWD';
    return (MIN_AMOUNT_TABLE[key] ?? MIN_AMOUNT_TABLE['TWD']).name;
  }

  formatMoney(value: number, currencyCode?: string): string {
    return `${this.currencyName(currencyCode)} ${this.formatNumber(value, currencyCode)}`;
  }

  // 純數字（無幣別前綴）：用於贖回流程已透過 banner 宣告幣別的情境
  // DesignSystem §4.5：台幣整數；外幣最多 2 位 trim 尾零
  formatNumber(value: number, currencyCode?: string): string {
    const code = currencyCode ?? this.selectedCurrency?.currencyCode ?? 'TWD';
    const num = Number(value || 0);
    return code === 'TWD'
      ? num.toLocaleString('en-US')
      : num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  formatRate(value: number): string {
    return `${Number(value || 0).toFixed(2)}%`;
  }

  rateClass(value: number): string {
    const num = Number(value || 0);
    if (num > 0) return 'val-up';
    if (num < 0) return 'val-down';
    return '';
  }

  formatUnits(value: number): string {
    // 最多 4 位小數，自動 trim 尾零（8000 → 8,000；95.2381 → 95.2381；30.5 → 30.5）
    return Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
  }

  formatNav(value: number): string {
    // DesignSystem §4.5：淨值最多 4 位 trim 尾零（16.2045 → 16.2045；10.5 → 10.5；100 → 100）
    return Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
  }

  trackStep(_: number, step: { key: DemoStep }): DemoStep {
    return step.key;
  }

  private numericAmountValidators(min: number): ValidatorFn[] {
    return [
      Validators.required,
      Validators.pattern(/^[0-9]+$/),
      Validators.min(min)
    ];
  }

  private applySettingsForMode(): void {
    const minAmount = this.minAmount;
    this.form.controls.amount.setValidators(this.numericAmountValidators(minAmount));
    const currentAmount = Number(this.form.controls.amount.value || 0);
    if (!Number.isFinite(currentAmount) || currentAmount < minAmount) {
      this.form.controls.amount.setValue(minAmount);
    }
    this.form.controls.amount.updateValueAndValidity({ emitEvent: false });

    if (this.isAddOnMode || !this.payActive) {
      this.form.controls.monthlyPay.clearValidators();
      this.form.controls.ratio.clearValidators();
      this.form.controls.monthlyPay.updateValueAndValidity({ emitEvent: false });
      this.form.controls.ratio.updateValueAndValidity({ emitEvent: false });
    } else {
      this.applyPayModeValidators();
    }

    if (this.isModifyMode && this.selectedContract) {
      this.applyContractSettings(this.selectedContract);
    }
  }

  private applyPayModeValidators(): void {
    if (this.payMode === 'amount') {
      this.form.controls.monthlyPay.setValidators([
        ...this.numericAmountValidators(1),
        this.annualRateLimitValidator
      ]);
      this.form.controls.ratio.clearValidators();
    } else {
      this.form.controls.monthlyPay.clearValidators();
      this.form.controls.ratio.setValidators([Validators.required, Validators.min(1), Validators.max(15)]);
    }
    this.form.controls.monthlyPay.updateValueAndValidity({ emitEvent: false });
    this.form.controls.ratio.updateValueAndValidity({ emitEvent: false });
  }

  private annualRateLimitValidator = (control: AbstractControl): ValidationErrors | null => {
    const monthlyPay = Number(control.value || 0);
    const amount = Number(this.form?.controls.amount.value || 0);
    if (!monthlyPay || !amount || this.payMode !== 'amount') return null;
    return (monthlyPay * 12 / amount) * 100 > 15 ? { annualRateExceeded: true } : null;
  };

  private resetThresholdState(): void {
    this.thresholdCustomActive = false;
    this.thresholdMode = 'protect';
    this.thresholdValue = -20;
    this.resetThresholdCustomControl();
  }

  private resetThresholdCustomControl(): void {
    const control = this.form.controls.thresholdCustom;
    control.setValue(20);
    control.markAsPristine();
    control.markAsUntouched();
    control.updateValueAndValidity({ emitEvent: false });
  }

  private syncSelectedContractForCurrency(): void {
    // 5.0 起：依選定幣別自動帶入該幣別的既有契約（若有），決定加碼或新申購模式
    this.selectedContract = this.contractForSelectedCurrency;
  }

  private resetFormState(): void {
    this.agreedTerms = false;
    this.pwd = '';
    this.pwdVisible = false;
    this.form.reset({ amount: this.minAmount, monthlyPay: null, ratio: null, day: 15, thresholdCustom: 20 });
    this.payMode = 'amount';
    this.payActive = true;
    this.thresholdEnabled = false;
    this.resetThresholdState();
    this.payModeHintOpen = false;
    this.dateHintOpen = false;
    this.applyPayModeValidators();
    // 升級四：贖回模式進入時重置兩層狀態
    // 若該契約無可選批次（全部已被 Pay 觸及）→ 自動鎖定全部贖回，免去無意義的決策
    this.redeemMode = this.isRedeemMode && !this.hasSelectableBatch ? 'all' : null;
    this.selectedBatchIds.clear();
    this.acknowledgePayAdjustment = false;
  }

  private applyContractSettings(contract: Contract): void {
    this.payActive = true;
    this.payMode = contract.payMode;
    this.form.controls.amount.clearValidators();
    this.form.controls.amount.setValue(contract.costBasis, { emitEvent: false });
    this.form.controls.amount.updateValueAndValidity({ emitEvent: false });
    this.form.controls.monthlyPay.setValue(contract.payMode === 'amount' ? contract.monthlyPay : null, { emitEvent: false });
    this.form.controls.ratio.setValue(contract.payMode === 'ratio' ? contract.annualRate : null, { emitEvent: false });
    this.form.controls.day.setValue(contract.payDay, { emitEvent: false });

    this.thresholdEnabled = contract.thresholdMode !== 'none';
    this.thresholdMode = contract.thresholdMode === 'unlock' ? 'unlock' : 'protect';
    this.thresholdValue = contract.thresholdMode === 'none' ? -20 : contract.thresholdValue;
    this.thresholdCustomActive = contract.thresholdMode === 'unlock'
      && !this.unlockPresetThresholdOptions.includes(contract.thresholdValue);
    this.form.controls.thresholdCustom.setValue(
      this.thresholdCustomActive ? contract.thresholdValue : 20,
      { emitEvent: false }
    );
    this.applyPayModeValidators();
  }

}
