<script setup lang="ts">
const { localeProperties } = useI18n()
interface Props {
    dateTime: string | null
}

const props = defineProps<Props>()
const checkDay = () => new Date(props.dateTime ?? '').getTime() - new Date().getTime() > 86400000
</script>

<template>
    <div class="uk-flex uk-align-center uk-margin-remove-vertical">
        <div v-if="dateTime && checkDay()" class="uk-margin-remove uk-text-right" style="white-space: nowrap; color:#aaa">{{ new Date(dateTime).toLocaleDateString(localeProperties.iso, {year: '2-digit', month: '2-digit', day: '2-digit' }) }}</div>
        <div class="uk-margin-remove-bottom" style="margin-left: 0.3rem;"> {{ dateTime? new Date(dateTime).toLocaleTimeString() : 'Error' }}</div>
    </div>
</template>