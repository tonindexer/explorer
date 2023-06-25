<script setup lang="ts">
const { localeProperties } = useI18n()
interface Props {
    dateTime: string | null
}

const props = defineProps<Props>()
const day = computed(() => {
    if (!props.dateTime) return 'Error'
    const current = new Date()
    const input = new Date(props.dateTime)
    if (input.setHours(0,0,0,0) === current.setHours(0,0,0,0)) return 'Today'
    else if (input.setHours(0,0,0,0) === current.setHours(-24,0,0,0)) return 'Yesterday'
    else return input.toLocaleDateString(localeProperties.value.iso, {year: '2-digit', month: '2-digit', day: '2-digit' })
})
</script>

<template>
    <div class="uk-flex uk-align-center uk-margin-remove-vertical">
        <div v-if="dateTime" class="uk-margin-remove uk-text-right" style="white-space: nowrap; color:#aaa">{{ day }}</div>
        <div class="uk-margin-remove-bottom" style="margin-left: 0.3rem;"> {{ dateTime? new Date(dateTime).toLocaleTimeString() : 'Error' }}</div>
    </div>
</template>