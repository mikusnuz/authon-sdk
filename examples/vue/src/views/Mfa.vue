<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthon } from '@authon/vue'
import type { MfaStatus } from '@authon/shared'

type SetupStep = 'idle' | 'qr' | 'verify' | 'done'

const { client } = useAuthon()

const status = ref<MfaStatus | null>(null)
const statusLoading = ref(true)
const setupStep = ref<SetupStep>('idle')
const qrData = ref<{ secret: string; qrCodeSvg: string; backupCodes: string[] } | null>(null)
const verifyCode = ref('')
const disableCode = ref('')
const showDisable = ref(false)
const regenCode = ref('')
const showRegen = ref(false)
const newBackupCodes = ref<string[] | null>(null)
const isLoading = ref(false)
const localError = ref('')
const successMsg = ref('')

const loadStatus = async () => {
  if (!client) return
  statusLoading.value = true
  try {
    const s = await client.getMfaStatus()
    status.value = s as MfaStatus
  } finally {
    statusLoading.value = false
  }
}

onMounted(loadStatus)

const handleSetupStart = async () => {
  if (!client) return
  localError.value = ''
  isLoading.value = true
  try {
    const data = await client.setupMfa()
    qrData.value = {
      secret: data.secret,
      qrCodeSvg: data.qrCodeSvg,
      backupCodes: data.backupCodes,
    }
    setupStep.value = 'qr'
  } catch (err) {
    localError.value = err instanceof Error ? err.message : 'Failed to start MFA setup'
  } finally {
    isLoading.value = false
  }
}

const handleVerifySetup = async () => {
  if (!client) return
  localError.value = ''
  isLoading.value = true
  try {
    await client.verifyMfaSetup(verifyCode.value)
    setupStep.value = 'done'
    successMsg.value = 'MFA enabled successfully!'
    await loadStatus()
  } catch (err) {
    localError.value = err instanceof Error ? err.message : 'Invalid code. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleDisable = async () => {
  if (!client) return
  localError.value = ''
  isLoading.value = true
  try {
    await client.disableMfa(disableCode.value)
    showDisable.value = false
    disableCode.value = ''
    successMsg.value = 'MFA has been disabled.'
    await loadStatus()
  } catch (err) {
    localError.value = err instanceof Error ? err.message : 'Invalid code'
  } finally {
    isLoading.value = false
  }
}

const handleRegenerate = async () => {
  if (!client) return
  localError.value = ''
  isLoading.value = true
  try {
    const codes = await (client as any).regenerateBackupCodes(regenCode.value)
    newBackupCodes.value = codes
    showRegen.value = false
    regenCode.value = ''
    successMsg.value = 'Backup codes regenerated.'
  } catch (err) {
    localError.value = err instanceof Error ? err.message : 'Failed to regenerate backup codes'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="page-centered" v-if="statusLoading">
    <div class="loading-spinner-lg" />
  </div>

  <div v-else class="page" style="max-width: 640px;">
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
        Two-Factor Authentication
      </h1>
      <p style="color: var(--text-secondary); font-size: 14px;">
        Add an extra layer of security using <code style="color: var(--accent);">client.setupMfa()</code>
      </p>
    </div>

    <div v-if="localError" class="alert alert-error" style="margin-bottom: 16px;">
      {{ localError }}
    </div>
    <div v-if="successMsg" class="alert alert-success" style="margin-bottom: 16px;">
      {{ successMsg }}
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">Authenticator App</div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
            {{ status?.enabled
              ? `Active — ${status.backupCodesRemaining} backup codes remaining`
              : 'Not configured' }}
          </div>
        </div>
        <span :class="['badge', status?.enabled ? 'badge-success' : 'badge-muted']">
          <span
            :style="{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: status?.enabled ? 'var(--success)' : 'var(--text-tertiary)',
              display: 'inline-block',
            }"
          />
          {{ status?.enabled ? 'Enabled' : 'Disabled' }}
        </span>
      </div>

      <!-- Setup Start -->
      <template v-if="!status?.enabled && setupStep === 'idle'">
        <button class="btn btn-primary" @click="handleSetupStart" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner" />
          <span v-else>Set up authenticator app</span>
        </button>
      </template>

      <!-- QR Step -->
      <template v-if="setupStep === 'qr' && qrData">
        <div class="alert alert-warning" style="margin-bottom: 20px;">
          Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
        </div>

        <div class="qr-container" style="margin-bottom: 20px;">
          <div v-html="qrData.qrCodeSvg" />
          <div style="font-size: 13px; color: var(--text-secondary); text-align: center;">
            Or enter manually:
            <div
              style="
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: var(--text-primary);
                margin-top: 6px;
                word-break: break-all;
                padding: 8px 12px;
                background: var(--bg-card);
                border-radius: 6px;
                border: 1px solid var(--border);
              "
            >
              {{ qrData.secret }}
            </div>
          </div>
        </div>

        <div v-if="qrData.backupCodes.length > 0" style="margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
            Backup Codes — Save these now
          </div>
          <div class="alert alert-warning" style="margin-bottom: 12px; font-size: 12px;">
            Store backup codes safely. Each code can only be used once.
          </div>
          <div class="backup-codes-grid">
            <div v-for="code in qrData.backupCodes" :key="code" class="backup-code">{{ code }}</div>
          </div>
        </div>

        <button
          class="btn btn-secondary btn-full"
          style="margin-bottom: 12px;"
          @click="setupStep = 'verify'"
        >
          I've scanned the QR code — Next
        </button>
      </template>

      <!-- Verify Step -->
      <template v-if="setupStep === 'verify'">
        <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">
          Enter the 6-digit code from your authenticator app
        </div>
        <div style="display: flex; gap: 10px; align-items: flex-end;">
          <div class="form-group" style="flex: 1;">
            <input
              class="form-input"
              type="text"
              inputmode="numeric"
              :maxlength="6"
              placeholder="000000"
              v-model="verifyCode"
              autofocus
              style="text-align: center; font-size: 20px; letter-spacing: 0.2em;"
            />
          </div>
          <button
            class="btn btn-primary"
            @click="handleVerifySetup"
            :disabled="isLoading || verifyCode.length !== 6"
            style="flex-shrink: 0;"
          >
            <span v-if="isLoading" class="loading-spinner" />
            <span v-else>Verify & Enable</span>
          </button>
        </div>
      </template>

      <!-- Done Step -->
      <template v-if="setupStep === 'done' && status?.enabled">
        <div class="alert alert-success">MFA is now active on your account!</div>
      </template>

      <!-- Enabled Actions -->
      <template v-if="status?.enabled && setupStep === 'idle'">
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button
            class="btn btn-secondary btn-sm"
            @click="() => { showRegen = true; showDisable = false; }"
          >
            Regenerate backup codes
          </button>
          <button
            class="btn btn-danger btn-sm"
            @click="() => { showDisable = true; showRegen = false; }"
          >
            Disable MFA
          </button>
        </div>
      </template>
    </div>

    <!-- Disable Panel -->
    <div v-if="showDisable" class="card" style="margin-bottom: 20px;">
      <div style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">
        Disable MFA
      </div>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
        Enter your current TOTP code to confirm.
        <code style="color: var(--accent);">disableMfa(code)</code>
      </p>
      <div style="display: flex; gap: 10px; align-items: flex-end;">
        <div class="form-group" style="flex: 1;">
          <input
            class="form-input"
            type="text"
            inputmode="numeric"
            :maxlength="6"
            placeholder="000000"
            v-model="disableCode"
            style="text-align: center; letter-spacing: 0.15em;"
          />
        </div>
        <button
          class="btn btn-danger"
          @click="handleDisable"
          :disabled="isLoading || disableCode.length !== 6"
        >
          <span v-if="isLoading" class="loading-spinner" />
          <span v-else>Disable</span>
        </button>
        <button class="btn btn-secondary" @click="() => { showDisable = false; disableCode = ''; }">
          Cancel
        </button>
      </div>
    </div>

    <!-- Regen Panel -->
    <div v-if="showRegen" class="card" style="margin-bottom: 20px;">
      <div style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">
        Regenerate Backup Codes
      </div>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
        Enter your TOTP code to generate new backup codes.
        <code style="color: var(--accent);">regenerateBackupCodes(code)</code>
      </p>
      <div style="display: flex; gap: 10px; align-items: flex-end;">
        <div class="form-group" style="flex: 1;">
          <input
            class="form-input"
            type="text"
            inputmode="numeric"
            :maxlength="6"
            placeholder="000000"
            v-model="regenCode"
            style="text-align: center; letter-spacing: 0.15em;"
          />
        </div>
        <button
          class="btn btn-primary"
          @click="handleRegenerate"
          :disabled="isLoading || regenCode.length !== 6"
        >
          <span v-if="isLoading" class="loading-spinner" />
          <span v-else>Regenerate</span>
        </button>
        <button class="btn btn-secondary" @click="() => { showRegen = false; regenCode = ''; }">
          Cancel
        </button>
      </div>
    </div>

    <!-- New Backup Codes -->
    <div v-if="newBackupCodes" class="card">
      <div style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">
        New Backup Codes
      </div>
      <div class="alert alert-warning" style="margin-bottom: 12px; font-size: 12px;">
        Previous backup codes have been invalidated. Save these new codes safely.
      </div>
      <div class="backup-codes-grid">
        <div v-for="code in newBackupCodes" :key="code" class="backup-code">{{ code }}</div>
      </div>
    </div>
  </div>
</template>
