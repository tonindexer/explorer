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
    workchain.value = (isNumeric(newQuery.id)) ? Number(newQuery.id) : null;
    shard.value = (isNumeric(newQuery.shard) && newQuery.shard) ? BigInt(newQuery.shard?.toString()) : null;
    seq_no.value = (isNumeric(newQuery.seq_no)) ? Number(newQuery.seq_no) : null;

    if ((workchain.value || workchain.value === 0) && shard.value && seq_no.value) {
        isGeneral.value = false;
        error.value = false;
        isLoading.value = false;
        return;
    }

    if (!workchain.value && !shard.value && !seq_no.value) {
        isGeneral.value = true;
        error.value = false;
        isLoading.value = false;
        return;
    }
    isLoading.value = false;
    error.value = true;
}


const filteredKeys = computed(() => store.getBlockKeys(store.exploredBlocks, excludeEmpty.value))

watch(() => route.query, (newQuery) => routeChecker(newQuery))
onMounted(() => routeChecker(route.query))
</script>

<template>
    <template v-if="error || isLoading">
        <NuxtLink to="/blocks">
            {{ 'An error occured while parcing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-if="isGeneral">
            <h1>{{  $t('route.blocks') }}</h1>
            <div class="uk-child-width-auto uk-text-right">
                <label><input v-model="excludeEmpty" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.exclude_blocks') }}</label>
            </div>
            <LazyBlocksTable :keys="filteredKeys" :update="true" :default-length="10" :item-selector="true" :hidden="false" :line-link="true"/>
        </div>
        <div v-else-if="(workchain || workchain === 0)&& shard && seq_no" class="uk-flex uk-flex-column">
            <div class="uk-flex uk-flex-bottom">
                <h1 class="uk-inline uk-margin-remove-vertical">
                {{ $t('route.block')}}
                </h1>
                <h2 class="uk-inline uk-margin-remove-vertical uk-text-primary uk-margin-left uk-text-bold" style="line-height: 1.35;">
                    {{ `${workchain}:${truncString(shard.toString(), 5, 4)}:${seq_no}` }}
                </h2>
            </div>
            <BlocksBlockInfo :shard="shard" :seq_no="seq_no" :workchain="workchain"/>
        </div>
    </template>
</template>