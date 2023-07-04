<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

const store = useMainStore()
const route = useRoute()

const searchq = computed(() => route.query.search? route.query.search.toString() : null)

</script>

<template>
    <div v-if="store.searchResults.length === 0">
        <h1 class="uk-margin-remove-vertical">{{  $t('general.nothing-found') }}</h1>
    </div>
    <div v-else class="uk-flex uk-flex-column">
        <h1 class="uk-margin-remove-vertical">{{  $t('route.search') }}</h1>
        <LazySearchTable :keys="store.searchResults" :search="searchq" :default-length="20"/>
    </div>
</template>