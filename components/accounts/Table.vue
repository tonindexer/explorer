<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface AccountTable {
    keys: AccountKey[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
}

const props = defineProps<AccountTable>()

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const firstMC: NullableBigRef = ref(0n)
const lastMC: NullableBigRef = ref(0n)

const updateValues = async (next: boolean = true) => {
    if (!props.update) return
    if (props.keys.length === 0 || pageNum.value === 0)
        await store.updateAccounts(itemCount.value, null)
    else {
        await store.updateAccounts(itemCount.value, next ? lastMC.value : firstMC.value)
    }
    firstMC.value = BigInt(store.accounts[props.keys[0]].last_tx_lt)
    lastMC.value = BigInt(store.accounts[props.keys[props.keys.length - 1]].last_tx_lt)
}

watch(pageNum, async() => {
    if (props.update) { 
        await updateValues() 
    }
}, {deep : true}) 

watch(itemCount, async() => {
    if (itemCount.value > props.keys.length)
        await updateValues(false)
    else lastMC.value = BigInt(store.accounts[props.keys[itemCount.value - 1]].last_tx_lt)
    
}, {deep : true})

onMounted(() => updateValues())
</script>

<template>
    <table v-if="!hidden" class="uk-table uk-table-divider uk-table-middle uk-margin-remove-top">
        <thead>
            <tr>
                <th class="uk-width-1-5">{{ $t('ton.id')}}</th>
                <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
                <th class="uk-table-shrink uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.updated')}}</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="acc in update ? keys.slice(0, itemCount) : keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
                <AccountsTableLine :acc="store.accounts[acc]"/>
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