<script setup lang="ts">

defineProps<{
    name: string
    requestId: string
    data: {
        value : number | bigint
    }
}>()

</script>


<template>
  <div class="uk-padding-small">
    <div class="uk-text-large uk-text-primary">
      {{ toCompact(data.value) }}
    </div>
  </div>
</template>