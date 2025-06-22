<script setup lang="ts">
const store = useMainStore()

onMounted(async () => {
  await store.initLoad()
})

const runtimeConfig = useRuntimeConfig()
</script>

<template>
  <div>
    <div 
      v-if="runtimeConfig.public.testnet"
      class="uk-width-1-1 uk-padding-small uk-text-center"
      style="background: rgb(155, 27, 27); color: white"
    >
      {{ $t('general.testnet_warning') }}
    </div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>