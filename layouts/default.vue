<script setup lang="ts">
const route = useRoute()

</script>

<template>
    <NavBar/>
    <div class="uk-section uk-width-3-4" style="margin: 1rem auto 0; padding-top: 0;">
        <AtomsSearchBar/>
        <div v-if="route.fullPath !== '/'">
            <AtomsRouteChain/>
        </div>
        <slot />
    </div>
</template>
