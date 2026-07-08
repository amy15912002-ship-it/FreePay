import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

/**
 * 資訊型 Modal（DesignSystem §3.10）。
 * 白底、標題＋關閉、內容、單顆「我知道了」。用於純說明——沒有要取消的東西。
 * 遮罩點擊、× 或「我知道了」、Esc 皆關閉；內容以 <ng-content> 投影。
 */
@Component({
  selector: 'fp-info-modal',
  templateUrl: './info-modal.component.html'
})
export class InfoModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.closed.emit();
  }
}
