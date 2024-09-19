<script setup lang="ts">
const props = defineProps<{
    hex: string
}>()

const emits = defineEmits<{
    'update:hex': [hex: string]
}>()

const route = useRoute()
const router = useRouter()
const store = useMainStore()

const error = ref(false)
const loading = ref(true)

const account = computed(() => store.accounts[props.hex] ?? null)
const trKeys = computed(() => account.value?.transaction_keys?.length > 0 ? account.value.transaction_keys : [] as TransactionKey[])
const jtKeys = computed(() => account.value?.jetton_wallets?.length > 0 ? account.value.jetton_wallets : [] as AccountKey[])
const minterKeys = computed(() => account.value?.minted_nfts?.length > 0 ? account.value.minted_nfts : [] as AccountKey[])
const ownerKeys = computed(() => account.value?.owned_nfts?.length > 0 ? account.value.owned_nfts : [] as AccountKey[])
const getMethods = computed(() => account.value?.executed_get_methods && Object.keys(account.value.executed_get_methods).length > 0 ? account.value.executed_get_methods : {} as {[key: string] : GetMethod[]})

const sankeyType = ref("count")
const sankeyOptions = ref({ 'count': 'count', 'amount': 'amount' })

const selectedRoute = ref('')
const selectedTab = ref<'info' | 'get_methods'>('info')
const selectedCategory = ref('')

const parentMap = {
    transactions: [ 'transactions', 'money_flow' ],
    jettons: [ 'jettons', 'jetton_holders' ],
    nfts: [ 'nfts', 'nft_holders', 'minter' ],
} as { [key: string]: string[] }

const childMap = {
    transactions: { parent: 'transactions', t: 'route' },
    overview: { parent: 'transactions', t: 'general' },
    money_flow: { parent: 'transactions', t: 'general' },
    jettons: { parent: 'jettons', t: 'route' },
    jetton_holders: { parent: 'jettons', t: 'ton' },
    nfts: { parent: 'nfts', t: 'route' },
    nft_holders: { parent: 'nfts', t: 'ton' },
    minter: { parent: 'nfts', t: 'ton' }
} as { [key: string]: { parent: string, t: string } }

type ParentChildRoutes = {
    parents: Array<'transactions' | 'jettons' | 'nfts'>
    children: Array<'transactions' | 'overview' | 'money_flow' | 'jettons' | 'jetton_holders' | 'nfts' | 'nft_holders' | 'minter'>
}

const allRoutes = computed<ParentChildRoutes>(() => {
    const output: ParentChildRoutes = {
        parents: [],
        children: []
    }
    if (account.value.transaction_amount > 0) { output.parents.push('transactions'); output.children.push('transactions') }
    if (account.value.transaction_amount > 0) { output.children.push('money_flow') }
    if (account.value.jetton_amount > 0) { output.parents.push('jettons'); output.children.push('jettons') }
    if (account.value.types?.includes('jetton_minter')) { output.parents.push('jettons'); output.children.push('jetton_holders') }
    if (account.value.nft_amount > 0) { output.parents.push('nfts'); output.children.push('nfts') }
    if (store.nftHolders[props.hex]) { output.parents.push('nfts'); output.children.push('nft_holders') }
    if (account.value.types?.includes('nft_collection')) { output.parents.push('nfts'); output.children.push('minter') }
    output.parents = [...new Set(output.parents)]
    return output
})

const links = computed(() => {
    const output = { categories: {} as { [key: string] : RouteLink }, children: {} as { [key: string] : RouteLink[] }}
    allRoutes.value.parents.forEach(item => {
        for (const child of parentMap[item]) {
            if (allRoutes.value.children.some(cat => cat === child)) {
                output.categories[item] = { parent: item, route: child, t: `${childMap[item].t}.${item}`, selected: parentMap[item].some(parent => parent === selectedCategory.value)}
                break
            }
        }
    })
    for (const cat of Object.values(output.categories)) {
        if (cat.parent) {
            output.children[cat.parent] = []
            for (const child of parentMap[cat.parent]) {
                if (allRoutes.value.children.some(cat => cat === child)) {
                    output.children[cat.parent].push({ parent: cat.route, route: child, t: `${childMap[child].t}.${child}`, selected: child === selectedRoute.value })
                }
            }
        }
    }
    return output
})

const tabs = computed<RouteLink[]>(() => {
    const output: RouteLink[] = []
    output.push({ route: 'info', t: 'route.info', selected: selectedTab.value === 'info' })
    if (Object.keys(getMethods.value).length > 0) output.push({ route: 'get_methods', t: 'ton.get_methods', selected: selectedTab.value === 'get_methods'  })
    return output
})

const reloadInfo = async() => {
    error.value = false
    loading.value = true
    if (!(props.hex in store.accounts) || !store.accounts[props.hex].loaded) {
        const res = await store.fetchAccount(props.hex)
        if (res && props.hex != res) emits('update:hex', res)
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

const setCategory = (value: string) => {
    if (selectedCategory.value !== value && value in links.value.categories) {
        const parent = links.value.categories[value].parent
        if (parent) {
            selectedCategory.value = value
            selectedRoute.value = links.value.categories[value].route
        }
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
    <AtomsTile
      :body="true"
      :top="true"
      :tile-style="'margin-top: 32px'"
    >
      <template #top>
        <AtomsCategorySelector
          v-model:selected="selectedTab"
          :set-route="false"
          :routes="tabs"
          :keep-desktop="true"
        />
      </template>
      <template #body>
        <AccountsPropsTable
          v-if="selectedTab === 'info'"
          :acc="account"
        />
        <AccountsGetMethods
          v-else-if="selectedTab === 'get_methods'"
          :methods="getMethods"
        />
      </template>
    </AtomsTile>
    <div
      v-if="isMobile()"
      class="uk-margin-large-top"
    >
      <AtomsCategorySelector
        :selected="selectedCategory"
        :routes="Object.values(links.categories)"
        :set-route="false"
        :use-parent="true"
        :keep-desktop="true"
        @update:selected="value => setCategory(value)"
      />
      <AtomsCategorySelector
        v-model:selected="selectedRoute"
        :routes="links.children[selectedCategory]"
        :secondary="true"
        :keep-desktop="true"
        style="margin-top: 12px; margin-bottom: 16px"
      />
    </div>
    <AtomsTile
      v-if="Object.keys(links.categories).length"
      :top="!isMobile()"
      :body="true"
      :divider="!isMobile()"
      :tile-style="`${isMobile() ? '' : 'margin-top: 32px'}; padding-bottom: 16px;`"
      :top-style="isMobile() ? '' : 'display: flex'"
    >
      <template #top>
        <AtomsCategorySelector
          :selected="selectedCategory"
          :routes="Object.values(links.categories)"
          :set-route="false"
          :use-parent="true"
          @update:selected="value => setCategory(value)"
        />
        <AtomsCategorySelector
          v-model:selected="selectedRoute"
          :routes="links.children[selectedCategory]"
          :secondary="true"
          :keep-desktop="true"
          style="margin-left: 24px;"
        />
      </template>
      <template #body>
        <div
          v-if="(route.hash === '#transactions' || route.hash === '#overview')"
          id="transactions"
        >
          <LazyTransactionsTable
            :keys="trKeys"
            :default-length="10"
            :hidden="trKeys.length === 0"
            :update="true"
            :item-selector="true"
            :account="hex"
          />
        </div>
        <div
          v-else-if="route.hash === '#money_flow'"
          id="money_flow"
          class="uk-padding-horizontal uk-padding-top"
          uk-grid
        >
          <div
            class="uk-width-1-1 uk-width-1-5@m uk-margin-small"
            style="min-width: 250px;"
          >
            <AtomsRadioButtons
              v-model:selected="sankeyType"
              :options="sankeyOptions"
              :layered="false"
            />
          </div>
          <div 
            class="uk-width-1-1 uk-width-expand@m uk-margin-remove-top"
            :class="{ 'divider': !isMobile}"
          >
            <GraphSankey
              :hex="hex"
              :count="sankeyType === 'count'"
            />
          </div>
        </div>
        <div
          v-else-if="route.hash === '#jettons'"
          id="jettons"
        >
          <LazyAccountsJettonsTable
            :owner="hex"
            :keys="jtKeys"
            :default-length="10"
          />
        </div>
        <div
          v-else-if="route.hash === '#jetton_holders' && account.types?.includes('jetton_minter')"
          id="jetton_holders"
        >
          <AccountsTopJettonHolders
            :minter="hex"
            :keys="store.jettonHolders[account.address.hex]?.owned_balance ?? []"
            :default-length="10"
          />
        </div>
        <div
          v-else-if="route.hash === '#nfts'"
          id="nfts"
          class="uk-padding-large-vertical uk-padding-horizontal"
        >
          <LazyAccountsNFTGrid
            :minter-flag="false"
            :keys="ownerKeys"
            :default-length="18"
            :account="hex"
          />
        </div>
        <div
          v-else-if="route.hash === '#minter' && account.types?.includes('nft_collection')"
          id="minter"
          class="uk-padding-large-vertical uk-padding-horizontal"
        >
          <LazyAccountsNFTGrid
            :minter-flag="true"
            :keys="minterKeys"
            :default-length="18"
            :account="hex"
          />
        </div>
        <div
          v-else-if="route.hash === '#nft_holders' && account.types?.includes('nft_collection')"
          id="nft_holders"
        >
          <AccountsTopNFTHolders
            :keys="store.nftHolders[account.address.hex]?.owned_items ?? []"
            :minter="hex"
            :default-length="10"
          />
        </div>
      </template>
    </AtomsTile>
  </template>
</template>

<style scoped lang="scss">
.divider {
    border-left: 1px solid var(--color-bg-shadow);
}
</style>