<script setup lang="ts">
const store = useMainStore()
</script>

<template>
    <AtomsHeaderCount>
        <template #title>
            {{  $t('route.accounts') }}
        </template>
        <template #value>
            {{ `${store.totalQueryAccounts === -1 ? '...' : store.totalQueryAccounts}` }}
        </template>
    </AtomsHeaderCount>

    <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 20px; padding-bottom: 12px'">
        <template #top>
            <GraphAreaAccount/>
        </template>
    </AtomsTile>

    <AtomsTile :body="true" :tile-style="'margin-top: 32px; padding-bottom: 12px'">
        <template #body>
            <LazyAccountsTable :keys="store.exploredAccounts" :update="true" :default-length="20" :item-selector="true" :hidden="false"/>
        </template>
    </AtomsTile>
</template>