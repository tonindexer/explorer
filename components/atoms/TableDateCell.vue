<script setup lang="ts">
const props = defineProps<{
    dateTime: string | number | null
}>()

const passedTime = () => {
    if (!props.dateTime) return null
    if (props.dateTime === '0001-01-01T00:00:00Z') return { time: null, t: 'just_now' }
    const time = Math.abs(new Date(props.dateTime ?? '').getTime() - new Date().getTime())
    if (time > (1000 * 60 * 60 * 24 * 365)) {
        return {
            time: Math.round(time / (1000 * 60 * 60 * 24 * 365)).toString(),
            t: 'y'
        }
    } else if (time > (1000 * 60 * 60 * 24 * 30)) {
        return {
            time: Math.round(time / (1000 * 60 * 60 * 24 * 30)).toString(),
            t: 'mo'
        }
    } else if (time > (1000 * 60 * 60 * 24)) {
        return {
            time: Math.round(time / (1000 * 60 * 60 * 24)).toString(),
            t: 'd'
        }
    } else if (time > (1000 * 60 * 60)) {
        return {
            time: Math.round(time / (1000 * 60 * 60)).toString(),
            t: 'h'
        }
    } else if (time > (1000 * 55)) {
        return {
            time: Math.round(time / (1000 * 60)).toString(),
            t: 'm'
        }
    } else if (time > (1000 * 15)) {
        return {
            time: Math.round(15 * time / (1000 * 15)).toString(),
            t: 's'
        }
    } else {
        return {
            time: null,
            t: 'just_now'
        }
    }
}

</script>

<template>
    <div v-if="passedTime()" class="uk-text-primary uk-text-right uk-text-nowrap">
        {{ (passedTime()?.time ?? '') + $t(`time_ago.${passedTime()?.t}`) }}
    </div>
    <div v-else>
        {{ 'Error' }}
    </div>
</template>