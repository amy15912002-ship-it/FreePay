import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// 千分位輸入：input 顯示帶逗號，form 值仍存純數字字串（驗證 /^[0-9]+$/ 與 Number() 計算不受影響）
// 整數部分加千分位、保留小數（贖回單位數可能有小數）
@Directive({
  selector: 'input[appThousands]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ThousandsDirective), multi: true }
  ]
})
export class ThousandsDirective implements ControlValueAccessor {
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly el: ElementRef<HTMLInputElement>) {}

  private format(raw: string): string {
    if (raw === '') return '';
    const [intPart, decPart] = raw.split('.');
    const grouped = intPart === '' ? '' : Number(intPart).toLocaleString('en-US');
    return grouped + (decPart !== undefined ? '.' + decPart : '');
  }

  @HostListener('input')
  handleInput(): void {
    const input = this.el.nativeElement;
    const before = input.value;
    const oldPos = input.selectionStart ?? before.length;
    const raw = before.replace(/[^\d.]/g, '');   // 只保留數字與小數點
    const formatted = this.format(raw);
    input.value = formatted;
    const newPos = Math.max(0, oldPos + (formatted.length - before.length));
    input.setSelectionRange(newPos, newPos);
    this.onChange(raw);                          // form 值存純數字（無逗號）
  }

  @HostListener('blur')
  handleBlur(): void {
    this.onTouched();
  }

  writeValue(value: unknown): void {
    const raw = String(value ?? '').replace(/,/g, '');
    this.el.nativeElement.value = this.format(raw);
  }

  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.el.nativeElement.disabled = isDisabled; }
}
