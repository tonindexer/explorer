<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const store = useMainStore()
</script>

<template>
    <div class="uk-flex uk-flex-column">
        <template v-for="(value, key) in store.stats">
            <hr style="margin: 0.7rem 0">
            <div class="uk-text-medium uk-flex" 
                style="justify-content: space-between;">
                <div>
                    {{ $t(`stats.${key}`) }}
                </div>
                <div>
                    {{ `${value}` }}
                </div>
            </div>
        </template>
    </div>
</template>