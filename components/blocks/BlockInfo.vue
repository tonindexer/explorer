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
const key = computed(() => store.blockKeyGen(props.workchain, props.shard, props.seq_no))
const trKeys = computed(() => store.deepTransactionKeys(key.value))
const messageKeys = computed(() => store.messageKeys(trKeys.value))
const block: Ref<Block | null> = ref(null)

const reloadInfo = async() => {
    error.value = false
    if (key.value in store.blocks) {
        block.value = store.blocks[key.value]
    } else {
        await store.fetchBlock(props.workchain, props.shard, props.seq_no)
        block.value = store.blocks[key.value] ?? null
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
    <!-- {{ block ?? 'gg' }} -->
    <BlocksPropsTable v-if="block" :block="block"/>
    <div>
        <ul v-if="block?.shard_keys.length || block?.transaction_keys.length" class="uk-child-width-expand uk-text-medium" uk-tab>
            <li :class="{'uk-active' : (route.hash === '#transactions' || route.hash === '#overview')}"><NuxtLink :to="{ hash: '#transactions', query: route.query}">{{ $t('route.transactions') }}</NuxtLink></li>
            <li :class="{'uk-active' : (route.hash === '#messages')}"><NuxtLink :to="{ hash: '#messages', query: route.query}">{{ $t('route.messages') }}</NuxtLink></li>
            <li :class="{'uk-active' : (route.hash === '#shards')}"><NuxtLink :to="{ hash: '#shards', query: route.query}">{{ $t('ton.shards') }}</NuxtLink></li>
        </ul>
    </div>
    <div v-if="(route.hash === '#transactions' || route.hash === '#overview')&& block?.transaction_keys" id="transactions">
        <TransactionsTable :item-selector="false" :default-length="5" :update="false" :keys="trKeys" :hidden="block?.transaction_keys.length === 0"/>
    </div>
    <div v-if="(route.hash === '#shards' )&& block?.shard_keys" id="shards">
        <BlocksTable :item-selector="false" :default-length="5" :update="false" :keys="block.shard_keys" :hidden="block?.shard_keys.length === 0"/>
    </div>
</template>