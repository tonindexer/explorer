<script setup lang="ts">
interface Props {
    methods: {[key: string] : GetMethod}
}
const props = defineProps<Props>()

const display = computed(() => JSON.stringify(props.methods, null, 4).trim())
</script>

<template>
    <pre>{{ display }}</pre>
</template>