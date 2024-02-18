<script setup lang="ts">
const store = useMainStore()
const loading = computed(() => Object.keys(store.stats).length === 0)

</script>

<template>
    <div class="uk-flex uk-flex-column">
        <template v-if="loading">
            <div class="uk-flex uk-flex-center">
                <Loader :ratio="2"/>
            </div>
        </template>
        <template v-else>
            <template v-for="(value, key) in store.stats">
                <hr style="margin: 0.7rem 0">
                <div class="uk-text-medium uk-flex" 
                    style="justify-content: space-between; padding: 0 12px;">
                    <div>
                        {{ $t(`stats.${key}`) }}
                    </div>
                    <div>
                        {{ `${value}` }}
                    </div>
                </div>
            </template>
        </template>
    </div>
</template>