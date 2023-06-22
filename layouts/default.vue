<script setup lang="ts">
const route = useRoute()

</script>

<template>
    <NavBar/>
    <div class="uk-section uk-padding-remove-top" style="margin: 1rem auto 0; min-height: calc(100vh - 120px);" :style="{ 'width' : isMobile() ? '90%' : '75%'}">
        <AtomsSearchBar/>
        <div v-if="route.fullPath !== '/' && !isMobile()">
            <AtomsRouteChain/>
        </div>
        <slot />
    </div>
    <FooterBar/>
</template>

<style src="~/assets/styles/main.scss" lang="scss"></style>
