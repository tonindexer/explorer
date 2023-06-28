<script setup lang="ts">
interface Props {
    addr: Address | null
    break_word: boolean
}
defineProps<Props>()

</script>

<template>
    <template v-if="addr === null">
        <div class="uk-text-secondary">
            {{ $t('general.empty') }}
        </div> 
    </template>
    <template v-else-if="addr.hex in badAddresses"> 
        <div class="uk-text-secondary">
            {{ badAddresses[addr.hex].name }}
        </div>
    </template>
    <template v-else> 
        <NuxtLink class="uk-text-primary" :to="{ path: 'accounts', query: { hex: addr.hex }, hash: '#overview'} " :style="break_word ? 'word-break: break-all;': ''">
            {{ addr.base64 }}
        </NuxtLink>
    </template>
</template>