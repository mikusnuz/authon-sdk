import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  template: `
    <div style="display:flex;flex-direction:column;min-height:100vh;">
      <app-nav />
      <main style="flex:1;display:flex;flex-direction:column;">
        <router-outlet />
      </main>
      <footer style="border-top:1px solid var(--border-subtle);padding:20px 24px;text-align:center;color:var(--text-tertiary);font-size:13px;">
        <div style="max-width:1100px;margin:0 auto;">
          Authon Angular SDK Example &mdash;
          <a href="https://docs.authon.dev" target="_blank" rel="noopener noreferrer">Documentation</a>
          &nbsp;·&nbsp;
          <a href="https://github.com/mikusnuz/authon-sdk" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </footer>
    </div>
  `,
})
export class AppComponent {}
