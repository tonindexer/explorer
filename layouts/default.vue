<script setup lang="ts">
const route = useRoute()
useSeoMeta({
    'title' : 'tonindexer',
    'description': 'tonindexer - The project to index data from TON blockchain.',
    'author': 'Anton Tools',
    'creator': 'Anton Tools',
    'ogTitle': 'tonindexer',
    'ogDescription': 'The project to index data from TON blockchain.',
    'ogType': 'website',
    'ogUrl' : 'https://explorer.anton.tools',
    'ogLocale': 'en_US'
});
</script>

<template>
    <NavBar/>
    <div class="uk-section uk-padding-remove-vertical" style="margin: 66px auto 0; min-height: calc(100vh - 120px);" :style="{ 'width' : isMobile() ? '90%' : '75%'}">
        <AtomsSearchBar/>
        <div v-if="route.fullPath !== '/' && !isMobile()">
            <AtomsRouteChain/>
        </div>
        <slot />
    </div>
    <FooterBar/>
</template>

<style src="~/assets/styles/main.scss" lang="scss"></style>
