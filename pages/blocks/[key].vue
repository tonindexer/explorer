<script setup lang="ts">
const route = useRoute()
const workchain : NullableNumRef = ref(null)
const shard : NullableBigRef = ref(null)
const seq_no : NullableNumRef = ref(null)

const key = computed(() => (workchain.value !== null) && shard.value && seq_no.value ? blockKeyGen(workchain.value, shard.value, seq_no.value) : null)

onMounted(() => {
    const key = route.params.key ? (Array.isArray(route.params.key) ? route.params.key[0] : route.params.key) : null
    if (key) {
        const params = blockKeyDegen(key)
        if (params) {
            workchain.value = params.workchain
            shard.value = params.shard
            seq_no.value = params.seq_no
        }
    }
})
</script>

<template>
    <template v-if="!key">
        <NuxtLink :to="{ name: 'blocks' }">
            {{ 'An error occured while parsing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-if="(workchain || workchain === 0) && shard && seq_no" class="uk-flex uk-flex-column">
            <BlocksBlockInfo :shard="shard" :seq_no="seq_no" :workchain="workchain"/>
        </div>
    </template>
</template>