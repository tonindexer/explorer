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
            <h1>{{  $t('route.transactions') }} <h2 class="uk-display-inline uk-text-muted">{{ `${store.totalQueryTransactions}` }}</h2></h1>
            <div class="uk-child-width-auto uk-text-right">
                <label><input v-model="excludeMC" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.exclude_masterchain') }}</label>
            </div>
            <div class="uk-flex uk-flex-middle uk-margin-small uk-margin-small-bottom">
                <div class="uk-margin-remove" style="padding: 0.2rem 0.5rem 0.2rem 0; height: fit-content; white-space: nowrap;">
                    {{ $t('ton.from') }}
                </div>
                <VueDatePicker @update:model-value="setRoute()" :min-date="new Date('15 Nov 2019')" :max-date="filterInterval.to ? new Date(filterInterval.to) : new Date()" :format="'yyyy-MM-dd HH:mm'" class="uk-width-1-5" v-model="filterInterval.from" :clearable="false"/>
                <div class="uk-margin-remove" style="padding: 0.2rem 0.5rem; height: fit-content; white-space: nowrap;">
                    {{ $t('ton.to') }}
                </div>
                <VueDatePicker @update:model-value="setRoute()" :min-date="filterInterval.from ? new Date(filterInterval.from) :new Date('15 Nov 2019')" :max-date="new Date()" :format="'yyyy-MM-dd HH:mm'" class="uk-width-1-5 uk-margin-small-right" v-model="filterInterval.to" :clearable="false"/>
                <button class="uk-margin-small-right uk-button" style="padding: 0.2rem 0.5rem; min-width: 120px; width: 10%; height: fit-content;" id="4h" @click="pickInterval('day')">
                    last day
                </button>
                <button class="uk-margin-small-right uk-button" style="padding: 0.2rem 0.5rem; min-width: 120px; width: 10%; height: fit-content;" id="4h" @click="pickInterval('week')">
                    last week
                </button>
                <button class="uk-margin-small-right uk-button" style="padding: 0.2rem 0.5rem; min-width: 120px; width: 10%; height: fit-content;" id="8h" @click="pickInterval('month')">
                    last month
                </button>
                <button class="uk-button" style="padding: 0.2rem 0.5rem; min-width: 120px; width: 10%; height: fit-content;" id="24h" @click="pickInterval('all')">
                    All
                </button>
            </div>

            <ClientOnly v-if="!isMobile()">
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
            </ClientOnly>

            <LazyTransactionsTable :keys="store.exploredTransactions" :update="true" :default-length="20" :item-selector="true" :hidden="false" :filters="filters" :order="'DESC'" :account="null"/>
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