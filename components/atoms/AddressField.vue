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
    <template v-else-if="addr.hex in badAddresses"> 
        <p class="uk-text-primary">
            {{ badAddresses[addr.hex].name }}
        </p>
    </template>
    <template v-else> 
        <NuxtLink class="uk-text-primary" :to="{ path: 'accounts', query: { hex: addr.hex }, hash: '#overview'} " style="word-break: break-all;">
            {{ addr.base64 }}
        </NuxtLink>
    </template>
</template>