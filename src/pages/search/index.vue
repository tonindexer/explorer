<script setup lang="ts">
const store = useMainStore()
const route = useRoute()

const searchq = computed(() => route.query.search? route.query.search.toString() : null)
</script>

<template>
  <AtomsHeaderCount v-if="store.searchResults.length !== 0">
    <template #title>
      {{ $t('route.search') }}
    </template>
    <template #value>
      {{ `${store.totalQuerySearch}` }}
    </template>
  </AtomsHeaderCount>
  <AtomsTile
    :body="true"
    :tile-style="'margin-top: 20px'"
  >
    <template #body>
      <div v-if="store.searchResults.length === 0 && !store.isLoaded('search')">
        <h1 class="uk-margin-remove-vertical uk-text-primary uk-padding">
          {{ $t('general.nothing-found') }}
        </h1>
      </div>
      <div
        v-else
        class="uk-flex uk-flex-column"
      >
        <LazySearchTable
          :keys="store.searchResults"
          :search="searchq"
          :default-length="20"
        />
      </div>
    </template>
  </AtomsTile>
</template>