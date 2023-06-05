<script setup lang="ts">
import { LocationQuery } from 'vue-router';

const route = useRoute()
const isGeneral = ref(true)
const error = ref(false)
const id : NullableStrNumRef = ref(null)
const shard : NullableNumRef = ref(null)
const seq_no : NullableNumRef = ref(null)

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
            {{ 'An error occured while parcing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-if="isGeneral">
            <LazyBlocksTable/>
        </div>
        <div v-else>
            {{ `this is block ${id}${shard ? '/' + shard : ''}${seq_no ? '/' + seq_no : ''}` }}
        </div>
    </template>
</template>