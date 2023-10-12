<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface Props {
    workchain: number
    shard: bigint
    seq_no: number
}

const error = ref(false)
const loading = ref(true)
const store = useMainStore()
const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()
const deepTrKeys = ref(false)


const key = computed(() => blockKeyGen(props.workchain, props.shard, props.seq_no))
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
        await store.fetchBlock(props.workchain, props.shard, props.seq_no, true)
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
    const output: { route: string, t: string }[] = []
    if (block.value.shard_keys?.length > 0) output.push({ route: 'shards', t: 'ton.shards'})
    if (trKeys.value.length > 0) output.push({ route: 'transactions', t: 'route.transactions'})
    if (loadedAccountKeys.value.length + unloadedAccountKeys.value.length  > 0) output.push({ route: 'accounts', t: 'route.accounts'})
    return output
})

const selectedRoute = ref('')

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
        <AtomsTile :body="true" :tile-style="'margin-top: 32px'">
            <template #body>
                <BlocksPropsTable :block="block"/>
            </template>
        </AtomsTile>
        <AtomsTile v-if="routes.length > 0" :top="true" :body="true" :tile-style="'margin-top: 32px; padding-bottom: 16px'">
            <template #top>
                <select v-if="isMobile()" :value="selectedRoute" aria-label="Select" @change="($event: any) => selectedRoute = $event.target.value" class="uk-select uk-padding-remove-bottom uk-text-primary uk-background-primary">
                    <option v-for="option in routes" :value="option.route">{{ $t(option.t) }}</option>
                </select>
                <div v-if="!isMobile()" class="category-wrapper">
                    <div class="uk-flex uk-flex-middle uk-margin-remove-top">
                        <!-- <NuxtLink v-if="trKeys.length > 0" class="category" :to="{ hash: '#transactions', query: route.query}" :class="{'selected white': (route.hash === '#transactions')}">
                            {{ $t('route.transactions')}}
                        </NuxtLink> -->
                        <NuxtLink v-for="item in routes" class="category" :to="{ hash: `#${item.route}`, query: route.query}" :class="{'selected white': (route.hash === `#${item.route}`)}">
                            {{ $t(item.t)}}
                        </NuxtLink>
                    </div>
                </div>
            </template>
            <template #body>
                <div v-if="(route.hash === '#shards' )&& block.shard_keys.length > 0" id="shards">
                    <LazyBlocksTable :item-selector="true" :default-length="5" :update="false" :keys="block.shard_keys" :hidden="block.shard_keys.length === 0" :line-link="false"/>
                </div>
                <div v-if="(route.hash === '#transactions') && block?.transaction_keys.length" id="transactions">
                    <div class="uk-child-width-auto uk-text-left uk-margin-remove-top uk-margin-small-left" v-if="block.shard_keys.length > 0">
                        <label><input v-model="deepTrKeys" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.deep_transactions') }}</label>
                    </div>
                    <TransactionsTable :item-selector="false" :default-length="10" :update="false" :keys="trKeys" :hidden="trKeys.length === 0" :account="null"/>
                </div>
                <div v-if="(route.hash === '#accounts' )&& loadedAccountKeys.length + unloadedAccountKeys.length > 0" id="accounts">
                    <div class="uk-child-width-auto uk-text-left uk-margin-remove-top uk-margin-small-left" v-if="block.shard_keys.length > 0">
                        <label><input v-model="deepTrKeys" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.deep_accounts') }}</label>
                    </div>
                    <h3 v-if="loadedAccountKeys.length > 0" class="uk-margin-remove-bottom uk-text-primary uk-margin-small-left">{{ $t('general.loaded_accs') + ` (${loadedAccountKeys.length})` }}</h3>
                    <AccountsTable :default-length="10" :keys="loadedAccountKeys" :hidden="loadedAccountKeys.length === 0" :update="false" :item-selector="false"/>
                    <h3 v-if="unloadedAccountKeys.length > 0" class="uk-margin-remove-bottom uk-text-primary uk-margin-small-left">{{ $t('general.unloaded_accs')+ ` (${unloadedAccountKeys.length})` }}</h3>
                    <AccountsUnloadedTable :default-length="5" :keys="unloadedAccountKeys" :hidden="unloadedAccountKeys.length === 0"/>
                </div>
            </template>
        </AtomsTile>
    </template>
</template>