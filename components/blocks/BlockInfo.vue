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

const block: Ref<Block | null> = ref(null)

onMounted(async() => {
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
})
</script>

<template>
    <!-- {{ block ?? 'gg' }} -->
    <BlocksSingleBlockTable v-if="block" :block="block"/>
    <div>
    <ul v-if="block?.shard_keys.length || block?.transaction_keys.length" class="uk-child-width-expand" uk-tab>
        <li class="uk-active"><NuxtLink :to="{ hash: '#transactions', query: route.query}">{{ $t('route.transactions') }}</NuxtLink></li>
        <li><NuxtLink :to="{ hash: '#messages', query: route.query}">{{ $t('route.messages') }}</NuxtLink></li>
        <li><NuxtLink :to="{ hash: '#shards', query: route.query}">{{ $t('ton.shards') }}</NuxtLink></li>
    </ul>
</div>
</template>