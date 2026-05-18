import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Contract, CurrencyOption, SCENARIOS, ScenarioData } from '../mock-data/scenarios';

type DemoStep = 'ccy' | 'settings' | 'confirm' | 'done';
type PayMode = 'amount' | 'ratio';
type ThresholdMode = 'protect' | 'unlock';
type PurchaseMode = 'addOn' | 'new' | null;

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
  purchaseMode: PurchaseMode = 'new';
  selectedContract: Contract | null = null;
  selectedCurrency: CurrencyOption | null = null;
  thresholdCustomActive = false;

  readonly dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly scenarios = SCENARIOS;
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
    private readonly route: ActivatedRoute
  ) {
    this.applyPayModeValidators();
    this.amountSub = this.form.controls.amount.valueChanges.subscribe(() => {
      this.form.controls.monthlyPay.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('scenarioId'));
      this.loadScenario(id);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.amountSub?.unsubscribe();
  }

  private loadScenario(id: number): void {
    this.scenario = SCENARIOS.find(s => s.id === id) ?? SCENARIOS[0];
    this.selectedCurrency = this.scenario.availableCurrencies[0] ?? null;
    if (this.shouldShowSccy) {
      this.activeStep = 'ccy';
      this.selectedContract = null;
      this.syncPurchaseModeForSelectedCurrency();
    } else {
      this.activeStep = 'settings';
      this.selectedContract = null;
      this.purchaseMode = 'new';
    }
    this.resetFormState();
    this.applySettingsForMode();
  }

  get shouldShowSccy(): boolean {
    return this.scenario?.hasExistingContracts ?? false;
  }

  get isAddOnMode(): boolean {
    return this.purchaseMode === 'addOn';
  }

  get isMultiCurrency(): boolean {
    return (this.scenario?.availableCurrencies.length ?? 0) > 1;
  }

  get contractsForSelectedCurrency(): Contract[] {
    return (this.scenario?.contracts ?? []).filter(c => c.currencyCode === this.selectedCurrency?.currencyCode);
  }

  get hasContractsForSelectedCurrency(): boolean {
    return this.contractsForSelectedCurrency.length > 0;
  }

  get steps(): Array<{ key: DemoStep; label: string; description: string }> {
    const base: Array<{ key: DemoStep; label: string; description: string }> = [
      { key: 'settings', label: '申購設定', description: '金額、Pay 設定' },
      { key: 'confirm', label: '確認送出', description: '確認摘要並送出' },
      { key: 'done', label: '完成', description: '委託完成' }
    ];
    if (this.shouldShowSccy) {
      return [{ key: 'ccy', label: '交易選擇', description: '加碼或新申購' }, ...base];
    }
    return base;
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

  selectContract(contract: Contract): void {
    this.selectedContract = contract;
    this.purchaseMode = 'addOn';
  }

  setPurchaseMode(mode: PurchaseMode): void {
    if (mode === 'addOn' && !this.hasContractsForSelectedCurrency) return;
    this.purchaseMode = mode;
    this.selectedContract = null;
  }

  selectCurrency(currencyCode: string): void {
    this.selectedCurrency = this.scenario?.availableCurrencies.find(c => c.currencyCode === currencyCode) ?? null;
    if (this.activeStep === 'ccy') {
      this.selectedContract = null;
      this.syncPurchaseModeForSelectedCurrency();
    }
    // 幣別改變後，門檻與金額單位都會跟著變，強制重設為新幣別的最低值
    this.form.controls.amount.setValue(this.minAmount);
    this.applySettingsForMode();
  }

  selectNewPurchase(): void {
    this.setPurchaseMode('new');
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
    if (this.activeStep === 'ccy') {
      if (!this.purchaseMode) return;
      if (this.purchaseMode === 'addOn' && !this.selectedContract) return;
      this.applySettingsForMode();
      this.activeStep = 'settings';
      return;
    }
    if (this.activeStep === 'settings') {
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
    } else if (this.activeStep === 'settings' && this.shouldShowSccy) {
      this.activeStep = 'ccy';
    }
  }

  queryTrade(): void {
    // demo：導至委託查詢（正式版為 /trade/order）
    alert('委託查詢（Demo 示意）');
  }

  reset(): void {
    this.loadScenario(this.scenario?.id ?? 1);
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

  formatMoney(value: number, currencyCode?: string): string {
    const code = currencyCode ?? this.selectedCurrency?.currencyCode ?? 'TWD';
    const name = (MIN_AMOUNT_TABLE[code] ?? MIN_AMOUNT_TABLE['TWD']).name;
    const num = Number(value || 0);
    const formatted = code === 'TWD'
      ? num.toLocaleString('en-US')
      : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${name} ${formatted}`;
  }

  formatRate(value: number): string {
    return `${Number(value || 0).toFixed(2)}%`;
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

    if (this.isAddOnMode) {
      this.form.controls.monthlyPay.clearValidators();
      this.form.controls.ratio.clearValidators();
      this.form.controls.monthlyPay.updateValueAndValidity({ emitEvent: false });
      this.form.controls.ratio.updateValueAndValidity({ emitEvent: false });
    } else {
      this.applyPayModeValidators();
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

  private syncPurchaseModeForSelectedCurrency(): void {
    this.purchaseMode = this.hasContractsForSelectedCurrency ? null : 'new';
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
  }

}
