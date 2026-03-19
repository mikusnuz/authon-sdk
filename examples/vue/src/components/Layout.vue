<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { AuthonSignedIn, AuthonSignedOut, AuthonUserButton } from '@authon/vue'
</script>

<template>
  <div style="display: flex; flex-direction: column; min-height: 100vh;">
    <nav
      style="
        height: 64px;
        background: rgba(10, 15, 30, 0.9);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        padding: 0 24px;
        position: sticky;
        top: 0;
        z-index: 100;
      "
    >
      <div
        style="
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        "
      >
        <RouterLink to="/" style="display: flex; align-items: center; gap: 10px; text-decoration: none;">
          <div
            style="
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background: linear-gradient(135deg, #7c3aed, #4f46e5);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-size: 16px;
              font-weight: 800;
            "
          >
            A
          </div>
          <span style="font-weight: 700; font-size: 16px; color: var(--text-primary);">
            Authon
            <span style="color: var(--accent); margin-left: 4px; font-size: 13px; font-weight: 500;">Vue SDK</span>
          </span>
        </RouterLink>

        <div style="display: flex; align-items: center; gap: 8px;">
          <AuthonSignedIn>
            <RouterLink
              to="/profile"
              style="
                padding: 6px 14px;
                border-radius: 7px;
                font-size: 13px;
                font-weight: 500;
                color: var(--text-secondary);
                text-decoration: none;
                transition: color 0.15s;
              "
            >
              Profile
            </RouterLink>
            <RouterLink
              to="/mfa"
              style="
                padding: 6px 14px;
                border-radius: 7px;
                font-size: 13px;
                font-weight: 500;
                color: var(--text-secondary);
                text-decoration: none;
                transition: color 0.15s;
              "
            >
              MFA
            </RouterLink>
            <RouterLink
              to="/sessions"
              style="
                padding: 6px 14px;
                border-radius: 7px;
                font-size: 13px;
                font-weight: 500;
                color: var(--text-secondary);
                text-decoration: none;
                transition: color 0.15s;
              "
            >
              Sessions
            </RouterLink>
            <AuthonUserButton />
          </AuthonSignedIn>

          <AuthonSignedOut>
            <RouterLink
              to="/sign-in"
              style="
                padding: 7px 16px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                color: var(--text-secondary);
                text-decoration: none;
                border: 1px solid var(--border);
                transition: all 0.15s;
              "
            >
              Sign in
            </RouterLink>
            <RouterLink
              to="/sign-up"
              style="
                padding: 7px 16px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                color: #fff;
                text-decoration: none;
                background: var(--accent);
                transition: background 0.15s;
              "
            >
              Sign up
            </RouterLink>
          </AuthonSignedOut>
        </div>
      </div>
    </nav>

    <main style="flex: 1; display: flex; flex-direction: column;">
      <RouterView />
    </main>

    <footer
      style="
        border-top: 1px solid var(--border-subtle);
        padding: 20px 24px;
        text-align: center;
        color: var(--text-tertiary);
        font-size: 13px;
      "
    >
      <div style="max-width: 1100px; margin: 0 auto;">
        Authon Vue SDK Example &mdash;
        <a href="https://docs.authon.dev" target="_blank" rel="noopener noreferrer">Documentation</a>
        &nbsp;&middot;&nbsp;
        <a href="https://github.com/mikusnuz/authon-sdk" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </footer>
  </div>
</template>
