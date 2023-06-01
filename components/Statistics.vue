<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const store = useMainStore()
</script>

<template>
    <div class="uk-flex uk-flex-column">
        <div class="uk-flex uk-flex-row">
            <div class="uk-width-1-2 uk-text-left" style="font-size: 1.2rem; align-self: center;">
            {{ $t('general.type') }}
            </div>
            <div class="uk-width-1-2 uk-text-right" style="font-size: 1.2rem; align-self: center; margin-left:15px;">
            {{ $t('general.amount') }}
            </div>
        </div>
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