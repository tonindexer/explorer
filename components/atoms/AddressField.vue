<script setup lang="ts">
interface Props {
    addr: Address | null
}
defineProps<Props>()

</script>

<template>
    <template v-if="addr === null">
        {{ $t('general.empty') }}
    </template>
    <template v-else-if="addr.hex in badAddresses"> {{ badAddresses[addr.hex].name }}</template>
    <template v-else> 
        <NuxtLink :to="{ path: 'accounts', query: { hex: addr.hex }, hash: '#overview'} " style="word-break: break-all;">
            {{ addr.base64 }}
        </NuxtLink>
    </template>
</template>