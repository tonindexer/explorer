<script setup lang="ts">
const { localeProperties } = useI18n()
interface Props {
    dateTime: string | null
}
defineProps<Props>()
</script>

<template>
    <td class="uk-flex uk-flex-column">
        <p class="uk-margin-remove-bottom uk-text-right uk-text-medium"> {{ dateTime? new Date(dateTime).toLocaleTimeString() : 'Error' }}</p>
        <p v-if="dateTime" class="uk-margin-remove uk-text-right" style="font-size: small;">{{ new Date(dateTime).toLocaleDateString(localeProperties.iso, {year: 'numeric', month: 'short', day: 'numeric' }) }}</p>
    </td>
</template>