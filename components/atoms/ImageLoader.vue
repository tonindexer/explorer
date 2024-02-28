<script setup>
import VueLoadImage from 'vue-load-image'

defineProps({
    src: {
        required: true,
        type: [String, null]
    }
})
</script>

<template>
    <VueLoadImage v-if="src">
        <template #image>
            <div
                class="cover"
                :data-src="src"
                :style="`background-image: url('${src}')`"
            />
        </template>
        <template #preloader>
            <Loader />
        </template>
        <template #error>
            <div class="empty-image uk-background-default"/>
        </template>
    </VueLoadImage>
    <div 
        v-else 
        class="empty-image uk-background-default"
    />
  </template>

<style scoped>
.cover {
    display: block;
    background-size: cover;
    background-position: center center;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    padding-bottom: 100%;
    overflow: hidden;
    position: relative;
}

.empty-image {
    width: 100%;
    border-radius: 8px;
    height: 100%;
}
</style>