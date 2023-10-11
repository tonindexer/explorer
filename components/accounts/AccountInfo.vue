<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const router = useRouter()

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
const sankeyType = ref("count")

const routes = computed(() => {
    const output: { route: string, t: string }[] = []
    if (account.value.transaction_amount > 0) output.push({ route: 'transactions', t: 'route.transactions'})
    if (account.value.transaction_amount > 0) output.push({ route: 'money_flow', t: 'general.money_flow'})
    if (account.value.jetton_amount > 0) output.push({ route: 'jettons', t: 'route.jettons'})
    if (account.value.types?.includes('jetton_minter')) output.push({ route: 'jetton_holders', t: 'ton.jetton_holders'})
    if (account.value.nft_amount > 0) output.push({ route: 'nfts', t: 'route.nfts'})
    if (account.value.types?.includes('nft_collection')) output.push({ route: 'minter', t: 'ton.minter'})
    if (account.value.types?.includes('nft_collection')) output.push({ route: 'nft_holders', t: 'ton.nft_holders'})
    if (Object.keys(getMethods.value).length > 0) output.push({ route: 'get_methods', t: 'ton.get_methods'})
    return output
})

const selectedRoute = ref('')

const reloadInfo = async() => {
    error.value = false
    loading.value = true
    if (!(props.hex in store.accounts) || !store.accounts[props.hex].loaded) {
        const res = await store.fetchAccount(props.hex)
        if (props.hex != res) emits('setHex', res)
    }

    selectedRoute.value = route.hash ? 
        (route.hash.slice(1,) === 'overview' ? 
            'transactions' : route.hash.slice(1,)) : 'transacitions'
                
    loading.value = false
    if (!account.value) {
        error.value = true
        return;
    }
}

onMounted(async() => reloadInfo())

watch(selectedRoute, (to, from) => {
    if (to !== from)
        router.replace({ hash: '#' + selectedRoute.value, query: route.query})
})

watch(() => props.hex, async() => await reloadInfo())
</script>

<template>
    <template v-if="error">
        <NuxtLink :to="{ name: 'accounts' }">
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
        <AtomsTile :top="true" :body="true" :tile-style="'margin-top: 32px; padding-bottom: 16px'">
            <template #top>
                <select v-if="isMobile()" :value="selectedRoute" aria-label="Select" @change="($event: any) => selectedRoute = $event.target.value" class="uk-select uk-padding-remove-bottom uk-text-primary uk-background-primary">
                    <option v-for="option in routes" :value="option.route">{{ $t(option.t) }}</option>
                </select>
                <div v-if="!isMobile()" class="category-wrapper">
                    <div class="uk-flex uk-flex-middle uk-margin-remove-top">
                        <NuxtLink v-if="account.transaction_amount> 0" class="category" :to="{ hash: '#transactions', query: route.query}" :class="{'selected white': (route.hash === '#transactions' || route.hash === '#overview')}">
                            {{ $t('route.transactions')}}
                        </NuxtLink>
                        <NuxtLink v-for="item in routes.slice(1,)" class="category" :to="{ hash: `#${item.route}`, query: route.query}" :class="{'selected white': (route.hash === `#${item.route}`)}">
                            {{ $t(item.t)}}
                        </NuxtLink>
                    </div>
                </div>
            </template>
            <template #body>
                <div v-if="(route.hash === '#transactions' || route.hash === '#overview')" id="transactions">
                    <LazyTransactionsTable :keys="trKeys" :default-length="10" :hidden="trKeys.length === 0" :update="true" :item-selector="true" :account="hex"/>
                </div>
                <div v-if="route.hash === '#jettons'" id="jettons">
                    <LazyAccountsJettonsTable :owner="hex" :keys="jtKeys" :default-length="10" />
                </div>
                <div v-if="route.hash === '#nfts'" id="nfts" style="padding: 0 16px;">
                    <LazyAccountsNFTGrid :minter-flag="false" :keys="ownerKeys" :default-length="18" :account="hex" />
                </div>
                <div v-if="route.hash === '#minter' && account.types?.includes('nft_collection')" id="minter" style="padding: 0 16px;">
                    <LazyAccountsNFTGrid :minter-flag="true" :keys="minterKeys" :default-length="18" :account="hex" />
                </div>
                <div v-if="route.hash === '#nft_holders' && account.types?.includes('nft_collection')" id="nft_holders" style="padding: 0 16px;">
                    <AccountsTopNFTHolders :keys="store.nftHolders[account.address.hex]?.owned_items ?? []" :minter="hex" :default-length="10" />
                </div>
                <div v-if="route.hash === '#jetton_holders' && account.types?.includes('jetton_minter')" id="jetton_holders">
                    <AccountsTopJettonHolders :minter="hex" :keys="store.jettonHolders[account.address.hex]?.owned_balance ?? []" :default-length="10" />
                </div>
                <div v-if="route.hash === '#get_methods'" id="get_methods" style="padding: 0 16px">
                    <AccountsGetMethods :methods="getMethods"/>
                </div>
                <div v-if="route.hash === '#money_flow'" id="money_flow" style="padding: 0 16px">
                    <div class="uk-form-controls uk-text-primary">
                        <label><input class="uk-radio" type="radio" v-model="sankeyType" value="count" name="radio1"> {{ $t('options.count') }} </label><br>
                        <label><input class="uk-radio" type="radio" v-model="sankeyType" value="amount" name="radio1"> {{ $t('options.amount') }} </label>
                    </div>
                    <GraphSankey :hex="hex" :count="sankeyType === 'count'"></GraphSankey>
                </div>
            </template>
        </AtomsTile>
    </template>
</template>