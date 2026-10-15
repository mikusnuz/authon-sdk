<script lang="ts">
  import { describeAuthonError } from '../authonErrors'

  export let error: unknown = null

  $: info = error ? describeAuthonError(error) : null
</script>

{#if info}
  <div class="alert alert-error" role="alert">
    <span class="alert-code">{info.code}</span>{info.message}
    {#if info.hint}<span class="alert-hint">{info.hint}</span>{/if}
  </div>
{/if}
