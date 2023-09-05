<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

const store = useMainStore()
const route = useRoute()

const searchq = computed(() => route.query.search? route.query.search.toString() : null)

</script>

<template>
    <AtomsHeaderCount v-if="store.searchResults.length !== 0">
        <template #title>
            {{  $t('route.search') }}
        </template>
        <template #value>
            {{ `${store.totalQuerySearch}` }}
        </template>
    </AtomsHeaderCount>
    <AtomsTile :body="true" :tile-style="'margin-top: 20px'" :body-style="'padding: 16px'">
        <template #body>
            <div v-if="store.searchResults.length === 0">
                <h1 class="uk-margin-remove-vertical uk-text-primary">{{  $t('general.nothing-found') }}</h1>
            </div>
            <div v-else class="uk-flex uk-flex-column">
                <LazySearchTable :keys="store.searchResults" :search="searchq" :default-length="20"/>
            </div>
        </template>
    </AtomsTile>
</template>