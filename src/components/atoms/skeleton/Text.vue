<script setup lang="ts">
defineProps<{
    isLoading: boolean
}>()
</script>

<template>
    <div 
        v-if="isLoading"
        class="skeleton"
        :style="['height: 1.5em', `width: ${30 + 40 * Math.random()}%`]"
    />
    <slot v-else/>
</template>

<style>
.skeleton {
    border-radius: 8px;
    animation: skeleton-loading 1s linear infinite alternate;
}

@keyframes skeleton-loading {
  0% {
    background-color: hsl(0, 0%, 85%);
  }
  100% {
    background-color: hsl(200, 20%, 95%);
  }
}
</style>