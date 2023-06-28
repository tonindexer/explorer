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
    <template v-else>
        <BlocksPropsTable v-if="block" :block="block"/>
        <div>
            <ul v-if="block?.transaction_keys.length" class="uk-child-width-expand uk-text-medium" uk-tab>
                <li class="uk-margin-remove-left" :class="{'uk-active' : (route.hash === '#transactions' || route.hash === '#overview')}" style="min-width: fit-content;">
                    <NuxtLink :to="{ hash: '#transactions', query: route.query}" >
                        {{ $t('route.transactions') + ` (${trKeys.length})` }}
                    </NuxtLink>
                </li>
                <li class="uk-margin-remove-left" v-if="inMessageKeys.length + outMessageKeys.length > 0" :class="{'uk-active' : (route.hash === '#messages')}" style="min-width: fit-content;">
                    <NuxtLink :to="{ hash: '#messages', query: route.query}">
                        {{ $t('route.messages') + ` (${inMessageKeys.length + outMessageKeys.length})` }}
                    </NuxtLink>
                </li>
                <li class="uk-margin-remove-left" v-if="loadedAccountKeys.length + unloadedAccountKeys.length > 0" :class="{'uk-active' : (route.hash === '#accounts')}" style="min-width: fit-content;">
                    <NuxtLink :to="{ hash: '#accounts', query: route.query}">
                        {{ $t('route.accounts') + ` (${loadedAccountKeys.length + unloadedAccountKeys.length})` }}
                    </NuxtLink>
                </li>
                <li class="uk-margin-remove-left" v-if="block.shard_keys.length > 0" :class="{'uk-active' : (route.hash === '#shards')}" style="min-width: fit-content;">
                    <NuxtLink :to="{ hash: '#shards', query: route.query}">
                        {{ $t('ton.shards') + ` (${block.shard_keys.length})`  }}
                    </NuxtLink>
                </li>
            </ul>
        </div>
        <div v-if="(route.hash === '#transactions' || route.hash === '#overview')&& block?.transaction_keys.length" id="transactions">
            <div class="uk-child-width-auto uk-text-left uk-margin-small-top" v-if="block.shard_keys.length > 0">
                <label><input v-model="deepTrKeys" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.deep_transactions') }}</label>
            </div>
            <TransactionsTable :item-selector="false" :default-length="5" :update="false" :keys="trKeys" :hidden="trKeys.length === 0" :account="null"/>
        </div>
        <div v-if="(route.hash === '#messages' )&& block?.shard_keys" id="messages">
            <div class="uk-child-width-auto uk-text-left uk-margin-small-top" v-if="block.shard_keys.length > 0">
                <label><input v-model="deepTrKeys" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.deep_messages') }}</label>
            </div>
            <h3 v-if="inMessageKeys.length > 0" class="uk-margin-small-top uk-margin-small">{{ $t('general.in_msg') + ` (${inMessageKeys.length})` }}</h3>
            <MessagesTable :filters="{}" :show-link="true" :item-selector="false" :default-length="5" :update="false" :keys="inMessageKeys" :hidden="inMessageKeys.length === 0"/>
            <h3 v-if="outMessageKeys.length > 0" class="uk-margin-small-top uk-margin-small">{{ $t('general.out_msg')+ ` (${outMessageKeys.length})` }}</h3>
            <MessagesTable :filters="{}" :show-link="true" :item-selector="false" :default-length="5" :update="false" :keys="outMessageKeys" :hidden="outMessageKeys.length === 0"/>
        </div>
        <div v-if="(route.hash === '#accounts' )&& loadedAccountKeys.length + unloadedAccountKeys.length > 0" id="accounts">
            <div class="uk-child-width-auto uk-text-left uk-margin-small-top" v-if="block.shard_keys.length > 0">
                <label><input v-model="deepTrKeys" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.deep_accounts') }}</label>
            </div>
            <h3 v-if="loadedAccountKeys.length > 0" class="uk-margin-small-top uk-margin-small">{{ $t('general.loaded_accs') + ` (${loadedAccountKeys.length})` }}</h3>
            <AccountsTable :default-length="5" :keys="loadedAccountKeys" :hidden="loadedAccountKeys.length === 0" :update="false" :item-selector="false" :contract="null"/>
            <h3 v-if="unloadedAccountKeys.length > 0" class="uk-margin-small-top uk-margin-small">{{ $t('general.unloaded_accs')+ ` (${unloadedAccountKeys.length})` }}</h3>
            <AccountsUnloadedTable :default-length="5" :keys="unloadedAccountKeys" :hidden="unloadedAccountKeys.length === 0"/>
        </div>
        <div v-if="(route.hash === '#shards' )&& block.shard_keys.length > 0" id="shards">
            <BlocksTable :item-selector="false" :default-length="5" :update="false" :keys="block.shard_keys" :hidden="block.shard_keys.length === 0" :line-link="false" :exclude-empty="false"/>
        </div>
    </template>
</template>