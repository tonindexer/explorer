<script setup lang="ts">
import { LocationQuery } from 'vue-router';
import { useMainStore } from '~/store/TONExp';

const route = useRoute()
const isLoading = ref(true)
const isGeneral = ref(true)
const error = ref(false)
const hash : NullableStrRef = ref(null)
const excludeMC = ref(false)
const desc = ref(true)

const store = useMainStore()

function routeChecker(newQuery: LocationQuery) {
    excludeMC.value = false
    hash.value = newQuery.hash? toBase64Rfc(newQuery.hash.toString()) : null;

    if (hash.value) {
        isGeneral.value = false;
        isLoading.value = false;
        return;
    }
    isGeneral.value = true;
    isLoading.value = false;
    return;
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
            <h1>{{  $t('route.transactions') }} <h2 class="uk-display-inline uk-text-muted">{{ `${store.totalQueryTransactions}` }}</h2></h1>
            <div class="uk-child-width-auto uk-text-right">
                <label :class="isMobile()? '':'uk-margin-small-right'"><input v-model="excludeMC" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.exclude_masterchain') }}</label>
                <label :style="isMobile()? 'display: block;' : ''"><input v-model="desc" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.desc') }}</label>
            </div>
            <LazyTransactionsTable :keys="store.exploredTransactions" :update="true" :default-length="20" :item-selector="true" :hidden="false" :exclude-m-c="excludeMC" :order="desc ? 'DESC' : 'ASC'" :account="null"/>
        </div>
        <div v-else-if="hash" class="uk-flex uk-flex-column">
            <div class="uk-flex" :class="{'uk-flex-column' : isMobile()}">
                <h1 v-if="!isMobile()" class="uk-margin-remove-vertical uk-text-left uk-margin-right">
                    {{ $t('route.transaction')}}
                </h1>
                <h3 v-if="isMobile()" class="uk-margin-remove uk-text-left">
                    {{ $t('route.transaction')}}
                </h3>
                <h2 class="uk-margin-remove-vertical uk-text-primary uk-text-bold uk-text-truncate" style="line-height: 1.35;" :style="isMobile() ? '' : 'align-self: flex-end;'">
                    {{ hash }}
                </h2>
            </div>
            <TransactionsTransactionInfo :hash="hash" @set-hash="(e) => hash = e"/>
        </div>
    </template>
</template>