<template>
    <div class="uk-background-primary header">
        <div class="nav-tabs uk-flex uk-flex-center">
            <button class="uk-button uk-button-default uk-background-muted navtab" @click.prevent.stop="navigateTo('/')">
                {{ $t('route.explorer' )}}
            </button>
            <button class="uk-button uk-button-default uk-background-muted navtab" @click.prevent.stop="navigateTo('/blocks')">
                {{ $t('route.blocks' )}}
            </button>
            <AtomsLangSwitcher/>
            <div class="uk-flex-inline uk-background-muted navtab">About project</div>
        </div>
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