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
const deepTrKeys = ref(false)


const key = computed(() => store.blockKeyGen(props.workchain, props.shard, props.seq_no))
const block = computed(() => store.blocks[key.value] ?? null)
const trKeys = computed(() => (deepTrKeys.value) ? store.deepTransactionKeys(key.value) : block.value?.transaction_keys ?? [])
const inMessageKeys = computed(() => store.getMessageKeys(trKeys.value, true, false))
const outMessageKeys = computed(() => store.getMessageKeys(trKeys.value, false, true))
const loadedAccountKeys = computed(() => store.getAccountKeys([...inMessageKeys.value, ...outMessageKeys.value]))
const unloadedAccountKeys = computed(() => store.getAccountKeys([...inMessageKeys.value, ...outMessageKeys.value], false))

const reloadInfo = async() => {
    error.value = false
    loading.value = true
    if (!block.value) {
        await store.fetchBlock(props.workchain, props.shard, props.seq_no)
    }
    await store.fetchBareAccounts(unloadedAccountKeys.value)
    loading.value = false
    if (!block.value) {
        error.value = true
        return;
    }
}
onMounted(async() => {
    await reloadInfo()
})
watch(props, async() => await reloadInfo())
</script>

<template>
    <template v-if="error">
        <NuxtLink :to="{ path: 'blocks' }">
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
        <AtomsTile :top="true" :body="true" :top-style="'padding-bottom: 0'" :tile-style="'margin-top: 32px; padding-bottom: 16px'">
            <template #top>
                <ul v-if="block?.transaction_keys.length" class="uk-child-width-expand uk-text-medium tab-styler" uk-tab>
                    <li class="uk-margin-remove-left" :class="{'uk-active' : (route.hash === '#transactions' || route.hash === '#overview')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#transactions', query: route.query}" >
                            {{ $t('route.transactions') }}
                            <span>
                                {{ trKeys.length }}
                            </span>
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" v-if="inMessageKeys.length + outMessageKeys.length > 0" :class="{'uk-active' : (route.hash === '#messages')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#messages', query: route.query}">
                            {{ $t('route.messages') }}
                            <span>
                                {{ inMessageKeys.length + outMessageKeys.length }}
                            </span>
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" v-if="loadedAccountKeys.length + unloadedAccountKeys.length > 0" :class="{'uk-active' : (route.hash === '#accounts')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#accounts', query: route.query}">
                            {{ $t('route.accounts') }}
                            <span>
                                {{ loadedAccountKeys.length + unloadedAccountKeys.length }}
                            </span>
                        </NuxtLink>
                    </li>
                    <li class="uk-margin-remove-left" v-if="block.shard_keys.length > 0" :class="{'uk-active' : (route.hash === '#shards')}" style="min-width: fit-content;">
                        <NuxtLink :to="{ hash: '#shards', query: route.query}">
                            {{ $t('ton.shards') }}
                            <span>
                                {{ block.shard_keys.length }}
                            </span>
                        </NuxtLink>
                    </li>
                </ul>
            </template>
            <template #body>
                <div v-if="(route.hash === '#transactions' || route.hash === '#overview')&& block?.transaction_keys.length" id="transactions">
                    <div class="uk-child-width-auto uk-text-left uk-margin-remove-top uk-margin-small-left" v-if="block.shard_keys.length > 0">
                        <label><input v-model="deepTrKeys" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.deep_transactions') }}</label>
                    </div>
                    <TransactionsTable :item-selector="false" :default-length="10" :update="false" :keys="trKeys" :hidden="trKeys.length === 0" :order="'DESC'" :account="null" :filters="{}"/>
                </div>
                <div v-if="(route.hash === '#messages' )&& block?.shard_keys" id="messages">
                    <div class="uk-child-width-auto uk-text-left uk-margin-remove-top uk-margin-small-left" v-if="block.shard_keys.length > 0">
                        <label><input v-model="deepTrKeys" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.deep_messages') }}</label>
                    </div>
                    <h3 v-if="inMessageKeys.length > 0" class="uk-margin-remove-bottom uk-text-primary uk-margin-small-left">{{ $t('general.in_msg') + ` (${inMessageKeys.length})` }}</h3>
                    <MessagesTable :show-link="true" :item-selector="false" :default-length="10" :update="false" :keys="inMessageKeys" :hidden="inMessageKeys.length === 0"/>
                    <h3 v-if="outMessageKeys.length > 0" class="uk-margin-remove-bottom uk-text-primary uk-margin-small-left">{{ $t('general.out_msg')+ ` (${outMessageKeys.length})` }}</h3>
                    <MessagesTable :show-link="true" :item-selector="false" :default-length="10" :update="false" :keys="outMessageKeys" :hidden="outMessageKeys.length === 0"/>
                </div>
                <div v-if="(route.hash === '#accounts' )&& loadedAccountKeys.length + unloadedAccountKeys.length > 0" id="accounts">
                    <div class="uk-child-width-auto uk-text-left uk-margin-remove-top uk-margin-small-left" v-if="block.shard_keys.length > 0">
                        <label><input v-model="deepTrKeys" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.deep_accounts') }}</label>
                    </div>
                    <h3 v-if="loadedAccountKeys.length > 0" class="uk-margin-remove-bottom uk-text-primary uk-margin-small-left">{{ $t('general.loaded_accs') + ` (${loadedAccountKeys.length})` }}</h3>
                    <AccountsTable :default-length="10" :keys="loadedAccountKeys" :hidden="loadedAccountKeys.length === 0" :update="false" :item-selector="false" :filters="{ interface: null }"/>
                    <h3 v-if="unloadedAccountKeys.length > 0" class="uk-margin-remove-bottom uk-text-primary uk-margin-small-left">{{ $t('general.unloaded_accs')+ ` (${unloadedAccountKeys.length})` }}</h3>
                    <AccountsUnloadedTable :default-length="5" :keys="unloadedAccountKeys" :hidden="unloadedAccountKeys.length === 0"/>
                </div>
                <div v-if="(route.hash === '#shards' )&& block.shard_keys.length > 0" id="shards">
                    <BlocksTable :item-selector="true" :default-length="5" :update="false" :keys="block.shard_keys" :hidden="block.shard_keys.length === 0" :line-link="false" :exclude-empty="false"/>
                </div>
            </template>
        </AtomsTile>
    </template>
</template>