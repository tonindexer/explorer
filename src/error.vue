<script setup lang="ts">
import { type NuxtError } from 'nuxt/app';

defineProps<{
    error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
    <NuxtLayout>
        <AtomsTile :body="true" :top="true"  :tile-style="'margin-top: 20px;'" :body-style="'padding: 0 16px 12px'">
            <template #top>
                <h2 class="uk-text-primary">
                    Something broke D:
                </h2>
            </template>
            <template #body>
                <NuxtLink class="uk-text-muted" @click.prevent.stop="handleError">
                    {{ error.message + ' ! Go to main page..' }}
                </NuxtLink>
            </template>
        </AtomsTile>
    </NuxtLayout>
</template>