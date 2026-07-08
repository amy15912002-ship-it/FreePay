import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

/**
 * 確認型 Modal（DesignSystem §3.10）。
 * 橙 header、標題白字＋關閉、內容、取消／確認兩顆。用於需要使用者做決定或破壞性動作。
 * 遮罩／×／取消／Esc 皆視為取消（cancelled）；確認鈕發出 confirmed。
 */
@Component({
  selector: 'fp-confirm-modal',
  templateUrl: './confirm-modal.component.html'
})
export class ConfirmModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() confirmLabel = '確認';
  @Input() cancelLabel = '取消';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.cancelled.emit();
  }
}
