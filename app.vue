<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';
const route = useRoute()
const store = useMainStore()

onServerPrefetch(async () => {
  await store.initLoad()
})

watch(route, async value => {
    if (value.path === '/') {
      await store.initLoad()
    }
    if (value.fullPath === '/blocks') {
      await store.updateBlockValues(20, null)
    }
  }, {deep: true, immediate: true})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
