<script setup lang="ts">
const route = useRoute()

onMounted(() => {
    if (Array.isArray(route.params.slug)) {
        const check = route.params.slug.join('/')
        navigateTo({ name: 'transactions-hash', params: { hash: toBase64Web(check)}, replace: true})
        return
    }
    navigateTo({ name: 'transactions' })
})
</script>

<template>
    <div></div>
</template>