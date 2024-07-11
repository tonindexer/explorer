<script setup lang="ts">
const store = useMainStore()

onServerPrefetch(async () => {
  await store.initLoad()
})

const runtimeConfig = useRuntimeConfig()

const testnetWarning = computed(() => runtimeConfig.public.tonUrl.includes('testnet'))

</script>

<template>
  <div>
    <div 
      v-if="testnetWarning"
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