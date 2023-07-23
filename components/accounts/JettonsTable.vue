<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface JettonTable {
    keys: AccountKey[]
    owner: AccountKey
    defaultLength: number
}

const props = defineProps<JettonTable>()
const store = useMainStore()

const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const maxExploredPage = ref(0)
const firstLT: NullableBigRef = ref(0n)
const lastLT: NullableBigRef = ref(0n)

const currentBatch = computed(() => props.keys.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value))

const lastPageFlag = computed(() => itemCount.value * (pageNum.value+1) >= store.accounts[props.owner].jetton_amount)

const jtList = computed(() => store.getMetaItems(currentBatch.value))
const jtRelations = computed(() => store.getMetaRelations(currentBatch.value))
const loading = computed(() => props.keys.length === 0 && Object.keys(jtList.value).length === 0)

const setExtraFields = () => {
    if (props.keys.length > 0) {
        if (props.keys[0] in store.accounts) {
            firstLT.value = BigInt(store.accounts[props.keys[0]].last_tx_lt)
        }
        if (props.keys[props.keys.length - 1] in store.accounts) {
            lastLT.value = BigInt(store.accounts[props.keys[props.keys.length - 1]].last_tx_lt)
        }
    }
}

const updateValues = async (next: boolean = true) => {
    if (props.keys.length === 0 || pageNum.value === 0)
        await store.loadAccountJettons(props.owner, false, itemCount.value, null)
    else {
        await store.loadAccountJettons(props.owner, false, itemCount.value, next ? lastLT.value : firstLT.value)
    }
    setExtraFields()
}

watch(pageNum, async(to, from) => {
    if (to === 0 || (to > from && to > maxExploredPage.value)) { 
        maxExploredPage.value = to
        await updateValues()
    }
}, {deep : true}) 

watch(itemCount, async() => {
    if (pageNum.value === 0) updateValues()
    else pageNum.value = 0
}, {deep : true})

watch(props, () => {
    setExtraFields()
})

onMounted(async () => {
    if (props.keys.length === 0 || props.keys.length === Object.keys(jtList.value).length) {
        await store.loadAccountJettons(props.owner, true, 10, null)

    } else if (props.keys.length > 0 && Object.keys(jtList.value).length !== props.keys.length) {
        await store.loadAccountJettons(props.owner, true, 10, null)
    }
    setExtraFields()
})
</script>

<template>
    <div v-if="loading" class="uk-flex uk-flex-center">
        <Loader :ratio="2"/>
    </div>
    <table v-else-if="!loading" class="uk-table uk-table-divider uk-table-middle uk-margin-remove-top">
        <thead v-if="!isMobile()">
            <tr>
                <th class="uk-width-1-4">{{ $t('ton.name')}}</th>
                <th class="uk-width-1-2">{{ $t('ton.wallet')}}</th>
                <th class="uk-table-expand uk-text-right">{{ $t('ton.balance')}}</th>
            </tr>
        </thead>
        <tbody>
            <template template v-for="key of currentBatch.filter(item => item in jtList)">
                <tr>
                    <template v-if="isMobile()">
                        <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical" style="padding: 0.5rem 12px;">
                            <div class="uk-flex uk-flex-row" style="gap: 0.5rem">
                                {{ `${formatTons(Number(store.accounts[key]?.jetton_balance ?? 0), jtList[key].decimals)}` }}
                                <NuxtLink :to="{ path: 'accounts', query: { hex: jtRelations[key].minter.hex }, hash: '#overview'}" class="uk-text-primary">
                                    {{ store.metadata[jtRelations[key].minter.hex]?.symbol ?? '' }}
                                </NuxtLink>
                                <p v-if="store.accounts[key]?.fake" class="uk-margin-remove uk-text-danger">
                                    {{ $t('ton.fake') }}
                                </p>
                            </div>
                            <div class="uk-flex">
                                <div class="uk-margin-remove uk-text-left uk-text-truncate" style="max-width: 85vw">
                                    <AtomsAddressField v-if="key in store.accounts" :break_word="true" :addr="store.accounts[key].address"/>
                                    <Loader :ratio="1" v-else />
                                </div>
                            </div>
                        </td>
                    </template>
                    <template v-else>
                        <td class="uk-flex uk-flex-row" style="gap: 0.5rem">
                            <NuxtLink :to="{ path: 'accounts', query: { hex: jtRelations[key].minter.hex }, hash: '#overview'}" class="uk-text-primary">
                                {{ store.metadata[jtRelations[key].minter.hex]?.name }}
                            </NuxtLink>
                        </td>
                        <td>
                            <AtomsAddressField v-if="key in store.accounts" :break_word="true" :addr="store.accounts[key].address"/>
                            <Loader :ratio="1" v-else />
                        </td>
                        <td class="uk-text-right uk-flex uk-flex-right" style="gap: 0.5rem">
                            {{ `${formatTons(Number(store.accounts[key]?.jetton_balance ?? 0), jtList[key].decimals)} ${store.metadata[jtRelations[key].minter.hex]?.symbol ?? ''}`}}

                            <p v-if="store.accounts[key]?.fake" class="uk-margin-remove uk-text-danger">
                                {{ $t('ton.fake') }}
                            </p>
                        </td>
                    </template>
                </tr>
            </template>
        </tbody>
    </table>
    <div class="uk-flex uk-width-1-1 uk-align-left uk-flex-middle uk-margin-remove-bottom" style="justify-content: flex-end;">
        <div class="uk-flex uk-flex-middle" v-if="!isMobile()">
            <AtomsSelector 
                :item-count="itemCount"
                :amount="store.accounts[owner].jetton_amount"
                :options="[5, 10, 20, 50]"
                @set-value="(e: any) => itemCount = e.value"
            />
        </div>
        <AtomsPageArrows    
            :page="pageNum" 
            :left-disabled="pageNum === 0" 
            :right-disabled="lastPageFlag"
            @increase="pageNum += 1"
            @decrease="pageNum -= 1"
        />
    </div>
</template>