<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface TransactionTable {
    keys: string[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
    excludeMC?: boolean
}

const props = defineProps<TransactionTable>()

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const firstMC: NullableBigRef = ref(0n)
const lastMC: NullableBigRef = ref(0n)

const updateValues = async (next: boolean = true) => {
    if (!props.update) return
    if (props.keys.length === 0 || pageNum.value === 0)
        await store.updateTransactions(itemCount.value, null, props.excludeMC)
    else {
        await store.updateTransactions(itemCount.value, next ? lastMC.value : firstMC.value, props.excludeMC)
    }
    firstMC.value = BigInt(store.transactions[props.keys[0]].created_lt)
    lastMC.value = BigInt(store.transactions[props.keys[props.keys.length - 1]].created_lt)
}

watch(() => props.excludeMC, () => {
    store.updateTransactions(itemCount.value, null, props.excludeMC)
    pageNum.value = 0
})

watch(pageNum, async() => {
    if (props.update) { 
        await updateValues() 
    }
}, {deep : true}) 

watch(itemCount, async() => {
    if (itemCount.value > props.keys.length)
        await updateValues(false)
    else lastMC.value = BigInt(store.transactions[props.keys[itemCount.value - 1]].created_lt)
    
}, {deep : true})

onMounted(() => updateValues())
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
            <template v-for="trn in update ? props.keys.slice(0, itemCount) : props.keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
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
                :right-disabled="(pageNum+1)*itemCount >= keys.length && !update"
                :hidden="itemCount >= keys.length && !update"
                @increase="pageNum += 1"
                @decrease="pageNum -= 1"
            />            
        </div>
</template>