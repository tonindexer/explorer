<script setup lang="ts">
const { localeProperties } = useI18n()
interface Props {
    dateTime: string | number | null
}
defineProps<Props>()
</script>

<template>
    <div class="uk-flex uk-flex-column uk-align-center uk-margin-remove-vertical">
        <p class="uk-margin-remove-bottom uk-text-right uk-text-medium"> {{ dateTime? new Date(dateTime).toLocaleTimeString() : 'Error' }}</p>
        <p v-if="dateTime" class="uk-margin-remove uk-text-right" style="font-size: small; white-space: nowrap;">{{ new Date(dateTime).toLocaleDateString(localeProperties.iso, {year: 'numeric', month: 'short', day: 'numeric' }) }}</p>
    </div>
</template>