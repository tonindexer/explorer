<template>
    <template v-if="isMobile()">
        <div class="uk-flex uk-flex-column uk-margin-top" style="gap: 1.5rem">
            <AtomsTile :top="true" :body="true" :tile-style="'width: 100%'" :body-style="'padding-bottom: 12px'">
                <template #top>
                    <h3 class="uk-text-center uk-width-1-1 uk-text-primary" style="margin-bottom: 0.5rem;">{{ $t('general.last_blocks') }}</h3>
                </template>
                <template #body>
                    <MainBlockList/>
                </template>
            </AtomsTile>
            <AtomsTile :top="true" :body="true" :tile-style="'width: 100%'" :body-style="'padding-bottom: 12px'">
                <template #top>
                    <h3 class="uk-text-center uk-width-1-1 uk-text-primary" style="margin-bottom: 0.5rem;">{{ $t('general.end_stats') }}</h3>
                </template>
                <template #body>
                    <MainStatistics/>   
                </template>
            </AtomsTile>
            <AtomsTile :top="true" :body="true" :tile-style="'width: 100%'" :body-style="'padding-bottom: 12px'">
                <template #top>
                    <h3 class="uk-text-center uk-text-primary" style="margin-bottom: 0.5rem;">{{ $t('route.transactions') }}</h3>
                </template>
                <template #body>
                    <MainTransactionList/>  
                </template>
            </AtomsTile>
        </div>
    </template>
    <template v-else>
        <div class="uk-flex uk-margin-top" style="column-gap: 0.5rem">
            <AtomsTile :top="true" :body="true" :tile-style="'width: 50%'" :body-style="'padding-bottom: 12px'">
                <template #top>
                    <h3 class="uk-text-center uk-width-1-1 uk-text-primary" style="margin-bottom: 0.5rem;">{{ $t('general.last_blocks') }}</h3>
                </template>
                <template #body>
                    <MainBlockList/>
                </template>
            </AtomsTile>
            <AtomsTile :top="true" :body="true" :tile-style="'width: 50%; height: fit-content'" :body-style="'padding-bottom: 12px'">
                <template #top>
                    <h3 class="uk-text-center uk-width-1-1 uk-text-primary" style="margin-bottom: 0.5rem;">{{ $t('general.end_stats') }}</h3>
                </template>
                <template #body>
                    <MainStatistics/>   
                </template>
            </AtomsTile>
        </div>
        <div class="uk-flex uk-margin-top" style="gap: 1rem">
            <AtomsTile :top="true" :body="true" :tile-style="'width: 100%'" :body-style="'padding-bottom: 12px'">
                <template #top>
                    <h3 class="uk-text-center uk-text-primary" style="margin-bottom: 0.5rem;">{{ $t('route.transactions') }}</h3>
                </template>
                <template #body>
                    <MainTransactionList/>  
                </template>
            </AtomsTile>
        </div>
    </template>
</template>