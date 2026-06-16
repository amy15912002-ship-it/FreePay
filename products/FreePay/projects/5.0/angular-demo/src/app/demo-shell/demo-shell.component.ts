import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
type RedeemMode = 'all' | 'partial' | 'batch' | null;
type PartialRedeemInputMode = 'amount' | 'units';

const DEFAULT_DEMO_SCENARIO = DEMO_SCENARIOS[0];
// Demo 固定參考日：避免短線判斷依賴系統時間（過 30 天後示意會失效）
const DEMO_TODAY = '2026/05/29';
const FUND_CURRENCY_CODE_MAP: Record<string, string> = {
  '台幣': 'TWD',
  '美元': 'USD',
  '日圓': 'JPY'
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
  JPY: { new: 500000, addOn: 10000, name: '日圓' }
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
  thresholdValue = 80;
  payActive = true;
  agreedTerms = false;
  pwd = '';
  pwdVisible = false;
  payModeHintOpen = false;
  dateHintOpen = false;
  selectedContract: Contract | null = null;
  selectedCurrency: CurrencyOption | null = null;
  thresholdCustomActive = false;
  redeemMode: RedeemMode = null;
  partialRedeemInputMode: PartialRedeemInputMode = 'amount';
  selectedBatchIds = new Set<string>();
  private addOnDirect = false;
  private flowContext: FlowContext = { mode: 'new', fundId: DEFAULT_DEMO_SCENARIO.fundId };

  readonly dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly protectThresholdOptions = [95, 90, 80];
  readonly unlockPresetThresholdOptions = [105, 110, 120];

  readonly form = this.fb.group({
    amount: [100000, this.numericAmountValidators(100000)],
    monthlyPay: [null as number | string | null, this.numericAmountValidators(1)],
    ratio: [null as number | null, [Validators.required, Validators.min(1), Validators.max(15)]],
    day: [15, [Validators.required]],
    redeemAmount: [null as number | string | null],
    redeemUnits: [null as number | string | null],
    thresholdCustom: [80, [
      Validators.required,
      Validators.min(70),
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
    this.activeStep = 'settings';
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
    if (c.thresholdMode === 'protect') return `市值低於投入成本 ${c.thresholdValue}% 暫停 Pay 出`;
    if (c.thresholdMode === 'unlock') return `市值超過成本 ${c.thresholdValue}% 開始 Pay 出`;
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

  get isContractScopedEntry(): boolean {
    return this.addOnDirect;
  }

  get canSwitchCurrency(): boolean {
    return this.isMultiCurrency && !this.isContractScopedEntry;
  }

  get contractForSelectedCurrency(): Contract | null {
    // 5.0 起：同基金同幣別僅一筆契約
    return (this.scenario?.contracts ?? []).find(c => c.currencyCode === this.selectedCurrency?.currencyCode) ?? null;
  }

  get hasContractForSelectedCurrency(): boolean {
    return this.contractForSelectedCurrency !== null;
  }

  get steps(): Array<{ key: DemoStep; label: string; description: string }> {
    if (this.isRedeemMode) {
      return [
        { key: 'settings', label: '設定', description: '選擇贖回方式' },
        { key: 'confirm', label: '確認', description: '確認試算與送出' },
        { key: 'done', label: '完成', description: '委託完成' }
      ];
    }
    return [
      { key: 'settings', label: '設定', description: '金額、Pay 設定' },
      { key: 'confirm', label: '確認', description: '確認摘要並送出' },
      { key: 'done', label: '完成', description: '委託完成' }
    ];
  }

  get flowPageTitle(): string {
    if (this.isRedeemMode) return '自由Pay-基金贖回';
    if (this.isModifyMode) return '自由Pay-設定異動';
    return '自由Pay-基金申購';
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

  get redeemSettingNotes(): string[] {
    return [
      '約當市值依最新淨值與參考匯率估算，實際贖回金額以基金公司回覆為準。',
      '實際贖回單位數以客戶基金帳上可用單位數為限。',
      '指定批次僅顯示可贖回批次；無可贖回批次時不提供指定贖回。'
    ];
  }

  get doneNotes(): string[] {
    if (this.isRedeemMode) {
      const notes = [
        '您的贖回委託已送出，若超過本營業日 14:00，將視為次一營業日交易。',
        '贖回款項入帳時間依各基金公司作業而定。'
      ];
      if (this.showRedeemAnnualRateNotice) {
        notes.push('若本次贖回後年化提領率超過建議上限，畫面將顯示年化提領率提醒；此提醒不影響贖回委託送出。');
      }
      return notes;
    }

    if (this.isModifyMode) {
      return [
        '您的自由 Pay 設定異動委託已送出，若超過本營業日 14:00，將視為次一營業日交易。',
        '設定生效狀態可至「委託查詢 / 取消」查看。',
        '異動生效後，後續 Pay 出將依新的設定執行。'
      ];
    }

    if (this.isAddOnMode) {
      return [
        '您的加碼委託已送出，若超過本營業日 13:00，將視為次一營業日交易。',
        '預計 3–4 個營業日後申購確認書入帳。',
        '加碼確認後將計入既有契約，Pay 設定維持既有契約設定。'
      ];
    }

    return [
      '您的自由 Pay 申購委託已送出，若超過本營業日 13:00，將視為次一營業日交易。',
      '預計 3–4 個營業日後申購確認書入帳。',
      `首次 Pay 將於設定基準日（每月 ${this.form.controls.day.value} 日）執行；若距申購確認日不足 30 日，將順延至屆滿後的第一個基準日。`
    ];
  }

  get addOnPaySettingSummary(): string {
    const contract = this.selectedContract ?? this.contractForSelectedCurrency;
    if (!contract) return '加碼至既有契約，Pay 設定維持既有設定。';

    const method = contract.payMode === 'ratio'
      ? `依比例 ${contract.annualRate}%`
      : '依金額';
    const day = `每月 ${contract.payDay} 日`;
    const value = contract.payMode === 'amount'
      ? this.formatMoney(contract.monthlyPay, contract.currencyCode)
      : '';
    const threshold = contract.threshold || '不設門檻';
    const parts = [method, day, value, threshold].filter(Boolean);

    return `加碼至既有契約，Pay 設定維持：${parts.join('・')}。`;
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

  get monthlyPayAnnualLimitAmount(): number {
    return Math.floor(this.amount * 0.15 / 12);
  }

  get monthlyPayRangeHint(): string {
    if (this.monthlyPayAnnualLimitAmount <= 0) return '請先輸入申購金額';
    return `可輸入範圍 ${this.currencyName()} 1–${this.formatNumber(this.monthlyPayAnnualLimitAmount)}`;
  }

  get monthlyPayRangeValue(): string {
    if (this.monthlyPayAnnualLimitAmount <= 0) return this.currencyName();
    return `${this.currencyName()} 1–${this.formatNumber(this.monthlyPayAnnualLimitAmount)}`;
  }

  get ratioSliderProgress(): number {
    const value = Number(this.form.controls.ratio.value || 1);
    return ((value - 1) / 14) * 100;
  }

  get thresholdText(): string {
    if (!this.thresholdEnabled) return '不設門檻';
    if (this.thresholdMode === 'protect') return `市值低於投入成本 ${this.thresholdValue}% 暫停 Pay 出`;
    return `市值超過成本 ${this.thresholdValue}% 開始 Pay 出`;
  }

  get thresholdPreviewLead(): string {
    return this.thresholdMode === 'protect' ? '市值低於投入成本' : '市值超過投入成本';
  }

  get thresholdPreviewSuffix(): string {
    return this.thresholdMode === 'protect' ? '時，暫停 Pay 出' : '時，開始 Pay 出';
  }

  get thresholdPreviewAmount(): number {
    return Math.round(this.amount * (this.thresholdValue / 100));
  }

  get thresholdCostText(): string {
    return this.formatMoney(this.amount);
  }

  get thresholdPreviewAmountText(): string {
    return this.formatMoney(this.thresholdPreviewAmount);
  }

  get showThresholdPreview(): boolean {
    return true;
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
    const batchUnits = this.batches.reduce((sum, batch) => sum + batch.remainUnits, 0);
    const marketValue = this.selectedContract?.marketValue ?? 0;
    const exchangeRate = this.redeemExchangeRate;
    if (batchUnits > 0 && marketValue > 0 && exchangeRate > 0) {
      return marketValue / batchUnits / exchangeRate;
    }
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
    const batchUnits = this.batches.reduce((sum, batch) => sum + batch.remainUnits, 0);
    if (batchUnits > 0) return batchUnits;
    const marketValue = this.selectedContract?.marketValue ?? 0;
    const unitPrice = this.redeemNav * this.redeemExchangeRate;
    return unitPrice > 0 ? marketValue / unitPrice : 0;
  }

  get redeemOrderingUnits(): number {
    return this.selectedContract?.fpNo === 'FP20241201' ? 12.3456 : 0;
  }

  get redeemableUnits(): number {
    return Math.max(this.redeemStockUnits - this.redeemOrderingUnits, 0);
  }

  get redeemableReferenceAmount(): number {
    return Math.round(this.redeemableUnits * this.redeemNav * this.redeemExchangeRate);
  }

  get partialRedeemAmount(): number {
    return Number(this.form.controls.redeemAmount.value || 0);
  }

  get partialRedeemInputUnits(): number {
    return Number(this.form.controls.redeemUnits.value || 0);
  }

  get partialRedeemUnits(): number {
    const unitPrice = this.redeemNav * this.redeemExchangeRate;
    if (this.partialRedeemInputMode === 'amount') {
      return unitPrice > 0 ? this.partialRedeemAmount / unitPrice : 0;
    }
    return this.partialRedeemInputUnits;
  }

  get partialRedeemReferenceAmount(): number {
    return Math.round(this.partialRedeemUnits * this.redeemNav * this.redeemExchangeRate);
  }

  get partialRedeemValid(): boolean {
    if (this.partialRedeemInputMode === 'amount') {
      return this.partialRedeemAmount > 0 && this.partialRedeemReferenceAmount <= this.redeemableReferenceAmount;
    }
    return this.partialRedeemInputUnits > 0 && this.partialRedeemInputUnits <= this.redeemableUnits;
  }

  get postRedeemMarketValue(): number {
    const marketValue = this.redeemableReferenceAmount;
    return Math.max(marketValue - this.redeemReferenceAmount, 0);
  }

  get redeemUnits(): number {
    if (this.redeemMode === 'batch') {
      return this.selectedBatches.reduce((s, b) => s + b.remainUnits, 0);
    }
    if (this.redeemMode === 'partial') {
      return Math.min(this.partialRedeemUnits, this.redeemableUnits);
    }
    return this.redeemableUnits;
  }

  get redeemReferenceAmount(): number {
    if (this.redeemMode === 'batch') {
      return Math.round(this.redeemUnits * this.redeemNav * this.redeemExchangeRate);
    }
    if (this.redeemMode === 'partial') {
      return this.partialRedeemReferenceAmount;
    }
    return Math.round(this.redeemUnits * this.redeemNav * this.redeemExchangeRate);
  }

  // 單一批次的贖回約當市值：依剩餘單位數計算（完全領完 → 自然為 0）
  batchReferenceAmount(batch: PurchaseBatch): number {
    return Math.round(batch.remainUnits * this.redeemNav * this.redeemExchangeRate);
  }

  // 含 Pay 報酬率：(剩餘市值 + 已 Pay 金額 − 批次投入成本) / 批次投入成本 × 100
  batchReturnRate(batch: PurchaseBatch): number {
    const cost = this.batchCostBasis(batch);
    if (cost <= 0) return 0;
    const remainValue = batch.remainUnits * this.redeemNav * this.redeemExchangeRate;
    return ((remainValue + batch.paidAmount - cost) / cost) * 100;
  }

  // 短線交易判定（demo 示意）：此處以「自成交日起 30 天內」簡化展演，實際短線判斷以工程既有規格為準。
  // 使用 tDate 與 demo 固定參考日，避免時區漂移與真實系統時間污染。
  isShortTerm(batch: PurchaseBatch): boolean {
    // slash 格式被瀏覽器當 local 解析（避免 ISO '-' 強制 UTC 漂移）
    const tradeDate = new Date(batch.tDate);
    const today = new Date(DEMO_TODAY);
    const days = (today.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days < 30;
  }

  get redeemReferenceReturnRate(): number {
    if (this.redeemMode === 'batch') {
      const totalCost = this.selectedBatches.reduce((s, b) => s + this.batchCostBasis(b), 0);
      if (totalCost <= 0) return 0;
      const totalRemainValue = this.selectedBatches.reduce(
        (s, b) => s + b.remainUnits * this.redeemNav * this.redeemExchangeRate, 0
      );
      const totalPaid = this.selectedBatches.reduce((s, b) => s + b.paidAmount, 0);
      return ((totalRemainValue + totalPaid - totalCost) / totalCost) * 100;
    }
    const costBasis = this.selectedContract?.costBasis ?? 0;
    if (costBasis <= 0) return 0;
    const paidTotal = this.selectedContract?.paidTotal ?? 0;
    return ((this.redeemReferenceAmount + paidTotal - costBasis) / costBasis) * 100;
  }

  get postRedeemCostBasis(): number {
    if (this.redeemMode !== 'partial' && this.redeemMode !== 'batch') return 0;
    const redeemUnitsByBatch = this.currentRedeemUnitsByBatch();
    return this.batches.reduce((sum, batch) => {
      const redeemUnits = redeemUnitsByBatch.get(batch.batchId) ?? 0;
      return sum + this.batchCostBasisAfterRedeem(batch, redeemUnits);
    }, 0);
  }

  get postRedeemRemainingUnits(): number {
    if (this.redeemMode !== 'partial' && this.redeemMode !== 'batch') return this.redeemableUnits;
    const redeemUnitsByBatch = this.currentRedeemUnitsByBatch();
    return this.batches.reduce((sum, batch) => {
      const redeemUnits = redeemUnitsByBatch.get(batch.batchId) ?? 0;
      return sum + Math.max(batch.remainUnits - redeemUnits, 0);
    }, 0);
  }

  get postRedeemAnnualRate(): number {
    const monthlyPay = this.selectedContract?.monthlyPay ?? 0;
    const costBasis = this.postRedeemCostBasis;
    return costBasis > 0 ? (monthlyPay * 12 / costBasis) * 100 : 0;
  }

  get showRedeemAnnualRateNotice(): boolean {
    return (this.redeemMode === 'partial' || this.redeemMode === 'batch')
      && (this.redeemMode === 'partial' ? this.partialRedeemValid : this.selectedBatches.length > 0)
      && this.postRedeemRemainingUnits > 0.0001
      && this.selectedContract?.payMode === 'amount'
      && this.postRedeemAnnualRate > 15;
  }

  private batchPaidUnits(batch: PurchaseBatch): number {
    return Math.max(batch.units - batch.remainUnits, 0);
  }

  private batchCostBasis(batch: PurchaseBatch): number {
    if (batch.units <= 0) return 0;
    return batch.amount * (batch.remainUnits + this.batchPaidUnits(batch)) / batch.units;
  }

  private batchCostBasisAfterRedeem(batch: PurchaseBatch, redeemUnits: number): number {
    if (batch.units <= 0) return 0;
    const remainUnitsAfterRedeem = Math.max(batch.remainUnits - redeemUnits, 0);
    return batch.amount * (remainUnitsAfterRedeem + this.batchPaidUnits(batch)) / batch.units;
  }

  private currentRedeemUnitsByBatch(): Map<string, number> {
    const result = new Map<string, number>();
    if (this.redeemMode === 'batch') {
      this.selectedBatches.forEach(batch => result.set(batch.batchId, batch.remainUnits));
      return result;
    }
    if (this.redeemMode === 'partial') {
      let unitsToRedeem = Math.min(this.partialRedeemUnits, this.redeemableUnits);
      for (const batch of this.selectableBatches) {
        if (unitsToRedeem <= 0) break;
        const units = Math.min(batch.remainUnits, unitsToRedeem);
        result.set(batch.batchId, units);
        unitsToRedeem -= units;
      }
    }
    return result;
  }

  get batches(): PurchaseBatch[] {
    return this.selectedContract ? batchesOf(this.selectedContract.fpNo) : [];
  }

  get selectableBatches(): PurchaseBatch[] {
    return this.batches.filter(b => b.remainUnits > 0);
  }

  get hasSelectableBatch(): boolean {
    return this.selectableBatches.length >= 2;
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
  }

  setPartialRedeemInputMode(mode: PartialRedeemInputMode): void {
    this.partialRedeemInputMode = mode;
  }

  clearPartialRedeemCounterpart(mode: PartialRedeemInputMode): void {
    if (mode === 'amount' && this.form.controls.redeemUnits.value) {
      this.form.controls.redeemUnits.setValue(null, { emitEvent: false });
    }
    if (mode === 'units' && this.form.controls.redeemAmount.value) {
      this.form.controls.redeemAmount.setValue(null, { emitEvent: false });
    }
  }

  limitPartialRedeemInput(mode: PartialRedeemInputMode): void {
    const control = mode === 'amount' ? this.form.controls.redeemAmount : this.form.controls.redeemUnits;
    const raw = String(control.value ?? '').replace(/,/g, '').trim();
    if (!raw) return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const max = mode === 'amount' ? this.redeemableReferenceAmount : this.redeemableUnits;
    if (parsed > max) {
      const capped = mode === 'amount' ? Math.floor(max) : Number(max.toFixed(4));
      control.setValue(capped, { emitEvent: false });
    }
  }

  toggleBatch(batch: PurchaseBatch): void {
    if (batch.remainUnits <= 0) return;
    if (this.selectedBatchIds.has(batch.batchId)) {
      this.selectedBatchIds.delete(batch.batchId);
    } else {
      this.selectedBatchIds.add(batch.batchId);
    }
  }

  toggleAllSelectableBatches(): void {
    if (this.allSelectableSelected) {
      this.selectedBatchIds.clear();
    } else {
      this.selectableBatches.forEach(b => this.selectedBatchIds.add(b.batchId));
    }
  }

  get redeemNavDate(): string {
    return '2026/05/12';
  }

  get actionDisabled(): boolean {
    if (this.activeStep === 'confirm') return this.submitDisabled;
    if (this.isRedeemMode && this.activeStep === 'settings') {
      if (!this.selectedContract) return true;
      if (!this.redeemMode) return true;
      if (this.redeemMode === 'partial' && !this.partialRedeemValid) return true;
      if (this.redeemMode === 'batch' && !this.hasSelectedBatch) return true;
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
    if (!this.canSwitchCurrency) return;
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

  @HostListener('document:click', ['$event'])
  closeHintsOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target || target.closest('.hint-icon, .hint-panel')) return;
    this.payModeHintOpen = false;
    this.dateHintOpen = false;
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
    this.thresholdValue = mode === 'protect' ? 80 : 110;
    this.resetThresholdCustomControl();
  }

  setThresholdValue(value: number): void {
    const presets = this.thresholdMode === 'protect'
      ? this.protectThresholdOptions
      : this.unlockPresetThresholdOptions;
    this.thresholdCustomActive = !presets.includes(value);
    this.thresholdValue = value;
    if (!this.thresholdCustomActive) {
      this.resetThresholdCustomControl();
    }
  }

  selectCustomThreshold(): void {
    this.thresholdCustomActive = true;
    const control = this.form.controls.thresholdCustom;
    this.applyThresholdCustomValidators();
    if (control.invalid) {
      control.setValue(this.thresholdMode === 'protect' ? 100 : 110);
      control.markAsPristine();
      control.markAsUntouched();
    }
    this.thresholdValue = Number(control.value || (this.thresholdMode === 'protect' ? 100 : 110));
  }

  setCustomThresholdValue(value: number | string | null): void {
    const raw = String(value ?? '').trim();
    const parsed = Number(raw);
    const min = this.thresholdMode === 'protect' ? 70 : 101;
    const max = this.thresholdMode === 'protect' ? 100 : 200;
    if (/^[1-9][0-9]*$/.test(raw) && parsed >= min && parsed <= max) {
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
    // 平台通規 §4.4：千分位、最多 2 位、不補零
    return `${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
  }

  formatAnnualPayRate(value: number): string {
    return `${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
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
    this.thresholdValue = 80;
    this.resetThresholdCustomControl();
  }

  private resetThresholdCustomControl(): void {
    const control = this.form.controls.thresholdCustom;
    this.applyThresholdCustomValidators();
    control.setValue(this.thresholdMode === 'protect' ? 80 : 110);
    control.markAsPristine();
    control.markAsUntouched();
    control.updateValueAndValidity({ emitEvent: false });
  }

  private applyThresholdCustomValidators(): void {
    const min = this.thresholdMode === 'protect' ? 70 : 101;
    const max = this.thresholdMode === 'protect' ? 100 : 200;
    this.form.controls.thresholdCustom.setValidators([
      Validators.required,
      Validators.min(min),
      Validators.max(max),
      Validators.pattern(/^[1-9][0-9]*$/)
    ]);
    this.form.controls.thresholdCustom.updateValueAndValidity({ emitEvent: false });
  }

  private syncSelectedContractForCurrency(): void {
    // 5.0 起：依選定幣別自動帶入該幣別的既有契約（若有），決定加碼或新申購模式
    this.selectedContract = this.contractForSelectedCurrency;
  }

  private resetFormState(): void {
    this.agreedTerms = false;
    this.pwd = '';
    this.pwdVisible = false;
    this.form.reset({
      amount: this.minAmount,
      monthlyPay: null,
      ratio: null,
      day: 15,
      redeemAmount: null,
      redeemUnits: null,
      thresholdCustom: 80
    });
    this.payMode = 'amount';
    this.payActive = true;
    this.thresholdEnabled = false;
    this.resetThresholdState();
    this.payModeHintOpen = false;
    this.dateHintOpen = false;
    this.applyPayModeValidators();
    this.redeemMode = null;
    this.partialRedeemInputMode = 'amount';
    this.selectedBatchIds.clear();
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
    this.thresholdValue = contract.thresholdMode === 'none' ? 80 : contract.thresholdValue;
    const presets = this.thresholdMode === 'protect'
      ? this.protectThresholdOptions
      : this.unlockPresetThresholdOptions;
    this.thresholdCustomActive = contract.thresholdMode !== 'none'
      && !presets.includes(contract.thresholdValue);
    this.form.controls.thresholdCustom.setValue(
      this.thresholdCustomActive ? contract.thresholdValue : (this.thresholdMode === 'protect' ? 80 : 110),
      { emitEvent: false }
    );
    this.applyThresholdCustomValidators();
    this.applyPayModeValidators();
  }

}
