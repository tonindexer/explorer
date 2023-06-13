<script setup lang="ts">
const { setLocale } = useI18n()
</script>

<template>
    <div class="link">
        <NuxtLink @click.prevent.stop="setLocale('en')">🇺🇸</NuxtLink> |
        <NuxtLink @click.prevent.stop="setLocale('ru')">🇷🇺</NuxtLink>
    </div>
</template>