<template>
    <div uk-sticky class="uk-background-primary header">
        <div class="nav-tabs uk-flex uk-flex-center" uk-sticky="end: !.uk-height-large; offset: 80">
            <div class="uk-flex-inline uk-background-muted navtab">Starting page</div>
            <div class="uk-flex-inline uk-background-muted navtab">TON Map</div>
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
    div {
        padding: 0.5rem;
        .navtab {
            margin: 0 1rem;
        }
    }
}
</style>