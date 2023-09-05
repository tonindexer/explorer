<script setup lang="ts">
interface Props {
    startLine?: string | null
    amount: number | null
    itemCount: number | string,
    options: Array<number | string>
}
defineProps<Props>()
defineEmits(['setValue'])
</script>

<template>
    <p v-if="startLine !== null" class="uk-margin-remove">{{ $t(startLine ?? 'general.show')}}</p>
    <select :value="itemCount" @change="$event => $emit('setValue', $event.target)" class="uk-select uk-background-primary uk-margin-small-left" style="min-width: 70px">
        <option v-for="option in options">{{ option }}</option>
    </select>
    <template v-if="amount && isNumeric(itemCount)">
        <p class="uk-margin-remove-vertical uk-margin-small-left" style="white-space: nowrap;">{{ $t('general.items') + ' ' + amount + (amount > Number(itemCount) ? ' ·' : '')}}</p>
    </template>
</template>