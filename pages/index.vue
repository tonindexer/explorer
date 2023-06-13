<template>
    <div class="uk-flex uk-margin-top" style="column-gap: 0.5rem">
        <div class="uk-flex-inline uk-width-1-1 uk-background-muted uk-padding-small uk-flex-column">
            <h3 class="uk-align-center" style="margin-bottom: 0.5rem;">{{ $t('general.last_blocks') }}</h3>
            <MainBlockList/>   
        </div>
        <div class="uk-flex-inline uk-width-1-1 uk-background-muted uk-padding-small uk-flex-column" style="; height: fit-content">
            <h3 class="uk-align-center" style="margin-bottom: 0.5rem;">{{ $t('route.transactions') }}</h3>
            <MainTransactionList/>   
        </div>
    </div>
    <div class="uk-flex uk-margin-top" style="gap: 1rem">
        <div class="uk-flex-inline uk-width-1-1 uk-background-muted uk-padding-small uk-flex-column" style="; height: fit-content">
            <h3 class="uk-align-center" style="margin-bottom: 0.5rem;">{{ $t('general.end_stats') }}</h3>
            <MainStatistics/>   
        </div>
    </div>
</template>