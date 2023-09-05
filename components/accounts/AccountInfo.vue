<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface Props {
    hex: string
}

const error = ref(false)
const loading = ref(true)
const store = useMainStore()
const props = defineProps<Props>()
const emits = defineEmits(['setHex'])

const route = useRoute()

const account = computed(() => store.accounts[props.hex] ?? null)
const trKeys = computed(() => account.value?.transaction_keys?.length > 0 ? account.value.transaction_keys : [] as TransactionKey[])
const jtKeys = computed(() => account.value?.jetton_wallets?.length > 0 ? account.value.jetton_wallets : [] as AccountKey[])
const minterKeys = computed(() => account.value?.minted_nfts?.length > 0 ? account.value.minted_nfts : [] as AccountKey[])
const ownerKeys = computed(() => account.value?.owned_nfts?.length > 0 ? account.value.owned_nfts : [] as AccountKey[])
const getMethods = computed(() => account.value?.executed_get_methods && Object.keys(account.value.executed_get_methods).length > 0 ? account.value.executed_get_methods : {} as {[key: string] : GetMethod[]})
const trDesc = ref(true)
const sankeyType = ref("count")

const reloadInfo = async() => {
    error.value = false
    loading.value = true
    if (!(props.hex in store.accounts) || jtKeys.value.length === 0 || minterKeys.value.length === 0 || ownerKeys.value.length === 0) {
        const res = await store.fetchAccount(props.hex)
        if (props.hex != res) emits('setHex', res)
    }
    loading.value = false
    if (!account.value) {
        error.value = true
        return;
    }
}

onMounted(async() => reloadInfo())

watch(() => props.hex, async() => await reloadInfo())
</script>

<template>
    <template v-if="error">
        <NuxtLink :to="{ path: 'accounts' }">
            {{ 'An error occured while loading account! Go to overview page..' }}
        </NuxtLink>
    </template>
    <template v-else-if="loading">
        <div class="uk-flex uk-flex-center">
            <Loader />
        </div>
    </template>
    <template v-else-if="account">
        <AtomsTile :body="true" :tile-style="'margin-top: 32px'">
            <template #body>
                <AccountsPropsTable :acc="account"/>
            </template>
        </AtomsTile>
        <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 32px; padding-bottom: 16px'" :client-body="true" >
            <template #top>
                <ul v-if="trKeys.length > 0" class="uk-child-width-expand uk-text-medium tab-styler" :style="isMobile() ? 'margin-bottom: 0.3rem' : ''" uk-tab>
                    <li class="uk-margin-remove-left" v-if="trKeys.length > 0" :class="{'uk-active' : (route.hash === '#transactions' || route.hash === '#overview')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#transactions', query: route.query}">
                            {{ $t('route.transactions')}}
                            <span>
                                {{ account.transaction_amount }}
                            </span>
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" v-if="jtKeys.length > 0" :class="{'uk-active' : (route.hash === '#jettons')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#jettons', query: route.query}">
                            {{ $t('route.jettons') }}
                            <span>
                                {{ account.jetton_amount }}
                            </span>
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" v-if="account.address.hex in store.jettonHolders" :class="{'uk-active' : (route.hash === '#jetton_holders')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#jetton_holders', query: route.query}">
                            {{ $t('ton.jetton_holders') }}
                            <span>
                                {{ store.jettonHolders[account.address.hex].wallets }}
                            </span>
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" v-if="ownerKeys.length > 0" :class="{'uk-active' : (route.hash === '#nfts')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#nfts', query: route.query}">
                            {{ $t('route.nfts') }}
                            <span>
                                {{ account.nft_amount }}
                            </span>
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" v-if="minterKeys.length > 0" :class="{'uk-active' : (route.hash === '#minter')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#minter', query: route.query}">
                            {{ $t('ton.minter') }}
                            <span>
                                {{ account.minted_amount }}
                            </span>
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" v-if="account.address.hex in store.nftHolders" :class="{'uk-active' : (route.hash === '#nft_holders')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#nft_holders', query: route.query}">
                            {{ $t('ton.nft_holders') }}
                            <span>
                                {{ store.nftHolders[account.address.hex].owners_count }}
                            </span>
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" v-if="Object.keys(getMethods).length > 0" :class="{'uk-active' : (route.hash === '#get_methods')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#get_methods', query: route.query}">
                            {{ $t('ton.get_methods') }}
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" v-if="hex in store.sankeyCount" :class="{'uk-active' : (route.hash === '#money_flow')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#money_flow', query: route.query}">
                            {{ $t('general.money_flow') }}
                        </NuxtLink>
                    </li>
                </ul>
            </template>
            <template #body>
                <div v-show="(route.hash === '#transactions' || route.hash === '#overview')" id="transactions">
                    <label class="uk-align-right uk-margin-right uk-margin-remove-bottom"><input v-model="trDesc" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.desc') }}</label>
                    <LazyTransactionsTable :keys="trKeys" :default-length="10" :hidden="trKeys.length === 0" :update="true" :item-selector="true" :filters="{}" :account="hex" :order="trDesc ? 'DESC' : 'ASC'"/>
                </div>
                <div v-if="route.hash === '#jettons'" id="jettons">
                    <LazyAccountsJettonsTable :owner="hex" :keys="jtKeys" :default-length="10" />
                </div>
                <div v-if="route.hash === '#nfts'" id="nfts" style="padding: 0 12px;">
                    <LazyAccountsNFTGrid :minter-flag="false" :keys="ownerKeys" :default-length="18" :account="hex" />
                </div>
                <div v-if="route.hash === '#minter'" id="minter" style="padding: 0 12px;">
                    <LazyAccountsNFTGrid :minter-flag="true" :keys="minterKeys" :default-length="18" :account="hex" />
                </div>
                <div v-if="route.hash === '#nft_holders' && account.address.hex in store.nftHolders" id="nft_holders" style="padding: 0 12px;">
                    <AccountsTopNFTHolders :keys="store.nftHolders[account.address.hex].owned_items ?? []" :minter="hex" :default-length="10" />
                </div>
                <div v-if="route.hash === '#jetton_holders' && account.address.hex in store.jettonHolders" id="jetton_holders">
                    <AccountsTopJettonHolders :minter="hex" :keys="store.jettonHolders[account.address.hex].owned_balance ?? []" :default-length="10" />
                </div>
                <div v-if="route.hash === '#get_methods'" id="get_methods" style="padding: 0 12px">
                    <AccountsGetMethods :methods="getMethods"/>
                </div>
                <div v-if="route.hash === '#money_flow'" id="money_flow">
                    <div class="uk-form-controls">
                        <label><input class="uk-radio" type="radio" v-model="sankeyType" value="count" name="radio1"> {{ $t('options.count') }} </label><br>
                        <label><input class="uk-radio" type="radio" v-model="sankeyType" value="amount" name="radio1"> {{ $t('options.amount') }} </label>
                    </div>
                    <GraphSankey :hex="hex" :count="sankeyType === 'count'"></GraphSankey>
                </div>
            </template>
        </AtomsTile>
    </template>
</template>