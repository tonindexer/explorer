<script setup lang="ts">
const route = useRoute()
useHead({
    htmlAttrs: {
        lang: 'en'
    },
    script: [{
        src: "js/uikit.min.js"
    },{
        src: "js/uikit-icons.min.js"
    }]    
})
useSeoMeta({
    'title' : 'tonindexer',
    'description': 'tonindexer - The project to index data from TON blockchain.',
    'author': 'Anton Tools',
    'creator': 'Anton Tools',
    'ogTitle': 'tonindexer',
    'ogDescription': 'The project to index data from TON blockchain.',
    'ogType': 'website',
    'ogUrl' : 'https://explorer.anton.tools',
    'ogLocale': 'en_US',
});
</script>

<template>
    <div v-if="!isMobile()" uk-grid class="uk-width-1-1 uk-height-1-1 uk-grid uk-margin-remove uk-background-default" style="column-gap: 24px; padding: 16px; position: relative;">
        <NavBar />
        <main class="uk-padding-remove uk-margin-remove uk-flex uk-flex-column uk-width-expand">
            <AtomsSearchBar/>
            <AtomsRouteChain/>
            <slot />
        </main>
    </div>
    <div v-if="isMobile()" class="uk-width-1-1 uk-height-1-1 uk-flex uk-flex-column" style="column-gap: 24px; padding: 16px">
        <div class="uk-flex" style="align-items: center; column-gap: 16px;">
            <AtomsSearchBar/>
            <NavBar />
        </div>
        <main class="uk-padding-remove uk-margin-remove uk-flex uk-flex-column">
            <AtomsRouteChain/>
            <slot />
        </main>
    </div>
</template>

<style src="~/assets/styles/main.scss" lang="scss"></style>
