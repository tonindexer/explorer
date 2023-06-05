<script setup lang="ts">
const { setLocale } = useI18n()
</script>

<template>
    <button class="uk-button uk-button-default uk-background-muted navtab" type="button">{{ $t('general.language' )}}</button>
    <div uk-dropdown>
        <ul class="uk-nav uk-dropdown-nav">
            <li>
                <NuxtLink @click.prevent.stop="setLocale('ru')">Русский</NuxtLink>
            </li>
            <li>
                <NuxtLink @click.prevent.stop="setLocale('en')">English</NuxtLink>
            </li>
        </ul>
    </div>
</template>