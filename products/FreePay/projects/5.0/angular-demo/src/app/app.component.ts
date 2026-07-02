import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'fp-root',
  template: `
    <header class="fp-site-header" [class.is-menu-open]="isMobileMenuOpen" role="banner">
      <div class="fp-site-brand" aria-label="鉅亨自由 Pay">
        <a
          class="fp-site-brand-logo"
          href="https://www.anuefund.com/fund/newsearch?tabname=%E7%A7%91%E6%8A%80%E7%8E%8B"
          aria-label="鉅亨買基金"
          (click)="closeMobileMenu()"
        >
          <img
            class="fp-site-logo"
            src="assets/logo.png"
            alt="鉅亨買基金"
          >
        </a>
        <span class="fp-site-brand-divider" aria-hidden="true"></span>
        <a class="fp-site-brand-product" routerLink="/demo/freepay-intro" (click)="closeMobileMenu()">鉅亨自由 Pay</a>
      </div>

      <button
        class="fp-site-menu-btn"
        type="button"
        aria-label="開啟主選單"
        [attr.aria-expanded]="isMobileMenuOpen"
        aria-controls="fp-site-nav"
        (click)="toggleMobileMenu()"
      >
        <i class="bi" [ngClass]="isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'"></i>
      </button>

      <nav id="fp-site-nav" class="fp-site-nav" [class.is-open]="isMobileMenuOpen" aria-label="主要導覽">
        <a routerLink="/demo/freepay-intro" routerLinkActive="is-active" (click)="closeMobileMenu()">自由 Pay 首頁</a>
        <a *ngIf="isLoggedIn" class="fp-site-nav-action" routerLink="/demo/search" (click)="closeMobileMenu()">立即申購</a>
        <a *ngIf="isLoggedIn" routerLink="/demo/overview" routerLinkActive="is-active" (click)="closeMobileMenu()">帳戶總覽</a>
        <button
          class="fp-site-login fp-site-login--text"
          type="button"
          (click)="toggleLoginState()"
        >{{ isLoggedIn ? '登出' : '登入' }}</button>
      </nav>
    </header>
    <main class="fp-site-main">
      <router-outlet></router-outlet>
    </main>
    <fp-footer></fp-footer>
  `
})
export class AppComponent {
  isMobileMenuOpen = false;
  isLoggedIn = false;

  constructor(private readonly router: Router) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleLoginState(): void {
    this.isLoggedIn = !this.isLoggedIn;
    this.closeMobileMenu();

    if (!this.isLoggedIn && this.router.url.startsWith('/demo/overview')) {
      this.router.navigate(['/demo/freepay-intro']);
    }
  }
}
