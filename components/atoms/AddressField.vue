<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
interface Props {
    addr: Address | null
    showHex?: boolean
    break_word: boolean
}
defineProps<Props>()

const store = useMainStore()
</script>

<template>
    <template v-if="addr === null">
        <div class="uk-text-secondary">
            {{ $t('general.empty') }}
        </div> 
    </template>
    <template v-else-if="addr.hex in badAddresses"> 
        <NuxtLink class="uk-text-emphasis" :to="{ path: '/accounts', query: { hex: addr.hex }, hash: '#overview'} " :style="break_word ? 'word-break: break-all;': ''">
            {{ badAddresses[addr.hex].name }}
        </NuxtLink>
    </template>
    <template v-else> 
        <NuxtLink class="uk-text-emphasis" :to="{ path: '/accounts', query: { hex: addr.hex }, hash: '#overview'} " :style="break_word ? 'word-break: break-all;': ''">
            {{ store.accounts[addr.hex]?.label?.name ?? truncString((showHex? addr.hex : addr.base64), 5) }}
        </NuxtLink>
    </template>
</template>