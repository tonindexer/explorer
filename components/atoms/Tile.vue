<script lang="ts" setup>

defineProps<{
    top?: boolean
    body?: boolean
    tileStyle?: string
    topStyle?: string
    bodyStyle?: string
}>()

</script>

<template>
    <div class="uk-background-primary uk-remove-padding" v-if="top || body" :style="tileStyle" style="border-radius: 12px;">
        <div v-if="top" style="padding: 16px" :style="topStyle">
            <slot name="top" />
        </div>
        <div v-if="body" :style="bodyStyle">
            <slot name="body" />
        </div>
    </div>
</template>