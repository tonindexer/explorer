<script setup lang="ts">
interface Props {
    wrap?: boolean
    bold?: boolean
    third?: string
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
                <div class="uk-margin-small-left uk-margin-small-right" v-if="third">{{ '·' }}</div>
                {{ third }}
            </p>
        </td>
    </template>
    <template v-else>
        <td :class="third? 'uk-width-1-3' : 'uk-width-1-5'">
            <slot name="name"/>
        </td>
        <td :class="{'uk-text-bold' : bold, 'uk-flex-wrap' : wrap, 'uk-width-1-3' : third, 'uk-width-1-1 uk-flex' : !third}">
            <slot name="value"/>
        </td>
        <td v-if="third" class="uk-width-1-3">
            {{ third }}
        </td>
    </template>
</template>