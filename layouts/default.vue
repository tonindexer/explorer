<script setup lang="ts">
const route = useRoute()

</script>

<template>
    <div class="uk-background-primary header">
        <div class="nav-tabs uk-flex uk-flex-center">
            <div class="uk-flex-inline uk-background-muted navtab">Starting page</div>
            <div class="uk-flex-inline uk-background-muted navtab">TON Map</div>
            <button class="uk-button uk-button-default uk-background-muted navtab" type="button">{{ $t('general.language' )}}</button>
            <AtomsLangSwitcher/>
            <div class="uk-flex-inline uk-background-muted navtab">About project</div>
        </div>
    </div>
    <div class="uk-section uk-width-3-4" style="margin: 1rem auto 0; padding-top: 0;">
        <AtomsSearchBar/>
        <div v-if="route.fullPath !== '/'">
            <AtomsRouteChain/>
        </div>
        <slot />
    </div>
</template>

<style lang="scss">
.header {
    position: sticky;
    top: 0;
    z-index: 90;
    div {
        padding: 0.5rem;
        .navtab {
            margin: 0 1rem;
        }
    }
    button {
        font-size: 16px;
        font-weight: normal;
        line-height: 1.5;
        -webkit-text-size-adjust: 100%;
        background: #fff;
        color: #666;
        text-transform: none;
        &:hover {
            background-color: #f8f8f8;
        }
    }
}
</style>