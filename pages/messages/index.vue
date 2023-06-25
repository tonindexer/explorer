<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';

const isGeneral = ref(true)
const error = ref(false)

const store = useMainStore()
</script>

<template>
    <template v-if="error">
        <NuxtLink to="/messages">
            {{ 'An error occured while parsing query parameters! Go back..' }}
        </NuxtLink>
    </template>
    <template v-else>
        <div v-if="isGeneral">
            <LazyMessagesTable :keys="store.exploredMessages" :update="true" :default-length="10" :hidden="false" :item-selector="true" :parent_tx="null" :show-link="false"
            />
        </div>
    </template>
</template>

<style lang="scss">
.search {
    font-family: 'Fira Mono';
}
</style>