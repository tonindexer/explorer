<script setup lang="ts">
import { LocationQuery } from 'vue-router';
import { useMainStore } from '~/store/TONExp';

const route = useRoute()
const isLoading = ref(true)
const isGeneral = ref(true)
const error = ref(false)
const hash : NullableStrRef = ref(null)
const excludeMC = ref(false)

const store = useMainStore()

function routeChecker(newQuery: LocationQuery) {
    hash.value = newQuery.hash? newQuery.hash.toString() : null;

    if (hash.value) {
        isGeneral.value = false;
        error.value = false;
        isLoading.value = false;
        return;
    }

    if (!hash.value) {
        isGeneral.value = true;
        error.value = false;
        isLoading.value = false;
        return;
    }

    isLoading.value = false;
    error.value = true;
}

watch(() => route.query, (newQuery) => routeChecker(newQuery))
// watch(excludeWorkCh => store.updateTransactions())
onMounted(() => routeChecker(route.query))
</script>

<template>
    <template v-if="error || isLoading">
        <NuxtLink to="/transactions">
            {{ 'An error occured while parsing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-if="isGeneral">
            <h1>{{  $t('route.transactions') }}</h1>
            <div class="uk-child-width-auto uk-text-right">
                <label><input v-model="excludeMC" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.exclude_masterchain') }}</label>
            </div>
            <LazyTransactionsTable :keys="store.exploredTransactions" :update="true" :default-length="20" :item-selector="true" :hidden="false" :exclude-m-c="excludeMC"/>
        </div>
        <div v-else-if="hash" class="uk-flex uk-flex-column">
            <div class="uk-flex uk-flex-bottom">
                <h1 class="uk-inline uk-margin-remove-vertical">
                {{ $t('route.transaction')}}
                </h1>
                <h2 class="uk-inline uk-margin-remove-vertical uk-text-primary uk-margin-left uk-text-bold" style="line-height: 1.35;">
                    {{ hash }}
                </h2>
            </div>
            <!-- <BlocksBlockInfo :shard="shard" :seq_no="seq_no" :workchain="workchain"/> -->
        </div>
    </template>
</template>