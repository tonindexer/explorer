<script lang="ts" setup>
import { createToast } from 'mosha-vue-toastify';
import 'mosha-vue-toastify/dist/style.css';

onMounted(() => {
    createToast({
        description: '<a class="uk-text-primary uk-margin-left" uk-icon="icon: arrow-right" rel="external" href="https://explorer-beta.anton.tools" class="link"> Go and test our new design </a>',
    },{
        hideProgressBar: true,
        timeout: 1000*60*3,
        })
})
</script>

<template>
    <template v-if="isMobile()">
        <div class="uk-flex uk-flex-column uk-margin-top" style="gap: 1.5rem">
            <div class="uk-flex-inline uk-width-1-1 uk-background-muted uk-padding-small uk-flex-column">
                <h3 class="uk-align-center" style="margin-bottom: 0.5rem;">{{ $t('general.last_blocks') }}</h3>
                <MainBlockList/>   
            </div>
            <div class="uk-flex-inline uk-width-1-1 uk-background-muted uk-padding-small uk-flex-column" style="; height: fit-content">
                <h3 class="uk-align-center" style="margin-bottom: 0.5rem;">{{ $t('route.transactions') }}</h3>
                <MainTransactionList/>  
            </div>
            <div class="uk-flex-inline uk-width-1-1 uk-background-muted uk-padding-small uk-flex-column" style="; height: fit-content"> 
                <h3 class="uk-align-center" style="margin-bottom: 0.5rem;">{{ $t('general.end_stats') }}</h3>
                <MainStatistics/>   
            </div>
        </div>
    </template>
    <template v-else>
        <div class="uk-flex uk-margin-top" style="column-gap: 0.5rem">
            <div class="uk-flex-inline uk-width-1-1 uk-background-muted uk-padding-small uk-flex-column">
                <h3 class="uk-align-center" style="margin-bottom: 0.5rem;">{{ $t('general.last_blocks') }}</h3>
                <MainBlockList/>   
            </div>
            <div class="uk-flex-inline uk-width-1-1 uk-background-muted uk-padding-small uk-flex-column" style="; height: fit-content"> 
                <h3 class="uk-align-center" style="margin-bottom: 0.5rem;">{{ $t('general.end_stats') }}</h3>
                <MainStatistics/>   
            </div>
        </div>
        <div class="uk-flex uk-margin-top" style="gap: 1rem">
            <div class="uk-flex-inline uk-width-1-1 uk-background-muted uk-padding-small uk-flex-column" style="; height: fit-content">
                <h3 class="uk-align-center" style="margin-bottom: 0.5rem;">{{ $t('route.transactions') }}</h3>
                <MainTransactionList/>  
            </div>
        </div>
    </template>
</template>

<style>
.mosha__toast__content-wrapper {
    width: 100%;
    justify-content: center;
}
</style>