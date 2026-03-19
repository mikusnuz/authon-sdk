<script setup lang="ts">
import { useAuthon } from '@authon/vue'
import { RouterView } from 'vue-router'

const { isSignedIn, isLoading } = useAuthon()
</script>

<template>
  <div v-if="isLoading" class="page-centered">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
      <div class="loading-spinner-lg" />
      <p style="color: var(--text-secondary); font-size: 14px;">Loading...</p>
    </div>
  </div>

  <RouterView v-else-if="isSignedIn" />

  <div v-else class="page-centered">
    <p style="color: var(--text-secondary);">Redirecting...</p>
  </div>
</template>
