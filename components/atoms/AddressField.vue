<script setup lang="ts">
import { useMainStore } from '~/store/TONExp';
const { t } = useI18n()

interface Props {
    addr: Address | null
    showHex?: boolean
    full?: boolean
    break_word: boolean
    link_style?: string
}
const props = defineProps<Props>()

const store = useMainStore()

const accName = computed(() => {
    if (props.addr)
        return store.accounts[props.addr.hex ?? '']?.label?.name ?? (props.full ? (props.showHex? props.addr.hex : props.addr.base64) : truncString(props.showHex? props.addr.hex : props.addr.base64, 5))
    return t('general.empty')
})
</script>

<template>
    <template v-if="addr === null">
        <div class="uk-text-secondary">
            {{ $t('general.empty') }}
        </div> 
    </template>
    <template v-else-if="addr.hex in badAddresses"> 
        <NuxtLink class="uk-text-emphasis" :to="{ name: 'accounts-hex', params: { hex: addr.base64 }, hash: '#overview'} " :style="(link_style ? link_style : '') + ';' + (break_word ? 'word-break: break-all;': '')">
            {{ badAddresses[addr.hex].name }}
        </NuxtLink>
    </template>
    <template v-else> 
        <NuxtLink class="uk-text-emphasis" :to="{ name: 'accounts-hex', params: { hex: addr.hex }, hash: '#overview'} " :style="(link_style ? link_style : '') + ';' + (break_word ? 'word-break: break-all;': '')">
            {{ accName }}
        </NuxtLink>
    </template>
</template>