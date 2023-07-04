<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface JettonTable {
    keys: JettonWalletKey[]
    owner: AccountKey
    defaultLength: number
}

const props = defineProps<JettonTable>()
const store = useMainStore()

const pageNum = ref(0)
const itemCount = ref(props.defaultLength)
const maxExploredPage = ref(0)
const loading = computed(() => props.keys.slice(pageNum.value*itemCount.value, (pageNum.value+1)*itemCount.value).length === 0)

const lastPageFlag = computed(() => itemCount.value * (pageNum.value+1) >= store.accounts[props.owner].jetton_amount)

const jtList = computed(() => store.getWallets(props.keys.slice(pageNum.value*itemCount.value, (pageNum.value + 1)*itemCount.value)))
const jtAccs = computed(() => props.keys.slice(pageNum.value*itemCount.value, (pageNum.value + 1)*itemCount.value).map(item => item.split('|')[1]))

const composeAddress = (item: string) => store.accounts[item]?.address ?? null
const loadJettons = async () => {
    await store.fetchBareAccounts(jtAccs.value)

}

watch(pageNum, async(to, from) => {
    if (to === 0 || (to > from && to > maxExploredPage.value)) { 
        maxExploredPage.value = to
        await loadJettons()
    }
}, {deep : true}) 

watch(itemCount, async() => {
    if (pageNum.value === 0) await loadJettons()
    else pageNum.value = 0
}, {deep : true})

onMounted(async () => {
    if (jtList.value.length === 0) {
        await store.loadAccountJettonWallets(props.owner)
        await loadJettons()
    }
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
            <template template v-for="jt of jtList">
                <tr>
                    <template v-if="isMobile()">
                        <td class="uk-flex uk-flex-column uk-align-center uk-width-1-1 uk-margin-remove-vertical" style="padding: 0.5rem 12px;">
                            <div class="uk-flex uk-flex-row" style="gap: 0.5rem">
                                {{ jt.jetton_balance }}
                                <NuxtLink :to="{ path: 'accounts', query: { hex: jt.minter_address }, hash: '#overview'}" class="uk-text-primary">
                                    {{ jt.symbol }}
                                </NuxtLink>
                                <p v-if="store.accounts[jt.wallet_address]?.fake" class="uk-margin-remove uk-text-danger">
                                    {{ $t('ton.fake') }}
                                </p>
                            </div>
                            <div class="uk-flex">
                                <div class="uk-margin-remove uk-text-left uk-text-truncate" style="max-width: 85vw">
                                    <AtomsAddressField v-if="jt.wallet_address in store.accounts" :break_word="true" :addr="composeAddress(jt.wallet_address)"/>
                                    <Loader :ratio="1" v-else />
                                </div>
                            </div>
                        </td>
                    </template>
                    <template v-else>
                        <td class="uk-flex uk-flex-row" style="gap: 0.5rem">
                            <NuxtLink :to="{ path: 'accounts', query: { hex: jt.minter_address }, hash: '#overview'}" class="uk-text-primary">
                                {{ jt.name }}
                            </NuxtLink>
                        </td>
                        <td>
                            <AtomsAddressField v-if="jt.wallet_address in store.accounts" :break_word="true" :addr="composeAddress(jt.wallet_address)"/>
                            <Loader :ratio="1" v-else />
                        </td>
                        <td class="uk-text-right uk-flex uk-flex-right" style="gap: 0.5rem">
                            {{ jt.jetton_balance ? `${jt.jetton_balance} ${jt.symbol}` : $t('general.none') }}

                            <p v-if="store.accounts[jt.wallet_address]?.fake" class="uk-margin-remove uk-text-danger">
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