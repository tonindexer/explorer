<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface Props {
    workchain: number
    shard: bigint
    seq_no: number
}

const error = ref(false)
const store = useMainStore()
const props = defineProps<Props>()
const route = useRoute()
const deepTrKeys = ref(false)
const deepMsgKeys = ref(false)


const key = computed(() => store.blockKeyGen(props.workchain, props.shard, props.seq_no))
const block = computed(() => store.blocks[key.value] ?? null)
const trKeys = computed(() => (deepTrKeys.value || deepMsgKeys.value) ? store.deepTransactionKeys(key.value) : block.value?.transaction_keys ?? [])
const inMessageKeys = computed(() => store.messageKeys(trKeys.value, true, false))
const outMessageKeys = computed(() => store.messageKeys(trKeys.value, false, true))

const reloadInfo = async() => {
    error.value = false
    if (!block.value) {
        await store.fetchBlock(props.workchain, props.shard, props.seq_no)
    }
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
    <BlocksPropsTable v-if="block" :block="block"/>
    <div>
        <ul v-if="block?.transaction_keys.length" class="uk-child-width-expand uk-text-medium" uk-tab>
            <li :class="{'uk-active' : (route.hash === '#transactions' || route.hash === '#overview')}"><NuxtLink :to="{ hash: '#transactions', query: route.query}" @click="deepMsgKeys = false">{{ $t('route.transactions') }}</NuxtLink></li>
            <li v-if="[...inMessageKeys, ...outMessageKeys].length > 0" :class="{'uk-active' : (route.hash === '#messages')}"><NuxtLink :to="{ hash: '#messages', query: route.query}" @click="deepTrKeys = false">{{ $t('route.messages') }}</NuxtLink></li>
            <li v-if="block?.shard_keys.length > 0" :class="{'uk-active' : (route.hash === '#shards')}"><NuxtLink :to="{ hash: '#shards', query: route.query}">{{ $t('ton.shards') }}</NuxtLink></li>
        </ul>
    </div>
    <div v-if="(route.hash === '#transactions' || route.hash === '#overview')&& block?.transaction_keys.length" id="transactions">
        <div class="uk-child-width-auto uk-text-left uk-margin-small-top">
            <label><input v-model="deepTrKeys" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.deep_transactions') }}</label>
        </div>
        <TransactionsTable :item-selector="false" :default-length="5" :update="false" :keys="trKeys" :hidden="trKeys.length === 0"/>
    </div>
    <div v-if="(route.hash === '#messages' )&& block?.shard_keys" id="messages">
        <div class="uk-child-width-auto uk-text-left uk-margin-small-top">
            <label><input v-model="deepMsgKeys" class="uk-checkbox uk-margin-small-right" type="checkbox">{{ $t('options.deep_messages') }}</label>
        </div>
        <h3 v-if="inMessageKeys.length > 0" class="uk-margin-small-top uk-margin-small">{{ $t('general.in_msg') }}</h3>
        <MessagesTable :item-selector="false" :default-length="5" :update="false" :keys="inMessageKeys" :hidden="inMessageKeys.length === 0"/>
        <h3 v-if="outMessageKeys.length > 0" class="uk-margin-small-top uk-margin-small">{{ $t('general.out_msg') }}</h3>
        <MessagesTable :item-selector="false" :default-length="5" :update="false" :keys="outMessageKeys" :hidden="outMessageKeys.length === 0"/>
    </div>
    <div v-if="(route.hash === '#shards' )&& block?.shard_keys" id="shards">
        <BlocksTable :item-selector="false" :default-length="5" :update="false" :keys="block.shard_keys" :hidden="block?.shard_keys.length === 0" :line-link="false"/>
    </div>
</template>