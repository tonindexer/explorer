<script setup lang="ts">
const { setLocale } = useI18n()
</script>

<template>
    <div class="uk-flex link" :class="isMobile()? 'uk-margin-bottom' : ''">
        <div class="uk-padding-remove" @click.prevent.stop="setLocale('en')" style="cursor: pointer;">🇺🇸</div> 
        <p class="uk-margin-remove-vertical uk-margin-small-left uk-margin-small-right">|</p>
        <div class="uk-padding-remove" @click.prevent.stop="setLocale('ru')" style="cursor: pointer;">🇷🇺</div>
    </div>
</template>