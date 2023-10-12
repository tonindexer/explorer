<script setup lang="ts">
import { NuxtError } from 'nuxt/app';

interface Props {
    error: NuxtError
}
defineProps<Props>()

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
                <NuxtLink @click.prevent.stop="handleError">
                    {{ error.message + ' ! Go to main page..' }}
                </NuxtLink>
            </template>
        </AtomsTile>
    </NuxtLayout>
</template>