<script setup lang="ts">
interface Props {
  balance: bigint
  full?: boolean
  delta?: boolean
  tooltip?: string
  place?: string
  filler?: string
}

withDefaults(defineProps<Props>(), {
  delta: false,
  full: false,
  place: 'baseline',
  filler: ''
})
</script>

<template>
  <div 
    class="uk-flex uk-width-1-1 diamond uk-text-primary"
    style="padding: 3px"
    :style="`place-content: ${place}`"
    :class="delta ? colorAmount(balance) : ''"
    :uk-tooltip="tooltip ? tooltip : (full ? undefined : fullTON(balance, delta))"
  >
    {{ filler + (full ? fullTON(balance, delta) : roundTON(balance)) }}
  </div>
</template>