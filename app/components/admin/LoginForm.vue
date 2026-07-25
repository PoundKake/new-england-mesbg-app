<script setup lang="ts">
const { login } = useAuth()

const emit = defineEmits<{
  success: []
}>()

const username = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

async function handleSubmit(): Promise<void> {
  errorMessage.value = null
  isSubmitting.value = true
  try {
    await login(username.value, password.value)
    emit('success')
  } catch {
    errorMessage.value = 'Invalid username or password.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="mx-auto max-w-sm space-y-4" @submit.prevent="handleSubmit">
    <div>
      <label class="block text-sm font-semibold text-mesbg-ink" for="username">Username</label>
      <input
        id="username"
        v-model="username"
        type="text"
        required
        autocomplete="username"
        class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
      />
    </div>
    <div>
      <label class="block text-sm font-semibold text-mesbg-ink" for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        autocomplete="current-password"
        class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
      />
    </div>
    <p v-if="errorMessage" role="alert" class="text-sm text-mesbg-red">{{ errorMessage }}</p>
    <button
      type="submit"
      :disabled="isSubmitting"
      class="w-full rounded bg-mesbg-red px-4 py-2 font-semibold text-mesbg-parchment disabled:opacity-50"
    >
      {{ isSubmitting ? 'Logging in…' : 'Log In' }}
    </button>
  </form>
</template>
