<script setup lang="ts">
const route = useRoute()
</script>

<template>
    <nav class="uk-background-primary header">
        <div class="uk-flex uk-container uk-width-3-4 uk-margin-auto" style="justify-content: space-between;">
            <div class="uk-flex" style="align-items: center;">
                <NuxtLink :to="'/'" uk-icon="icon: grid" class="white_svg link"></NuxtLink>
                <NuxtLink :to="'/blocks'" class="link" :class="{ 'active' : route.path === '/blocks'}"> {{ $t('route.blocks') }}</NuxtLink>
                <NuxtLink :to="'/transactions'" class="link" :class="{ 'active' : route.path === '/transactions'}"> {{ $t('route.transactions') }}</NuxtLink>
                <NuxtLink :to="'/accounts'" class="link" :class="{ 'active' : route.path === '/accounts'}"> {{ $t('route.accounts') }}</NuxtLink>
                <NuxtLink :to="'https://anton.tools/'" class="link"> {{ $t('general.about') }} </NuxtLink>
            </div>
            <AtomsLangSwitcher/>
        </div>
    </nav>
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
    .link {
        margin-right: 15px;
        line-height: normal;
        &:not(.active) {
            color: #eee;
        }
        &.active {
            color: white;
            text-decoration: underline
        }
        &:hover {
            color: white;
        }
    }
}
</style>