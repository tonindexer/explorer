<script setup lang="ts">
const { setLocale } = useI18n()
</script>

<template>
    <div class="uk-flex link">
        <NuxtLink @click.prevent.stop="setLocale('en')">🇺🇸</NuxtLink> 
        <p class="uk-margin-remove-vertical uk-margin-small-left uk-margin-small-right">|</p>
        <NuxtLink @click.prevent.stop="setLocale('ru')">🇷🇺</NuxtLink>
    </div>
</template>