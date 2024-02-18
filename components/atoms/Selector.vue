<script setup lang="ts">

defineProps<{
    amount: number | null
    itemCount: number | string
    options: Array<number | string>
    startLine?: string | null
    def?: boolean
}>()

defineEmits<{
    'update:itemCount': [item: number | string]
}>()

</script>

<template>
    <p v-if="startLine !== null" class="uk-margin-remove uk-text-muted">{{ $t(startLine ?? 'general.show')}}</p>
    <select :value="itemCount" @change="($event: Event) => $emit('update:itemCount', ($event.target as HTMLSelectElement).value)" class="uk-select uk-text-muted uk-background-primary" :class="{'custom' : !def}">
        <option v-for="option in options">{{ option }}</option>
    </select>
    <template v-if="amount && isNumeric(itemCount)">
        <p class="uk-margin-remove-vertical uk-text-muted" style="white-space: nowrap; height: 24px; margin-left: 8px">{{ $t('general.items') + ' ' + amount}}</p>
    </template>
</template>

<style scoped lang="scss">
.uk-select:not([multiple]):not([size]) {
    &.custom {
        background-position: 100% 60%;
    }
}

.uk-select {
    border-color: var(--color-text-muted);
}
.uk-select.custom {
    min-width: fit-content; 
    border-radius: 4px; 
    height: 24px !important;
    padding: 0 20px 0 4px;
    line-height: 16px; 
    margin-left: 8px;
}
</style>