<script setup lang="ts">

defineProps<{
    page: number
    leftDisabled: boolean
    rightDisabled: boolean
}>()

defineEmits<{
    'update:page': [page: number]
}>()

</script>

<template>
  <div
    v-if="(!leftDisabled) || (!rightDisabled)"
    class="uk-flex uk-flex-middle uk-text-muted"
    style="margin-left: 36px;"
  >
    <p class="uk-margin-remove">
      {{ `${$t('general.page')} ${page + 1}` }}
    </p>
    <div 
      class="arrow bg uk-border-rounded uk-margin-small-left"
      :class="{'disabled' : leftDisabled}"
      style="border-radius: 4px; line-height: 16px;"
      @click.prevent="$emit('update:page', page - 1)"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6.39452 8.06176L10.1345 4.32176L9.06617 3.25341L4.25781 8.06176L9.06617 12.8701L10.1345 11.8018L6.39452 8.06176Z" />
      </svg>
    </div>
    <div
      class="arrow bg uk-border-rounded uk-margin-small-left" 
      :class="{'disabled' : rightDisabled}"
      style="border-radius: 4px; line-height: 16px;"
      @click.prevent="$emit('update:page', page + 1)"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8.9961 8.06176L5.2561 4.32176L6.32446 3.25341L11.1328 8.06176L6.32446 12.8701L5.2561 11.8018L8.9961 8.06176Z" />
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bg {
    background-color: black;
    padding: 4px;
}

.arrow {
    path {
        fill: white;
        stroke: white;
    }
}
.disabled {
    background-color: var(--color-bg) !important;
    pointer-events: none;
}

.uk-button {
    padding: 4px !important;
}
</style>