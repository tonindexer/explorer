<script setup lang="ts">
import { LocationQuery } from 'vue-router';

const route = useRoute()
const isGeneral = ref(true)
const error = ref(false)
const id : Ref<string | number | null> = ref(null)
const shard : Ref<number | null> = ref(null)
const seq_no : Ref<number | null> = ref(null)

function routeChecker(newQuery: LocationQuery) {
    id.value = (typeof newQuery.id === "string") ? newQuery.id : null;
    if (isNumeric(id.value)) id.value = Number(id.value)
    shard.value = (isNumeric(newQuery.shard)) ? Number(newQuery.shard) : null;
    seq_no.value = (isNumeric(newQuery.seq_no)) ? Number(newQuery.seq_no) : null;

    if (typeof id.value === "string" || (isNumeric(id.value) && shard.value && seq_no.value)) {
        isGeneral.value = false;
        error.value = false;
        return;
    }

    if (!id.value && !shard.value && !seq_no.value) {
        isGeneral.value = true;
        error.value = false
        return;
    }
    error.value = true
}

watch(() => route.query, (newQuery) => routeChecker(newQuery))
onMounted(() => routeChecker(route.query))
</script>

<template>
    <template v-if="error">
        <NuxtLink to="/blocks">
            {{ 'it truly do be like that sometimes' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-if="isGeneral">
            {{ 'this is general page of blocks' }}
        </div>
        <div v-else>
            {{ `this is block ${id}${shard ? '/' + shard : ''}${seq_no ? '/' + seq_no : ''}` }}
        </div>
    </template>
</template>