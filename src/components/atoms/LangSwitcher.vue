<script setup lang="ts">
const { setLocale } = useI18n()
</script>

<template>
  <div
    class="uk-flex uk-link"
    :class="isMobile()? 'uk-margin-bottom' : ''"
  >
    <div
      class="uk-padding-remove"
      style="cursor: pointer;"
      @click.prevent.stop="setLocale('en')"
    >
      🇺🇸
    </div> 
    <p class="uk-margin-remove-vertical uk-margin-small-left uk-margin-small-right">
      |
    </p>
    <div
      class="uk-padding-remove"
      style="cursor: pointer;"
      @click.prevent.stop="setLocale('ru')"
    >
      🇷🇺
    </div>
  </div>
</template>