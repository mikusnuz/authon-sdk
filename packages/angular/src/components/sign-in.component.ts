import { Authon } from '@authon/js';
import type { AuthonConfig } from '@authon/js';

/**
 * Embedded sign-in component for Angular 17+ standalone projects.
 *
 * Since tsup cannot compile Angular decorators, use this class directly
 * and annotate it in your application layer:
 *
 * ```ts
 * import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
 * import { AuthonSignInComponent } from '@authon/angular';
 *
 * @Component({
 *   selector: 'authon-sign-in',
 *   standalone: true,
 *   template: `<div #container></div>`,
 * })
 * export class SignInComponent extends AuthonSignInComponent implements OnInit, OnDestroy {
 *   @Input() override publishableKey!: string;
 *   @Input() override apiUrl = 'https://api.authon.dev';
 *   @Input() override theme: 'light' | 'dark' | 'auto' = 'auto';
 *   @Input() override locale?: string;
 *   @Output() override signIn = new EventEmitter<any>();
 *   @ViewChild('container', { static: true }) override containerRef!: ElementRef<HTMLDivElement>;
 *
 *   ngOnInit() { this.onInit(); }
 *   ngOnDestroy() { this.onDestroy(); }
 * }
 * ```
 *
 * Or, for a fully self-contained approach (Angular 17+):
 *
 * ```ts
 * import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
 * import { Authon } from '@authon/js';
 *
 * @Component({
 *   selector: 'authon-sign-in',
 *   standalone: true,
 *   template: `<div #container></div>`,
 * })
 * export class AuthonSignInComponent implements OnInit, OnDestroy {
 *   @Input() publishableKey!: string;
 *   @Input() apiUrl = 'https://api.authon.dev';
 *   @Input() theme: 'light' | 'dark' | 'auto' = 'auto';
 *   @Input() locale?: string;
 *   @Output() signIn = new EventEmitter<any>();
 *   @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
 *
 *   private _authon: Authon | null = null;
 *   private _containerId = `authon-signin-${Math.random().toString(36).slice(2, 8)}`;
 *
 *   ngOnInit() {
 *     this.containerRef.nativeElement.id = this._containerId;
 *     this._authon = new Authon(this.publishableKey, {
 *       mode: 'embedded',
 *       containerId: this._containerId,
 *       apiUrl: this.apiUrl,
 *       theme: this.theme,
 *       locale: this.locale,
 *     });
 *     this._authon.on('signedIn', (user) => this.signIn.emit(user));
 *     this._authon.openSignIn();
 *   }
 *
 *   ngOnDestroy() {
 *     this._authon?.destroy();
 *   }
 * }
 * ```
 */
export class AuthonSignInComponent {
  publishableKey!: string;
  apiUrl = 'https://api.authon.dev';
  theme: 'light' | 'dark' | 'auto' = 'auto';
  locale?: string;
  signIn: { emit: (user: unknown) => void } = { emit: () => {} };
  containerRef!: { nativeElement: HTMLDivElement };

  private _authon: Authon | null = null;
  private _containerId = `authon-signin-${Math.random().toString(36).slice(2, 8)}`;

  /**
   * Call from ngOnInit().
   */
  onInit(): void {
    this.containerRef.nativeElement.id = this._containerId;

    const config: AuthonConfig = {
      mode: 'embedded',
      containerId: this._containerId,
      apiUrl: this.apiUrl,
      theme: this.theme,
    };
    if (this.locale) {
      config.locale = this.locale;
    }

    this._authon = new Authon(this.publishableKey, config);
    this._authon.on('signedIn', (user) => this.signIn.emit(user));
    this._authon.openSignIn();
  }

  /**
   * Call from ngOnDestroy().
   */
  onDestroy(): void {
    this._authon?.destroy();
    this._authon = null;
  }
}
