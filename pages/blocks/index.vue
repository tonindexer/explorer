<script setup lang="ts">
const store = useMainStore()
const filteredKeys = computed(() => store.getBlockKeys(store.exploredBlocks, false))
</script>

<template>
    <AtomsHeaderCount>
        <template #title>
            {{  $t('route.blocks') }}
        </template>
        <template #value>
            {{ `${store.totalQueryBlocks}` }}
        </template>
    </AtomsHeaderCount>
    <AtomsTile :body="true" :tile-style="'margin-top: 20px; padding-bottom: 12px'">
        <template #body>
            <LazyBlocksTable :keys="filteredKeys" :update="true" :default-length="5" :item-selector="true" :hidden="false" :line-link="true"/>
        </template>
    </AtomsTile>
</template>