<template>
  <div
    class="uk-flex uk-flex-bottom"
    style="margin-top:32px;"
  >
    <h1
      class="uk-margin-remove-vertical uk-text-primary uk-margin-right font-inter"
      :style="`font-size: ${isMobile() ? 28: 48}px; font-weight: 400;`"
    >
      <slot name="title" />
    </h1>
    <h1
      class="uk-margin-remove"
      :style="`font-size: ${isMobile() ? 28: 48}px; font-weight: 400;`"
    >
      <slot name="value" />
    </h1>
  </div>
</template>

<style scoped lang="scss">
.uk-margin-remove {
    color: var(--color-text);
}
</style>