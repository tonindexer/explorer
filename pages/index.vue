<script setup lang="ts">
import { useMainStore } from '@/store/TONExp';

const store = useMainStore()

onMounted(() => {
    store.initLoad()
})

</script>

<template>
    <div class="uk-flex uk-margin-top uk-width-3-4 uk-margin-auto" style="justify-content: space-between;">
        <div class="uk-flex-inline uk-width-1-1 uk-background-muted uk-padding-small" style="width:48%">
            <h2 class="uk-align-center">Last blocks</h2>
        </div>
        <div class="uk-flex-inline uk-width-1-1 uk-background-muted uk-padding-small" style="width:48%">
            <h2 class="uk-align-center">Endpoint stats</h2>
        </div>
    </div>
</template>