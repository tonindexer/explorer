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
const deepTrKeys = ref(false)

const key = computed(() => blockKeyGen(props.workchain, props.shard, props.seqNo))
const block = computed(() => store.blocks[key.value] ?? null)
const trKeys = computed(() => (deepTrKeys.value) ? store.deepTransactionKeys(key.value) : block.value?.transaction_keys ?? [])
const inMessageKeys = computed(() => store.getMessageKeys(trKeys.value, true, false))
const outMessageKeys = computed(() => store.getMessageKeys(trKeys.value, false, true))
const loadedAccountKeys = computed(() => store.getAccountKeys([...inMessageKeys.value, ...outMessageKeys.value]))
const unloadedAccountKeys = computed(() => store.getAccountKeys([...inMessageKeys.value, ...outMessageKeys.value], false))

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
        (route.hash.slice(1,) === 'shards' ? 
            (block.value.shard_keys?.length > 0 ? 'shards' : 'transactions' ) : route.hash.slice(1,)) 
                : block.value.shard_keys?.length > 0 ? 'shards' : 'transactions'

    loading.value = false
}

const routes = computed(() => {
    const output: { route: string, t: string, selected: boolean }[] = []
    if (block.value.shard_keys?.length > 0) output.push({ route: 'shards', t: 'ton.shards', selected: route.hash === '#shards' })
    if (trKeys.value.length > 0) output.push({ route: 'transactions', t: 'route.transactions', selected: route.hash === '#transactions' })
    if (loadedAccountKeys.value.length + unloadedAccountKeys.value.length  > 0) output.push({ route: 'accounts', t: 'route.accounts', selected: route.hash === '#accounts' })
    return output
})

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
    <AtomsTile
      v-if="routes.length > 0"
      :top="true"
      :body="true"
      :tile-style="'margin-top: 32px; padding-bottom: 16px'"
    >
      <template #top>
        <AtomsCategorySelector
          v-model:selected="selectedRoute"
          :routes="routes"
        />
      </template>
      <template #body>
        <div
          v-if="(route.hash === '#shards' )&& block.shard_keys.length > 0"
          id="shards"
        >
          <LazyBlocksTable
            :item-selector="false"
            :default-length="5"
            :update="false"
            :keys="block.shard_keys"
            :hidden="block.shard_keys.length === 0"
            :line-link="false"
          />
        </div>
        <div
          v-else-if="(route.hash === '#transactions') && block?.transaction_keys.length"
          id="transactions"
        >
          <div
            v-if="block.shard_keys.length > 0"
            class="uk-child-width-auto uk-text-left uk-margin-remove-top uk-margin-small-left"
          >
            <label><input
              v-model="deepTrKeys"
              class="uk-checkbox uk-margin-small-right"
              type="checkbox"
            >{{ $t('options.deep_transactions') }}</label>
          </div>
          <TransactionsTable
            :item-selector="false"
            :default-length="10"
            :update="false"
            :keys="trKeys"
            :hidden="trKeys.length === 0"
            :account="null"
          />
        </div>
        <div
          v-else-if="(route.hash === '#accounts' )&& loadedAccountKeys.length + unloadedAccountKeys.length > 0"
          id="accounts"
        >
          <div
            v-if="block.shard_keys.length > 0"
            class="uk-child-width-auto uk-text-left uk-margin-remove-top uk-margin-small-left"
          >
            <label><input
              v-model="deepTrKeys"
              class="uk-checkbox uk-margin-small-right"
              type="checkbox"
            >{{ $t('options.deep_accounts') }}</label>
          </div>
          <h3
            v-if="loadedAccountKeys.length > 0"
            class="uk-margin-remove-bottom uk-text-primary uk-margin-small-left"
          >
            {{ $t('general.loaded_accs') + ` (${loadedAccountKeys.length})` }}
          </h3>
          <AccountsTable
            :default-length="10"
            :keys="loadedAccountKeys"
            :hidden="loadedAccountKeys.length === 0"
            :update="false"
            :item-selector="false"
          />
          <h3
            v-if="unloadedAccountKeys.length > 0"
            class="uk-margin-remove-bottom uk-text-primary uk-margin-small-left"
          >
            {{ $t('general.unloaded_accs')+ ` (${unloadedAccountKeys.length})` }}
          </h3>
          <AccountsUnloadedTable
            :default-length="5"
            :keys="unloadedAccountKeys"
            :hidden="unloadedAccountKeys.length === 0"
          />
        </div>
      </template>
    </AtomsTile>
  </template>
</template>