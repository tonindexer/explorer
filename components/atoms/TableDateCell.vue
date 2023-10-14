<script setup lang="ts">
interface Props {
    dateTime: string | number | null
}
const props = defineProps<Props>()

const relativeTime = computed(() => {
    return getHumanTime(props.dateTime ?? '')
})
</script>

<template>
    <div v-if="relativeTime" class="uk-text-primary uk-text-right uk-text-nowrap">
        {{ relativeTime }}
    </div>
    <div v-else>
        {{ 'Error' }}
    </div>
</template>