<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';
const route = useRoute()
const store = useMainStore()

onServerPrefetch(async () => {
  await store.initLoad()
})

watch(route, async value => {
    if (value.path === '/') {
      await store.mainPageLoad()
    }
    if (value.fullPath === '/blocks') {
      await store.updateBlockValues(10, null)
    }
    if (value.fullPath === '/transactions') {
      await store.updateTransactions(20, null, false)
    }
    if (value.fullPath === '/accounts') {
      await store.updateAccounts(20, null, null)
    }
  }, {deep: true})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
