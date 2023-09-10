<script setup lang="ts">
import { LocationQuery } from 'vue-router';
import { useMainStore } from '~/store/TONExp';

const route = useRoute()
const isLoading = ref(true)
const isGeneral = ref(true)
const error = ref(false)
const workchain : NullableNumRef = ref(null)
const shard : NullableBigRef = ref(null)
const seq_no : NullableNumRef = ref(null)
const excludeEmpty = ref(false)

const store = useMainStore()

function routeChecker(newQuery: LocationQuery) {
    workchain.value = (isNumeric(newQuery.workchain)) ? Number(newQuery.workchain) : null;
    shard.value = (isNumeric(newQuery.shard) && newQuery.shard) ? BigInt(newQuery.shard?.toString()) : null;
    seq_no.value = (isNumeric(newQuery.seq_no)) ? Number(newQuery.seq_no) : null;

    if ((workchain.value || workchain.value === 0) && shard.value && seq_no.value) {
        isGeneral.value = false;
        error.value = false;
        isLoading.value = false;
        return;
    }

    if (shard.value === null && seq_no.value === null) {
        isGeneral.value = true;
        error.value = false;
        isLoading.value = false;
        return;
    }
    isLoading.value = false;
    error.value = true;
}


const filteredKeys = computed(() => store.getBlockKeys(store.exploredBlocks, excludeEmpty.value))

watch(() => route.query, (newQuery) => {
    routeChecker(newQuery)
})
onMounted(() => routeChecker(route.query))
</script>

<template>
    <template v-if="error || isLoading">
        <NuxtLink to="/blocks">
            {{ 'An error occured while parsing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-if="isGeneral">
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
                    <LazyBlocksTable :keys="filteredKeys" :update="true" :default-length="10" :item-selector="true" :hidden="false" :line-link="true"/>
                </template>
            </AtomsTile>
        </div>
        <div v-else-if="(workchain || workchain === 0) && shard && seq_no" class="uk-flex uk-flex-column">
            <BlocksBlockInfo :shard="shard" :seq_no="seq_no" :workchain="workchain"/>
        </div>
    </template>
</template>