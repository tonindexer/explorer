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

const parentMap = {
    transactions: [ 'transactions', 'money_flow' ],
    jettons: [ 'jettons', 'jetton_holders' ],
    jetton_holders: [ 'jettons', 'jetton_holders' ],
    nfts: [ 'nfts', 'nft_holders', 'minter' ],
    nft_holders: [ 'nfts', 'nft_holders', 'minter' ]
}

const childMap = {
    transactions: { parent: 'transactions', t: 'route' },
    overview: { parent: 'transactions', t: 'general' },
    money_flow: { parent: 'transactions', t: 'general' },
    jettons: { parent: 'jettons', t: 'route' },
    jetton_holders: { parent: 'jettons', t: 'ton' },
    nfts: { parent: 'nfts', t: 'route' },
    nft_holders: { parent: 'nfts', t: 'ton' },
    minter: { parent: 'nfts', t: 'ton' }
} as { [key: string] : { parent: string, t: string } }

type ParentChildRoutes = {
    [key: string]: 'transactions' | 'jettons' | 'nfts'
}

// Routes as their names and parents for further conversion
const allRoutes = computed<ParentChildRoutes>(() => {
    const output: ParentChildRoutes = {}
    if (account.value.transaction_amount > 0) output['transactions'] = 'transactions'
    if (account.value.transaction_amount > 0) output['money_flow'] = 'transactions'
    if (account.value.jetton_amount > 0) output['jettons'] = 'jettons'
    if (account.value.types?.includes('jetton_minter')) output['jetton_holders'] = 'jettons'
    if (account.value.nft_amount > 0) output['nfts'] = 'nfts'
    if (account.value.types?.includes('nft_collection')) output['nft_holders'] = 'nfts'
    if (account.value.types?.includes('nft_collection')) output['minter'] = 'nfts'
    return output
})

const categories = computed(() => {
    const output: RouteLink[] = []
    const walkedRoutes = { 'transactions': false, 'jettons': false, 'nfts': false }
    Object.keys(allRoutes.value).forEach(item => {
        if (!walkedRoutes[allRoutes.value[item]]) { 
            output.push({ route: item, t: `${childMap[allRoutes.value[item]].t}.${allRoutes.value[item]}`, selected: parentMap[allRoutes.value[item]].includes(selectedCategory.value)})
            walkedRoutes[allRoutes.value[item]] = true
        }
    })
    return output
})

const children = computed(() => {
    const output: RouteLink[] = []
    Object.keys(allRoutes.value).forEach(item => {
        if (allRoutes.value[item] === selectedCategory.value) {
            if (item === 'transactions') {
                output.push({ route: item, t: `${childMap[item].t}.${item}`, selected: route.hash === `#${item}` || route.hash === `#overview`})
            } else {
                output.push({ route: item, t: `${childMap[item].t}.${item}`, selected: route.hash === `#${item}`})
            }
        }
    })
    return output
})

const tabs = computed<RouteLink[]>(() => {
    const output: RouteLink[] = []
    output.push({ route: 'info', t: 'route.info', selected: selectedTab.value === 'info' })
    if (Object.keys(getMethods.value).length > 0) output.push({ route: 'get_methods', t: 'ton.get_methods', selected: selectedTab.value === 'get_methods'  })
    return output
})

const selectedRoute = ref('')
const selectedTab = ref('info')
const selectedCategory = ref('')

const reloadInfo = async() => {
    error.value = false
    loading.value = true
    if (!(props.hex in store.accounts) || !store.accounts[props.hex].loaded) {
        const res = await store.fetchAccount(props.hex)
        if (props.hex != res) emits('setHex', res)
    }
    if (!route.hash) router.replace({ hash: '#overview'})

    selectedRoute.value = (!route.hash || route.hash.slice(1,) === 'overview') ? 'transactions' : route.hash.slice(1,)
    selectedCategory.value = selectedRoute.value in childMap ? childMap[selectedRoute.value].parent : 'transactions'

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
        <AtomsTile :body="true" :top="true" :tile-style="'margin-top: 32px'">
            <template #top>
                <AtomsCategorySelector
                    v-model:selected="selectedTab"
                    :set-route="false"
                    :routes="tabs"
                />
            </template>
            <template #body>
                <AccountsPropsTable :acc="account"/>
            </template>
        </AtomsTile>
        <AtomsTile v-if="categories.length" :top="true" :body="true" :tile-style="'margin-top: 32px; padding-bottom: 16px'">
            <template #top>
                <AtomsCategorySelector
                    v-if="!isMobile()"
                    v-model:selected="selectedCategory"
                    :routes="categories"
                />
                <AtomsCategorySelector
                    v-model:selected="selectedRoute"
                    :routes="children"
                    :secondary="true"
                    style="margin-top: 16px;"
                />
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