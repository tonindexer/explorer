<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface TransactionTable {
    keys: string[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
    account: AccountKey | null
    filters: MockType,
    order: "ASC" | "DESC"
}

const props = defineProps<TransactionTable>()

const store = useMainStore()
const pageNum = ref(0)
const maxExploredPage = ref(0)

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
        await store.updateTransactions(itemCount.value, null, props.filters, props.account, props.order)
    }
    else {
        await store.updateTransactions(itemCount.value, next ? lastLT.value : firstLT.value, props.filters, props.account, props.order)
    }
    if (props.keys.length === 0) emptyTable.value = true

}

watch(pageNum, async(to, from) => {
    if (props.update) {
        if (to === 0 || (to > from && to > maxExploredPage.value)) { 
            maxExploredPage.value = to
            await updateValues()
        }
    }
}, {deep : true}) 

watch(() => props.filters, () => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
})

watch(() => props.order, () => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
})

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
})
</script>

<template>
    <template v-if="emptyTable">
        <div class="uk-flex uk-margin-top">
            {{ $t('warning.nothing_found') }}
        </div>
    </template>
    <template v-else-if="loading && !hidden">
        <div class="uk-flex uk-flex-center">
            <Loader />
        </div>
    </template>
    <template v-else>
        <table v-if="!hidden" class="uk-table uk-table-divider uk-table-middle uk-margin-remove-vertical">
            <thead v-if="!isMobile()">
                <tr>
                    <th class="uk-table-shrink" style="min-width: 20px"></th>
                    <th class="uk-table-shrink" style="min-width: 20px"></th>
                    <th class="uk-width-1-5">OP</th>
                    <th class="uk-table-expand">{{ $t('route.transaction')}}</th>
                    <th class="uk-width-1-6 uk-text-right">{{ $t('ton.balance')}}</th>
                    <th class="uk-table-shrink uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.created')}}</th>
                </tr>
            </thead>
            <tbody>
                <template v-for="trn in props.keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                    <TransactionsTableLine :trn="store.transactions[trn]" :msg-show="store.transactionMsgFlag[trn]" @toggle-msg="(e) => toggleMsg(e)"/>
                        <td colspan="6" class="uk-padding-remove" 
                            v-if="!isMobile() && [store.transactions[trn].in_msg_hash, ...store.transactions[trn].out_msg_keys].length > 0 && store.transactionMsgFlag[trn]"
                            style="border-bottom: 2px solid #d0d0d0; border-top: 2px solid #d0d0d0;">
                            <MessagesTable 
                                :filters="{}"
                                :show-link="false"
                                :item-selector="false" 
                                :default-length="10" 
                                :update="false" 
                                :keys="[store.transactions[trn].in_msg_hash, ...store.transactions[trn].out_msg_keys]" 
                                :hidden="[store.transactions[trn].in_msg_hash, ...store.transactions[trn].out_msg_keys].length === 0"
                            />
                        </td>
                </template>
            </tbody>
        </table>
        <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle uk-margin-remove-vertical" style="justify-content: flex-end;">
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
</template>