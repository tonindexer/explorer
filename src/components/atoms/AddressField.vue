<script setup lang="ts">

const props = defineProps<{
    addr: Address | null
    showHex?: boolean
    full?: boolean
    breakWord: boolean
    linkStyle?: string
    tooltip?: string
}>()

const { t } = useI18n()
const store = useMainStore()

const accName = computed(() => {
    if (props.addr)
        return store.accounts[props.addr.hex ?? '']?.label?.name ?? 
            (props.full ? 
                (props.showHex? props.addr.hex : props.addr.base64) 
                : truncString(props.showHex? props.addr.hex : props.addr.base64, 5))
    return null
})

const jsxLikeTooltip = (text: string): string => {
    return `<div class='address-tooltip uk-padding-xsmall-vertical'>
                <div class='title uk-margin-small-bottom'>${t('ton.contract')}</div>
                <div class='body'>${text}</div>
            </div>`.replace(/ {2}(\r\n|\r|\n)+/g, '')
}
</script>

<template>
  <template v-if="addr === null">
    <div class="uk-text-secondary">
      {{ $t('general.empty') }}
    </div> 
  </template>
  <template v-else-if="addr.hex in specialAccounts"> 
    <NuxtLink 
      class="uk-text-emphasis" 
      :to="{ name: 'accounts-hex', params: { hex: addr.base64 }, hash: '#overview'} " 
      :style="[
        linkStyle,
        breakWord ? 'word-break: break-all;': ''
      ]"
      :uk-tooltip="tooltip ? jsxLikeTooltip(tooltip) : undefined"
    >
      {{ specialAccounts[addr.hex].name }}
    </NuxtLink>
  </template>
  <template v-else> 
    <NuxtLink 
      class="uk-text-emphasis" 
      :to="{ name: 'accounts-hex', params: { hex: addr.hex }, hash: '#overview'} " 
      :style="[
        linkStyle,
        breakWord ? 'word-break: break-all;': ''
      ]"
      :uk-tooltip="tooltip ? jsxLikeTooltip(tooltip) : undefined"
    >
      {{ accName ?? $t('general.empty') }}
    </NuxtLink>
  </template>
</template>