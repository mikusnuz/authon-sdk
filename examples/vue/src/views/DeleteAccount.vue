<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthon } from '@authon/vue'

const CONFIRMATION_TEXT = 'DELETE'

const router = useRouter()
const { signOut } = useAuthon()

const confirmInput = ref('')
const loading = ref(false)
const error = ref('')

const isConfirmed = computed(() => confirmInput.value === CONFIRMATION_TEXT)

const handleDelete = async () => {
  if (!isConfirmed.value) return
  loading.value = true
  error.value = ''
  try {
    await signOut()
    router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete account'
    loading.value = false
  }
}
</script>

<template>
  <div class="page-centered">
    <div style="width: 100%; max-width: 480px;">
      <div class="card">
        <div style="text-align: center; margin-bottom: 24px;">
          <div
            style="
              width: 56px;
              height: 56px;
              border-radius: 50%;
              background: var(--danger-bg);
              border: 1px solid rgba(239, 68, 68, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 16px;
              font-size: 24px;
            "
          >
            ⚠️
          </div>
          <h1 style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
            Delete Account
          </h1>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
            This action is <strong style="color: var(--danger);">permanent and irreversible</strong>.
            All your data will be deleted immediately.
          </p>
        </div>

        <div class="alert alert-error" style="margin-bottom: 24px;">
          <div style="font-weight: 600; margin-bottom: 6px;">This will permanently delete:</div>
          <ul style="padding-left: 18px; display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
            <li>Your account and personal information</li>
            <li>All active sessions</li>
            <li>MFA configuration and backup codes</li>
            <li>Any linked social accounts</li>
          </ul>
        </div>

        <div v-if="error" class="alert alert-error" style="margin-bottom: 16px;">{{ error }}</div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" for="confirm">
            Type <strong style="color: var(--danger); font-family: 'Courier New', monospace;">DELETE</strong> to confirm
          </label>
          <input
            id="confirm"
            class="form-input"
            type="text"
            placeholder="DELETE"
            v-model="confirmInput"
            :style="{
              borderColor: isConfirmed ? 'var(--danger)' : undefined,
              textAlign: 'center',
              fontFamily: '\'Courier New\', monospace',
              letterSpacing: '0.1em',
              fontSize: '16px',
            }"
          />
        </div>

        <button
          class="btn btn-danger btn-full"
          @click="handleDelete"
          :disabled="!isConfirmed || loading"
          :style="{ marginBottom: '12px', opacity: isConfirmed ? 1 : 0.4 }"
        >
          <span v-if="loading" class="loading-spinner" />
          <span v-else>Permanently delete my account</span>
        </button>

        <RouterLink to="/profile" class="btn btn-secondary btn-full">
          Cancel — Keep my account
        </RouterLink>
      </div>
    </div>
  </div>
</template>
