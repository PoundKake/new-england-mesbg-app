<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })
</script>

<template>
  <div>
    <h1 class="mb-8 text-2xl font-bold text-mesbg-ink">Add Event Result</h1>
    <ResultEntryForm />
  </div>
</template>
