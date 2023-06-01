<script setup lang="ts">
const { setLocale } = useI18n()
</script>

<template>
    <div class="uk-background-primary header">
        <div class="nav-tabs uk-flex uk-flex-center">
            <div class="uk-flex-inline uk-background-muted navtab">Starting page</div>
            <div class="uk-flex-inline uk-background-muted navtab">TON Map</div>
            <button class="uk-button uk-button-default uk-background-muted navtab" type="button">{{ $t('general.language' )}}</button>
            <div uk-dropdown>
                <ul class="uk-nav uk-dropdown-nav">
                    <li>
                        <NuxtLink @click.prevent.stop="setLocale('ru')">Русский</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink @click.prevent.stop="setLocale('en')">English</NuxtLink>
                    </li>
                </ul>
            </div>
            <div class="uk-flex-inline uk-background-muted navtab">About project</div>
        </div>
    </div>
    <div class="uk-section" style="margin-top: 1rem; padding-top: 0%;">
        <div class="uk-flex uk-flex-center">
            <form class="uk-search uk-search-default uk-width-3-4">
                <a href="" uk-search-icon></a>
                <input class="uk-search-input" type="search" placeholder="Search TON adresses, tokens..." aria-label="Search">
            </form>
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