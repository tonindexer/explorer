<template>
    <div class="uk-flex uk-flex-bottom" style="margin-top:32px;">
        <h1 class="uk-margin-remove-vertical uk-text-primary uk-margin-right" :style="`font-size: ${isMobile() ? 30: 48}px; font-weight: 400;`">
            <slot name="title"/>
        </h1>
        <h1 class="uk-margin-remove" :style="`color: rgba(0, 0, 0, 0.30); font-size: ${isMobile() ? 30: 48}px; font-weight: 400;`">
            <slot name="value"/>
        </h1>
    </div>
</template>

<style scoped lang="scss">
h1 {
    font-family: 'Inter', monospace; 
}
</style>