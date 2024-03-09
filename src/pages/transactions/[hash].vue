<script setup lang="ts">
const route = useRoute()

const hash = ref<string | null>('')

onMounted(() => {
    const out = route.params.hash ? (Array.isArray(route.params.hash) ? route.params.hash[0] : route.params.hash) : null
    hash.value = out ? (trnParse(out) ? out : (trnParse('/' + out) ? '/' + out : null)) : null
})
</script>

<template>
  <template v-if="!hash">
    <NuxtLink :to="{name: 'transactions'}">
      {{ 'An error occured while parsing transaction hash! Go back..' }}
    </NuxtLink>
  </template>
  <template v-else>
    <div class="uk-flex uk-flex-column">
      <LazyTransactionsTransactionInfo v-model:hash="hash" />
    </div>
  </template>
</template>