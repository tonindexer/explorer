<script setup lang="ts">
import { LocationQuery } from 'vue-router';

const route = useRoute()
const isLoading = ref(true)
const isGeneral = ref(true)
const error = ref(false)
const id : NullableNumRef = ref(null)
const shard : NullableNumRef = ref(null)
const seq_no : NullableNumRef = ref(null)

function routeChecker(newQuery: LocationQuery) {
    id.value = (isNumeric(newQuery.id)) ? Number(newQuery.id) : null;
    shard.value = (isNumeric(newQuery.shard)) ? Number(newQuery.shard) : null;
    seq_no.value = (isNumeric(newQuery.seq_no)) ? Number(newQuery.seq_no) : null;

    if ((id.value || id.value ===0) && shard.value && seq_no.value) {
        isGeneral.value = false;
        error.value = false;
        isLoading.value = false;
        return;
    }

    if (!id.value && !shard.value && !seq_no.value) {
        isGeneral.value = true;
        error.value = false;
        isLoading.value = false;
        return;
    }
    isLoading.value = false;
    error.value = true;
}

watch(() => route.query, (newQuery) => routeChecker(newQuery))
onMounted(() => routeChecker(route.query))
</script>

<template>
    <template v-if="error || isLoading">
        <NuxtLink to="/blocks">
            {{ 'An error occured while parcing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-if="isGeneral">
            <h1>{{  $t('route.blocks') }}</h1>
            <LazyBlocksTable/>
        </div>
        <div v-else-if="(id || id === 0)&& shard && seq_no" class="uk-flex uk-flex-column">
            <div class="uk-flex uk-flex-bottom">
                <h1 class="uk-inline uk-margin-remove-vertical">
                {{ $t('route.block')}}
                </h1>
                <h2 class="uk-inline uk-margin-remove-vertical uk-text-primary uk-margin-left uk-text-bold" style="line-height: 1.35;">
                    {{ `${id}:${truncString(shard.toString(), 5, 4)}:${seq_no}` }}
                </h2>
            </div>
            <BlocksBlockInfo :shard="shard" :seq_no="seq_no" :workchain="id"/>
        </div>
    </template>
</template>