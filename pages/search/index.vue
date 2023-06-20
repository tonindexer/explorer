<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

const store = useMainStore()

</script>

<template>
    <div v-if="store.searchResults.length === 0">
        <h1 class="uk-margin-remove-vertical">{{  $t('general.nothing-found') }}</h1>
    </div>
    <div v-else class="uk-flex uk-flex-column">
        <h1 class="uk-margin-remove-vertical">{{  $t('route.search') }}</h1>
        <SearchTable :keys="store.searchResults" :update="false" :default-length="20" :hidden="store.searchResults.length === 0"/>
    </div>
</template>