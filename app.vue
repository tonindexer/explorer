<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';
const store = useMainStore()
const route = useRoute()

onServerPrefetch(async () => {
  await store.initLoad()
})

onMounted(() => {
  if (route.hash !== '#overview')
        return navigateTo({ path: route.path, query: route.query, hash: '#overview', replace: true})
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
