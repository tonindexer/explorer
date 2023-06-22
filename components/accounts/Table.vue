<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface AccountTable {
    keys: AccountKey[]
    update: boolean
    defaultLength: number
    itemSelector: boolean
    hidden: boolean
    contract: string | null
}

const props = defineProps<AccountTable>()

const store = useMainStore()
const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const firstTX: NullableBigRef = ref(0n)
const lastTX: NullableBigRef = ref(0n)
const lastPageFlag = computed(() => props.update ? store.nextPageFlag(itemCount.value * (pageNum.value+1), 'acc') : false)

const maxExploredPage = ref(0)
const loading = computed(() => props.keys.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value).length === 0)

const setExtraFields = () => {
    if (props.keys.length > 0) {
        if (props.keys[0] in store.accounts) {
            firstTX.value = BigInt(store.accounts[props.keys[0]].last_tx_lt)
        }
        if (props.keys[props.keys.length - 1] in store.accounts) {
            lastTX.value = BigInt(store.accounts[props.keys[props.keys.length - 1]].last_tx_lt)
        }
    }
}

const updateValues = async (next: boolean = true) => {
    if (!props.update) return
    if (props.keys.length === 0 || pageNum.value === 0)
        await store.updateAccounts(itemCount.value, null, props.contract)
    else {
        await store.updateAccounts(itemCount.value, next ? lastTX.value : firstTX.value, props.contract)
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

watch(itemCount, async() => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep : true})

watch(() => props.contract, () => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
})

onMounted(() => {
    setExtraFields()
})
</script>

<template>
    <template v-if="loading">
        <div class="uk-flex uk-flex-center">
            <Loader />
        </div>
    </template>
    <template v-else>
        <table v-if="!hidden" class="uk-table uk-table-divider uk-table-middle uk-margin-remove-top">
            <thead>
                <tr>
                    <th class="uk-width-1-3">{{ $t('ton.id')}}</th>
                    <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
                    <th class="uk-table-shrink uk-text-right" style="margin-right: 0.3rem;">{{ $t('general.updated')}}</th>
                </tr>
            </thead>
            <tbody>
                <template v-for="acc in keys.slice(pageNum*itemCount, (pageNum+1)*itemCount)">
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
                :right-disabled="((pageNum+1)*itemCount >= keys.length && !update) || lastPageFlag"
                @increase="pageNum += 1"
                @decrease="pageNum -= 1"
            />
        </div>
    </template>
</template>