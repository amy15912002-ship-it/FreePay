import { Component } from '@angular/core';

@Component({
  selector: 'fp-root',
  template: `
    <header class="fp-demo-header" [class.is-menu-open]="isMobileMenuOpen" role="banner">
      <a class="fp-demo-brand" routerLink="/demo/freepay-intro" aria-label="鉅亨自由 Pay" (click)="closeMobileMenu()">
        <img
          class="fp-demo-logo"
          src="assets/logo.png"
          alt="鉅亨買基金"
        >
        <span class="fp-demo-brand-divider" aria-hidden="true"></span>
        <span class="fp-demo-brand-product">鉅亨自由 Pay</span>
      </a>

      <button
        class="fp-demo-menu-btn"
        type="button"
        aria-label="開啟主選單"
        [attr.aria-expanded]="isMobileMenuOpen"
        aria-controls="fp-demo-nav"
        (click)="toggleMobileMenu()"
      >
        <i class="bi" [ngClass]="isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'"></i>
      </button>

      <nav id="fp-demo-nav" class="fp-demo-nav" [class.is-open]="isMobileMenuOpen" aria-label="主要導覽">
        <a routerLink="/demo/freepay-intro" routerLinkActive="is-active" (click)="closeMobileMenu()">什麼是自由Pay?</a>
        <a routerLink="/demo/overview" routerLinkActive="is-active" (click)="closeMobileMenu()">帳戶總覽</a>
        <a class="fp-demo-nav-action" routerLink="/demo/search" (click)="closeMobileMenu()">立即申購</a>
        <button class="fp-demo-login" type="button" (click)="closeMobileMenu()">登入</button>
      </nav>
    </header>
    <main class="fp-demo-main">
      <router-outlet></router-outlet>
    </main>
    <fp-footer></fp-footer>
  `
})
export class AppComponent {
  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
