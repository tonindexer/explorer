<script setup lang="ts">
interface Props {
    name: string | null,
    itemCount: number | string,
    options: Array<number | string>
}
defineProps<Props>()
defineEmits(['setValue'])
</script>

<template>
    <p v-if="name" class="uk-margin-remove">{{ $t(name)}}</p>
    <select :value="itemCount" @change="$event => $emit('setValue', $event.target)" class="uk-select uk-margin-small-left" style="min-width: 70px">
        <option v-for="option in options">{{ option }}</option>
    </select>
</template>