<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
import { ModelSelect } from 'vue-search-select'
const route = useRoute()
const router = useRouter()

interface AccountTable {
    keys: AccountKey[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
}

type SelectItem = {
    value: string,
    text: string
}

const props = defineProps<AccountTable>()

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const firstTX: NullableBigRef = ref(0n)
const lastTX: NullableBigRef = ref(0n)
const lastPageFlag = computed(() => props.update ? store.nextPageFlag(itemCount.value * (pageNum.value+1), 'acc') : false)

const maxExploredPage = ref(0)
const loading = computed(() => props.update && props.keys.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value).length === 0)
const emptyTable = ref(false)

const selected: Ref<SelectItem | {}> = ref({ value: '', text: ''})
const selectedMobile = ref('All')
const contract = computed(() => route.query.contract? route.query.contract.toString() : null)

const options = computed(() => Object.values(store.interfaces).map(item => { return { value: item.name, text: item.name}}).sort((a, b) => a.text > b.text ? 1 : -1))
const optionsMobile = computed(() : string[] => {
    const defualt = ['All']
    defualt.push(...Object.keys(store.interfaces))
    return defualt.sort()
})

const reset = () => { 
    selected.value = {};
    selectedMobile.value = 'All' 
}

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
    if ('value' in selected.value && selected.value.value !== '')
        contract = selected['value'].value
    else if (selectedMobile.value !== 'All') contract = selectedMobile.value

    if (!('hex' in route.query)) {
        const queryString = getQueryString({ contract } , true)
        if (queryString || route.fullPath.split('?')[1] !== queryString) router.replace(`/accounts?${queryString}`)
    }

}

const routeChecker = () => {
    if (route.path !== '/accounts') return
    if ('contract' in route.query && route.query.contract !== '') {
        isMobile() ? (selectedMobile.value = route.query.contract?.toString() ?? 'All') :
            selected.value = {value: route.query.contract, text: route.query.contract }
    } else {
        selectedMobile.value = 'All'
        selected.value = {}
    }
}
const updateValues = async (next: boolean = true) => {
    if (!props.update) return
    emptyTable.value = false
    if (props.keys.length === 0 || pageNum.value === 0)
        await store.updateAccounts(itemCount.value, null, {interface: contract.value})
    else {
        await store.updateAccounts(itemCount.value, next ? lastTX.value : firstTX.value, {contract: contract.value})
    }
    if (props.keys.length === 0) emptyTable.value = true
}

watch(contract, () => 
    isMobile() ? (selectedMobile.value = route.query.contract?.toString() ?? 'All') :
            selected.value = {value: route.query.contract, text: route.query.contract })

watch(selected, (to, from) => {
    if (to !== from)
        setRoute()
})
watch(selectedMobile, () => setRoute())

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
    <div v-if="route.path === '/accounts'" class="uk-flex uk-flex-right" style="padding: 12px;">
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
        <a v-if="Object.keys(selected).length > 0 && contract" uk-icon="icon: close" @click="reset" style="align-self: center; margin-left: 0.5rem;"></a>
    </div>
    <template v-if="emptyTable && store.totalQueryAccounts === 0">
        <div class="uk-flex uk-margin-top">
            {{ $t('warning.nothing_found') }}
        </div>
    </template>
    <template v-else-if="loading">
        <div class="uk-flex uk-flex-center">
            <Loader />
        </div>
    </template>
    <template v-else-if="!hidden">
        <table class="uk-table uk-table-divider uk-table-middle uk-margin-remove-top">
            <thead v-if="!isMobile()">
                <tr>
                    <th class="uk-width-2-5">{{ $t('ton.id')}}</th>
                    <th class="uk-width-1-3">{{ $t('ton.contract')}}</th>
                    <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
                    <th class="uk-width-1-6 uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.updated')}}</th>
                </tr>
            </thead>
            <tbody>
                <template v-for="acc in keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                    <AccountsTableLine :acc="store.accounts[acc]"/>
                </template>
            </tbody>
        </table>
        <div class="uk-flex uk-width-1-1 uk-flex-middle uk-margin-remove-bottom" style="justify-content: flex-end; padding-right: 12px;">
            <div class="uk-flex uk-flex-middle" v-if="itemSelector && !isMobile()">
                <ClientOnly>
                    <AtomsSelector 
                        :item-count="itemCount"
                        :amount="store.totalQueryAccounts"
                        :options="[5, 10, 20, 50]"
                        @set-value="(e: any) => itemCount = e.value"
                    />
                </ClientOnly>
            </div>
            <AtomsPageArrows    
                :page="pageNum" 
                :left-disabled="pageNum === 0" 
                :right-disabled="((pageNum+1)*itemCount >= keys.length && !update) || lastPageFlag"
                @increase="pageNum += 1"
                @decrease="pageNum -= 1"
            />
        </div>
    </template>
</template>