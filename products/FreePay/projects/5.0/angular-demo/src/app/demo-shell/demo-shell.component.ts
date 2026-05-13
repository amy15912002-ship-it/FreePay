import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Contract, CurrencyOption, SCENARIOS, ScenarioData } from '../mock-data/scenarios';

type DemoStep = 'ccy' | 'settings' | 'confirm' | 'done';
type PayMode = 'amount' | 'ratio';
type ThresholdMode = 'protect' | 'unlock';
type PurchaseMode = 'addOn' | 'new';

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

  readonly dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly scenarios = SCENARIOS;

  readonly form = this.fb.group({
    amount: [100000, [Validators.required, Validators.min(100000)]],
    monthlyPay: [null as number | null, [Validators.required, Validators.min(1)]],
    ratio: [null as number | null, [Validators.required, Validators.min(1), Validators.max(15)]],
    day: [15, [Validators.required]]
  });

  private routeSub?: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute
  ) {
    this.applyPayModeValidators();
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('scenarioId'));
      this.loadScenario(id);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private loadScenario(id: number): void {
    this.scenario = SCENARIOS.find(s => s.id === id) ?? SCENARIOS[0];
    this.resetFormState();
    this.selectedCurrency = this.scenario.availableCurrencies[0] ?? null;
    if (this.shouldShowSccy) {
      this.activeStep = 'ccy';
      this.selectedContract = this.contractsForSelectedCurrency[0] ?? null;
      this.purchaseMode = this.selectedContract ? 'addOn' : 'new';
    } else {
      this.activeStep = 'settings';
      this.selectedContract = null;
      this.purchaseMode = 'new';
    }
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

  get minAmountHint(): string {
    return this.isAddOnMode ? '最低加碼 3,000 元' : '最低申購 100,000 元';
  }

  get minAmountErrorMsg(): string {
    return this.isAddOnMode ? '加碼金額不可低於 3,000 元' : '申購金額不可低於 100,000 元';
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

  get thresholdTitle(): string {
    if (this.thresholdMode === 'protect') {
      return `市值低於投入成本 ${Math.abs(this.thresholdValue)}% 時，暫停 Pay 出`;
    }
    return `市值首次達投入成本 +${this.thresholdValue}% 時，啟動 Pay 出`;
  }

  get thresholdDescription(): string {
    if (this.thresholdMode === 'protect') {
      return '市值回升至門檻以上後，自動恢復執行，無需手動操作。';
    }
    return '首次達到設定比例後解鎖，即使市值後續回落，仍持續按週期執行 Pay，無需重新觸及。';
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

  selectCurrency(currencyCode: string): void {
    this.selectedCurrency = this.scenario?.availableCurrencies.find(c => c.currencyCode === currencyCode) ?? null;
    if (this.activeStep === 'ccy') {
      this.selectedContract = this.contractsForSelectedCurrency[0] ?? null;
      this.purchaseMode = this.selectedContract ? 'addOn' : 'new';
    }
  }

  selectNewPurchase(): void {
    this.selectedContract = null;
    this.purchaseMode = 'new';
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
      this.applySettingsForMode();
      this.activeStep = 'settings';
      return;
    }
    if (this.activeStep === 'settings') {
      this.form.markAllAsTouched();
      const annualRateOk = this.isAddOnMode || !this.payActive || this.annualRate <= 15;
      if (this.form.invalid || !annualRateOk) return;
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

  QryTrade(): void {
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
  }

  setThresholdMode(mode: ThresholdMode): void {
    this.thresholdMode = mode;
    this.thresholdValue = mode === 'protect' ? -20 : 20;
  }

  setThresholdValue(value: number): void {
    this.thresholdValue = value;
  }

  formatMoney(value: number): string {
    return `NT$ ${Number(value || 0).toLocaleString('en-US')}`;
  }

  formatRate(value: number): string {
    return `${Number(value || 0).toFixed(2)}%`;
  }

  trackStep(_: number, step: { key: DemoStep }): DemoStep {
    return step.key;
  }

  private applySettingsForMode(): void {
    const minAmount = this.isAddOnMode ? 3000 : 100000;
    this.form.controls.amount.setValidators([Validators.required, Validators.min(minAmount)]);
    if ((this.form.controls.amount.value ?? 0) < minAmount) {
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
      this.form.controls.monthlyPay.setValidators([Validators.required, Validators.min(1)]);
      this.form.controls.ratio.clearValidators();
    } else {
      this.form.controls.monthlyPay.clearValidators();
      this.form.controls.ratio.setValidators([Validators.required, Validators.min(1), Validators.max(15)]);
    }
    this.form.controls.monthlyPay.updateValueAndValidity({ emitEvent: false });
    this.form.controls.ratio.updateValueAndValidity({ emitEvent: false });
  }

  private resetFormState(): void {
    this.agreedTerms = false;
    this.pwd = '';
    this.pwdVisible = false;
    this.form.reset({ amount: 100000, monthlyPay: null, ratio: null, day: 15 });
    this.payMode = 'amount';
    this.payActive = true;
    this.thresholdEnabled = false;
    this.thresholdMode = 'protect';
    this.thresholdValue = -20;
    this.payModeHintOpen = false;
    this.dateHintOpen = false;
    this.applyPayModeValidators();
  }
}
