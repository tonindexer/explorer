<script setup lang="ts">
defineProps<{
    asElement: string
    hoverTrigger: boolean
    showDropdown?: boolean
    filterIcon: boolean
    noDropdown: boolean
    offset: 'top' | 'bottom'
    innerPadding?: 'small' | 'large'
}>()
</script>

<template>
  <component
    :is="asElement"
    :class="[
      'uk-position-relative',
      { 'dropdown-text' : !noDropdown },
      { 'filter-icon' : !noDropdown && filterIcon },
      { 'hoverable' : !noDropdown && hoverTrigger }
    ]"
  >
    <slot name="trigger" />
    <div 
      :class="[
        'dropdown-filter',
        `uk-padding${innerPadding ? ('-' + innerPadding) : ''}-vertical`,
        'uk-position-absolute uk-flex-column uk-background-primary',
        { 'dropdown-filter_on': !hoverTrigger && showDropdown }
      ]"
      :style="[
        `gap: ${innerPadding === 'small' ? 0 : 8}px`,
        `${offset}:${innerPadding === 'small' ? 24 : 50}px`
      ]"
    >
      <slot name="dropdown" />
    </div>
  </component>
</template>

<style scoped lang="scss">

.dropdown-text:hover {
    cursor: pointer;
}

.hoverable:hover {
    .dropdown-filter {
        display: flex;
    }
}

.dropdown-filter {
    display: none;
    width: fit-content;
    z-index: 10;
    backface-visibility: hidden;
    border-radius: 8px;
    box-shadow: 0px 0px 20px 0px var(--color-bg-shadow);
    max-height: 16rem;
    overflow-y: auto;
    &_on {
        display: flex;
    }
}
</style>
