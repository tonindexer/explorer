<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';
const store = useMainStore()

onServerPrefetch(async () => {
  await store.initLoad()
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
