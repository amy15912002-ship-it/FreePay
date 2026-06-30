import { Component } from '@angular/core';

@Component({
  selector: 'fp-freepay-intro',
  template: `
    <main class="fp-empty-page" aria-label="什麼是自由Pay">
      <section class="fp-empty-card">
        <div class="fp-empty-icon" aria-hidden="true">
          <i class="bi bi-file-earmark-text"></i>
        </div>
        <h1>什麼是自由Pay?</h1>
        <p>行銷說明內容建置中。</p>
      </section>
    </main>
  `,
  styles: [`
    .fp-empty-page {
      width: min(1200px, 100%);
      min-height: 360px;
      margin: 0 auto;
      display: grid;
      place-items: center;
      padding: 0 20px;
    }

    .fp-empty-card {
      width: min(520px, 100%);
      padding: 48px 32px;
      border: 1px solid var(--color-border-default);
      border-radius: 8px;
      background: var(--color-bg-base);
      text-align: center;
    }

    .fp-empty-icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 16px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--color-bg-muted);
      color: var(--color-text-secondary);
      font-size: 24px;
    }

    h1 {
      margin: 0;
      color: var(--color-text-heading);
      font-size: 22px;
      font-weight: 500;
      line-height: 1.45;
    }

    p {
      margin: 8px 0 0;
      color: var(--color-text-secondary);
      font-size: 16px;
      line-height: 1.6;
    }

    @media (max-width: 767px) {
      .fp-empty-page {
        min-height: 300px;
        padding: 0 15px;
      }

      .fp-empty-card {
        padding: 40px 24px;
      }

      h1 {
        font-size: 20px;
      }
    }
  `]
})
export class FreepayIntroComponent {}
