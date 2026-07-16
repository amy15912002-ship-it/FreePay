import { Component, Input } from '@angular/core';

@Component({
  selector: 'fp-terms-content',
  templateUrl: './terms-content.component.html',
  styleUrls: ['./terms-content.component.scss']
})
export class TermsContentComponent {
  @Input() variant: 'default' | 'setting' = 'default';
}
