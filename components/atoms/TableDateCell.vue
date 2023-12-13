<script setup lang="ts">
interface Props {
    dateTime: string | number | null
}
const props = defineProps<Props>()

const passedTime = () => {
    if (!props.dateTime) return null
    if (props.dateTime === '0001-01-01T00:00:00Z') return 'just now'
    const time = Math.abs(new Date(props.dateTime ?? '').getTime() - new Date().getTime())
    if (time > (1000 * 60 * 60 * 24 * 365)) {
        return Math.round(time / (1000 * 60 * 60 * 24 * 365)).toString() + 'y ago'
    } else if (time > (1000 * 60 * 60 * 24 * 30)) {
        return Math.round(time / (1000 * 60 * 60 * 24 * 30)).toString() + 'mo ago'
    } else if (time > (1000 * 60 * 60 * 24)) {
        return Math.round(time / (1000 * 60 * 60 * 24)).toString() + 'd ago'
    } else if (time > (1000 * 60 * 60)) {
        return Math.round(time / (1000 * 60 * 60)).toString() + 'h ago'
    } else if (time > (1000 * 55)) {
        return Math.round(time / (1000 * 60)).toString() + ' min ago'
    } else if (time > (1000 * 15)) {
        return Math.round(15 * time / (1000 * 15)).toString() + 's ago'
    } else {
        return 'just now'
    }
}

</script>

<template>
    <div v-if="passedTime()" class="uk-text-primary uk-text-right uk-text-nowrap">
        {{ passedTime() }}
    </div>
    <div v-else>
        {{ 'Error' }}
    </div>
</template>