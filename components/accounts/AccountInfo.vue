<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface Props {
    hex: string
}

const error = ref(false)
const store = useMainStore()
const props = defineProps<Props>()
const emits = defineEmits(['setHex'])

const route = useRoute()

const account = computed(() => store.accounts[props.hex] ?? null)
const trKeys = computed(() => account.value?.transaction_keys?.length > 0 ? account.value.transaction_keys : [] as TransactionKey[])
const jtKeys = computed(() => account.value?.jetton_wallets?.length > 0 ? account.value.jetton_wallets : [] as JettonWalletKey[])
const minterKeys = computed(() => account.value?.minted_nfts?.length > 0 ? account.value.minted_nfts : [] as NFTKey[])
const ownerKeys = computed(() => account.value?.nft_keys?.length > 0 ? account.value.nft_keys : [] as NFTKey[])

const reloadInfo = async() => {
    error.value = false
    if (!(props.hex in store.accounts) || jtKeys.value.length === 0 || minterKeys.value.length === 0 || ownerKeys.value.length === 0) {
        const res = await store.fetchAccount(props.hex)
        if (props.hex != res) emits('setHex', res)
    }
    if (!account.value) {
        error.value = true
        return;
    }
}

onMounted(async() => reloadInfo())

watch(props, async() => await reloadInfo())
</script>

<template>
    <template v-if="error">
        <NuxtLink @click.prevent.stop="$router.back()">
            {{ 'An error occured while loading account! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <AccountsPropsTable v-if="account" :acc="account"/>
        <div v-if="account">
            <ul v-if="trKeys.length > 0" class="uk-child-width-expand uk-text-medium" uk-tab>
                <li v-if="trKeys.length > 0" :class="{'uk-active' : (route.hash === '#transactions' || route.hash === '#overview')}">
                    <NuxtLink :to="{ hash: '#transactions', query: route.query}">
                        {{ $t('route.transactions') }}
                    </NuxtLink>
                </li>
                <li v-if="jtKeys.length > 0" :class="{'uk-active' : (route.hash === '#jettons')}">
                    <NuxtLink :to="{ hash: '#jettons', query: route.query}">
                        {{ $t('route.jettons') }}
                    </NuxtLink>
                </li>
                <li v-if="ownerKeys.length > 0" :class="{'uk-active' : (route.hash === '#nfts')}">
                    <NuxtLink :to="{ hash: '#nfts', query: route.query}">
                        {{ $t('route.nfts') }}
                    </NuxtLink>
                </li>
                <li v-if="minterKeys.length > 0" :class="{'uk-active' : (route.hash === '#minter')}">
                    <NuxtLink :to="{ hash: '#minter', query: route.query}">
                        {{ $t('ton.minter') }}
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
    </template>
</template>