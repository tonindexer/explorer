<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
import { ModelSelect } from 'vue-search-select'
import VueDatePicker from '@vuepic/vue-datepicker';

type SelectItem = {
    value: string,
    text: string
}
const route = useRoute()
const router = useRouter()

const isGeneral = ref(true)
const error = ref(false)
const hex = computed(() => route.query.hex? route.query.hex.toString() : null)
const contract = computed(() => route.query.contract? route.query.contract.toString() : null)

const selected: Ref<SelectItem | {}> = ref({ value: '', text: ''})
const selectedMobile = ref('All')
const store = useMainStore()

const filterInterval = ref({
    from: null as number | null,
    to: null as number | null,
})

const options = computed(() => Object.values(store.interfaces).map(item => { return { value: item.name, text: item.name}}).sort((a, b) => a.text > b.text ? 1 : -1))
const optionsMobile = computed(() : string[] => {
    const defualt = ['All']
    defualt.push(...Object.keys(store.interfaces))
    return defualt.sort()
})


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

const selectedFilter = computed(() => { return {
    interface: contract.value,
    'from': filterInterval.value.from ? msToISO(filterInterval.value.from) : msToISO(store.startupTime - 86400000 * 31),
    'to': filterInterval.value.to ? msToISO(filterInterval.value.to) : null
}})

const reset = () => { 
    selected.value = {};
    selectedMobile.value = 'All' 
}

const setRoute = () => {
    let contract = null
    if ('value' in selected.value && selected.value.value !== '')
        contract = selected['value'].value
    else if (selectedMobile.value !== 'All') contract = selectedMobile.value

    if (!('hex' in route.query)) {
        const queryString = getQueryString({ to : filterInterval.value.to ? msToISO(filterInterval.value.to) : null, 
                                        from: filterInterval.value.from ? msToISO(filterInterval.value.from) : null,
                                        contract } , true)
        if (queryString || route.fullPath.split('?')[1] !== queryString) router.replace(`/accounts?${queryString}`)
    }
}

function routeChecker() {
    if ('contract' in route.query && route.query.contract !== '') {
        isMobile() ? (selectedMobile.value = route.query.contract?.toString() ?? 'All') :
            selected.value = {value: route.query.contract, text: route.query.contract }
    } else {
        selectedMobile.value = 'All'
        selected.value = {}
    }

    if (hex.value) {
        isGeneral.value = false;
        return;
    }

    filterInterval.value = {
        'from' : route.query.from ? new Date(route.query.from.toString()).getTime() : null,
        'to' : route.query.to ? new Date(route.query.to.toString()).getTime() : null
    }

    setRoute()
    isGeneral.value = true;
    return;
}

watch(hex, () => routeChecker())

watch(contract, () => 
    isMobile() ? (selectedMobile.value = route.query.contract?.toString() ?? 'All') :
            selected.value = {value: route.query.contract, text: route.query.contract })

watch(selected, (to, from) => {
    if (to !== from)
        setRoute()
})
watch(selectedMobile, () => setRoute())

onMounted(() => routeChecker())
</script>

<template>
    <template v-if="error">
        <NuxtLink to="/accounts">
            {{ 'An error occured while parsing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-if="isGeneral">
            <div class="uk-flex uk-flex-bottom uk-margin-bottom">
                <h1 class="uk-margin-remove-vertical uk-margin-right">{{  $t('route.accounts') }}</h1>
                <h2 class="uk-margin-remove uk-text-muted">{{ `${store.totalQueryAccounts === -1 ? '...' : store.totalQueryAccounts}` }}</h2>
            </div>
            <div class="uk-flex uk-flex-right">
                <div v-if="!isMobile()" class="uk-width-2-5">
                    <ModelSelect :options="options" v-model="selected" :placeholder="$t('ton.contract')" style="border-radius: 0;"></ModelSelect>
                </div>
                <div v-else-if="isMobile()" class="uk-width-4-5 uk-text-small" style="margin-right: 0.5rem;">
                    <AtomsSelector 
                        :item-count="selectedMobile"
                        :amount="null"
                        :start-line="null"
                        :options="optionsMobile"
                        @set-value="(e: any) => selectedMobile = e.value"
                    />
                </div>
                <a v-if="Object.keys(selected).length > 0" uk-icon="icon: close" @click="reset" style="align-self: center; margin-left: 0.5rem;"></a>
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

            <ClientOnly v-if="!isMobile()">
                <GraphAreaAccount
                    :contract="selectedFilter.interface"
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

            <LazyAccountsTable :keys="store.exploredAccounts" :update="true" :default-length="20" :item-selector="true" :hidden="false" :filters="selectedFilter"/>
        </div>
        <div v-else-if="hex" class="uk-flex uk-flex-column">
            <div class="uk-flex" :class="{'uk-flex-column' : isMobile()}">
                <h1 v-if="!isMobile()" class="uk-margin-remove-vertical uk-text-left uk-margin-right">
                    {{ $t('route.account')}}
                </h1>
                <h3 v-if="isMobile()" class="uk-margin-remove uk-text-left">
                    {{ $t('route.account')}}
                </h3>
                <h2 class="uk-margin-remove-vertical uk-text-primary uk-text-bold uk-text-truncate" style="line-height: 1.35;" :style="isMobile() ? '' : 'align-self: flex-end;'">
                    {{ store.accounts[hex]?.address?.base64 ?? 'loading..' }}
                </h2>
            </div>
            <AccountsAccountInfo :hex="hex" @set-hex="(e) => navigateTo( e ? {path: 'accounts', query: {hex: e}, hash: '#overview', replace: true} : {path: 'accounts', replace: true})"/>
        </div>
    </template>
</template>

<style lang="scss">
.search {
    font-family: 'Fira Mono';
}
</style>