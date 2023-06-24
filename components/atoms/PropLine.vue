<script setup lang="ts">
interface Props {
    wrap?: boolean
    bold?: boolean
}
defineProps<Props>()
</script>

<template>
    <template v-if="isMobile()">
        <td class="uk-flex uk-flex-column uk-align-center uk-margin-remove-vertical" style="padding: 0.5rem 0;">
            <p class="uk-margin-remove-bottom uk-text-small uk-text-left uk-text-bold">
                <slot name="name"/>
            </p>
            <p class="uk-flex uk-margin-remove uk-text-left" :class="{'uk-flex-wrap' : wrap}">
                <slot name="value"/>
            </p>
        </td>
    </template>
    <template v-else>
        <td class="uk-width-1-5">
            <slot name="name"/>
        </td>
        <td class="uk-flex uk-width-1-1" :class="{'uk-text-bold' : bold, 'uk-flex-wrap' : wrap}">
            <slot name="value"/>
        </td>
    </template>
</template>