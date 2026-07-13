import { Component, Input } from '@angular/core';

export interface StepperStep {
  label: string;
}

@Component({
  selector: 'fp-stepper',
  templateUrl: './stepper.component.html',
})
export class StepperComponent {
  /** 步驟清單，只需 label；桌機並列、手機顯示當前一步。 */
  @Input() steps: readonly StepperStep[] = [];
  /** 當前步驟索引（0 起）。 */
  @Input() currentIndex = 0;

  trackByStep(index: number): number {
    return index;
  }

  get currentLabel(): string {
    return this.steps[this.currentIndex]?.label ?? '';
  }

  /** 進度條寬度％：第 N 步填 N／總數（與「N / 總數」計數同分數）。 */
  get progress(): number {
    const total = this.steps.length;
    return total ? ((this.currentIndex + 1) / total) * 100 : 0;
  }
}
