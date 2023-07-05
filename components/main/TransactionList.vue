<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const store = useMainStore()

const excludeMC = ref(true)
</script>

<template>
  <div class="uk-child-width-auto uk-text-right">
        <label><input v-model="excludeMC" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.exclude_masterchain') }}</label>
    </div>
    <div class="uk-flex uk-flex-column">
      <LazyTransactionsTable :keys="store.exploredTransactions" :update="true" :default-length="isMobile() ? 5 : 10" :item-selector="true" :hidden="false" :exclude-m-c="excludeMC" :account="null" :order="'DESC'"/>
    </div>
</template>