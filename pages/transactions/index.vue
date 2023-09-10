<script setup lang="ts">
import { LocationQuery } from 'vue-router';
import { useMainStore } from '~/store/TONExp';
import VueDatePicker from '@vuepic/vue-datepicker';

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const isGeneral = ref(true)
const error = ref(false)
const hash : NullableStrRef = ref(null)


const store = useMainStore()

function routeChecker(newQuery: LocationQuery) {
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

        </div>
        <div v-else-if="hash" class="uk-flex uk-flex-column">
            <TransactionsTransactionInfo :hash="hash" @set-hash="(e) => hash = e"/>
        </div>
    </template>
</template>