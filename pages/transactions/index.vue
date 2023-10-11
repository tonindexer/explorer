<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';


const store = useMainStore()
</script>

<template>
    <AtomsHeaderCount>
        <template #title>
            {{  $t('route.transactions') }}
        </template>
        <template #value>
            {{ `${store.totalQueryTransactions}` }}
        </template>
    </AtomsHeaderCount>
    <AtomsTile :top="true" :tile-style="'margin-top: 20px;'">
        <template #top>
            <GraphAreaTransaction/>
        </template>
    </AtomsTile>
    
    <AtomsTile :body="true" :tile-style="'margin-top: 32px; padding-bottom: 12px'">
        <template #body>
            <LazyTransactionsTable :keys="store.exploredTransactions" :update="true" :default-length="20" :item-selector="true" :hidden="false" :account="null"/>
        </template>
    </AtomsTile>
</template>