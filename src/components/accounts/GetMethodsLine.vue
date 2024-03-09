<script setup lang="ts">

defineProps<{
    name: string
    third?: string
    fourth?: string
}>()

</script>

<template>
  <template v-if="isMobile()">
    <td class="uk-flex uk-flex-column uk-align-center uk-margin-remove-vertical uk-text-muted uk-padding-small">
      <p
        class="uk-margin-remove-bottom uk-text-small uk-text-left"
        :class="{'uk-flex' : third || fourth}"
      >
        {{ name }}
      </p><div
        v-if="third"
        class="uk-margin-small-left uk-margin-small-right"
      >
        {{ '·' }}
      </div>
      {{ third }}
      <div
        v-if="fourth"
        class="uk-margin-small-left uk-margin-small-right"
      >
        {{ '·' }}
      </div>
      {{ fourth }}
      <p class="uk-flex uk-margin-remove uk-text-left uk-text-primary">
        <slot name="value" />
      </p>
    </td>
  </template>
  <template v-else>
    <td class="uk-padding-large-left uk-text-truncate">
      {{ name }}
    </td>
    <td>
      {{ third }}
    </td>
    <td>
      {{ fourth }}
    </td>
    <td class="uk-flex">
      <slot name="value" />
    </td>
  </template>
</template>