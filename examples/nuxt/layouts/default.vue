<template>
  <div class="app-shell">
    <nav class="nav">
      <div class="nav-inner">
        <NuxtLink to="/" class="nav-brand">
          <div class="brand-logo">A</div>
          <span class="brand-name">
            Authon
            <span class="brand-sub">Nuxt SDK</span>
          </span>
        </NuxtLink>

        <div class="nav-actions">
          <template v-if="isSignedIn">
            <NuxtLink to="/profile" class="nav-link">Profile</NuxtLink>
            <NuxtLink to="/mfa" class="nav-link">MFA</NuxtLink>
            <NuxtLink to="/sessions" class="nav-link">Sessions</NuxtLink>
            <button class="btn btn-secondary btn-sm" @click="handleSignOut">Sign out</button>
          </template>
          <template v-else>
            <NuxtLink to="/sign-in" class="btn btn-outline">Sign in</NuxtLink>
            <NuxtLink to="/sign-up" class="btn btn-primary">Sign up</NuxtLink>
          </template>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <slot />
    </main>

    <footer class="footer">
      <div class="footer-inner">
        Authon Nuxt SDK Example &mdash;
        <a href="https://docs.authon.dev" target="_blank" rel="noopener noreferrer">Documentation</a>
        &middot;
        <a href="https://github.com/mikusnuz/authon-sdk" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { $authon } = useNuxtApp()
const authon = $authon as any

const isSignedIn = computed(() => authon?.isSignedIn ?? false)

const handleSignOut = async () => {
  if (!authon?.client) return
  await authon.client.signOut()
  await navigateTo('/')
}
</script>
