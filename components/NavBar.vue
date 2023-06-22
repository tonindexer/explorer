<script setup lang="ts">
const route = useRoute()

const showMobileNav = ref(false)

watch(showMobileNav, () => {
    showMobileNav.value ? document.body.style.overflow = 'hidden' : document.body.style.overflow = 'auto' 
})
</script>

<template>
    <nav class="uk-background-primary header">
        <div class="uk-flex uk-container uk-margin-auto" style="justify-content: space-between;" :style="{ 'width' : isMobile() ? '90%' : '75%'}">
            <template v-if="!isMobile()">
                <div class="uk-flex" style="align-items: center;">
                    <NuxtLink :to="'/'" uk-icon="icon: grid" class="white_svg link"></NuxtLink>
                    <NuxtLink :to="'/blocks'" class="link" :class="{ 'active' : route.path === '/blocks'}"> {{ $t('route.blocks') }}</NuxtLink>
                    <NuxtLink :to="'/transactions'" class="link" :class="{ 'active' : route.path === '/transactions'}"> {{ $t('route.transactions') }}</NuxtLink>
                    <NuxtLink :to="'/accounts'" class="link" :class="{ 'active' : route.path === '/accounts'}"> {{ $t('route.accounts') }}</NuxtLink>
                    <NuxtLink :to="'/about'" class="link" :class="{ 'active' : route.path === '/about'}"> {{ $t('route.about') }} </NuxtLink>
                </div>
                <AtomsLangSwitcher/>
            </template>
            <template v-else>
                <div class="uk-flex" style="align-items: center;">
                    <NuxtLink :to="'/'" uk-icon="icon: grid" class="white_svg link"></NuxtLink>
                    <NuxtLink :to="'/'" class="link">explorer</NuxtLink>
                </div>
                <button v-if="!showMobileNav" uk-icon="icon: menu" class="link" @click="showMobileNav = !showMobileNav">
                </button>
                <button v-else-if="showMobileNav" uk-icon="icon: close" class="link" @click="showMobileNav = !showMobileNav">
                </button>
            </template>
        </div>
    </nav>
    
    <nav v-show="isMobile()" class="uk-position-absolute uk-position-z-index mob-nav uk-flex uk-flex-column" :class="{ 'open' : showMobileNav , 'closed' : !showMobileNav}" style="justify-content: space-between;">
        <div>
            <table class="uk-table uk-table-divider uk-padding-remove-top" style="align-items: center; border-top: 1px solid #666;">
                <tbody>
                    <tr><td class="uk-text-large">
                        <NuxtLink :to="'/blocks'" class="link" :class="{ 'active' : route.path === '/blocks'}" @click="showMobileNav = false"> {{ $t('route.blocks') }}</NuxtLink>
                    </td></tr>
                    <tr><td class="uk-text-large">
                        <NuxtLink :to="'/transactions'" class="link" :class="{ 'active' : route.path === '/transactions'}" @click="showMobileNav = false"> {{ $t('route.transactions') }}</NuxtLink>
                    </td></tr>
                    <tr><td class="uk-text-large">
                        <NuxtLink :to="'/accounts'" class="link" :class="{ 'active' : route.path === '/accounts'}" @click="showMobileNav = false"> {{ $t('route.accounts') }}</NuxtLink>
                    </td></tr>
                    <tr><td class="uk-text-large">
                        <NuxtLink :to="'/about'" class="link" :class="{ 'active' : route.path === '/about'}" @click="showMobileNav = false"> {{ $t('route.about') }} </NuxtLink>
                    </td></tr>
                </tbody>
            </table>
        </div>
        <div class="uk-container uk-margin-small-bottom">
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
        .link {
            min-width: 20px;
            margin-right: 15px;
            line-height: normal;
            &:not(.active) {
                color: #eee;
            }
            &.active {
                color: white;
            }
            &:hover {
                color: white;
            }
        }
    }
}

.link.active {
    text-decoration: underline
}

    
.mob-nav {
    top: 120px;
    right: -100vw;
    width: 0;
    height: calc(100% - 120px);
    transition: right 0.3s;
    background-color: white;
    overflow: hidden;
    &.open {
        right: 0;
        width: 100vw;
    }
}
</style>