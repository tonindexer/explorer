<script setup lang="ts">

const props = defineProps<{
    workchain: number
    shard: bigint
    seqNo: number
}>()

const route = useRoute()
const router = useRouter()
const store = useMainStore()

const error = ref(false)
const loading = ref(true)

const selectedRoute = ref('')
const selectedCategory = ref('')

const key = computed(() => blockKeyGen(props.workchain, props.shard, props.seqNo))
const block = computed(() => store.blocks[key.value] ?? null)

const getTrKeys = (shard: boolean = false) => {
  const output = block.value?.transaction_keys ?? [] as TransactionKey[]
  return shard ? store.deepTransactionKeys(key.value) : output
}

const allTrKeys = computed(() => (block.value?.transaction_keys ?? []).concat(store.deepTransactionKeys(key.value)))

const msgKeys = computed(() => store.getMessageKeys(allTrKeys.value, true, true))

const getAccKeys = (shard: boolean = false) => {
  const localMsgKeys = store.getMessageKeys(getTrKeys(shard), true, true)
  return store.getAccountKeys(localMsgKeys)
}

const unloadedAccKeys = computed(() => store.getAccountKeys(msgKeys.value, false))

const parentMap = {
    shards: { children: [ 'shards' ], t: 'ton.shards' },
    transactions: { children: [ 'master_tx', 'shard_tx' ], t: 'route.transactions' },
    accounts: { children: [ 'master_accounts', 'shard_accounts', 'unloaded' ], t: 'route.accounts' }
} as { [key: string]: { children: string[], t: string } }

const childMap = {
    shards: { parent: 'shards', t: 'ton' },
    master_tx: { parent: 'transactions', t: 'route' },
    shard_tx: { parent: 'transactions', t: 'route' },
    master_accounts: { parent: 'accounts', t: 'route' },
    shard_accounts: { parent: 'accounts', t: 'route' },
    unloaded: { parent: 'accounts', t: 'route' }
} as { [key: string]: { parent: string, t: string } }

type ParentChildRoutes = {
    parents: Array<'shards' | 'transactions' | 'accounts'>
    children: Array<'shards' | 'master_tx' | 'shard_tx' | 'master_accounts' | 'shard_accounts' | 'unloaded'>
}

const allRoutes = computed<ParentChildRoutes>(() => {
    const output: ParentChildRoutes = {
        parents: [],
        children: []
    }
    if (block.value.shard_keys?.length > 0) { output.parents.push('shards'); output.children.push('shards') }
    if (allTrKeys.value.length > 0) { 
        output.parents.push('transactions'); output.children.push('master_tx')
        if (block.value.shard_keys?.length > 0) {
          output.children.push('shard_tx')
        }
    }
    if (msgKeys.value.length  > 0) {
        output.parents.push('accounts'); 
        if (getAccKeys(false).length > 0) output.children.push('master_accounts')
        if (block.value.shard_keys?.length > 0) {
          output.children.push('shard_accounts')
        }
        if (unloadedAccKeys.value.length > 0) {
          output.children.push('unloaded')
        }
    }
    return output
})

const links = computed(() => {
    const output = { categories: {} as { [key: string] : RouteLink }, children: {} as { [key: string] : RouteLink[] }}
    allRoutes.value.parents.forEach(item => {
        for (const child of parentMap[item].children) {
            if (allRoutes.value.children.some(cat => cat === child)) {
                output.categories[item] = { parent: item, route: child, t: parentMap[item].t, selected: parentMap[item].children.some(child => child === selectedRoute.value)}
                break
            }
        }
    })
    for (const cat of Object.values(output.categories)) {
      if (cat.parent) {
        output.children[cat.parent] = []
        for (const child of parentMap[cat.parent].children) {
          if (allRoutes.value.children.some(cat => cat === child)) {
            const t = props.workchain === 0 && child.includes('master') ? 'route.all' : `${childMap[child].t}.${child}`
            output.children[cat.parent].push({ parent: cat.route, route: child, t, selected: child === selectedRoute.value })
          }
        }
      }
    }
    return output
})

const setCategory = (value: string) => {
    if (selectedCategory.value !== value && value in links.value.categories) {
        const parent = links.value.categories[value].parent
        if (parent) {
            selectedCategory.value = value
            selectedRoute.value = links.value.categories[value].route
        }
    }
}

const reloadInfo = async() => {
    error.value = false
    loading.value = true
    if (!block.value || !block.value.loaded) {
        await store.fetchBlock(props.workchain, props.shard, props.seqNo, true)
    }

    if (!block.value) {
        loading.value = false
        error.value = true
        return;
    }

    selectedRoute.value = route.hash ? 
        (route.hash === '#shards' ? 
            (block.value.shard_keys?.length > 0 ? 'shards' : 'master_tx' ) : route.hash.slice(1,)) 
                : block.value.shard_keys?.length > 0 ? 'shards' : 'master_tx'

    selectedCategory.value = selectedRoute.value in childMap ? childMap[selectedRoute.value].parent : 'transactions'

    loading.value = false
}

onMounted(async() => {
    await reloadInfo()
})

watch(selectedRoute, (to, from) => {
    if (to !== from)
        router.replace({ hash: '#' + selectedRoute.value, query: route.query})
})
watch(props, async() => await reloadInfo())
</script>

<template>
  <template v-if="error">
    <NuxtLink :to="{ name: 'blocks' }">
      {{ 'An error occured while loading block! Go to overview page..' }}
    </NuxtLink>
  </template>
  <template v-else-if="loading">
    <div class="uk-flex uk-flex-center">
      <Loader />
    </div>
  </template>
  <template v-else-if="block">
    <AtomsTile
      :body="true"
      :tile-style="'margin-top: 32px'"
    >
      <template #body>
        <BlocksPropsTable :block="block" />
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
      v-if="allRoutes.children.length > 0"
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
          v-if="(route.hash === '#shards' )&& block.shard_keys.length > 0"
          id="shards"
        >
          <BlocksTable
            :item-selector="false"
            :default-length="5"
            :update="false"
            :keys="block.shard_keys"
            :hidden="block.shard_keys.length === 0"
            :line-link="false"
          />
        </div>
        <div
          v-if="route.hash === '#master_tx'"
          id="master_tx"
        >
          <TransactionsTable
            :item-selector="false"
            :default-length="10"
            :update="false"
            :keys="getTrKeys(false)"
            :hidden="getTrKeys(false).length === 0"
            :account="null"
          />
        </div>
        <div
          v-if="route.hash === '#shard_tx'"
          id="transactions"
        >
          <TransactionsTable
            :item-selector="false"
            :default-length="10"
            :update="false"
            :keys="getTrKeys(true)"
            :hidden="getTrKeys(true).length === 0"
            :account="null"
          />
        </div>
        <div
          v-else-if="route.hash === '#master_accounts'"
          id="master_accounts"
        >
          <AccountsTable
            :default-length="10"
            :keys="getAccKeys(false)"
            :hidden="getAccKeys(false).length === 0"
            :update="false"
            :item-selector="false"
          />
        </div>
        <div
          v-else-if="route.hash === '#shard_accounts'"
          id="accounts"
        >
          <AccountsTable
            :default-length="10"
            :keys="getAccKeys(true)"
            :hidden="getAccKeys(true).length === 0"
            :update="false"
            :item-selector="false"
          />
        </div>
        <div
          v-else-if="route.hash === '#unloaded'"
          id="unloaded_accounts"
        >
          <AccountsUnloadedTable
            :default-length="5"
            :keys="unloadedAccKeys"
            :hidden="unloadedAccKeys.length === 0"
          />
        </div>
      </template>
    </AtomsTile>
  </template>
</template>