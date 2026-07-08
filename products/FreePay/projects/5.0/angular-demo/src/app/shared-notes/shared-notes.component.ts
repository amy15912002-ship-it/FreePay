import { Component, Input } from '@angular/core';

@Component({
  selector: 'fp-notes',
  templateUrl: './shared-notes.component.html'
})
export class SharedNotesComponent {
  readonly faqLabel = '常見問題';
  readonly faqUrl = 'https://www.anuefund.com/customer/problem/%E9%89%85%E4%BA%A8%E8%87%AA%E7%94%B1Pay';

  @Input() title = '注意事項';
  @Input() notes: string[] = [];

  noteParts(note: string): string[] {
    return note.split(this.faqLabel);
  }
}
