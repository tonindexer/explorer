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
const jtKeys = computed(() => account.value?.jetton_wallets?.length > 0 ? account.value.jetton_wallets : [] as JettonWalletKey[])
const minterKeys = computed(() => account.value?.minted_nfts?.length > 0 ? account.value.minted_nfts : [] as NFTKey[])
const ownerKeys = computed(() => account.value?.nft_keys?.length > 0 ? account.value.nft_keys : [] as NFTKey[])
const getMethods = computed(() => account.value?.executed_get_methods && Object.keys(account.value.executed_get_methods).length > 0 ? account.value.executed_get_methods : {} as {[key: string] : GetMethod})

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
    <template v-else>
        <AccountsPropsTable v-if="account" :acc="account"/>
        <div v-if="account">
            <ul v-if="trKeys.length > 0" class="uk-child-width-expand uk-text-medium" :style="isMobile() ? 'margin-bottom: 0.3rem' : ''" uk-tab>
                <li class="uk-margin-remove-left" v-if="trKeys.length > 0" :class="{'uk-active' : (route.hash === '#transactions' || route.hash === '#overview')}" style="min-width: fit-content;">
                    <NuxtLink :to="{ hash: '#transactions', query: route.query}">
                        {{ $t('route.transactions') + ` (${store.totalQueryTransactions})` }}
                    </NuxtLink>
                </li>
                <li class="uk-margin-remove-left" v-if="jtKeys.length > 0" :class="{'uk-active' : (route.hash === '#jettons')}" style="min-width: fit-content;">
                    <NuxtLink :to="{ hash: '#jettons', query: route.query}">
                        {{ $t('route.jettons') + ` (${store.totalQueryJettonWallets})`}}
                    </NuxtLink>
                </li>
                <li class="uk-margin-remove-left" v-if="ownerKeys.length > 0" :class="{'uk-active' : (route.hash === '#nfts')}" style="min-width: fit-content;">
                    <NuxtLink :to="{ hash: '#nfts', query: route.query}">
                        {{ $t('route.nfts') + ` (${store.totalAccountNFTOwned})`}}
                    </NuxtLink>
                </li>
                <li class="uk-margin-remove-left" v-if="minterKeys.length > 0" :class="{'uk-active' : (route.hash === '#minter')}" style="min-width: fit-content;">
                    <NuxtLink :to="{ hash: '#minter', query: route.query}">
                        {{ $t('ton.minter') + ` (${store.totalQueryNFTMinters})`}}
                    </NuxtLink>
                </li>
                <li class="uk-margin-remove-left" v-if="Object.keys(getMethods).length > 0" :class="{'uk-active' : (route.hash === '#get_methods')}" style="min-width: fit-content;">
                    <NuxtLink :to="{ hash: '#get_methods', query: route.query}">
                        {{ $t('ton.get_methods') }}
                    </NuxtLink>
                </li>
            </ul>
        </div>
        <div v-show="account && (route.hash === '#transactions' || route.hash === '#overview')" id="transactions">
            <LazyTransactionsTable :keys="trKeys" :default-length="10" :hidden="trKeys.length === 0" :update="true" :item-selector="false" :account="hex" />
        </div>
        <div v-if="account && route.hash === '#jettons'" id="jettons">
            <LazyAccountsJettonsTable :owner="hex" :keys="jtKeys" :default-length="10" />
        </div>
        <div v-if="account && route.hash === '#nfts'" id="nfts">
            <LazyAccountsNFTGrid :minter-flag="false" :keys="ownerKeys" :default-length="18" :account="hex" />
        </div>
        <div v-if="account && route.hash === '#minter'" id="minter">
            <LazyAccountsNFTGrid :minter-flag="true" :keys="minterKeys" :default-length="18" :account="hex" />
        </div>
        <div v-if="account && route.hash === '#get_methods'" id="get_methods">
            <AccountsGetMethods :methods="getMethods"/>
        </div>
    </template>
</template>