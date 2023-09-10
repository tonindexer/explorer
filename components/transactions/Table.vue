<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const route = useRoute()
const router = useRouter()

interface TransactionTable {
    keys: string[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
    account: AccountKey | null
}

const props = defineProps<TransactionTable>()

const store = useMainStore()
const pageNum = ref(0)
const maxExploredPage = ref(0)

const workchain = ref<'main' | 'base' | null>(null)
const sortby = ref({
    order_desc: true
})
const itemCount = ref(props.defaultLength)
const firstLT: NullableBigRef = ref(0n)
const lastLT: NullableBigRef = ref(0n)
const lastPageFlag = computed(() => props.update ? 
    (props.account ? 
        ((itemCount.value * (pageNum.value+1)) >= store.accounts[props.account ?? '']?.transaction_amount)
        : store.nextPageFlag(itemCount.value * (pageNum.value+1), 'trn'))
    : false)
const toggleMsg = (key: TransactionKey) => store.transactionMsgFlag[key] = !store.transactionMsgFlag[key]

const loading = computed(() => props.update && props.keys.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value).length === 0)
const emptyTable = ref(false)

const setExtraFields = () => {
    if (props.keys.length > 0) {
        if (props.keys[0] in store.transactions) {
            firstLT.value = BigInt(store.transactions[props.keys[0]].created_lt)
        }
        if (props.keys[props.keys.length - 1] in store.transactions) {
            lastLT.value = BigInt(store.transactions[props.keys[props.keys.length - 1]].created_lt)
        }
    }
}
const updateValues = async (next: boolean = true) => {
    if (!props.update) return
    emptyTable.value = false
    setExtraFields()
    if (props.keys.length === 0 || pageNum.value === 0) {
        await store.updateTransactions(itemCount.value, null, workchain.value, props.account, sortby.value.order_desc ? 'DESC' : 'ASC')
    }
    else {
        await store.updateTransactions(itemCount.value, next ? lastLT.value : firstLT.value, workchain.value, props.account, sortby.value.order_desc ? 'DESC' : 'ASC')
    }
    if (props.keys.length === 0) emptyTable.value = true

}

const setRoute = () => {
    if (route.path !== '/transactions') return

    if (!('hash' in route.query)) {
        if (!workchain.value) {
            router.replace(`/transactions`)
            return
        }
        const queryString = getQueryString({ workchain: workchain.value === 'base' ? '0' : '-1' } , true)
        if (queryString || route.fullPath.split('?')[1] !== queryString) router.replace(`/transactions?${queryString}`)
    }

}

const routeChecker = () => {
    if (route.path !== '/transactions') return
    if ('workchain' in route.query && (route.query.workchain === '0' || route.query.workchain === '-1')) {
        workchain.value = route.query.workchain === '-1' ? 'main' : 'base'
    } else {
        workchain.value = null
    }
}

watch(pageNum, async(to, from) => {
    if (props.update) {
        if (to === 0 || (to > from && to > maxExploredPage.value)) { 
            maxExploredPage.value = to
            await updateValues()
        }
    }
}, {deep : true}) 

watch(workchain, () => {
    setRoute()
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
})

watch(sortby, () => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep: true})

watch(() => props.account, () => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
})

watch(itemCount, async() => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep : true})

onMounted(() => {
    setExtraFields()
    routeChecker()
})
</script>

<template>
    <table v-if="!hidden" class="uk-table uk-table-middle uk-margin-remove-top" :class="{'uk-table-divider' : isMobile(), 'uk-table-striped': !isMobile()}">
        <colgroup v-if="!isMobile()">
            <col width="13%" />
            <col width="13%" />
            <col width="25%" />
            <col width="13%" />
            <col width="13%" />
            <col width="13%" />
            <col width="10%" />
        </colgroup>
        <thead v-if="!isMobile()">
            <tr>
                <th style="width:13%; min-width: 20px">{{ $t('ton.id') }}</th>
                <th class="uk-flex" style="position: relative; width: fit-content;" :class="{'dropdown-text filter-icon hover-header' : update && route.path === '/transactions'}">
                    {{ $t('ton.type')}}
                    <div class="dropdown-filter">
                        <div class="uk-child-width-auto uk-text-left uk-text-nowrap uk-text-primary" style="padding: 8px 16px;">
                            <label><input type="radio" :value="null" v-model="workchain" class="uk-radio uk-margin-small-right">{{ $t('options.both') }}</label>
                        </div>
                        <div class="uk-child-width-auto uk-text-left uk-text-nowrap uk-text-primary" style="padding: 8px 16px;">
                            <label><input type="radio" :value="'base'" v-model="workchain" class="uk-radio uk-margin-small-right">{{ $t('options.basechain') }}</label>
                        </div>
                        <div class="uk-child-width-auto uk-text-left uk-text-nowrap uk-text-primary" style="padding: 8px 16px;">
                            <label><input type="radio" :value="'main'" v-model="workchain" class="uk-radio uk-margin-small-right">{{ $t('options.masterchain') }}</label>
                        </div>
                    </div>
                </th>
                <th class="uk-table-expand" style="width:25%;">{{ $t('ton.operation_name') }}</th>
                <th class="uk-text-right" style="width:13%;">{{ $t('general.amount')}}</th>
                <th class="uk-text-right" style="width:13%;">{{ $t('general.sender')}}</th>
                <th class="uk-text-right" style="width:13%;">{{ $t('general.receiver')}}</th>
                <th class="uk-text-right uk-text-nowrap" style="width:10%;" :class="{'hover-header' : update}" @click="sortby.order_desc = !sortby.order_desc">
                    {{ $t('general.created') + (update ? (sortby.order_desc ? ' ▼' : ' ▲') : '') }}
                </th>
            </tr>
        </thead>
        <template v-if="emptyTable">
            <div class="uk-flex uk-margin-top">
                {{ $t('warning.nothing_found') }}
            </div>
        </template>
        <template v-else-if="loading && !hidden">
            <tr class="uk-text-center">
                <td colspan="7">
                    <Loader />
                </td>
            </tr>
        </template>
        <template v-else>
                <tbody>
                    <template v-for="trn in props.keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                        <TransactionsTableLine :trn="store.transactions[trn]" :msg-show="store.transactionMsgFlag[trn]" @toggle-msg="(e) => toggleMsg(e)"/>
                    </template>
                </tbody>
        </template>
    </table>
    <div v-show="!emptyTable && !loading && !hidden" class="uk-flex uk-width-1-1 uk-flex-middle uk-margin-remove-vertical" style="justify-content: flex-end; padding-right: 12px;">
        <div class="uk-flex uk-flex-middle" v-if="itemSelector && !isMobile() && !hidden">
            <AtomsSelector 
                :item-count="itemCount"
                :amount="account ? store.accounts[account].transaction_amount : store.totalQueryTransactions"
                :options="[5, 10, 20, 50]"
                @set-value="(e: any) => itemCount = e.value"
            />
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