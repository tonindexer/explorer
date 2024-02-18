<script setup lang="ts">
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