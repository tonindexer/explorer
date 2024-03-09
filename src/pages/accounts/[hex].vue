<script setup lang="ts">
const route = useRoute()

const hex = ref<string | null>('')

onMounted(() => {
    const out = route.params.hex ? (Array.isArray(route.params.hex) ? route.params.hex[0] : route.params.hex) : null
    hex.value = out && addParse(out) ? out : null
})
</script>

<template>
  <template v-if="!hex">
    <NuxtLink to="/accounts">
      {{ 'Incorrect address! Go back..' }}
    </NuxtLink>
  </template>
  <template v-else>
    <div class="uk-flex uk-flex-column">
      <LazyAccountsAccountInfo v-model:hex="hex" />
    </div>
  </template>
</template>