<script setup lang="ts">
const route = useRoute()

const showMobileNav = ref(false)

watch(showMobileNav, () => {
    showMobileNav.value ? document.body.style.overflow = 'hidden' : document.body.style.overflow = 'auto' 
}, { deep: true })
</script>

<template>
    <nav class="uk-background-primary header uk-position-fixed uk-width-1-1">
        <div class="uk-flex uk-margin-auto" style="justify-content: space-between;" :style="{ 'width' : isMobile() ? '90%' : '75%'}">
            <template v-if="!isMobile()">
                <div class="uk-flex uk-flex-wrap" style="align-items: center;">
                    <NuxtLink aria-label="main_page" :to="'/'" uk-icon="icon: grid" class="white_svg link"></NuxtLink>
                    <NuxtLink :to="'/blocks'" class="link" :class="{ 'active' : route.path === '/blocks'}"> {{ $t('route.blocks') }}</NuxtLink>
                    <NuxtLink :to="'/transactions'" class="link" :class="{ 'active' : route.path === '/transactions'}"> {{ $t('route.transactions') }}</NuxtLink>
                    <NuxtLink :to="'/messages'" class="link" :class="{ 'active' : route.path === '/messages'}"> {{ $t('route.messages') }}</NuxtLink>
                    <NuxtLink :to="'/accounts'" class="link"  :class="{ 'active' : route.path === '/accounts' && route.fullPath !== '/accounts?contract=nft_collection' && route.fullPath !== '/accounts?contract=jetton_minter'}" > {{ $t('route.accounts') }}</NuxtLink>
                    <NuxtLink :to="'/accounts?contract=nft_collection'" class="link" :class="{ 'active' : route.fullPath === '/accounts?contract=nft_collection'}"> {{ $t('route.nft_collection') }}</NuxtLink>
                    <NuxtLink :to="'/accounts?contract=jetton_minter'" class="link" :class="{ 'active' : route.fullPath === '/accounts?contract=jetton_minter'}"> {{ $t('route.jetton_minter') }}</NuxtLink>
                </div>
                <div class="uk-flex uk-padding-remove" style="align-items: center;">
                    <NuxtLink style="white-space: nowrap;" :to="'/about'" class="link" :class="{ 'active' : route.path === '/about'}"> {{ $t('route.about') }} </NuxtLink>
                    <AtomsLangSwitcher/>
                </div>
            </template>
            <template v-else>
                <div class="uk-flex" style="align-items: center;">
                    <NuxtLink aria-label="main_page" name="main_page" :to="'/'" uk-icon="icon: grid" class="white_svg link" @click="showMobileNav = false"></NuxtLink>
                    <NuxtLink :to="'/'" class="link" @click="showMobileNav = false">tonexplorer</NuxtLink>
                </div>
                <button aria-label="open_menu" v-if="!showMobileNav" uk-icon="icon: menu" class="link" @click="showMobileNav = !showMobileNav">
                </button>
                <button aria-label="close_menu" v-else-if="showMobileNav" uk-icon="icon: close" class="link" @click="showMobileNav = !showMobileNav">
                </button>
            </template>
        </div>
    </nav>
    
    <nav v-show="isMobile()" class="uk-position-fixed uk-position-z-index mob-nav uk-flex uk-flex-column" :class="{ 'open' : showMobileNav , 'closed' : !showMobileNav}" style="justify-content: space-between;">
        <div>
            <table class="uk-table uk-table-divider uk-padding-remove-top" style="align-items: center; font-size: 1.25rem;">
                <tbody>
                    <tr><td>
                        <NuxtLink :to="'/blocks'" class="link" :class="{ 'active' : route.path === '/blocks'}" @click="showMobileNav = false"> {{ $t('route.blocks') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
                        <NuxtLink :to="'/transactions'" class="link" :class="{ 'active' : route.path === '/transactions'}" @click="showMobileNav = false"> {{ $t('route.transactions') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
                        <NuxtLink :to="'/accounts'" class="link" :class="{ 'active' : route.path === '/accounts' && route.fullPath !== '/accounts?contract=nft_collection' && route.fullPath !== '/accounts?contract=jetton_minter'}" @click="showMobileNav = false"> {{ $t('route.accounts') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
                        <NuxtLink :to="'/accounts?contract=nft_collection'" class="link" :class="{ 'active' : route.fullPath === '/accounts?contract=nft_collection'}" @click="showMobileNav = false"> {{ $t('route.nft_collection') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
                        <NuxtLink :to="'/accounts?contract=jetton_minter'" class="link" :class="{ 'active' : route.fullPath === '/accounts?contract=jetton_minter'}" @click="showMobileNav = false"> {{ $t('route.jetton_minter') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
                        <NuxtLink :to="'/messages'" class="link" :class="{ 'active' : route.path === '/messages'}" @click="showMobileNav = false"> {{ $t('route.messages') }}</NuxtLink>
                    </td></tr>
                    <tr><td>
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
            color: white;
        }
    }
}

.link.active {
    text-decoration: underline
}

.mob-nav {
    top: 53px;
    right: -100vw;
    width: 0;
    height: calc(100% - 53px);
    transition: right 0.3s;
    background-color: white;
    overflow: hidden;
    &.open {
        right: 0;
        width: 100vw;
    }
}
</style>