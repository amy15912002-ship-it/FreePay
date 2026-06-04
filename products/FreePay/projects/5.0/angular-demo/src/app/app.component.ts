import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'fp-root',
  template: `
    <header class="fp-site-header" [class.is-menu-open]="isMobileMenuOpen" role="banner">
      <a class="fp-site-brand" routerLink="/demo/freepay-intro" aria-label="鉅亨自由 Pay" (click)="closeMobileMenu()">
        <img
          class="fp-site-logo"
          src="assets/logo.png"
          alt="鉅亨買基金"
        >
        <span class="fp-site-brand-divider" aria-hidden="true"></span>
        <span class="fp-site-brand-product">鉅亨自由 Pay</span>
      </a>

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
        <a routerLink="/demo/freepay-intro" routerLinkActive="is-active" (click)="closeMobileMenu()">什麼是自由Pay?</a>
        <a *ngIf="isLoggedIn" routerLink="/demo/overview" routerLinkActive="is-active" (click)="closeMobileMenu()">帳戶總覽</a>
        <button
          class="fp-site-login"
          [class.fp-site-login--outline]="!isLoggedIn"
          [class.fp-site-login--ghost]="isLoggedIn"
          type="button"
          (click)="toggleLoginState()"
        >{{ isLoggedIn ? '登出' : '登入' }}</button>
        <a class="fp-site-nav-action" routerLink="/demo/search" (click)="closeMobileMenu()">立即申購</a>
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
