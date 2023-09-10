<script setup lang="ts">
interface Props {
    wrap?: boolean
    bold?: boolean
    third?: string
    fourth?: string
}
defineProps<Props>()
</script>

<template>
    <template v-if="isMobile()">
        <td class="uk-flex uk-flex-column uk-align-center uk-margin-remove-vertical uk-text-muted" style="padding: 0.5rem;">
            <p class="uk-margin-remove-bottom uk-text-small uk-text-left" :class="{'uk-flex' : third || fourth}">
                <slot name="name"/>
                <div class="uk-margin-small-left uk-margin-small-right" v-if="third">{{ '·' }}</div>
                {{ third }}
                <div class="uk-margin-small-left uk-margin-small-right" v-if="fourth">{{ '·' }}</div>
                {{ fourth }}
            </p>
            <p class="uk-flex uk-margin-remove uk-text-left uk-text-primary" :class="{'uk-flex-wrap' : wrap}">
                <slot name="value"/>
            </p>
        </td>
    </template>
    <template v-else>
        <td class="uk-text-muted" :class="third !== undefined? (fourth !== undefined? 'uk-width-1-4' : 'uk-width-1-3') : 'uk-width-1-5'">
            <slot name="name"/>
        </td>
        <td v-if="third !== undefined">
            {{ third }}
        </td>
        <td v-if="fourth !== undefined">
            {{ fourth }}
        </td>
        <td class="uk-flex uk-text-primary" :class="{'uk-text-bold' : bold, 'uk-flex-wrap' : wrap, 'uk-width-1-1' : !third}">
            <slot name="value"/>
        </td>
    </template>
</template>