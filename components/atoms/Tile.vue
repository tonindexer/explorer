<script lang="ts" setup>
interface Props {
    top?: boolean
    body?: boolean
    tileStyle?: string
    topStyle?: string
    bodyStyle?: string
    clientBody?: boolean
}

defineProps<Props>()
</script>

<template>
    <div class="uk-background-primary uk-remove-padding" v-if="top || body" :style="tileStyle" style="border-radius: 12px;">
        <div v-if="top" style="padding: 16px" :style="topStyle">
            <slot name="top" />
        </div>
        <div v-if="body" :style="bodyStyle">
            <template v-if="clientBody">
                <ClientOnly>
                    <slot name="body" />

                </ClientOnly>
            </template>
            <template v-else>
                <slot name="body" />
            </template>
        </div>
    </div>
</template>