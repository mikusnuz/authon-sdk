<script setup lang="ts">
import { computed } from 'vue'
import { describeAuthonError } from '../authonErrors'

const props = defineProps<{ error: unknown }>()
const info = computed(() => (props.error ? describeAuthonError(props.error) : null))
</script>

<template>
  <div v-if="info" class="alert alert-error" role="alert">
    <span class="alert-code">{{ info.code }}</span>{{ info.message }}
    <span v-if="info.hint" class="alert-hint">{{ info.hint }}</span>
  </div>
</template>
