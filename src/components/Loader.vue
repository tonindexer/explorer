<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 50 50"
    xmlns="http://www.w3.org/2000/svg"
    class="uk-margin-vertical"
  >
    <g fill="none" stroke-width="3">
      <!-- Outer arc -->
      <path
        :stroke="activeDark ? 'rgba(255, 255, 255, 0.5)' : '#000000'"
        d="M25,4 A21,21 0 1,1 25,46 A21,21 0 1,1 25,4"
        stroke-linecap="round"
        stroke-dasharray="95 37"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </path>
      <!-- Inner arc -->
      <path
        :stroke="activeDark ? 'rgba(255, 255, 255, 0.5)' : '#000000'"
        d="M25,8 A17,17 0 1,0 25,42 A17,17 0 1,0 25,8"
        stroke-linecap="round"
        stroke-dasharray="75 30"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="360 25 25"
          to="0 25 25"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  ratio?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  ratio: 3
})

const size = computed(() => {
  const baseSize = 40
  const size = baseSize * Number(props.ratio)
  return `${size}px`
})


const colorMode = useColorMode()
const activeDark = computed(() => colorMode.value === 'dark')
</script>
  