<template>
  <div style="display: flex; gap: 8px; align-items: baseline">
    <span style="font-size: 13px; color: var(--text-tertiary); min-width: 70px">{{ label }}</span>
    <span :style="valueStyle">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: string
  mono?: boolean
}

const props = defineProps<Props>()

const valueStyle = computed(() => ({
  fontSize: '13px',
  color: 'var(--text-secondary)',
  fontFamily: props.mono ? "'Courier New', monospace" : 'inherit',
  wordBreak: 'break-all',
}))
</script>
