import { Component, Input } from '@angular/core';

@Component({
  selector: 'fp-notes',
  templateUrl: './shared-notes.component.html'
})
export class SharedNotesComponent {
  @Input() title = '注意事項';
  @Input() notes: string[] = [];
}
