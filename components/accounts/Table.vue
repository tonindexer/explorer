<script setup lang="ts">

const props = defineProps<{
    keys: AccountKey[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
}>()

const route = useRoute()
const router = useRouter()
const store = useMainStore()

const loading = computed(() => props.update && props.keys.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value).length === 0)
const emptyTable = ref(false)

const pageNum = ref(0)
const maxExploredPage = ref(0)
const selectedContract = ref('All')
const itemCount = ref(props.defaultLength)

const firstTX: NullableBigRef = ref(0n)
const lastTX: NullableBigRef = ref(0n)
const lastPageFlag = computed(() => props.update ? store.nextPageFlag(itemCount.value * (pageNum.value+1), 'acc') : false)

const contract = computed(() => route.query.contract? route.query.contract.toString() : null)

const sortby = ref({
    order_desc: true
})

const optionsContract = computed(() : string[] => {
    const defualt = ['All']
    defualt.push(...Object.keys(store.interfaces))
    return defualt.sort()
})

const setExtraFields = () => {
    if (props.keys.length > 0) {
        if (props.keys[0] in store.accounts) {
            firstTX.value = BigInt(store.accounts[props.keys[0]].last_tx_lt)
        }
        if (props.keys[props.keys.length - 1] in store.accounts) {
            lastTX.value = BigInt(store.accounts[props.keys[props.keys.length - 1]].last_tx_lt)
        }
    } else emptyTable.value = true
}

const setRoute = () => {
    if (route.path !== '/accounts') return
    let contract = null
    if (selectedContract.value !== 'All') contract = selectedContract.value

    if (!('hex' in route.query)) {
        const queryString = getQueryString({ contract } , true)
        if (queryString || route.fullPath.split('?')[1] !== queryString) router.replace(`/accounts?${queryString}`)
    }

}

const routeChecker = () => {
    if (route.path !== '/accounts') return
    if ('contract' in route.query && route.query.contract !== '') {
        selectedContract.value = route.query.contract?.toString() ?? 'All'
    } else {
        selectedContract.value = 'All'
    }
}

const updateValues = async (next: boolean = true) => {
    if (!props.update) return
    emptyTable.value = false
    if (props.keys.length === 0 || pageNum.value === 0)
        await store.updateAccounts(itemCount.value, null, {interface: contract.value}, sortby.value.order_desc ? 'DESC' :'ASC')
    else {
        await store.updateAccounts(itemCount.value, next ? lastTX.value : firstTX.value, {interface: contract.value}, sortby.value.order_desc ? 'DESC' :'ASC')
    }
    if (props.keys.length === 0) emptyTable.value = true
}

watch(contract, () => selectedContract.value = route.query.contract?.toString() ?? 'All')

watch(selectedContract, () => setRoute())

watch(sortby, () => updateValues(), {deep: true})

watch(pageNum, async(to, from) => {
    if (props.update) {
        if (to === 0 || (to > from && to > maxExploredPage.value)) { 
            maxExploredPage.value = to
            await updateValues()
        }
    }
}, {deep : true}) 

watch(itemCount, async() => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep : true})

watch(() => contract, (to, from) => {
    if (pageNum.value === 0 && from.value !== '') updateValues()
    else pageNum.value = 0
}, { deep: true })

watch(loading, (to) => {
    if (to) setExtraFields()
})
onMounted(() => {
    maxExploredPage.value = 0
    setExtraFields()
    routeChecker()
})
</script>

<template>
    <div v-if="isMobile() && route.path === '/accounts'" class="uk-flex uk-flex-right uk-padding-top uk-padding-vertical uk-padding-remove-bottom">
        <div class="uk-width-1-1 uk-text-small">
            <AtomsSelector 
                v-model:item-count="selectedContract"
                :def="true"
                :amount="null"
                :start-line="null"
                :options="optionsContract"
            />
        </div>
        <a v-if="selectedContract !== 'All'" uk-icon="icon: close" @click="selectedContract = 'All'" style="align-self: center; margin-left: 0.5rem;"></a>
    </div>
    <table v-show="!hidden" class="uk-table uk-margin-remove-top" :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}">
        <colgroup v-if="!isMobile()">
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
        </colgroup>
        <thead v-if="!isMobile()">
            <tr>
                <th class="uk-width-1-5">{{ $t('ton.id')}}</th>
                <th class="uk-width-1-5 uk-flex" style="position: relative; width: fit-content;" :class="{'dropdown-text filter-icon hover-header' : update}">
                    {{ $t('ton.contract')}}
                    <div class="dropdown-filter">
                        <div v-for="item of optionsContract" class="filter-item" :class="{'selected-filter': selectedContract === item}" @click="selectedContract = item">
                            {{ item }}
                        </div>
                    </div>
                </th>
                <th class="uk-width-1-5 uk-text-right">{{ $t('ton.balance')}}</th>
                <th class="uk-width-1-5 uk-text-right uk-margin-small-right">{{ $t('ton.status')}}</th>
                <th class="uk-width-1-5 uk-text-right" :class="{'hover-header' : update}" @click="sortby.order_desc = !sortby.order_desc">
                    {{ $t('general.updated') + (update ? (sortby.order_desc ? ' ▼' : ' ▲') : '') }}
                </th>
            </tr>
        </thead>
        <template v-if="emptyTable && store.totalQueryAccounts === 0">
            <div class="uk-flex uk-margin-top">
                {{ $t('warning.nothing_found') }}
            </div>
        </template>
        <template v-else-if="loading">
            <tr class="uk-text-center">
                <td colspan="5">
                    <Loader />
                </td>
            </tr>
        </template>
        <template v-else>
            <tbody>
                <template v-for="acc in keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                    <AccountsTableLine :acc="store.accounts[acc]"/>
                </template>
            </tbody>
        </template>
    </table>
    <div v-show="!(emptyTable && store.totalQueryAccounts === 0) && !loading && !hidden" class="uk-flex uk-width-1-1 uk-flex-middle uk-margin-remove-bottom uk-padding-medium-right" style="justify-content: flex-end">
        <div class="uk-flex uk-flex-middle" v-if="itemSelector && !isMobile()">
            <ClientOnly>
                <AtomsSelector 
                    v-model:item-count="itemCount"
                    :amount="store.totalQueryAccounts"
                    :options="[5, 10, 20, 50]"
                />
            </ClientOnly>
        </div>
        <AtomsPageArrows    
            v-model:page="pageNum" 
            :left-disabled="pageNum === 0" 
            :right-disabled="((pageNum+1)*itemCount >= keys.length && !update) || lastPageFlag"
        />
    </div>
</template>