<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const store = useMainStore()

</script>

<template>
  <div class="uk-flex uk-flex-column">
    <LazyTransactionsTable :keys="store.exploredTransactions" :update="true" :default-length="isMobile() ? 5 : 10" :item-selector="true" :hidden="false" :account="null"/>
  </div>
</template>