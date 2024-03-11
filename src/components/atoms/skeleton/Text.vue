<script setup lang="ts">
const props = defineProps<{
    isLoading: boolean,
    width?: string,
    styles?: string
}>()

const widthShown = ref('70%')

onMounted(() => widthShown.value = props.width ?? `${50 + 40 * Math.random()}%`)
</script>

<template>
  <div 
    v-if="isLoading"
    class="skeleton"
    :style="[
      'height: 1.5em', 
      'width: ' + widthShown,
      styles
    ]"
  />
  <slot v-else />
</template>

<style>
.skeleton {
    border-radius: 8px;
    animation: skeleton-loading 1s linear infinite alternate;
}

@keyframes skeleton-loading {
  0% {
    background-color: var(--skeleton-start);
  }
  100% {
    background-color: var(--skeleton-end);
  }
}
</style>