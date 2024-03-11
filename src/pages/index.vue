<script setup lang="ts">
const store = useMainStore()

onBeforeMount(() => {
  store.mainPageLoad()
})
</script>

<template>
  <MainStatistics />
  <div 
    :class="[ 
      'uk-flex uk-margin-top',
      { 'uk-flex-column': isMobile() }
    ]"
    style="gap: 20px"
  >
    <div 
      :class="[
        'uk-flex uk-flex-column',
        isMobile() ? 'uk-width-1-1' : 'uk-width-1-2'
      ]"
      style="gap: 20px"
    >
      <MainContracts 
        class="uk-width-1-1"
      />
      <MainOperations 
        class="uk-width-1-1"
      />
    </div>
    <div
      :class="[
        isMobile() ? 'uk-width-1-1' : 'uk-width-1-2'
      ]"
    >
      <MainCompactBlocks />
    </div>
  </div>
</template>