<script setup lang="ts">

defineProps<{
    wrap?: boolean
    bold?: boolean
}>()

</script>

<template>
  <template v-if="isMobile()">
    <td class="uk-flex uk-flex-column uk-align-center uk-margin-remove-vertical uk-text-muted uk-padding-small">
      <p class="uk-margin-remove-bottom uk-text-small uk-text-left">
        <slot name="name" />
      </p>
      <p
        class="uk-flex uk-margin-remove uk-text-left uk-text-primary"
        :class="{'uk-flex-wrap' : wrap}"
      >
        <slot name="value" />
      </p>
    </td>
  </template>
  <template v-else>
    <td class="uk-text-muted uk-width-1-5">
      <slot name="name" />
    </td>
    <td
      class="uk-flex uk-text-primary"
      :class="{'uk-text-bold' : bold, 'uk-flex-wrap' : wrap}"
    >
      <slot name="value" />
    </td>
  </template>
</template>