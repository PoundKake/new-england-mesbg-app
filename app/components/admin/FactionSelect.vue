<script setup lang="ts">
import { MESBG_FACTIONS } from '~/data/factions'

defineProps<{ label: string }>()
const modelValue = defineModel<string>({ required: true })
</script>

<template>
  <div>
    <label class="block text-sm font-semibold text-mesbg-ink">{{ label }}</label>
    <select v-model="modelValue" required class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2">
      <option value="" disabled>Select a faction</option>
      <option v-for="faction in MESBG_FACTIONS" :key="faction" :value="faction">{{ faction }}</option>
    </select>
  </div>
</template>
