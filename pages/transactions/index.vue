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
const excludeMC = ref(false)

const filterInterval = ref({
    from: null as number | null,
    to: null as number | null,
})

const store = useMainStore()

const pickInterval = (interval : PresetInterval) => {
    if (!store.lastAvailableTimestamp) store.lastAvailableTimestamp = new Date().getTime()
    switch (interval) {
        case 'day':
            if (filterInterval.value.from && filterInterval.value.to && filterInterval.value.to - filterInterval.value.from === 86400000 && filterInterval.value.to === store.lastAvailableTimestamp) return
            filterInterval.value = {
                to : null,
                from : store.lastAvailableTimestamp - 86400000
            }
            break
        case 'week':
            if (filterInterval.value.from && filterInterval.value.to && filterInterval.value.to - filterInterval.value.from === 86400000 * 7 && filterInterval.value.to === store.lastAvailableTimestamp) return
            filterInterval.value = {
                to : null,
                from : store.lastAvailableTimestamp - 86400000 * 7
            }

            break
        case 'month':
            if (filterInterval.value.from && filterInterval.value.to && filterInterval.value.to - filterInterval.value.from === 86400000 * 31 && filterInterval.value.to === store.lastAvailableTimestamp) return
            filterInterval.value = {
                to : null,
                from : store.lastAvailableTimestamp - 86400000 * 31
            }

            break
        case 'all':
            if (filterInterval.value.from && filterInterval.value.from === new Date('15 Nov 2019').getTime()) return
            filterInterval.value = {
                to : null,
                from : new Date('15 Nov 2019').getTime()
            }
            break
        default:
    }
    setRoute()
}

const setRoute = () => {
    const queryString = getQueryString({ to : filterInterval.value.to ? msToISO(filterInterval.value.to) : null, 
                                        from: filterInterval.value.from ? msToISO(filterInterval.value.from) : null} , true)
    if (queryString || route.fullPath.split('?')[1] !== queryString) router.replace(`/transactions?${queryString}`)
}

const filters = computed(() => { return {
    'workchain' : excludeMC.value ? 0 : null,
    'from': filterInterval.value.from ? msToISO(filterInterval.value.from) : msToISO(store.startupTime - 86400000 * 31),
    'to': filterInterval.value.to ? msToISO(filterInterval.value.to) : null
}})

function routeChecker(newQuery: LocationQuery) {
    excludeMC.value = false
    hash.value = newQuery.hash? toBase64Rfc(newQuery.hash.toString()) : null;

    if (hash.value) {
        isGeneral.value = false;
        isLoading.value = false;
        return;
    }

    filterInterval.value = {
        'from' : route.query.from ? new Date(route.query.from.toString()).getTime() : null,
        'to' : route.query.to ? new Date(route.query.to.toString()).getTime() : null
    }

    isGeneral.value = true;
    isLoading.value = false;

    setRoute()
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
            <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 20px; padding-bottom: 12px'">
                <template #top>
                    <div class="uk-child-width-auto uk-text-right">
                        <label><input v-model="excludeMC" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.exclude_masterchain') }}</label>
                    </div>
                    <div class="uk-child-width-1-1 uk-child-width-1-2@m uk-child-width-1-3@xl" uk-grid>
                        <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 0.4rem">
                            <div class="uk-margin-remove-vertical uk-margin-small-left" style=" white-space: nowrap;">
                                {{ $t('ton.from') }}
                            </div>
                            <VueDatePicker @update:model-value="setRoute()" :min-date="new Date('15 Nov 2019')" :max-date="filterInterval.to ? new Date(filterInterval.to) : new Date()" :format="'yyyy-MM-dd HH:mm'" v-model="filterInterval.from" :clearable="false"/>
                            <div class="uk-margin-remove" style="white-space: nowrap;">
                                {{ $t('ton.to') }}
                            </div>
                            <VueDatePicker @update:model-value="setRoute()" :min-date="filterInterval.from ? new Date(filterInterval.from) :new Date('15 Nov 2019')" :max-date="new Date()" :format="'yyyy-MM-dd HH:mm'" v-model="filterInterval.to" :clearable="false"/>
                        </div> 
                        <div class="uk-flex uk-flex-middle uk-margin-small-top" style="justify-content: space-between; gap: 0.4rem">
                            <button class="uk-button uk-width-1-4 uk-padding-remove" style="text-wrap: nowrap" id="4h" @click="pickInterval('day')">
                                last day
                            </button>
                            <button class="uk-button uk-width-1-4 uk-padding-remove" style="text-wrap: nowrap" id="4h" @click="pickInterval('week')">
                                last week
                            </button>
                            <button class="uk-button uk-width-1-4 uk-padding-remove" style="text-wrap: nowrap" id="8h" @click="pickInterval('month')">
                                last month
                            </button>
                            <button class="uk-button uk-width-1-4 uk-padding-remove" style="text-wrap: nowrap" id="24h" @click="pickInterval('all')">
                                All
                            </button>
                        </div> 
                    </div>
                </template>
                <template #body>
                    <GraphAreaTransaction 
                        :exclude-m-c="excludeMC"
                        :interval="filterInterval"
                        @set-range="(e) => {
                            filterInterval = {
                                from: e.from,
                                to: e.to
                            }
                            setRoute()
                        }"
                    />
                </template>
            </AtomsTile>
            
            <AtomsTile :body="true" :tile-style="'margin-top: 32px; padding-bottom: 12px'">
                <template #body>
                    <LazyTransactionsTable :keys="store.exploredTransactions" :update="true" :default-length="20" :item-selector="true" :hidden="false" :filters="filters" :order="'DESC'" :account="null"/>
                </template>
            </AtomsTile>

        </div>
        <div v-else-if="hash" class="uk-flex uk-flex-column">
            <TransactionsTransactionInfo :hash="hash" @set-hash="(e) => hash = e"/>
        </div>
    </template>
</template>