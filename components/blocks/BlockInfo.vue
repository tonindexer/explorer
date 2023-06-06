<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

interface Props {
    workchain: number,
    shard: number,
    seq_no: number
}

const error = ref(false)
const store = useMainStore()
const props = defineProps<Props>()
const route = useRoute()

const pointer: NullableStrRef = ref(null)
const block: Ref<SmallBlock | SmallShard | null> = ref(null)
const shardList: Ref<Array<SmallShard> | []> = ref([])
const transList: Ref<Array<Transaction> | []> = ref([])

onMounted(async() => {
    error.value = false
    pointer.value = store.pageBlocksIndexer[`${props.workchain}:${props.shard}:${props.seq_no}`]?.toString() ?? null
    if (pointer.value) {
        block.value = store.pageSmallBlockFetcher(pointer.value)
    }
    if (!block.value) {
        block.value = await store.fetchBlock(props.workchain, props.shard, props.seq_no)
    }
    if (!block.value) {
        error.value = true
        return;
    }
})
</script>

<template>
    <!-- {{ block ?? 'gg' }} -->
    <BlocksSingleBlockTable :block="block"/>
    <div>
    <ul v-if="shardList.length || block?.tr_count" class="uk-child-width-expand" uk-tab>
        <li class="uk-active"><NuxtLink :to="{ hash: '#transactions', query: route.query}">{{ $t('route.transactions') }}</NuxtLink></li>
        <li><NuxtLink :to="{ hash: '#messages', query: route.query}">{{ $t('route.messages') }}</NuxtLink></li>
        <li><NuxtLink :to="{ hash: '#shards', query: route.query}">{{ $t('ton.shards') }}</NuxtLink></li>
    </ul>
</div>
</template>