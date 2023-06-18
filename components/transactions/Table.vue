<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface TransactionTable {
    keys: string[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
    account: AccountKey | null
    excludeMC?: boolean
}

const props = defineProps<TransactionTable>()

const store = useMainStore()
const pageNum = ref(0)
const maxExploredPage = ref(0)

const itemCount = ref(props.defaultLength)
const firstLT: NullableBigRef = ref(0n)
const lastLT: NullableBigRef = ref(0n)
const lastPageFlag = computed(() => store.nextPageFlag(itemCount.value * (pageNum.value+1), 'trn'))

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
    if (props.keys.length === 0 || pageNum.value === 0) {
        await store.updateTransactions(itemCount.value, null, props.excludeMC, props.account)
    }
    else {
        await store.updateTransactions(itemCount.value, next ? lastLT.value : firstLT.value, props.excludeMC, props.account)
    }
    setExtraFields()
}

watch(pageNum, async(to, from) => {
    if (props.update) {
        if (to === 0 || (to > from && to > maxExploredPage.value)) { 
            maxExploredPage.value = to
            await updateValues()
        }
    }
}, {deep : true}) 

watch(() => props.excludeMC, () => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
})

watch(itemCount, async() => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep : true})

watch(props, () => {
    setExtraFields()
})

onMounted(() => {
    setExtraFields()
})
</script>

<template>
    <table v-if="!hidden" class="uk-table uk-table-divider uk-table-middle uk-margin-remove-top">
        <thead>
            <tr>
                <th class="uk-width-1-6">{{ $t('ton.id')}}</th>
                <th class="uk-width-1-6">{{ $t('ton.address')}}</th>
                <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
                <th class="uk-table-shrink uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.created')}}</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="trn in props.keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <TransactionsTableLine :trn="store.transactions[trn]"/>
            </template>
        </tbody>
    </table>
        <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle" style="justify-content: flex-end;">
            <div class="uk-flex uk-flex-middle" v-if="itemSelector">
                <AtomsSelector 
                    :item-count="itemCount"
                    :name="'general.items'"
                    :options="[5, 10, 20, 50]"
                    @set-value="(e: any) => itemCount = e.value"
                />
            </div>
            <AtomsPageArrows    
                :page="pageNum" 
                :left-disabled="pageNum === 0" 
                :right-disabled="((pageNum+1)*itemCount >= keys.length && !update) || lastPageFlag"
                :hidden="itemCount >= keys.length && !update"
                @increase="pageNum += 1"
                @decrease="pageNum -= 1"
            />            
        </div>
</template>