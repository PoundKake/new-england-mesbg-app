<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <div>
    <h1 class="mb-8 text-center text-2xl font-bold text-mesbg-ink">Admin Login</h1>
    <LoginForm @success="router.push('/admin')" />
  </div>
</template>
